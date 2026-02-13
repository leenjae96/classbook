package com.leenjae.dto;

import lombok.Builder;

import java.time.LocalDate;

public class StudentDto {
    //LEE: 일단은 새친구등록에 대한 부분만 생각하고
    // 이후에 인적사항 변경도 가능하도록 범용 req res로 변경 필요.
    @Builder
    public record Info(
            Long id,
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
            String remark
    ) {
    }
}
