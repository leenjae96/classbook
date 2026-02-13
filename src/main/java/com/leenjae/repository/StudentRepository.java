package com.leenjae.repository;

import com.leenjae.domain.Student;
import com.leenjae.domain.StudentRole;
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

    List<Student> findByStatus(Integer status);
}
