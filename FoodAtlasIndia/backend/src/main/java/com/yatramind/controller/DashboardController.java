package com.yatramind.controller;

import com.yatramind.dto.response.ApiResponse;
import com.yatramind.dto.response.DashboardResponse;
import com.yatramind.dto.response.UserResponse;
import com.yatramind.entity.Booking;
import com.yatramind.entity.User;
import com.yatramind.repository.BookingRepository;
import com.yatramind.repository.ExpenseRepository;
import com.yatramind.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ExpenseRepository expenseRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> allBookings = bookingRepository.findByUserIdOrderByBookedAtDesc(user.getId());
        List<Booking> activeBookings = bookingRepository.findByUserIdAndStatus(user.getId(), Booking.BookingStatus.CONFIRMED);
        Integer totalSpent = expenseRepository.getTotalExpenses(user.getId());
        List<Object[]> breakdown = expenseRepository.getCategoryBreakdown(user.getId());

        // Count unique journeys (by travel date)
        int totalTrips = (int) allBookings.stream()
                .map(Booking::getTravelDate)
                .filter(Objects::nonNull)
                .distinct()
                .count();

        // Recent bookings (last 5)
        List<Map<String, Object>> recentBookings = allBookings.stream()
                .limit(5)
                .map(b -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", b.getId());
                    map.put("type", b.getType());
                    map.put("details", b.getDetails());
                    map.put("totalAmount", b.getTotalAmount());
                    map.put("status", b.getStatus());
                    map.put("travelDate", b.getTravelDate());
                    map.put("bookedAt", b.getBookedAt());
                    return map;
                }).collect(Collectors.toList());

        // Expense breakdown
        List<Map<String, Object>> expenseBreakdown = breakdown.stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("category", row[0]);
                    map.put("total", row[1]);
                    return map;
                }).collect(Collectors.toList());

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();

        DashboardResponse dashboard = DashboardResponse.builder()
                .user(userResponse)
                .totalTrips(totalTrips)
                .totalSpent(totalSpent)
                .activeBookings(activeBookings.size())
                .savedPlaces(0) // TODO: implement saved places
                .recentBookings(recentBookings)
                .expenseBreakdown(expenseBreakdown)
                .build();

        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}
