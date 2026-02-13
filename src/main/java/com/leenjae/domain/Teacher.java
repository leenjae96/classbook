package com.leenjae.domain;

import com.leenjae.global.common.TeacherRoleConverter;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@NoArgsConstructor
public class Teacher {

    @Id
    @Comment("식별자")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    @Comment("이름")
    private String name;

    @Column(nullable = false)
    @Comment("성별")
    private Boolean gender;

    @Column(length = 20)
    @Comment("전화번호")
    private String phone;

    @Column(length = 100)
    @Comment("주소")
    private String address;

    @Column
    @Comment("생일")
    private LocalDate birthday;

    @Column
    @Comment("음력 여부")
    private Boolean isLunar;

    @Column
    @Comment("등록 일시")
    private LocalDate registeredAt;

    @Column
    @Comment("비고")
    private String remark;

    @ElementCollection(targetClass = TeacherRoles.class)
    @CollectionTable(name = "teacher_roles", joinColumns = @JoinColumn(name = "teacher_id"))
    @Convert(converter = TeacherRoleConverter.class)
    @Column(name = "role_code")
    private Set<TeacherRoles> roles = new HashSet<>();

    @OneToMany(mappedBy = "teacher")
    private Set<Classroom> classrooms = new HashSet<>();

    @Builder
    public Teacher(
            String name,
            Boolean gender,
            String phone,
            LocalDate birthday,
            Boolean isLunar,
            LocalDate registeredAt
    ) {
        this.name = name;
        this.gender = gender;
        this.phone = phone;
        this.birthday = birthday;
        this.isLunar = isLunar;
        this.registeredAt = registeredAt;
    }
}
