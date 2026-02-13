package com.leenjae.controller;

import com.leenjae.dto.NoticeDto;
import com.leenjae.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notice")
public class NoticeController {
    private final NoticeService noticeService;

    @GetMapping("/birthday")
    public NoticeDto.BirthdayReponse getBirthday (
            @RequestParam int month
    ) {
        return noticeService.getBirthdayList(month);
    }
}
