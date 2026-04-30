package com.yatramind.repository;

import com.yatramind.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CityRepository extends JpaRepository<City, Long> {
    List<City> findByCategory(String category);
    List<City> findByNameContainingIgnoreCase(String name);
}
