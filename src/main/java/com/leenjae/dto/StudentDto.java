package com.leenjae.dto;

import lombok.ToString;

import java.time.LocalDate;

@ToString
public class StudentDto {
    //LEE: 일단은 새친구등록에 대한 부분만 생각하고
    // 이후에 인적사항 변경도 가능하도록 범용 req res로 변경 필요.

    public record SummaryInfo(
            Long id,
            String name,
            Integer grade,
            String classNo,
            Long classroomId,
            Integer status
    ) {
    }

    // 홈 퀵서치용 경량 정보 (이름/나이(생일)/학교/학년반/반선생님/상태)
    public record SearchInfo(
            Long id,
            String name,
            LocalDate birthday,
            String school,
            Integer grade,
            String classNo,
            String teacherName,
            Integer status
    ) {
    }

    public record Info(
            Long id,
            Integer grade,
            String classNo,
            Long classroomId,
            String name,
            Boolean gender,
            String school,
            String phone,
            String parentPhone,
            String address,
            LocalDate birthday,
            Integer status,
            LocalDate registeredAt,
            LocalDate promotedAt,
            String remark,
            String evangelist
    ) {
    }
    //TODO : response 객체 따로 dto 따로?
}
