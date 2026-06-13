package com.leenjae.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "student_history")
@Comment("학생 히스토리 정보")
public class StudentHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("식별자")
    private Long id;

    @Column(nullable = false)
    @Comment("상태 변경 일")
    private LocalDate statusChangeDate;

    @Column(nullable = false)
    @Comment("변경 전 상태")
    private Integer preStatus;

    @Column(nullable = false)
    @Comment("변경 후 상태")
    private Integer postStatus;

    @Column(nullable = false)
    @Comment("코멘트")
    private String comments;

    @CreatedDate
    @Column(nullable=false, updatable = false)
    @Comment("수정 일시")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @Comment("학생 식별자")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "old_classroom_id")
    @Comment("이전 반 식별자")
    private Classroom oldClassroom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_classroom_id")
    @Comment("최종 반 식별자")
    private Classroom newClassroom;

    @Builder
    public StudentHistory(
            Student student,
            Classroom oldClassroom,
            Classroom newClassroom,
            LocalDate date,
            Integer preStatus,
            Integer postStatus,
            String comments
    ) {
        this.student = student;
        this.oldClassroom = oldClassroom;
        this.newClassroom = newClassroom;
        this.statusChangeDate = date;
        this.preStatus = preStatus;
        this.postStatus = postStatus;
        this.comments = comments;
    }
}
