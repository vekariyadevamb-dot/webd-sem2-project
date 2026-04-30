package com.yatramind.repository;

import com.yatramind.entity.Transport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransportRepository extends JpaRepository<Transport, Long> {
    List<Transport> findByFromCityIgnoreCaseAndToCityIgnoreCase(String fromCity, String toCity);
    List<Transport> findByFromCityIgnoreCaseAndToCityIgnoreCaseAndType(String fromCity, String toCity, Transport.TransportType type);
}
