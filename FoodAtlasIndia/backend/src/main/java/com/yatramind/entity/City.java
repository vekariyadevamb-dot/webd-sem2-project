package com.yatramind.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "cities")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class City {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String state;

    private String tagline;

    @Column(length = 1000)
    private String description;

    private String category; // heritage, beach, mountain, nature, metro

    private Double rating;

    private String bestTime;

    private String language;

    private String imageUrl;

    @OneToMany(mappedBy = "city", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Place> places;

    @OneToMany(mappedBy = "city", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Hotel> hotels;

    @OneToMany(mappedBy = "city", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Food> foods;
}
