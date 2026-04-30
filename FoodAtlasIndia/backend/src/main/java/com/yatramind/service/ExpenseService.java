package com.yatramind.service;

import com.yatramind.dto.request.ExpenseRequest;
import com.yatramind.entity.Expense;
import com.yatramind.entity.User;
import com.yatramind.repository.ExpenseRepository;
import com.yatramind.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public Expense addExpense(String email, ExpenseRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = Expense.builder()
                .user(user)
                .category(request.getCategory())
                .description(request.getDescription())
                .amount(request.getAmount())
                .date(request.getDate())
                .journeyName(request.getJourneyName())
                .build();

        return expenseRepository.save(expense);
    }

    public List<Expense> getUserExpenses(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return expenseRepository.findByUserIdOrderByDateDesc(user.getId());
    }

    public void deleteExpense(Long id, String email) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: Not your expense");
        }

        expenseRepository.delete(expense);
    }

    public Map<String, Object> getExpenseSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Integer total = expenseRepository.getTotalExpenses(user.getId());
        List<Object[]> breakdown = expenseRepository.getCategoryBreakdown(user.getId());

        List<Map<String, Object>> categories = new ArrayList<>();
        for (Object[] row : breakdown) {
            Map<String, Object> map = new HashMap<>();
            map.put("category", row[0]);
            map.put("total", row[1]);
            categories.add(map);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalSpent", total);
        summary.put("categoryBreakdown", categories);
        return summary;
    }
}
