package com.yatramind.repository;

import com.yatramind.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByBookedAtDesc(Long userId);
    List<Booking> findByUserIdAndStatus(Long userId, Booking.BookingStatus status);
}
