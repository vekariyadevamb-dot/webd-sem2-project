package com.yatramind.dto.response;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardResponse {
    private UserResponse user;
    private int totalTrips;
    private int totalSpent;
    private int activeBookings;
    private int savedPlaces;
    private List<Map<String, Object>> recentBookings;
    private List<Map<String, Object>> expenseBreakdown;
}
