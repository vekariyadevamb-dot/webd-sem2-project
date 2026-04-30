package com.yatramind.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hotels")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String type; // 5 Star, 4 Star, 3 Star, Budget

    private String nearPlace;

    private Double rating;

    private Integer pricePerNight;

    private String imageUrl;

    private String amenities; // comma-separated: WiFi,Pool,Spa,Restaurant

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)
    @JsonIgnore
    private City city;
}
