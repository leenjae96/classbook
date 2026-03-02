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
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceService {

    private final ClassroomRepository classroomRepository;
    private final StudentRepository studentRepository;
    private final StudentAttendanceRepository studentAttendanceRepository;
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
                    .map(student -> {
                        StudentAttendance sa = studentAttendanceMap.get(student.getId());
                        if (sa == null) {
                            return AttendanceDto.StudentAttendance.builder()
                                    .id(student.getId())
                                    .studentName(student.getName())
                                    .status(false)
                                    .comments(null)
                                    .build();
                        } else {
                            return AttendanceDto.StudentAttendance.builder()
                                    .id(student.getId())
                                    .studentName(student.getName())
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
                        .worship(-1)
                        .otn(false)
                        .dawnPray(0)
                        .comments(null)
                        .build();
            } else {
                teacherReport = AttendanceDto.TeacherReport.builder()
                        .id(teacher.getId())
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
        System.out.println(sheet);
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
                .map(s -> StudentDto.Info.builder()
                        .id(s.getId())
                        .classroomId(s.getClassroom().getId())
                        .name(s.getName())
                        .gender(s.getGender())
                        .school(s.getSchool())
                        .phone(s.getPhone())
                        .parentPhone(s.getParentPhone())
                        .address(s.getAddress())
                        .birthday(s.getBirthday())
                        .status(s.getStatus())
                        .registeredAt(s.getRegisteredAt())
                        .promotedAt(s.getPromotedAt())
                        .remark(s.getRemark())
                        .build()
                )
                .toList();
    }

    @Transactional
    public Long registerStudent(StudentDto.Info info) {
        Classroom classroom = null;
        if (info.grade() != null && info.classNo() != null) {
            classroom = classroomRepository.findByGradeAndClassNo(info.grade(), info.classNo())
                    .orElseThrow(() -> new IllegalArgumentException("해당 학년 반과 매칭되는 classroom 정보가 없습니다." + info.grade() + "/" + info.classNo()));
        }
        Student newStudent = studentRepository.save(
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
        return newStudent.getId();
    }

    @Transactional
    public Long updateStudent(StudentDto.Info info) {
        Student existingData = studentRepository.findById(info.id())
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 학생을 찾을 수 없습니다: " + info.id()));
        Classroom classroom = null;
        if (info.grade() != null && info.classNo() != null) {
            classroom = classroomRepository.findByGradeAndClassNo(info.grade(), info.classNo())
                    .orElseThrow(() -> new IllegalArgumentException("해당 교실을 찾을 수 없습니다."));
        }
        existingData.update(
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
        return existingData.getId();
    }

    @Transactional
    public void deleteStudent(Long studentId) {
        studentRepository.deleteById(studentId);
    }

    public StudentDto.Info getStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow();
        Classroom classroom = student.getClassroom();
        return StudentDto.Info.builder()
                .classroomId(classroom.getId())
                .name(student.getName())
                .gender(student.getGender())
                .school(student.getSchool())
                .phone(student.getPhone())
                .parentPhone(student.getParentPhone())
                .address(student.getAddress())
                .birthday(student.getBirthday())
                .status(student.getStatus())
                .registeredAt(student.getRegisteredAt())
                .promotedAt(student.getPromotedAt())
                .remark(student.getRemark())
                .build();
    }
}
