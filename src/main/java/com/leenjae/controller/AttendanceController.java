package com.leenjae.controller;

import com.leenjae.dto.AttendanceDto;
import com.leenjae.dto.StudentDto;
import com.leenjae.dto.TeacherDto;
import com.leenjae.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/attendances")
@CrossOrigin(origins = "http://localhost:9999")
public class AttendanceController {

    private final AttendanceService attendanceService;

    // LEE: teacherId에 맞춰서 교사보고서 전달
    //  반목이 있으면 학생명단도 주고
    //  없으면 선생님 보고서만 전달
    @GetMapping(value = "/sheet", params = "teacherId")
    public AttendanceDto.Sheet getSheet(
            @RequestParam long teacherId,
            @RequestParam LocalDate date
    ) {
        return attendanceService.getSheetByTeacherId(teacherId, date);
    }

    @GetMapping(value = "/sheet", params = {"grade", "classNo"})
    public AttendanceDto.Sheet getSheet(
            @RequestParam int grade,
            @RequestParam int classNo,
            @RequestParam LocalDate date
    ) {
        return attendanceService.getSheetByGradeAndClassNo(grade, classNo, date);
    }

    @GetMapping(value = "/sheet", params = "teamName")
    public AttendanceDto.Sheet getSheet(
            @RequestParam String teamName,
            @RequestParam LocalDate date
    ) {
        return attendanceService.getSheetByWorshipTeamName(teamName, date);
    }

    @GetMapping("/classroom")
    public List<AttendanceDto.ClassroomSummary> getClassroomList(
            @RequestParam int grade
    ) {
        return attendanceService.getClassroomListByGrade(grade);
    }

    @GetMapping("/administrative")
    public List<TeacherDto.Response> getAdministrativceList() {
        return attendanceService.getAdministrativceList();
    }

    @PostMapping("/sheet")
    // LEE: sheet에 날짜 정보 넣기?
    public String saveSheet(
            @RequestParam LocalDate date,
            @RequestBody AttendanceDto.Sheet sheet
    ) {
        attendanceService.saveSheet(date, sheet);
        return "save success.";
    }

    @GetMapping("/new-friend/sheet")
    public AttendanceDto.Sheet getNewFriendList(
            @RequestParam LocalDate date
    ) {
        return attendanceService.getSheetOfNewFriend(date);
    }

    /*@GetMapping("/new-friend")
    public List<StudentDto.Info> getNewFriendList() {
        return attendanceService.getNewFriends();
    }*/

    @PostMapping("/new-friend")
    public String registerNewFriend(
            @RequestBody StudentDto.Info info
    ) {
        return "save success. " + attendanceService.registerStudent(info);
    }

    @PutMapping("/new-friend")
    public String promoteNewFriend(
            @RequestBody StudentDto.Info info
    ) {
        return "save success. " + attendanceService.updateStudent(info);
    }


    @GetMapping("/student")
    public StudentDto.Info setStudent(
            @RequestParam Long id
    ) {
        return attendanceService.getStudent(id);
    }

    //LEE: 관리자 페이지용.
    @PostMapping("/student")
    public String registerStudent(
            @RequestBody StudentDto.Info info
    ) {
        return "save success. " + attendanceService.registerStudent(info);
    }

    @PutMapping("/student")
    public String updateStudent(
            @RequestBody StudentDto.Info info
    ) {
        return "save success. " + attendanceService.updateStudent(info);
    }
    @DeleteMapping("/student")
    public String saveStudent(
            @RequestParam Long studentId
    ) {
        attendanceService.deleteStudent(studentId);
        return "delete success.";
    }
}
