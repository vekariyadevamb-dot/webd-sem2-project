package com.yatramind.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingType type;

    private Long referenceId; // transportId or hotelId

    private String details; // human-readable summary

    private Integer passengers;

    private Integer totalAmount;

    private LocalDate travelDate;

    private String paymentMethod; // UPI, CARD, NETBANKING, COD

    private String paymentId; // transaction reference

    private String deliveryAddress; // for food orders

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BookingStatus status = BookingStatus.CONFIRMED;

    @CreationTimestamp
    private LocalDateTime bookedAt;

    public enum BookingType {
        TRANSPORT, HOTEL, FOOD
    }

    public enum BookingStatus {
        CONFIRMED, CANCELLED, COMPLETED
    }
}
