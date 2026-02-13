package com.leenjae.dto;

import com.leenjae.domain.Student;
import com.leenjae.domain.Teacher;
import lombok.Builder;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class NoticeDto {

    // 날짜 포맷터 미리 정의 (스레드 안전함)
    private static final DateTimeFormatter BIRTHDAY_FORMATTER = DateTimeFormatter.ofPattern("MM-dd");

    @Builder
    public record BirthdayReponse(
            Integer month,
            List<StudentBirthday> studentBirthdays,
            List<TeacherBirthday> teacherBirthdays
    ) {
    }

    @Builder
    public record StudentBirthday(
            Long id,
            String name,
            Integer grade,
            String classNo,
            String birthday
    ) {
        public static StudentBirthday from (Student entity) {
            return StudentBirthday.builder()
                    .id(entity.getId())
                    .name(entity.getName())
                    .grade(entity.getClassroom().getGrade())
                    .classNo(entity.getClassroom().getClassNo())
                    .birthday(BIRTHDAY_FORMATTER.format(entity.getBirthday()))
                    .build();
        }
    }

    @Builder
    public record TeacherBirthday(
            Long id,
            String name,
            Boolean isLunar,
            String birthday
    ) {
        public static TeacherBirthday from (Teacher entity) {
            return TeacherBirthday.builder()
                    .id(entity.getId())
                    .name(entity.getName())
                    .isLunar(entity.getIsLunar())
                    .birthday(BIRTHDAY_FORMATTER.format(entity.getBirthday()))
                    .build();
        }
    }

    public record CreateRequest() {
    }

    public record UpdateRequest() {
    }

    public record DeleteRequest() {
    }

    public record NoticeResponse() {
    }
}
