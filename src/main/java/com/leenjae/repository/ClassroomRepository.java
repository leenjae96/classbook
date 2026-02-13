package com.leenjae.repository;

import com.leenjae.domain.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    @Query(" select c " +
            "from Classroom c " +
            "join fetch c.teacher " +
            "where c.grade = :grade " +
            "  and c.teacher is not null " +
            "order by c.id " )
    List<Classroom> findByGrade(Integer grade);

    @Query(" select c " +
            "from Classroom c " +
            "join fetch c.teacher " +
            "where c.grade = :grade and c.classNo = :classNo ")
    Optional<Classroom> findByGradeAndClassNo(Integer grade, String classNo);
}
