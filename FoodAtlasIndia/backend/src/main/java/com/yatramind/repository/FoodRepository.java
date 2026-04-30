package com.yatramind.repository;

import com.yatramind.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FoodRepository extends JpaRepository<Food, Long> {
    List<Food> findByCityId(Long cityId);
    List<Food> findByCityIdAndCategory(Long cityId, String category);
}
