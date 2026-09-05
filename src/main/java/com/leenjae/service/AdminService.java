package com.leenjae.service;

import com.leenjae.domain.Classroom;
import com.leenjae.domain.Student;
import com.leenjae.domain.StudentAttendance;
import com.leenjae.domain.StudentHistory;
import com.leenjae.domain.Teacher;
import com.leenjae.domain.TeacherRoles;
import com.leenjae.domain.TeacherReport;
import com.leenjae.dto.AdminDto;
import com.leenjae.dto.AttendanceDto;
import com.leenjae.dto.StudentDto;
import com.leenjae.repository.ClassroomRepository;
import com.leenjae.repository.StudentAttendanceRepository;
import com.leenjae.repository.StudentHistoryRepository;
import com.leenjae.repository.StudentRepository;
import com.leenjae.repository.TeacherRepository;
import com.leenjae.repository.TeacherReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
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
    private final StudentHistoryRepository studentHistoryRepository;
    private final ClassroomRepository classroomRepository;

    public List<StudentDto.SummaryInfo> getStudentSummaryInfo() {
        return studentRepository.findAllStudentSummaryInfo();
    }

    // 소프트 삭제(status=5)된 학생 목록
    public List<StudentDto.SummaryInfo> getDeletedStudentSummaryInfo() {
        return studentRepository.findDeletedStudentSummaryInfo();
    }

    // 인적사항 엑셀 export (삭제 제외 전체 + ABCD 등급). 별분(3)은 맨 아래, 나머지는 학년/반/이름순
    public List<AdminDto.StudentExportRow> getStudentExport() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Seoul"));
        LocalDate yearStart = LocalDate.of(today.getYear(), 1, 1);

        Map<Long, Long> presentCount = new HashMap<>();
        for (Object[] row : studentAttendanceRepository.countPresentByStudentBetween(yearStart, today)) {
            presentCount.put((Long) row[0], (Long) row[1]);
        }

        return studentRepository.findAllForExport().stream()
                .map(s -> {
                    Classroom c = s.getClassroom();
                    LocalDate reg = s.getRegisteredAt();
                    // 분모 시작: 등록일과 올해 1/1 중 더 늦은 쪽 (25년 등록이어도 최대 올해 1/1부터)
                    LocalDate start = (reg != null && reg.isAfter(yearStart)) ? reg : yearStart;
                    long denom = countSundays(start, today);
                    long numer = presentCount.getOrDefault(s.getId(), 0L);
                    return new AdminDto.StudentExportRow(
                            s.getId(),
                            (c != null && c.getTeacher() != null) ? c.getTeacher().getName() : null,
                            c != null ? c.getGrade() : null,
                            c != null ? c.getClassNo() : null,
                            s.getName(),
                            s.getSchool(),
                            s.getGender(),
                            s.getEvangelist(),
                            s.getBirthday(),
                            s.getPhone(),
                            s.getParentPhone(),
                            s.getAddress(),
                            s.getRemark(),
                            s.getRegisteredAt(),
                            s.getStatus(),
                            attendanceGrade(numer, denom)
                    );
                })
                .sorted(
                        Comparator.comparingInt((AdminDto.StudentExportRow r) ->
                                        (r.status() != null && r.status() == 3) ? 1 : 0)
                                .thenComparingInt(r -> r.grade() == null ? Integer.MAX_VALUE : r.grade())
                                .thenComparingInt(r -> parseClassNo(r.classNo()))
                                .thenComparing(r -> r.name() == null ? "" : r.name())
                )
                .toList();
    }

    // [start, end] 사이 일요일 수
    private long countSundays(LocalDate start, LocalDate end) {
        if (start.isAfter(end)) return 0;
        LocalDate firstSunday = start.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        if (firstSunday.isAfter(end)) return 0;
        return ChronoUnit.WEEKS.between(firstSunday, end) + 1;
    }

    // 출석 등급: D=0회, C=~30%, B=~60%, A=~100%
    private String attendanceGrade(long numer, long denom) {
        if (numer <= 0) return "D";
        if (denom <= 0) return "A";
        double pct = numer * 100.0 / denom;
        if (pct <= 30) return "C";
        if (pct <= 60) return "B";
        return "A";
    }

    private int parseClassNo(String classNo) {
        if (classNo == null) return Integer.MAX_VALUE;
        try {
            return Integer.parseInt(classNo);
        } catch (NumberFormatException e) {
            return Integer.MAX_VALUE;
        }
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
        List<AdminDto.HistoryResponse.Item> items = studentHistoryRepository
                .findByStatusChangeDateBetween(startDate, endDate)
                .stream()
                .map(h -> new AdminDto.HistoryResponse.Item(
                        h.getId(),
                        h.getStudent().getName(),
                        classroomLabelOrDash(h.getOldClassroom()),
                        classroomLabelOrDash(h.getNewClassroom()),
                        h.getComments(),
                        h.getStatusChangeDate(),
                        h.getCreatedAt()
                ))
                .toList();
        return new AdminDto.HistoryResponse(items);
    }

    // 반 라벨: 1부남/1부여, N-M, 없으면 "-"
    private String classroomLabelOrDash(Classroom classroom) {
        if (classroom == null) return "-";
        int grade = classroom.getGrade();
        String classNo = classroom.getClassNo();
        if (grade == 0) return "1부" + ("0".equals(classNo) ? "여" : "남");
        return grade + "-" + classNo;
    }

    // 관리자 출석 수정: 날짜 잠금 없이 과거 데이터도 수정 + 변경 학생별 사유를 히스토리에 기록
    //  - 출석 데이터: 없으면 생성, 있으면 갱신 (새친구 덮어쓰기 방지 로직 미적용 — 관리자 강제 수정)
    //  - 히스토리   : status_change_date = 수정 대상 출석일, comments = 사유, 재적 상태는 변경 없음
    @Transactional
    public void editAttendances(AdminDto.AttendanceEditRequest req) {
        LocalDate date = req.date();
        if (req.items() == null) return;

        for (AdminDto.AttendanceEditRequest.Item item : req.items()) {
            Student student = studentRepository.findById(item.studentId())
                    .orElseThrow(() -> new IllegalArgumentException("학생을 찾을 수 없습니다. id=" + item.studentId()));

            Optional<StudentAttendance> existing =
                    studentAttendanceRepository.findByStudentIdAndDate(item.studentId(), date);

            // 변경 전 상태 캡처 (출석부 기록이 없으면 결석/코멘트 없음으로 간주)
            boolean oldStatus = existing.map(StudentAttendance::getStatus).orElse(false);
            String oldComments = existing.map(StudentAttendance::getComments).orElse(null);
            boolean newStatus = Boolean.TRUE.equals(item.status());
            String newComments = item.comments();

            if (existing.isEmpty()) {
                studentAttendanceRepository.save(
                        StudentAttendance.builder()
                                .student(student)
                                .date(date)
                                .status(newStatus)
                                .comments(newComments)
                                .build()
                );
            } else {
                existing.get().update(newStatus, newComments);
            }

            studentHistoryRepository.save(
                    StudentHistory.builder()
                            .student(student)
                            .oldClassroom(student.getClassroom())
                            .newClassroom(student.getClassroom())
                            .date(date)                       // 수정 대상 출석일
                            .preStatus(student.getStatus())   // 재적 변경 아님 → pre == post
                            .postStatus(student.getStatus())
                            .comments(buildAttendanceEditComment(item.reason(), oldStatus, newStatus, oldComments, newComments))
                            .build()
            );
        }
    }

    // 출석 수정 히스토리 코멘트 조립 (구분자 '/')
    //  형식: {수정사유}/{출석 전->후}/{코멘트 전->후}
    //  - 출석이 안 바뀌었으면 출석 구간 생략, 코멘트가 안 바뀌었으면 코멘트 구간 생략
    private String buildAttendanceEditComment(
            String reason, boolean oldStatus, boolean newStatus, String oldComments, String newComments) {
        StringBuilder sb = new StringBuilder(reason == null ? "" : reason);

        if (oldStatus != newStatus) {
            sb.append("/").append(oldStatus ? "출석" : "결석")
              .append("->").append(newStatus ? "출석" : "결석");
        }

        String oldC = oldComments == null ? "" : oldComments.trim();
        String newC = newComments == null ? "" : newComments.trim();
        if (!oldC.equals(newC)) {
            sb.append("/")
              .append(oldC.isEmpty() ? "(없음)" : oldC)
              .append("->")
              .append(newC.isEmpty() ? "(없음)" : newC);
        }

        return sb.toString();
    }
}
