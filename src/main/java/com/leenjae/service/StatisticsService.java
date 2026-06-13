package com.leenjae.service;

import com.leenjae.dto.StatisticsDto;
import com.leenjae.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsService {
    private final ClassroomRepository classroomRepository;
    private final StudentRepository studentRepository;
    private final StudentAttendanceRepository studentAttendanceRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherReportRepository teacherReportRepository;

    public List<StatisticsDto.WeeklyDashboardResponse> getDashboardStatistics(LocalDate date) {
        LocalDate startDate = date.minusDays(56);
        // 2. DB에서 56일치 범위 내 데이터 조회
        List<StatisticsDto.WeeklyGradeStats> rawStats =
                studentAttendanceRepository.getWeeklyGradeStats(startDate, date);

        // 3. 날짜별/학년별 그룹핑
        Map<LocalDate, Map<Integer, Long>> groupedByDate = rawStats.stream()
                .collect(Collectors.groupingBy(
                        StatisticsDto.WeeklyGradeStats::date,
                        Collectors.toMap(
                                StatisticsDto.WeeklyGradeStats::grade,
                                StatisticsDto.WeeklyGradeStats::attendanceCount
                        )
                ));

        // 4. 프론트엔드 포맷(가로) 변환 후 오름차순 정렬
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd");

        return groupedByDate.entrySet().stream()
                .map(entry -> {
                    LocalDate localDate = entry.getKey();
                    Map<Integer, Long> grades = entry.getValue();

                    return new StatisticsDto.WeeklyDashboardResponse(
                            localDate.format(formatter),
                            grades.getOrDefault(0, 0L),
                            grades.getOrDefault(1, 0L),
                            grades.getOrDefault(2, 0L),
                            grades.getOrDefault(3, 0L)
                    );
                })
                .sorted(Comparator.comparing(StatisticsDto.WeeklyDashboardResponse::date))
                .toList();

    }

    public StatisticsDto.Response getGradeStatistics(LocalDate date) {
        // 올해 1/1 = 등록일 미상 placeholder → '올해 등록 추적'에서 제외
        LocalDate excludeDate = LocalDate.of(date.getYear(), 1, 1);

        return StatisticsDto.Response.builder()
                .classStats(studentAttendanceRepository.getStudentStatsByDate(date))
                .newFriendStats(studentAttendanceRepository.getNewFriendStatsByDate(date, excludeDate))
                .date(date)
                .build();
    }

    public StatisticsDto.Response getTeacherStatistics(LocalDate date) {
        return null;
    }
}
