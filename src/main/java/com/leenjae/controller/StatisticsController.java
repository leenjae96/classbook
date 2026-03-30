package com.leenjae.controller;

import com.leenjae.dto.StatisticsDto;
import com.leenjae.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/statistics")
//@CrossOrigin(origins = "http://localhost:9999")
public class StatisticsController {
    private final StatisticsService statisticsService;

    @GetMapping(value = "/for-dashboard")
    public ResponseEntity<List<StatisticsDto.WeeklyDashboardResponse>> getWeeklyStats(
            @RequestParam LocalDate date
    ) {
        // 프론트에서 날짜를 안 던져줬을 때의 기본값 방어 로직 (선택 사항)
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(statisticsService.getDashboardStatistics(targetDate));
    }


    @GetMapping(value = "/student-stats")
    public StatisticsDto.Response getGradeStatistics(
            @RequestParam LocalDate date
    ) {
        return statisticsService.getGradeStatistics(date);
    }

    @GetMapping(value = "/teacher-stats")
    public StatisticsDto.Response getTeacherStatistics(
            @RequestParam LocalDate date
    ) {
        return statisticsService.getTeacherStatistics(date);
    }
}
