package com.leenjae.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

@Entity
@Getter
@NoArgsConstructor(access= AccessLevel.PROTECTED)
public class Classroom {
    @Id
    @Comment("식별자")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 2)
    @Comment("학년(0: 1부)")
    private Integer grade;

    @Column(length = 5)
    @Comment("반")
    private String classNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @Builder
    public Classroom(Integer grade, String classNo) {
        this.grade = grade;
        this.classNo = classNo;
    }

}
