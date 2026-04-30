package com.yatramind.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "foods")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    private String category; // Street Food, Main Course, Sweet, Drink

    private String restaurant; // best place to eat

    private String priceRange;

    private Integer price; // exact price for ordering

    private String imageUrl;

    private Boolean mustTry;

    private Boolean isVeg;

    private Double rating;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)
    @JsonIgnore
    private City city;
}
