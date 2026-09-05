package com.leenjae.controller;

import com.leenjae.dto.AdminDto;
import com.leenjae.dto.AttendanceDto;
import com.leenjae.dto.StudentDto;
import com.leenjae.service.AdminAuthService;
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
    private final AdminAuthService adminAuthService;

    // PIN 게이트 로그인 — 인터셉터 제외 경로 (WebConfig 참고)
    @PostMapping("/login")
    public ResponseEntity<AdminDto.LoginResponse> login(
            @RequestBody AdminDto.LoginRequest req
    ) {
        AdminAuthService.LoginResult result = adminAuthService.login(req.pin());
        return ResponseEntity.ok(new AdminDto.LoginResponse(result.token(), result.expiresAt()));
    }

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

    // 소프트 삭제(status=5)된 학생 목록
    @GetMapping(value = "/students/deleted")
    public ResponseEntity<List<StudentDto.SummaryInfo>> getDeletedStudents() {
        return ResponseEntity.ok(adminService.getDeletedStudentSummaryInfo());
    }

    // 인적사항 엑셀 export용 전체 학생 (ABCD 포함, 삭제 제외)
    @GetMapping(value = "/students/export")
    public ResponseEntity<List<AdminDto.StudentExportRow>> getStudentExport() {
        return ResponseEntity.ok(adminService.getStudentExport());
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

    // 학생 소프트 삭제 (status=5, 사유는 히스토리 기록)
    @PostMapping("/students/{id}/delete")
    public ResponseEntity<Void> softDeleteStudent(
            @PathVariable Long id,
            @RequestBody AdminDto.StudentDeleteRequest req
    ) {
        attendanceService.softDeleteStudent(id, req.reason());
        return ResponseEntity.ok().build();
    }

    //@DeleteMapping("/students")
    //public ResponseEntity<Void> saveStudent(
    //        @RequestParam Long studentId
    //) {
    //    attendanceService.deleteStudent(studentId);
    //    return ResponseEntity.ok().build();
    //}

    @GetMapping("/teacher-cumulative-stats")
    public ResponseEntity<AttendanceDto.TeacherCumulativeSheet> getTeacherCumulativeStats(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return ResponseEntity.ok(attendanceService.getTeacherCumulativeStatistics(startDate, endDate));
    }

    @GetMapping("/teacher-weekly-report")
    public ResponseEntity<List<AdminDto.TeacherWeeklyReportItem>> getTeacherWeeklyReport(
            @RequestParam LocalDate date
    ) {
        return ResponseEntity.ok(adminService.getTeacherWeeklyReport(date));
    }

    // 관리자 출석 수정 (날짜 잠금 없이, 변경 학생별 사유는 히스토리로 기록)
    @PostMapping("/attendances")
    public ResponseEntity<Void> editAttendances(
            @RequestBody AdminDto.AttendanceEditRequest req
    ) {
        adminService.editAttendances(req);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/histories")
    public ResponseEntity<AdminDto.HistoryResponse> getHistories(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return ResponseEntity.ok(adminService.getHistories(startDate, endDate));
    }
}
