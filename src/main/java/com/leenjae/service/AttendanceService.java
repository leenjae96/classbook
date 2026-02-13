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

    private AttendanceDto.Sheet getSheet(List<Student> students, Teacher teacher, LocalDate date) {
        List<AttendanceDto.StudentCheck> studentCheckList = null;
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

            studentCheckList = students.stream()
                    .map(student -> {
                        StudentAttendance sa = studentAttendanceMap.get(student.getId());
                        if (sa == null) {
                            return AttendanceDto.StudentCheck.builder()
                                    .id(student.getId())
                                    .studentName(student.getName())
                                    .status(false)
                                    .comments(null)
                                    .build();
                        } else {
                            return AttendanceDto.StudentCheck.builder()
                                    .id(student.getId())
                                    .studentName(student.getName())
                                    .status(sa.getStatus())
                                    .comments(sa.getComments())
                                    .build();
                        }
                    })
                    .sorted(Comparator.comparing(AttendanceDto.StudentCheck::studentName))
                    .toList();
        }

        AttendanceDto.TeacherCheck teacherCheck = null;
        if (teacher != null) {
            TeacherAttendance teacherAttendance = teacherAttendanceRepository.findByTeacherIdAndDate(teacher.getId(), date);
            if (teacherAttendance == null) {
                teacherCheck = AttendanceDto.TeacherCheck.builder()
                        .id(teacher.getId())
                        .worship(-1)
                        .otn(false)
                        .dawnPray(0)
                        .comments(null)
                        .build();
            } else {
                teacherCheck = AttendanceDto.TeacherCheck.builder()
                        .id(teacher.getId())
                        .otn(teacherAttendance.getOtn())
                        .worship(teacherAttendance.getWorship())
                        .dawnPray(teacherAttendance.getDawnPray())
                        .comments(teacherAttendance.getComments())
                        .build();
            }
        }

        return AttendanceDto.Sheet.builder()
                .studentChecks(studentCheckList)
                .teacherCheck(teacherCheck)
                .build();
    }

    @Transactional
    //LEE: save 작업이후 예외나 에러시 사용자는 어떻게 감지할 수 있나?
    public void saveSheet(LocalDate date, AttendanceDto.Sheet sheet) {
        // administrative data인 경우는 studentChecks가 없음.
        List<AttendanceDto.StudentCheck> studentChecks = sheet.studentChecks();
        if (studentChecks != null) {
            for (AttendanceDto.StudentCheck dto : studentChecks) {
                Optional<StudentAttendance> existingData = studentAttendanceRepository.findByStudentIdAndDate(dto.id(), date);
                if (existingData.isEmpty()) {
                    // LEE: ref객체에 대해서.
                    Student studentRef = studentRepository.getReferenceById(dto.id());
                    studentAttendanceRepository.save(
                            StudentAttendance.builder()
                                    .student(studentRef)
                                    .date(date)
                                    .comments(dto.comments())
                                    .status(dto.status())
                                    .build()
                    );
                } else {
                    existingData.get().update(
                            dto.status(),
                            dto.comments()
                    );
                }
            }
        }
        // worshipTeam data인 경우는 teacherCheck가 없음.
        AttendanceDto.TeacherCheck teacherCheck = sheet.teacherCheck();
        if (teacherCheck != null) {
            long teacherId = teacherCheck.id();

            TeacherAttendance existingData = teacherAttendanceRepository.findByTeacherIdAndDate(teacherId, date);
            if (existingData == null) {
                Teacher teacherRef = teacherRepository.getReferenceById(teacherId);
                teacherAttendanceRepository.save(
                        TeacherAttendance.builder()
                                .teacher(teacherRef)
                                .date(date)
                                .worship(teacherCheck.worship())
                                .otn(teacherCheck.otn())
                                .dawnPray(teacherCheck.dawnPray())
                                .comments(teacherCheck.comments())
                                .build()
                );
            } else {
                existingData.update(
                        teacherCheck.worship(),
                        teacherCheck.otn(),
                        teacherCheck.dawnPray(),
                        teacherCheck.comments()
                );
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
                .map(s-> StudentDto.Info.builder()
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
        Student newStudent = studentRepository.save(
                Student.builder()
                        .name(info.name())
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
                .orElseThrow();
        Classroom classroom = classroomRepository.findById(info.classroomId())
                .orElseThrow();
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

}
