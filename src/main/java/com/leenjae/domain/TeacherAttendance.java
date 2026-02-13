package com.leenjae.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "teacher_attendance")
public class TeacherAttendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("식별자")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @Comment("선생님 식별자")
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(nullable = false)
    @Comment("날짜")
    private LocalDate date;

    @Column(nullable = false, length = 3)
    @Comment("출석 예배 (1~6: 부 예배 0: 미참석)")
    private Integer worship;

    @Column(nullable = false)
    @Comment("otn 출석 여부")
    private Boolean otn;

    @Column(nullable = false, length = 3)
    @Comment("새벽기도 출석 횟수")
    private Integer dawnPray;

    @Column
    @Comment("심방 기도제목 건의사항 코멘트")
    private String comments;

    @Builder
    public TeacherAttendance(
            Teacher teacher,
            LocalDate date,
            Integer worship,
            Boolean otn,
            Integer dawnPray,
            String comments
    ) {
        this.teacher = teacher;
        this.date = date;
        this.worship = worship;
        this.otn = otn;
        this.dawnPray = dawnPray;
        this.comments = comments;
    }

    public void update(Integer newWorship, Boolean newOtn, Integer newDawnPray, String newComments) {
        this.worship = newWorship;
        this.otn = newOtn;
        this.dawnPray = newDawnPray;
        this.comments = newComments;
    }

}
