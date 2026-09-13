package com.leenjae.controller;

import com.leenjae.dto.NoticeDto;
import com.leenjae.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

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

    // 게시판 > 새친구/등반 (date 가 속한 주, 일요일 시작)
    @GetMapping("/new-friend-weekly")
    public NoticeDto.WeeklyNewFriendResponse getWeeklyNewFriends(
            @RequestParam LocalDate date
    ) {
        return noticeService.getWeeklyNewFriends(date);
    }
}
