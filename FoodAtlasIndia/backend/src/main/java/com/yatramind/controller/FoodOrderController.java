package com.yatramind.controller;

import com.yatramind.dto.request.FoodOrderRequest;
import com.yatramind.dto.response.ApiResponse;
import com.yatramind.entity.Expense;
import com.yatramind.entity.FoodOrder;
import com.yatramind.entity.User;
import com.yatramind.repository.ExpenseRepository;
import com.yatramind.repository.FoodOrderRepository;
import com.yatramind.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/food-orders")
@RequiredArgsConstructor
public class FoodOrderController {

    private final FoodOrderRepository foodOrderRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<FoodOrder>> placeOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody FoodOrderRequest request) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String txnId = "YM-FD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        FoodOrder order = FoodOrder.builder()
                .user(user)
                .items(request.getItems())
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryCity(request.getDeliveryCity())
                .pincode(request.getPincode())
                .phone(request.getPhone())
                .paymentMethod(request.getPaymentMethod())
                .paymentId(request.getPaymentId() != null ? request.getPaymentId() : txnId)
                .totalAmount(request.getTotalAmount())
                .deliveryFee(request.getDeliveryFee() != null ? request.getDeliveryFee() : 40)
                .estimatedDelivery("30-45 mins")
                .build();

        FoodOrder saved = foodOrderRepository.save(order);

        // Auto-add to expenses
        try {
            Expense expense = Expense.builder()
                    .user(user)
                    .category("Food")
                    .description("Food Order — " + request.getDeliveryCity())
                    .amount(request.getTotalAmount() + (request.getDeliveryFee() != null ? request.getDeliveryFee() : 40))
                    .date(LocalDate.now())
                    .journeyName(request.getDeliveryCity() != null ? request.getDeliveryCity() + " Trip" : "Food Order")
                    .build();
            expenseRepository.save(expense);
        } catch (Exception e) {
            // Don't fail the order if expense tracking fails
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully! Estimated delivery: 30-45 mins", saved));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FoodOrder>>> getOrders(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<FoodOrder> orders = foodOrderRepository.findByUserIdOrderByOrderedAtDesc(user.getId());
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
}
