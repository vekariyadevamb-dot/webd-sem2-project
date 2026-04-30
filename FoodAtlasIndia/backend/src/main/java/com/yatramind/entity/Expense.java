package com.yatramind.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String category; // Transport, Hotel, Food, Shopping, Tickets, Misc

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Integer amount;

    private LocalDate date;

    private String journeyName; // e.g. "Jaipur Trip"

    @CreationTimestamp
    private LocalDateTime createdAt;
}
