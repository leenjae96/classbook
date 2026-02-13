package com.leenjae.controller;

import com.leenjae.dto.StudentDto;
import com.leenjae.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/classbook/students")
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    public Long register(@RequestBody StudentDto.Info info) {
        return studentService.registerStudent(info);
    }

    @PatchMapping("/{studentId}/promote")
    public String promote(@PathVariable Long studentId, @RequestParam Long classroomId) {
        studentService.promoteStudent(studentId, classroomId);
        return "promote success";
    }

    @GetMapping("/{studentId}")
    public StudentDto.Info getStudentById(@PathVariable Long studentId) {
        return studentService.getStudent(studentId);
    }
}
