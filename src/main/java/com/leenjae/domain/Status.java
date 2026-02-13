package com.leenjae.domain;

import lombok.Getter;

import java.util.Arrays;

public enum Status {
    NEW(0, "새친구"),
    NORMAL(1, "일반, 정상"),
    GRADUATED(2, "졸업"),
    REMOVED(3, "제거"),
    ABSENCE(4, "휴직");

    @Getter
    private final int code;
    @Getter
    private final String description;

    Status(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public Status of(int code) {
        return Arrays.stream(Status.values())
                .filter(status -> status.code == code)
                .findFirst()
                .orElse(null);
    }

}
