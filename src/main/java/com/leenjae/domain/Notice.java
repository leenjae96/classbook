package com.leenjae.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "notice")
@Comment("공지사항")
public class Notice {
    @Id
    @Comment("식별자")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}
