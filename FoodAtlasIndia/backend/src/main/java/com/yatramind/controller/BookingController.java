package com.yatramind.controller;

import com.yatramind.dto.request.BookingRequest;
import com.yatramind.dto.response.ApiResponse;
import com.yatramind.entity.Booking;
import com.yatramind.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> createBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BookingRequest request) {
        Booking booking = bookingService.createBooking(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking confirmed", booking));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Booking>>> getBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Booking> bookings = bookingService.getUserBookings(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Booking>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Booking booking = bookingService.cancelBooking(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", booking));
    }
}
