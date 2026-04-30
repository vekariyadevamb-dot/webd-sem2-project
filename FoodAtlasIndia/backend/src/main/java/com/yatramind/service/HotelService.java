package com.yatramind.service;

import com.yatramind.entity.Hotel;
import com.yatramind.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;

    public List<Hotel> getHotelsByCity(Long cityId, Integer maxPrice) {
        if (maxPrice != null) {
            return hotelRepository.findByCityIdAndPricePerNightLessThanEqual(cityId, maxPrice);
        }
        return hotelRepository.findByCityId(cityId);
    }

    public Hotel getById(Long id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));
    }
}
