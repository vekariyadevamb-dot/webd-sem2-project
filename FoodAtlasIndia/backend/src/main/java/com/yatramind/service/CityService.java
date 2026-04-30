package com.yatramind.service;

import com.yatramind.entity.City;
import com.yatramind.repository.CityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CityService {

    private final CityRepository cityRepository;

    public List<City> getAllCities() {
        return cityRepository.findAll();
    }

    public City getCityById(Long id) {
        return cityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("City not found with id: " + id));
    }

    public List<City> getCitiesByCategory(String category) {
        return cityRepository.findByCategory(category);
    }

    public List<City> searchCities(String query) {
        return cityRepository.findByNameContainingIgnoreCase(query);
    }
}
