package com.yatramind.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transports")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransportType type;

    @Column(nullable = false)
    private String operator;

    @Column(nullable = false)
    private String fromCity;

    @Column(nullable = false)
    private String toCity;

    private String departure;

    private String arrival;

    private String duration;

    private Integer price;

    private Integer availableSeats;

    private Double rating;

    private String travelClass; // AC Sleeper, Chair Car, Economy, etc.

    public enum TransportType {
        BUS, TRAIN, FLIGHT
    }
}
