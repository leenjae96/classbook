package com.leenjae.domain;

import lombok.Getter;

import java.util.Arrays;

@Getter
public enum TeacherRoles {
    PASTOR(1, "목사"),
    DIRECTOR(2, "부장"),
    DEPUTY_DIRECTOR(3, "부감"),
    SECRETARY(4, "서기"),
    TREASURER(5, "회계"),
    WORSHIP_TEAM(6, "찬양팀"),
    SERVANT(7, "섬김이"),
    SUPPORT(8, "지원");

    private final int code;
    private final String description;

    TeacherRoles(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public static TeacherRoles of(int code) {
        return Arrays.stream(TeacherRoles.values())
                .filter(r -> r.code == code)
                .findAny()
                .orElse(null);
    }
}
