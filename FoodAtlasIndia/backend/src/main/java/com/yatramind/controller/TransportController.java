package com.yatramind.controller;

import com.yatramind.dto.response.ApiResponse;
import com.yatramind.entity.Transport;
import com.yatramind.service.DynamicTransportService;
import com.yatramind.service.TransportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transport")
@RequiredArgsConstructor
public class TransportController {

    private final TransportService transportService;
    private final DynamicTransportService dynamicTransportService;

    /**
     * Live search — generates dynamic, real-time-like transport results
     */
    @GetMapping("/live-search")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> liveSearch(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String date) {
        List<Map<String, Object>> results = dynamicTransportService.searchLive(from, to, type, date);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    /**
     * Legacy search — uses seeded database data (fallback)
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Transport>>> searchTransport(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false) String type) {
        List<Transport> results = transportService.searchTransport(from, to, type);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Transport>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(transportService.getById(id)));
    }
}
