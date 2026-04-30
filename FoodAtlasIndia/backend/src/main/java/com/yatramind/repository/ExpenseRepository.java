package com.yatramind.repository;

import com.yatramind.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserIdOrderByDateDesc(Long userId);
    List<Expense> findByUserIdAndJourneyName(Long userId, String journeyName);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId GROUP BY e.category")
    List<Object[]> getCategoryBreakdown(Long userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId")
    Integer getTotalExpenses(Long userId);
}
