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
@Table(name = "teacher_attendance", uniqueConstraints = {
        @UniqueConstraint(
                columnNames = {"teacher_id", "date"}
        )
})
@Comment("교사 출석 정보")
public class TeacherAttendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("식별자")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(nullable = false)
    @Comment("날짜")
    private LocalDate date;

    @Column(nullable = false)
    @Comment("출결상태")
    private Boolean status;

    @Column
    @Comment("출결 사유 코멘트")
    private String comments;

    @Builder
    public TeacherAttendance(Teacher teacher, LocalDate date, Boolean status, String comments) {
        this.teacher = teacher;
        this.date = date;
        this.status = status;
        this.comments = comments;
    }

    public void update(Boolean newStatus, String newComments) {
        this.status = newStatus;
        this.comments = newComments;
    }
}
