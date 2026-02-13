package com.leenjae.domain;

import lombok.Getter;

import java.util.Arrays;

@Getter
public enum StudentRole {
    PRESIDENT(1, "회장"),
    VICE_PRESIDENT(2, "부회장"),
    MANAGER(3, "총무"),
    DEPUTY_MANAGER(4, "부총무"),
    SECRETARY(5, "서기"),
    DEPUTY_SECRETARY(6, "부서기"),
    TREASURER(7, "회계"),
    DEPUTY_TREASURER(8, "부회계"),

    LEADER(10, "리더"),
    SINGER(21, "싱어"),
    INSTRUMENT(31, "악기"),
    WORSHIP(41, "워십"),
    ENGINEER(51, "엔지니어");

    private final int code;
    private final String description;

    StudentRole(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public static StudentRole byCode(int code) {
        return Arrays.stream(StudentRole.values())
                .filter(o -> o.code == code)
                .findFirst()
                .orElse(null);
    }

    public static StudentRole byDescription(String description) {
        return Arrays.stream(StudentRole.values())
                .filter(o -> o.description.equals(description))
                .findFirst()
                .orElse(null);
    }

}
