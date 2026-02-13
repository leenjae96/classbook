package com.leenjae.domain;

import com.leenjae.global.common.StudentRoleConverter;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.Comment;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@ToString
@NoArgsConstructor
public class Student {
    @Id
    //LEE: 여기서 쓰는 generationType 전략이랑 autoIncrement 와의 차이는?
    // 그냥 설정해놓으면 생성할때 그렇게 참고하나?
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    @Comment("이름")
    private String name;

    @Column(nullable = false)
    @Comment("성별")
    private Boolean gender;

    @Column(length = 20)
    @Comment("학교")
    private String school;

    @Column(length = 20)
    @Comment("전화번호")
    private String phone;

    @Column(length = 40)
    @Comment("부모님 전화번호")
    private String parentPhone;

    @Column(length = 100)
    @Comment("주소")
    private String address;

    @Column
    @Comment("생일")
    private LocalDate birthday;

    @Column(nullable = false, length = 5)
    @Comment("상태")
    private Integer status;

    @Column
    @Comment("등록 일시")
    private LocalDate registeredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id")
    @Comment("반 식별자")
    private Classroom classroom;

    @Column
    @Comment("등반 일시")
    private LocalDate promotedAt;

    @Column(length = 1000)
    @Comment("비고")
    private String remark;

    //LEE: roles
    @ElementCollection(targetClass = StudentRole.class)
    @CollectionTable(name = "student_roles", joinColumns = @JoinColumn(name = "student_id"))
    @Convert(converter = StudentRoleConverter.class)
    @Column(name = "role_code")
    private Set<StudentRole> roles = new HashSet<>();

    public void promote(Classroom classroom) {
        this.classroom = classroom;
        this.status = Status.NORMAL.getCode();
    }

    @Builder
    public Student(
            String name,
            Boolean gender,
            String school,
            String phone,
            String parentPhone,
            String address,
            LocalDate birthday,
            Integer status,
            LocalDate registeredAt,
            LocalDate promotedAt,
            String remark,
            Classroom classroom
    ) {
        this.name = name;
        this.gender = gender;
        this.school = school;
        this.phone = phone;
        this.parentPhone = parentPhone;
        this.birthday = birthday;
        this.address = address;
        this.status = status;
        this.registeredAt = registeredAt;
        this.promotedAt = promotedAt;
        this.remark = remark;
        this.classroom = classroom;
    }

    public void update(
            Boolean gender,
            String school,
            String phone,
            String parentPhone,
            String address,
            LocalDate birthday,
            Integer status,
            LocalDate registeredAt,
            LocalDate promotedAt,
            String remark,
            Classroom classroom
    ) {
        this.gender = gender;
        this.school = school;
        this.phone = phone;
        this.parentPhone = parentPhone;
        this.address = address;
        this.birthday = birthday;
        this.status = status;
        this.registeredAt = registeredAt;
        this.promotedAt = promotedAt;
        this.remark = remark;
        this.classroom = classroom;
    }
}
