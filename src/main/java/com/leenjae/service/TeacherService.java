package com.leenjae.service;

import com.leenjae.dto.TeacherDto;
import com.leenjae.repository.ClassroomRepository;
import com.leenjae.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final ClassroomRepository classroomRepository;

    public List<TeacherDto.Response> getClassTeachers(Integer classId) {
        return null;
    }

    public List<TeacherDto.Response> getAdministrativeTeachers() {
        return null;
    }
}
