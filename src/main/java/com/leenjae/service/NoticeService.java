package com.leenjae.service;

import com.leenjae.domain.Student;
import com.leenjae.domain.Teacher;
import com.leenjae.dto.NoticeDto;
import com.leenjae.repository.NoticeRepository;
import com.leenjae.repository.StudentRepository;
import com.leenjae.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final NoticeRepository noticeRepository;

    public NoticeDto.BirthdayReponse getBirthdayList(int month) {
        // 개인정보 보호: 이번 달과 다음 달(한국시각 기준)만 조회 허용
        int thisMonth = LocalDate.now(ZoneId.of("Asia/Seoul")).getMonthValue();
        int nextMonth = thisMonth == 12 ? 1 : thisMonth + 1;
        if (month != thisMonth && month != nextMonth) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "생일자는 이번 달과 다음 달만 조회할 수 있습니다.");
        }
        // LEE: 음력, 윤달평달 convert 필요.
        return NoticeDto.BirthdayReponse.builder()
                .month(month)
                .studentBirthdays(
                        studentRepository.findByBirthdayMonth(month)
                                .stream()
                                .map(NoticeDto.StudentBirthday::from)
                                .toList())
                .teacherBirthdays(
                        teacherRepository.findByBirthdayMonth(month)
                                .stream()
                                .map(NoticeDto.TeacherBirthday::from)
                                .toList())
                .build();
    }

    // 날짜가 속한 주(일요일 시작)의 새로 온 친구 / 등반한 친구
    public NoticeDto.WeeklyNewFriendResponse getWeeklyNewFriends(LocalDate date) {
        LocalDate weekStart = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
        LocalDate weekEnd = weekStart.plusDays(6);

        return NoticeDto.WeeklyNewFriendResponse.builder()
                .weekStart(weekStart)
                .weekEnd(weekEnd)
                .registered(
                        studentRepository.findRegisteredBetween(weekStart, weekEnd)
                                .stream()
                                // 1/1 은 '등록일 미상' placeholder 라 제외
                                .filter(s -> !(s.getRegisteredAt().getMonthValue() == 1 && s.getRegisteredAt().getDayOfMonth() == 1))
                                .map(s -> NoticeDto.WeeklyStudent.of(s, s.getRegisteredAt()))
                                .toList())
                .promoted(
                        studentRepository.findPromotedBetween(weekStart, weekEnd)
                                .stream()
                                .map(s -> NoticeDto.WeeklyStudent.of(s, s.getPromotedAt()))
                                .toList())
                .build();
    }
}
