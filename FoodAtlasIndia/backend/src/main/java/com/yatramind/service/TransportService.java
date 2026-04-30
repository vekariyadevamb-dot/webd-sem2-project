package com.yatramind.service;

import com.yatramind.entity.Transport;
import com.yatramind.repository.TransportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransportService {

    private final TransportRepository transportRepository;

    public List<Transport> searchTransport(String from, String to, String type) {
        if (type != null && !type.isEmpty()) {
            return transportRepository.findByFromCityIgnoreCaseAndToCityIgnoreCaseAndType(
                    from, to, Transport.TransportType.valueOf(type.toUpperCase()));
        }
        return transportRepository.findByFromCityIgnoreCaseAndToCityIgnoreCase(from, to);
    }

    public Transport getById(Long id) {
        return transportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transport not found with id: " + id));
    }
}
