package com.leenjae.service;

import com.leenjae.domain.Teacher;
import com.leenjae.domain.TeacherAttendance;
import com.leenjae.dto.TeacherAttendanceDto;
import com.leenjae.repository.TeacherAttendanceRepository;
import com.leenjae.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeacherAttendanceService {

    private final TeacherRepository teacherRepository;
    private final TeacherAttendanceRepository teacherAttendanceRepository;

    public TeacherAttendanceDto.Response getAttendance(Long teacherId, LocalDate date) {
        TeacherAttendance attendance = teacherAttendanceRepository.findByTeacherIdAndDate(teacherId, date);
        if (attendance == null) {
            return TeacherAttendanceDto.Response.empty(teacherId);
        } else {
            return TeacherAttendanceDto.Response.from(attendance);
        }
    }

    @Transactional
    public void updateAttendance(TeacherAttendanceDto.Request request, LocalDate date) {
        Teacher teacher = teacherRepository.findById(request.teacherId())
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));

        TeacherAttendance existingRecord = teacherAttendanceRepository.findByTeacherIdAndDate(request.teacherId(), date);
        if (existingRecord != null) {
            // LEE: dirty 체크의 정의? 뜻?
            // LEE: entity를 update하면 자동으로 DB update가 되는건가?
            existingRecord.update(request.worship(), request.otn(), request.dawnPray(), request.comments());
        } else {
            teacherAttendanceRepository.save(
                    TeacherAttendance.builder()
                            .teacher(teacher)
                            .worship(request.worship())
                            .otn(request.otn())
                            .dawnPray(request.dawnPray())
                            .build()
            );
        }
    }
}
