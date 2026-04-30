package com.yatramind.controller;

import com.yatramind.dto.response.ApiResponse;
import com.yatramind.entity.Food;
import com.yatramind.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Food>>> getFoods(
            @RequestParam Long cityId,
            @RequestParam(required = false) String category) {
        List<Food> foods = foodService.getFoodsByCity(cityId, category);
        return ResponseEntity.ok(ApiResponse.success(foods));
    }
}
