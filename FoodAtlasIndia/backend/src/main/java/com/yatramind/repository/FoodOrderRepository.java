package com.yatramind.repository;

import com.yatramind.entity.FoodOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FoodOrderRepository extends JpaRepository<FoodOrder, Long> {
    List<FoodOrder> findByUserIdOrderByOrderedAtDesc(Long userId);
}
