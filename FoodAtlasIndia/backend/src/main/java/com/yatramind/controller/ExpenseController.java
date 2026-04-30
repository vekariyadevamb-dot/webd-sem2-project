package com.yatramind.controller;

import com.yatramind.dto.request.ExpenseRequest;
import com.yatramind.dto.response.ApiResponse;
import com.yatramind.entity.Expense;
import com.yatramind.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ApiResponse<Expense>> addExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ExpenseRequest request) {
        Expense expense = expenseService.addExpense(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense added", expense));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Expense>>> getExpenses(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Expense> expenses = expenseService.getUserExpenses(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> summary = expenseService.getExpenseSummary(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        expenseService.deleteExpense(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Expense deleted", null));
    }
}
