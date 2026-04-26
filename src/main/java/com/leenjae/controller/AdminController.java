package com.leenjae.controller;

import com.leenjae.dto.AdminDto;
import com.leenjae.dto.AttendanceDto;
import com.leenjae.dto.StudentDto;
import com.leenjae.service.AdminService;
import com.leenjae.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/administrator")
public class AdminController {
    private final AdminService adminService;
    private final AttendanceService attendanceService;

    @GetMapping(value = "/cumulative-stats")
    public ResponseEntity<AttendanceDto.CumulativeSheet> getCumulativeStats(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return ResponseEntity.ok(
                attendanceService.getCumulativeStatistics(startDate, endDate, null, null)
        );
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

    //TODO: 관리자 update
    @PutMapping("/students")
    public ResponseEntity<Void> updateStudent(
            @RequestBody AttendanceDto.EditStudentInfo info
    ) {
        attendanceService.updateNewFriend(info);
        return ResponseEntity.ok().build();
    }

    //@DeleteMapping("/students")
    //public ResponseEntity<Void> saveStudent(
    //        @RequestParam Long studentId
    //) {
    //    attendanceService.deleteStudent(studentId);
    //    return ResponseEntity.ok().build();
    //}

    @GetMapping("/histories")
    public ResponseEntity<AdminDto.HistoryResponse> getHistories(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return ResponseEntity.ok(adminService.getHistories(startDate, endDate));
    }
}
