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

    // 게시판 > 새친구/등반: 한 주(일~토)에 새로 온 친구와 등반한 친구
    @Builder
    public record WeeklyNewFriendResponse(
            LocalDate weekStart,
            LocalDate weekEnd,
            List<WeeklyStudent> registered, // 이번 주 첫 출석(등록)
            List<WeeklyStudent> promoted    // 이번 주 등반
    ) {
    }

    public record WeeklyStudent(
            Long id,
            String name,
            Integer grade,
            String classNo,
            String teacherName,
            LocalDate date,     // 등록일 또는 등반일
            Integer status
    ) {
        public static WeeklyStudent of(Student entity, LocalDate date) {
            var c = entity.getClassroom();
            return new WeeklyStudent(
                    entity.getId(),
                    entity.getName(),
                    c != null ? c.getGrade() : null,
                    c != null ? c.getClassNo() : null,
                    (c != null && c.getTeacher() != null) ? c.getTeacher().getName() : null,
                    date,
                    entity.getStatus()
            );
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
