package com.leenjae.controller;

import com.leenjae.dto.TeacherDto;
import com.leenjae.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/classbook/teachers")
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping("/{teacherId}")
    public TeacherDto.Response getTeacherById(@PathVariable Long teacherId) {
        return null;
    }


    @GetMapping("/grade/{grade}")
    public List<TeacherDto.Response> getClassroomTeachersByGrade(@PathVariable Integer grade) {
        return teacherService.getClassTeachers(grade);
    }

    @GetMapping("/administrative")
    public List<TeacherDto.Response> getAdministrativeTeachers() {
        return null;
    }


}
