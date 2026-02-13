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
@Table(
        name = "student_attendance"
)
public class StudentAttendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("식별자")
    private Long id;

    @Column(nullable = false)
    @Comment("날짜")
    private LocalDate date;

    @Column(nullable = false)
    @Comment("출결상태")
    private Boolean status;

    @Column
    @Comment("목양코멘트")
    private String comments;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Builder
    public StudentAttendance(Student student, LocalDate date, Boolean status, String comments) {
        this.student = student;
        this.date = date;
        this.status = status;
        this.comments = comments;
    }

    public void update(Boolean newStatus, String newComments) {
        this.status = newStatus;
        this.comments = newComments;
    }

}
