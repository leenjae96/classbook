package com.leenjae.repository;

import com.leenjae.domain.StudentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface StudentHistoryRepository extends JpaRepository<StudentHistory, Long> {

    @Query("""
                SELECT h FROM StudentHistory h
                JOIN FETCH h.student s
                LEFT JOIN FETCH h.oldClassroom oc
                LEFT JOIN FETCH h.newClassroom nc
                WHERE h.statusChangeDate BETWEEN :startDate AND :endDate
                ORDER BY h.statusChangeDate ASC, h.createdAt ASC
            """)
    List<StudentHistory> findByStatusChangeDateBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
