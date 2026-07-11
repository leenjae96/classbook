package com.leenjae.repository;

import com.leenjae.domain.Student;
import com.leenjae.domain.StudentRole;
import com.leenjae.dto.AdminDto;
import com.leenjae.dto.StudentDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Set;

public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByClassroomId(Long classroomId);

    @Query(" select s " +
            "from Student s " +
            "join fetch s.classroom c " +
            "where c.teacher.id = :teacherId ")
    List<Student> findByTeacherId(Long teacherId);

    @Query(" select s " +
            "from Student s " +
            "join fetch s.classroom c " +
            "where month(s.birthday) = :month " +
            "order by c.grade, c.classNo, s.name ")
    List<Student> findByBirthdayMonth(int month);

    @Query(" select s " +
            "from Student s " +
            "join s.roles r " +
            "where r = :studentRole ")
    List<Student> findByRole(StudentRole studentRole);

    @Query(" select s " +
            "from Student s " +
            "join s.roles r " +
            "where r in :studentRoles ")
    List<Student> findByRolesIn(Set<StudentRole> studentRoles);

    @Query("""
        SELECT new com.leenjae.dto.StudentDto$SummaryInfo(
            s.id, s.name, c.grade, c.classNo, c.id, s.status
        )
        FROM Student s
        LEFT JOIN s.classroom c
        WHERE s.status <> 5
        ORDER BY c.grade ASC, CAST(c.classNo AS int) ASC, s.name ASC
    """)
    List<StudentDto.SummaryInfo> findAllStudentSummaryInfo();

    // 소프트 삭제(status=5)된 학생만
    @Query("""
        SELECT new com.leenjae.dto.StudentDto$SummaryInfo(
            s.id, s.name, c.grade, c.classNo, c.id, s.status
        )
        FROM Student s
        LEFT JOIN s.classroom c
        WHERE s.status = 5
        ORDER BY s.name ASC
    """)
    List<StudentDto.SummaryInfo> findDeletedStudentSummaryInfo();

    // 홈 퀵서치: 삭제(5) 제외 전체. 별분(3)은 맨 아래, 나머지는 이름순
    @Query("""
        SELECT new com.leenjae.dto.StudentDto$SearchInfo(
            s.id, s.name, s.birthday, s.school, c.grade, c.classNo, s.status
        )
        FROM Student s
        LEFT JOIN s.classroom c
        WHERE s.status <> 5
        ORDER BY CASE WHEN s.status = 3 THEN 1 ELSE 0 END ASC, s.name ASC
    """)
    List<StudentDto.SearchInfo> findAllForSearch();


    List<Student> findByStatus(Integer status);
}
