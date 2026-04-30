package com.yatramind.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "places")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    private String category; // Fort, Temple, Beach, Nature, Monument, Museum

    private Double rating;

    private String imageUrl;

    private String timings;

    private String entryFee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)
    @JsonIgnore
    private City city;
}
