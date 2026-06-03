package com.leenjae.service;

import com.leenjae.domain.Classroom;
import com.leenjae.domain.Teacher;
import com.leenjae.domain.TeacherRoles;
import com.leenjae.domain.TeacherReport;
import com.leenjae.dto.AdminDto;
import com.leenjae.dto.AttendanceDto;
import com.leenjae.dto.StudentDto;
import com.leenjae.repository.ClassroomRepository;
import com.leenjae.repository.StudentAttendanceRepository;
import com.leenjae.repository.StudentRepository;
import com.leenjae.repository.TeacherRepository;
import com.leenjae.repository.TeacherReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {
    private final AttendanceService attendanceService;

    private final TeacherRepository teacherRepository;
    private final TeacherReportRepository teacherReportRepository;
    private final StudentRepository studentRepository;
    private final StudentAttendanceRepository studentAttendanceRepository;
    private final ClassroomRepository classroomRepository;

    public List<StudentDto.SummaryInfo> getStudentSummaryInfo() {
        return studentRepository.findAllStudentSummaryInfo();
    }

    public List<AdminDto.TotalReportResponse> getTotalReports(LocalDate date) {
        List<AdminDto.TotalReportResponse> result = new ArrayList<>();
        Set<Long> classroomTeacherIds = new HashSet<>(); // 이미 조회된 선생님 ID 기록용

        // 1. 모든 반(Classroom)을 기준으로 보고서 불러오기
        List<Classroom> classrooms = classroomRepository.findAll();
        for (Classroom c : classrooms) {
            Teacher teacher = c.getTeacher();
            if (teacher == null) continue;
            // 해당 반에 담당 선생님이 있다면 Set에 기록 (중복 조회 방지)
            classroomTeacherIds.add(teacher.getId());
            // 반 기준 시트 조회 (메서드명은 실제 프로젝트에 맞게 수정)
            AttendanceDto.Sheet sheet = attendanceService.getSheetByGradeAndClassNo(
                    c.getGrade(),
                    Integer.parseInt(c.getClassNo()),
                    date
            );
            result.add(new AdminDto.TotalReportResponse(
                    c.getGrade(),
                    c.getClassNo(),
                    sheet
            ));
        }
        // 2. 반을 맡지 않은 '남은 선생님들' 보고서 불러오기
        List<Teacher> adminTeachers = teacherRepository.findAll()
                .stream()
                .filter(t -> !classroomTeacherIds.contains(t.getId()))
                .filter(t -> !t.getRoles().contains(TeacherRoles.PASTOR))
                .sorted(Comparator.comparing(Teacher::getName))
                .toList();

        for (Teacher t : adminTeachers) {
            // 선생님 ID 기준 시트 조회 (반 정보가 없는 선생님)
            AttendanceDto.Sheet sheet = attendanceService.getSheetByTeacherId(t.getId(), date);

            result.add(new AdminDto.TotalReportResponse(
                    null, // 학년 없음
                    null, // 반 없음
                    sheet
            ));
        }
        // 3. 리스트 통합 후 정렬하여 반환
        return result.stream()
                .sorted((r1, r2) -> {
                    // 학년이 없는(null) 선생님은 목록 맨 아래로 보냄
                    if (r1.grade() == null && r2.grade() == null) return 0;
                    if (r1.grade() == null) return 1;
                    if (r2.grade() == null) return -1;

                    // 학년 오름차순 정렬
                    int gradeCompare = r1.grade().compareTo(r2.grade());
                    if (gradeCompare != 0) return gradeCompare;

                    // 반 오름차순 정렬
                    int classNo1 = r1.classNo() != null ? Integer.parseInt(r1.classNo()) : 999;
                    int classNo2 = r2.classNo() != null ? Integer.parseInt(r2.classNo()) : 999;
                    return Integer.compare(classNo1, classNo2);
                })
                .toList();
    }

    public List<AdminDto.TeacherWeeklyReportItem> getTeacherWeeklyReport(LocalDate date) {
        // 선생님ID → Classroom 맵 (N+1 방지)
        Map<Long, Classroom> classroomByTeacherId = classroomRepository.findAllWithTeacher()
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        c -> c.getTeacher().getId(),
                        c -> c,
                        (a, b) -> a
                ));

        return teacherRepository.findAll()
                .stream()
                .filter(t -> !t.getRoles().contains(TeacherRoles.PASTOR))
                .sorted(Comparator
                        .comparingInt((Teacher t) -> classroomGradeSortKey(classroomByTeacherId.get(t.getId())))
                        .thenComparingInt(t -> classroomClassNoSortKey(classroomByTeacherId.get(t.getId())))
                        .thenComparing(Teacher::getName))
                .map(t -> {
                    TeacherReport report = teacherReportRepository.findByTeacherIdAndDate(t.getId(), date);
                    String classroom = formatClassroomLabel(classroomByTeacherId.get(t.getId()));
                    return new AdminDto.TeacherWeeklyReportItem(
                            classroom,
                            t.getName(),
                            report != null ? report.getDate() : null,
                            report != null ? report.getWorship() : null,
                            report != null ? report.getOtn() : null,
                            report != null ? report.getDawnPray() : null,
                            report != null ? report.getComments() : null
                    );
                })
                .toList();
    }

    private String formatClassroomLabel(Classroom classroom) {
        if (classroom == null) return "-";
        int grade = classroom.getGrade();
        String classNo = classroom.getClassNo();
        if (grade == 0) return "1부" + ("0".equals(classNo) ? "여" : "남");
        return grade + "-" + classNo;
    }

    // grade=0(1부)은 1/2/3학년 뒤, classroom 없으면 맨 뒤
    private int classroomGradeSortKey(Classroom classroom) {
        if (classroom == null) return 100;
        return classroom.getGrade() == 0 ? 10 : classroom.getGrade();
    }

    // 같은 학년반 내 반번호 정렬 (1부의 경우 남=1 before 여=0)
    private int classroomClassNoSortKey(Classroom classroom) {
        if (classroom == null) return 999;
        String classNo = classroom.getClassNo();
        if (classroom.getGrade() == 0) return "0".equals(classNo) ? 1 : 0;
        try { return Integer.parseInt(classNo); } catch (NumberFormatException e) { return 999; }
    }

    public AdminDto.HistoryResponse getHistories(LocalDate startDate, LocalDate endDate) {
        return null;
    }
}
