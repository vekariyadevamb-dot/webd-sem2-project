package com.yatramind.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FoodOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 2000)
    private String items; // JSON string of ordered items

    @Column(nullable = false)
    private String deliveryAddress;

    private String deliveryCity;

    private String pincode;

    private String phone;

    @Column(nullable = false)
    private String paymentMethod; // UPI, CARD, NETBANKING, COD

    private String paymentId; // transaction reference

    @Column(nullable = false)
    private Integer totalAmount;

    private Integer deliveryFee;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OrderStatus status = OrderStatus.CONFIRMED;

    @CreationTimestamp
    private LocalDateTime orderedAt;

    private String estimatedDelivery; // e.g. "30-45 mins"

    public enum OrderStatus {
        CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    }
}
