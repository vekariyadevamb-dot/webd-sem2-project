package com.yatramind.service;

import com.yatramind.dto.request.BookingRequest;
import com.yatramind.entity.Booking;
import com.yatramind.entity.Expense;
import com.yatramind.entity.User;
import com.yatramind.repository.BookingRepository;
import com.yatramind.repository.ExpenseRepository;
import com.yatramind.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    public Booking createBooking(String email, BookingRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String txnId = "YM-" + request.getType().substring(0, 2).toUpperCase()
                + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Booking booking = Booking.builder()
                .user(user)
                .type(Booking.BookingType.valueOf(request.getType().toUpperCase()))
                .referenceId(request.getReferenceId())
                .details(request.getDetails())
                .passengers(request.getPassengers())
                .totalAmount(request.getTotalAmount())
                .travelDate(request.getTravelDate())
                .paymentMethod(request.getPaymentMethod())
                .paymentId(request.getPaymentId() != null ? request.getPaymentId() : txnId)
                .deliveryAddress(request.getDeliveryAddress())
                .build();

        Booking saved = bookingRepository.save(booking);

        // Auto-add to expenses
        try {
            String category = switch (request.getType().toUpperCase()) {
                case "TRANSPORT" -> "Transport";
                case "HOTEL" -> "Hotel";
                case "FOOD" -> "Food";
                default -> "Misc";
            };

            Expense expense = Expense.builder()
                    .user(user)
                    .category(category)
                    .description(request.getDetails() != null ? request.getDetails() : category + " Booking")
                    .amount(request.getTotalAmount())
                    .date(request.getTravelDate() != null ? request.getTravelDate() : LocalDate.now())
                    .journeyName(category + " Booking")
                    .build();
            expenseRepository.save(expense);
        } catch (Exception e) {
            // Don't fail the booking if expense tracking fails
        }

        return saved;
    }

    public List<Booking> getUserBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUserIdOrderByBookedAtDesc(user.getId());
    }

    public Booking cancelBooking(Long bookingId, String email) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: Not your booking");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
