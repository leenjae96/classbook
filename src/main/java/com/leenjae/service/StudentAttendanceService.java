package com.leenjae.service;

import com.leenjae.domain.StudentAttendance;
import com.leenjae.domain.Classroom;
import com.leenjae.domain.Student;
import com.leenjae.dto.StudentAttendanceDto;
import com.leenjae.repository.StudentAttendanceRepository;
import com.leenjae.repository.ClassroomRepository;
import com.leenjae.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentAttendanceService {

    private final StudentAttendanceRepository studentAttendanceRepository;
    private final StudentRepository studentRepository;
    private final ClassroomRepository classroomRepository;

    public List<StudentAttendanceDto.Response> getAttendances(Long classroomId, LocalDate date) {
        //classroomId 로 해당 반 students전부 select
        List<Student> students = studentRepository.findByClassroomId(classroomId);
        //classroomId와 날짜로 해당 출석 기록 select후
        //attendanceId로 collect.toMap
        Map<Long, StudentAttendance> attendanceMap = studentAttendanceRepository.findByClassroomIdAndDate(classroomId, date)
                .stream()
                .collect(Collectors.toMap(
                        r -> r.getStudent().getId(), Function.identity()
                ));

        return students.stream()
                .map(student -> {
                    StudentAttendance studentAttendance = attendanceMap.get(student.getId());
                    if (studentAttendance != null) {
                        //출석기록이 없으면 빈 응답 return
                        return StudentAttendanceDto.Response.from(studentAttendance);
                    } else {
                        //출석기록이 있으면 그대로 return
                        return StudentAttendanceDto.Response.empty(student.getId());
                    }
                })
                .toList();
    }

    @Transactional
    public void updateAttendance(Long classroomId, LocalDate date, List<StudentAttendanceDto.Request> requestList) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found"));

        for (StudentAttendanceDto.Request request : requestList) {
            Student student = studentRepository.findById(request.studentId())
                    .orElseThrow(() -> new IllegalArgumentException("Student not found"));

            Optional<StudentAttendance> existingData = studentAttendanceRepository.findByStudentIdAndDate(student.getId(), date);
            if (existingData.isPresent()) {
                existingData.get().update(
                        request.status(),
                        request.comments()
                );
            } else {
                // 없을때 새 것.
                studentAttendanceRepository.save(
                        StudentAttendance.builder()
                                .student(student)
                                .date(date)
                                .status(request.status())
                                .comments(request.comments())
                                .build()
                );
            }
        }
    }

}
