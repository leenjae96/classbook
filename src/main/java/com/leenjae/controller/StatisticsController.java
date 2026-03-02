package com.leenjae.controller;

import com.leenjae.dto.StatisticsDto;
import com.leenjae.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @GetMapping(value = "/grade-stats")
    public List<StatisticsDto.GradeStats> getGradeStatistics(
            @RequestParam LocalDate date
    ) {
        return statisticsService.getGradeStatistics(date);
    }

    @GetMapping(value = "/class-stats")
    public List<StatisticsDto.ClassStats> getClassStatistics(
            @RequestParam LocalDate date
    ) {
        return statisticsService.getClassStatistics(date);
    }

    @GetMapping(value = "/teacher-stats")
    public List<StatisticsDto.TeacherStats> getTeacherStatistics(
            @RequestParam LocalDate date
    ) {
        return statisticsService.getTeacherStatistics(date);
    }
}
