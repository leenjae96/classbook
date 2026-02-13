package com.leenjae.service;

import com.leenjae.domain.Student;
import com.leenjae.domain.Teacher;
import com.leenjae.dto.NoticeDto;
import com.leenjae.repository.NoticeRepository;
import com.leenjae.repository.StudentRepository;
import com.leenjae.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final NoticeRepository noticeRepository;

    public NoticeDto.BirthdayReponse getBirthdayList(int month) {
        // LEE: 음력, 윤달평달 convert 필요.
        return NoticeDto.BirthdayReponse.builder()
                .month(month)
                .studentBirthdays(
                        studentRepository.findByBirthdayMonth(month)
                                .stream()
                                .map(NoticeDto.StudentBirthday::from)
                                .toList())
                .teacherBirthdays(
                        teacherRepository.findByBirthdayMonth(month)
                                .stream()
                                .map(NoticeDto.TeacherBirthday::from)
                                .toList())
                .build();
    }
}
