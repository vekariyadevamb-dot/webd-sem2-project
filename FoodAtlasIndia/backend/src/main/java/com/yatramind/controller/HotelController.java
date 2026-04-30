package com.yatramind.controller;

import com.yatramind.dto.response.ApiResponse;
import com.yatramind.entity.Hotel;
import com.yatramind.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Hotel>>> getHotels(
            @RequestParam Long cityId,
            @RequestParam(required = false) Integer maxPrice) {
        List<Hotel> hotels = hotelService.getHotelsByCity(cityId, maxPrice);
        return ResponseEntity.ok(ApiResponse.success(hotels));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Hotel>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(hotelService.getById(id)));
    }
}
