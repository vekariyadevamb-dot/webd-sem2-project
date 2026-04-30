package com.yatramind.service;

import com.yatramind.entity.Food;
import com.yatramind.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepository;

    public List<Food> getFoodsByCity(Long cityId, String category) {
        if (category != null && !category.isEmpty()) {
            return foodRepository.findByCityIdAndCategory(cityId, category);
        }
        return foodRepository.findByCityId(cityId);
    }
}
