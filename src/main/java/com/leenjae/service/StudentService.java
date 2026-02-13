package com.leenjae.service;

import com.leenjae.domain.Classroom;
import com.leenjae.domain.Student;
import com.leenjae.dto.StudentDto;
import com.leenjae.repository.ClassroomRepository;
import com.leenjae.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
//LEE: readOnly에만 true라는건 이 내부 메소드 에 대해 지정하지 않은거 default?
@Transactional(readOnly = true)
public class StudentService {

    private final StudentRepository studentRepository;
    private final ClassroomRepository classroomRepository;

    @Transactional
    public Long registerStudent(StudentDto.Info req) {
        return null;
    }

    @Transactional
    public void promoteStudent(Long studentId, Long classroomId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found.  / ID : {}" + studentId));

        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found.  / ID : {}" + classroomId));

        student.promote(classroom);
    }

    public StudentDto.Info getStudent(Long studentId) {
        return null;
    }

}
