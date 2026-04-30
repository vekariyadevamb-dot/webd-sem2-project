package com.yatramind.repository;

import com.yatramind.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlaceRepository extends JpaRepository<Place, Long> {
    List<Place> findByCityId(Long cityId);
    List<Place> findByCityIdAndCategory(Long cityId, String category);
}
