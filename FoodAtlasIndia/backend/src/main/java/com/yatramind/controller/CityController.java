package com.yatramind.controller;

import com.yatramind.dto.response.ApiResponse;
import com.yatramind.entity.City;
import com.yatramind.entity.Place;
import com.yatramind.entity.Hotel;
import com.yatramind.entity.Food;
import com.yatramind.repository.PlaceRepository;
import com.yatramind.repository.FoodRepository;
import com.yatramind.service.CityService;
import com.yatramind.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/cities")
@RequiredArgsConstructor
public class CityController {

    private final CityService cityService;
    private final PlaceRepository placeRepository;
    private final FoodRepository foodRepository;
    private final HotelService hotelService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllCities(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        List<City> cities;
        if (search != null && !search.isEmpty()) {
            cities = cityService.searchCities(search);
        } else if (category != null && !category.isEmpty()) {
            cities = cityService.getCitiesByCategory(category);
        } else {
            cities = cityService.getAllCities();
        }

        // Map to avoid lazy-loading issues — return slim city DTOs
        List<Map<String, Object>> result = cities.stream().map(c -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("state", c.getState());
            map.put("tagline", c.getTagline());
            map.put("description", c.getDescription());
            map.put("category", c.getCategory());
            map.put("rating", c.getRating());
            map.put("bestTime", c.getBestTime());
            map.put("language", c.getLanguage());
            map.put("imageUrl", c.getImageUrl());
            return map;
        }).toList();

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCityDetail(@PathVariable Long id) {
        City city = cityService.getCityById(id);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", city.getId());
        result.put("name", city.getName());
        result.put("state", city.getState());
        result.put("tagline", city.getTagline());
        result.put("description", city.getDescription());
        result.put("category", city.getCategory());
        result.put("rating", city.getRating());
        result.put("bestTime", city.getBestTime());
        result.put("language", city.getLanguage());
        result.put("imageUrl", city.getImageUrl());

        // Eager load relations
        List<Place> places = placeRepository.findByCityId(id);
        List<Food> foods = foodRepository.findByCityId(id);

        result.put("places", places);
        result.put("foods", foods);

        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
