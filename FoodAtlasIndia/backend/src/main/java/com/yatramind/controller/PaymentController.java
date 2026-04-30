package com.yatramind.controller;

import com.yatramind.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    /**
     * Simulate payment processing — generates transaction ID and returns success.
     * In production, this would integrate with Razorpay/Stripe.
     */
    @PostMapping("/process")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processPayment(
            @RequestBody Map<String, Object> request) {

        String method = (String) request.getOrDefault("method", "UPI");
        Number amountNum = (Number) request.getOrDefault("amount", 0);
        int amount = amountNum.intValue();

        if (amount <= 0) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid amount"));
        }

        // Generate transaction ID
        String txnId = "YM-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("transactionId", txnId);
        response.put("status", "SUCCESS");
        response.put("method", method);
        response.put("amount", amount);
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        response.put("message", "Payment of ₹" + amount + " processed successfully via " + method);

        return ResponseEntity.ok(ApiResponse.success("Payment successful", response));
    }
}
