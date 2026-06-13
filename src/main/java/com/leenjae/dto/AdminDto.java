package com.leenjae.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class AdminDto {

    // 관리자 출석 수정: 변경된 학생들만 사유와 함께 전달
    public record AttendanceEditRequest(
            LocalDate date,          // 수정 대상 출석일 (히스토리 status_change_date 로 기록)
            List<Item> items
    ) {
        public record Item(
                Long studentId,
                Boolean status,      // 출석 여부
                String comments,     // 출석부 코멘트
                String reason        // 히스토리 사유
        ) {}
    }

    public record TeacherWeeklyReportItem(
            String classroom,
            String name,
            LocalDate date,
            Integer worship,
            Boolean otn,
            Integer dawnPray,
            String comments
    ) {}

    public record TotalReportResponse(
            Integer grade,
            String classNo,
            AttendanceDto.Sheet sheet // ✨ 기존에 만든 완벽한 구조를 그대로 가져다 씁니다!
    ) {}

    public record HistoryResponse(
            List<Item> items
    ) {
        public record Item(
                Long id,
                String studentName,
                String oldClassroom,        // 이전 반 (포맷된 라벨, 없으면 "-")
                String newClassroom,        // 새 반 (포맷된 라벨, 없으면 "-")
                String comments,
                LocalDate statusChangeDate, // 상태변경일 (출석수정이면 해당 출석일)
                LocalDateTime createdAt     // 수정일시 (실제 기록 시각)
        ) {}
    }

}
