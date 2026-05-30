package com.leenjae.service;

import com.leenjae.domain.*;
import com.leenjae.dto.AttendanceDto;
import com.leenjae.dto.StudentDto;
import com.leenjae.dto.TeacherDto;
import com.leenjae.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
//LEE: readOnly에만 true라는건 이 내부 메소드 에 대해 지정하지 않은거 default?
@Transactional(readOnly = true)
public class AttendanceService {

    private final ClassroomRepository classroomRepository;
    private final StudentRepository studentRepository;
    private final StudentAttendanceRepository studentAttendanceRepository;
    private final StudentHistoryRepository studentHistoryRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherReportRepository teacherReportRepository;
    private final TeacherAttendanceRepository teacherAttendanceRepository;

    public List<AttendanceDto.ClassroomSummary> getClassroomListByGrade(int grade) {
        return classroomRepository.findByGrade(grade)
                .stream()
                .map(c -> AttendanceDto.ClassroomSummary.builder()
                        .id(c.getId())
                        .grade(c.getGrade())
                        .classNo(c.getClassNo())
                        .teacherId(c.getTeacher().getId())
                        .teacherName(c.getTeacher().getName())
                        .build())
                .toList();
    }

    public AttendanceDto.Sheet getSheetByTeacherId(long teacherId, LocalDate date) {
        List<Student> students = studentRepository.findByTeacherId(teacherId);
        Teacher teacher = teacherRepository.findById(teacherId).orElseThrow();
        return getSheet(students, teacher, date);
    }

    //반 출석부. 학년반 정보로 classroom
    public AttendanceDto.Sheet getSheetByGradeAndClassNo(int grade, int classNo, LocalDate date) {
        Long teacherId = classroomRepository.findByGradeAndClassNo(grade, String.valueOf(classNo))
                .orElseThrow()
                .getTeacher()
                .getId();

        List<Student> students = studentRepository.findByTeacherId(teacherId);
        Teacher teacher = teacherRepository.findById(teacherId).orElseThrow();

        return getSheet(students, teacher, date);
    }

    //LEE: getSheet saveSheet 통합. 파라미터 통일?
    public AttendanceDto.Sheet getSheetByWorshipTeamName(String teamName, LocalDate date) {
        List<Student> students = studentRepository.findByRole(StudentRole.byDescription(teamName));

        return getSheet(students, null, date);
    }

    public AttendanceDto.Sheet getSheetOfNewFriend(LocalDate date) {
        List<Student> students = studentRepository.findByStatus(Status.NEW.getCode());
        System.out.println(students.size());
        return getSheet(students, null, date);
    }

    private AttendanceDto.Sheet getSheet(List<Student> students, Teacher teacher, LocalDate date) {
        List<AttendanceDto.StudentAttendance> studentAttendanceList = null;
        if (students != null) {
            Map<Long, StudentAttendance> studentAttendanceMap =
                    studentAttendanceRepository.findByStudentIdInAndDate(
                                    students.stream().map(Student::getId).toList(),
                                    date
                            )
                            .stream()
                            .collect(Collectors.toMap(
                                    a -> a.getStudent().getId(),
                                    a -> a
                            ));

            studentAttendanceList = students.stream()
                    .filter(student -> {
                        return (student.getStatus() == Status.NEW.getCode() ||
                                student.getStatus() == Status.NORMAL.getCode());
                    })
                    .map(student -> {
                        StudentAttendance sa = studentAttendanceMap.get(student.getId());
                        if (sa == null) {
                            return AttendanceDto.StudentAttendance.builder()
                                    .id(student.getId())
                                    .studentName(student.getName())
                                    .studentStatus(student.getStatus())
                                    .status(false)
                                    .comments(null)
                                    .build();
                        } else {
                            return AttendanceDto.StudentAttendance.builder()
                                    .id(student.getId())
                                    .studentName(student.getName())
                                    .studentStatus(student.getStatus())
                                    .status(sa.getStatus())
                                    .comments(sa.getComments())
                                    .build();
                        }
                    })
                    .sorted(Comparator.comparing(AttendanceDto.StudentAttendance::studentName))
                    .toList();
        }

        AttendanceDto.TeacherReport teacherReport = null;
        if (teacher != null) {
            TeacherReport tr = teacherReportRepository.findByTeacherIdAndDate(teacher.getId(), date);
            if (tr == null) {
                teacherReport = AttendanceDto.TeacherReport.builder()
                        .id(teacher.getId())
                        .name(teacher.getName())
                        .worship(-1)
                        .otn(false)
                        .dawnPray(0)
                        .comments(null)
                        .build();
            } else {
                teacherReport = AttendanceDto.TeacherReport.builder()
                        .id(teacher.getId())
                        .name(teacher.getName())
                        .otn(tr.getOtn())
                        .worship(tr.getWorship())
                        .dawnPray(tr.getDawnPray())
                        .comments(tr.getComments())
                        .build();
            }
        }

        List<AttendanceDto.TeacherAttendance> teacherAttendanceList = null;
        if (teacher != null && teacher.getRoles().contains(TeacherRoles.DIRECTOR)) {
            List<Teacher> teachers = teacherRepository.findAll()
                    .stream()
                    .filter(a -> !a.getRoles().contains(TeacherRoles.PASTOR))
                    .filter(a -> !a.getRoles().contains(TeacherRoles.DIRECTOR))
                    .toList();

            Map<Long, TeacherAttendance> teacherAttendanceMap =
                    teacherAttendanceRepository.findByTeacherIdInAndDate(
                                    teachers.stream().map(Teacher::getId).toList(),
                                    date
                            )
                            .stream()
                            .collect(Collectors.toMap(
                                    a -> a.getTeacher().getId(),
                                    a -> a
                            ));

            teacherAttendanceList = teachers.stream()
                    .map(t -> {
                        TeacherAttendance ta = teacherAttendanceMap.get(t.getId());
                        if (ta == null) {
                            return AttendanceDto.TeacherAttendance.builder()
                                    .id(t.getId())
                                    .teacherName(t.getName())
                                    .status(false)
                                    .comments(null)
                                    .build();
                        } else {
                            return AttendanceDto.TeacherAttendance.builder()
                                    .id(t.getId())
                                    .teacherName(t.getName())
                                    .status(ta.getStatus())
                                    .comments(ta.getComments())
                                    .build();
                        }
                    })
                    .sorted(Comparator.comparing(AttendanceDto.TeacherAttendance::teacherName))
                    .toList();
        }

        return AttendanceDto.Sheet.builder()
                .studentAttendances(studentAttendanceList)
                .teacherReport(teacherReport)
                .teacherAttendances(teacherAttendanceList)
                .build();
    }

    @Transactional
    //LEE: save 작업이후 예외나 에러시 사용자는 어떻게 감지할 수 있나?
    public void saveSheet(LocalDate date, AttendanceDto.Sheet sheet) {
        // administrative data인 경우는 studentChecks가 없음.
        List<AttendanceDto.StudentAttendance> studentAttendances = sheet.studentAttendances();
        if (studentAttendances != null) {
            for (AttendanceDto.StudentAttendance sa : studentAttendances) {
                Optional<StudentAttendance> existingData = studentAttendanceRepository.findByStudentIdAndDate(sa.id(), date);
                if (existingData.isEmpty()) {
                    // LEE: ref객체에 대해서.
                    Student studentRef = studentRepository.getReferenceById(sa.id());
                    studentAttendanceRepository.save(
                            StudentAttendance.builder()
                                    .student(studentRef)
                                    .date(date)
                                    .comments(sa.comments())
                                    .status(sa.status())
                                    .build()
                    );
                } else {
                    existingData.get().update(
                            sa.status(),
                            sa.comments()
                    );
                }
            }
        }
        // worshipTeam data인 경우는 teacherCheck가 없음.
        AttendanceDto.TeacherReport teacherReport = sheet.teacherReport();
        if (teacherReport != null) {
            long teacherId = teacherReport.id();

            TeacherReport existingData = teacherReportRepository.findByTeacherIdAndDate(teacherId, date);
            if (existingData == null) {
                Teacher teacherRef = teacherRepository.getReferenceById(teacherId);
                teacherReportRepository.save(
                        com.leenjae.domain.TeacherReport.builder()
                                .teacher(teacherRef)
                                .date(date)
                                .worship(teacherReport.worship())
                                .otn(teacherReport.otn())
                                .dawnPray(teacherReport.dawnPray())
                                .comments(teacherReport.comments())
                                .build()
                );
            } else {
                existingData.update(
                        teacherReport.worship(),
                        teacherReport.otn(),
                        teacherReport.dawnPray(),
                        teacherReport.comments()
                );
            }
        }

        List<AttendanceDto.TeacherAttendance> teacherAttendances = sheet.teacherAttendances();
        if (teacherAttendances != null) {
            for (AttendanceDto.TeacherAttendance ta : teacherAttendances) {
                Optional<TeacherAttendance> existingData = teacherAttendanceRepository.findByTeacherIdAndDate(ta.id(), date);
                if (existingData.isEmpty()) {
                    Teacher teacherRef = teacherRepository.getReferenceById(ta.id());
                    teacherAttendanceRepository.save(
                            TeacherAttendance.builder()
                                    .teacher(teacherRef)
                                    .date(date)
                                    .status(ta.status())
                                    .comments(ta.comments())
                                    .build()
                    );
                } else {
                    existingData.get().update(
                            ta.status(),
                            ta.comments()
                    );
                }
            }
        }
    }

    public List<TeacherDto.Response> getAdministrativceList() {
        return teacherRepository.findAdministratives()
                .stream()
                .filter(a -> !a.getRoles().contains(TeacherRoles.PASTOR))
                .map(TeacherDto.Response::new)
                .toList();
    }

    public List<StudentDto.Info> getNewFriends() {
        return studentRepository.findByStatus(Status.NEW.getCode())
                .stream()
                .map(s -> new StudentDto.Info(
                                s.getId(),
                                s.getClassroom().getGrade(),
                                s.getClassroom().getClassNo(),
                                s.getClassroom().getId(),
                                s.getName(),
                                s.getGender(),
                                s.getSchool(),
                                s.getPhone(),
                                s.getParentPhone(),
                                s.getAddress(),
                                s.getBirthday(),
                                s.getStatus(),
                                s.getRegisteredAt(),
                                s.getPromotedAt(),
                                s.getRemark()
                        )
                )
                .toList();
    }

    @Transactional
    public void registerStudent(StudentDto.Info info) {
        log.info(info.toString());
        Classroom classroom = null;
        if (info.classroomId() != null) {
            classroom = classroomRepository.findById(info.classroomId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 classroomId과 매칭되는 classroom 정보가 없습니다. :/ " + info.classroomId()));
        }
        studentRepository.save(
                Student.builder()
                        .name(info.name())
                        .classroom(classroom)
                        .gender(info.gender())
                        .school(info.school())
                        .phone(info.phone())
                        .parentPhone(info.parentPhone())
                        .address(info.address())
                        .birthday(info.birthday())
                        .status(info.status())
                        .registeredAt(info.registeredAt())
                        .promotedAt(info.promotedAt())
                        .remark(info.remark())
                        .build()
        );
    }

    @Transactional
    public void updateNewFriend(AttendanceDto.EditStudentInfo info) {
        Student existingStudent = studentRepository.findById(info.id())
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 학생을 찾을 수 없습니다: " + info.id()));
        Classroom classroom = null;
        if (info.classroomId() != null) {
            classroom = classroomRepository.findById(info.classroomId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 classroomId과 매칭되는 classroom 정보가 없습니다. :/ " + info.classroomId()));
        }

        Integer oldStatus = existingStudent.getStatus();
        Integer newStatus = info.status();
        // 새친구에서 등반한 경우
        if (oldStatus == Status.NEW.getCode() && newStatus == Status.NORMAL.getCode()) {
            studentHistoryRepository.save(
                    StudentHistory.builder()
                            .student(existingStudent)
                            .classroom(existingStudent.getClassroom())
                            .date(info.promotedAt())
                            .preStatus(oldStatus)
                            .postStatus(newStatus)
                            .comments("등반")
                            .build()
            );
        }
        // 새친구 등반을 제외한 모든 경우(admin 요청)
        else {
            studentHistoryRepository.save(
                    StudentHistory.builder()
                            .student(existingStudent)
                            .classroom(existingStudent.getClassroom())
                            .date(info.promotedAt())
                            .preStatus(oldStatus)
                            .postStatus(newStatus)
                            .comments(info.comments())
                            .build()
            );
        }

        existingStudent.update(
                info.gender(),
                info.school(),
                info.phone(),
                info.parentPhone(),
                info.address(),
                info.birthday(),
                info.status(),
                info.registeredAt(),
                info.promotedAt(),
                info.remark(),
                classroom
        );
    }

    @Transactional
    public void deleteStudent(Long studentId) {
        studentRepository.deleteById(studentId);
    }

    public StudentDto.Info getStudent(Long id) {
        Student s = studentRepository.findById(id)
                .orElseThrow();
        Classroom c = s.getClassroom();
        return new StudentDto.Info(
                s.getId(),
                c == null ? null : c.getGrade(),
                c == null ? null : c.getClassNo(),
                c == null ? null : c.getId(),
                s.getName(),
                s.getGender(),
                s.getSchool(),
                s.getPhone(),
                s.getParentPhone(),
                s.getAddress(),
                s.getBirthday(),
                s.getStatus(),
                s.getRegisteredAt(),
                s.getPromotedAt(),
                s.getRemark()
        );
    }

    public AttendanceDto.CumulativeSheet getCumulativeStatistics(LocalDate startDate, LocalDate endDate, Integer grade, String classNo) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd");
        List<AttendanceDto.RawCumulativeStats> rawData;

        // 1. 조건에 따라 DB에서 데이터 퍼오기
        if (grade == null || classNo == null) {
            // 관리자가 호출한 경우: 전체 조회
            rawData = studentAttendanceRepository.getRawCumulativeStats(startDate, endDate);
        } else {
            // 선생님이 호출한 경우: 특정 반만 조회
            rawData = studentAttendanceRepository.getRawCumulativeStatsByClassroom(grade, classNo, startDate, endDate);
        }
        // 전체 날짜 중에서 null이 아닌 것만 'MM/dd' 포맷으로 추출 후 중복 제거 & 정렬 (headerDates)
        List<String> headerDates = rawData.stream()
                .map(AttendanceDto.RawCumulativeStats::attendanceDate)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .map(date -> date.format(formatter))
                .toList();

        // 학생 ID 기준으로 데이터 그룹핑 (LinkedHashMap을 써서 Repository의 정렬 순서 유지)
        Map<Long, List<AttendanceDto.RawCumulativeStats>> groupedByStudent =
                rawData.stream()
                        .collect(Collectors.groupingBy(
                                AttendanceDto.RawCumulativeStats::studentId,
                                LinkedHashMap::new,
                                Collectors.toList()
                        ));

        // 프론트엔드용 학생 리스트 조립
        List<AttendanceDto.StudentAttendanceSummary> students =
                groupedByStudent.values().stream()
                        .map(list -> {
                            AttendanceDto.RawCumulativeStats first = list.getFirst(); // 학생 기본 정보는 첫 번째 row에서 추출

                            // 출석한 날짜만 'MM/dd' 포맷으로 추출 (결석/미출석은 아예 안 담김)
                            List<String> attendances =
                                    list.stream()
                                            .map(AttendanceDto.RawCumulativeStats::attendanceDate)
                                            .filter(Objects::nonNull)
                                            .map(date -> date.format(formatter))
                                            .toList();

                            return new AttendanceDto.StudentAttendanceSummary(
                                    first.studentStatus(), first.grade(), first.classNo(), first.name(), attendances
                            );
                        })
                        .toList();
        return new AttendanceDto.CumulativeSheet(headerDates, students);
    }

    public AttendanceDto.TeacherCumulativeSheet getTeacherCumulativeStatistics(LocalDate startDate, LocalDate endDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd");

        List<TeacherAttendance> records = teacherAttendanceRepository.findByDateBetween(startDate, endDate);

        List<String> headerDates = records.stream()
                .map(r -> r.getDate().format(formatter))
                .distinct()
                .sorted()
                .toList();

        Map<String, List<TeacherAttendance>> byTeacher = records.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getTeacher().getName(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<AttendanceDto.TeacherAttendanceSummary> teachers = byTeacher.entrySet().stream()
                .map(e -> new AttendanceDto.TeacherAttendanceSummary(
                        e.getKey(),
                        e.getValue().stream()
                                .filter(ta -> Boolean.TRUE.equals(ta.getStatus()))
                                .map(ta -> ta.getDate().format(formatter))
                                .toList()
                ))
                .toList();

        return new AttendanceDto.TeacherCumulativeSheet(headerDates, teachers);
    }
}
