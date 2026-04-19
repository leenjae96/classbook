package com.leenjae.controller;

import com.leenjae.dto.AdminDto;
import com.leenjae.dto.StudentDto;
import com.leenjae.service.AdminService;
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
@RequestMapping("/api/administrator")
public class AdminController {
    private final AdminService adminService;

    @GetMapping(value = "/cumulative-stats")
    public AdminDto.CumulativeSheet getCumulativeStats(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return adminService.getCumulativeStatistics(startDate, endDate);
    }

    @GetMapping(value = "/students")
    public ResponseEntity<List<StudentDto.SummaryInfo>> getStudentSummaryInfo() {
        return ResponseEntity.ok(adminService.getStudentSummaryInfo());
    }

    @GetMapping("/total-reports")
    public ResponseEntity<List<AdminDto.TotalReportResponse>> getTotalReports(
            @RequestParam LocalDate date) {
        return ResponseEntity.ok(adminService.getTotalReports(date));
    }
}
