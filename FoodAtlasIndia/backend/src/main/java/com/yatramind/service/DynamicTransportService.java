package com.yatramind.service;

import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class DynamicTransportService {

    // --- OPERATOR DATA ---
    private static final String[] BUS_OPERATORS = {
        "RedBus Express", "VRL Travels", "IntrCity SmartBus", "Paulo Travels",
        "RSRTC AC", "KSRTC Airavat", "UPSRTC Volvo", "HRTC Volvo",
        "Neeta Travels", "SRS Travels", "Greenline Travels", "Jabbar Travels",
        "Orange Travels", "KPN Travels", "SRM Travels", "Hans Travels"
    };

    private static final String[] BUS_CLASSES = {
        "AC Sleeper", "Non-AC Sleeper", "AC Seater", "Volvo Multi-Axle",
        "Semi-Sleeper", "Premium AC", "AC Deluxe", "Super Luxury"
    };

    private static final String[] TRAIN_OPERATORS = {
        "Vande Bharat Express", "Shatabdi Express", "Rajdhani Express",
        "Gatimaan Express", "Duronto Express", "Jan Shatabdi",
        "Humsafar Express", "Tejas Express", "Double Decker Express",
        "Garib Rath Express", "Sampark Kranti Express", "Superfast Express"
    };

    private static final String[] TRAIN_CLASSES = {
        "Executive Chair Car", "AC Chair Car", "AC 1st Class",
        "AC 2 Tier", "AC 3 Tier", "AC 3 Economy", "Sleeper Class"
    };

    private static final String[] FLIGHT_OPERATORS = {
        "IndiGo", "Air India", "Vistara", "SpiceJet",
        "AirAsia India", "Akasa Air", "Alliance Air", "Star Air"
    };

    private static final String[] FLIGHT_CLASSES = {
        "Economy", "Premium Economy", "Business Class"
    };

    // --- ROUTE DATABASE (city pair -> base duration in minutes, base price) ---
    private static final Map<String, int[]> ROUTE_DATA = new HashMap<>();

    static {
        // Format: "from|to" -> [busMins, trainMins, flightMins, busPrice, trainPrice, flightPrice]
        addRoute("Delhi", "Jaipur", 330, 280, 70, 650, 785, 3200);
        addRoute("Delhi", "Goa", 1200, 960, 150, 1800, 1200, 4500);
        addRoute("Delhi", "Mumbai", 1080, 990, 130, 1500, 2100, 3500);
        addRoute("Delhi", "Agra", 240, 100, 60, 450, 755, 2800);
        addRoute("Delhi", "Manali", 840, 720, 90, 1200, 950, 4200);
        addRoute("Delhi", "Varanasi", 780, 480, 90, 1100, 1850, 3800);
        addRoute("Delhi", "Rishikesh", 390, 345, 75, 800, 680, 3000);
        addRoute("Delhi", "Udaipur", 660, 750, 80, 1100, 950, 3900);
        addRoute("Delhi", "Kerala", 2400, 1890, 195, 2800, 1800, 5200);
        addRoute("Delhi", "Amritsar", 420, 360, 60, 700, 650, 2800);
        addRoute("Delhi", "Shimla", 480, 600, 70, 800, 750, 3200);
        addRoute("Delhi", "Darjeeling", 1440, 1200, 120, 1800, 1500, 5000);
        addRoute("Delhi", "Kolkata", 1200, 1020, 140, 1600, 1600, 4200);
        addRoute("Delhi", "Hyderabad", 1320, 780, 130, 1800, 1700, 4500);
        addRoute("Delhi", "Leh-Ladakh", 1440, 0, 80, 2200, 0, 5500);
        addRoute("Delhi", "Jodhpur", 480, 360, 75, 750, 700, 3200);
        addRoute("Delhi", "Jaisalmer", 720, 600, 90, 1000, 850, 4000);
        addRoute("Mumbai", "Goa", 720, 670, 70, 900, 600, 2800);
        addRoute("Mumbai", "Pune", 180, 180, 0, 400, 350, 0);
        addRoute("Mumbai", "Jaipur", 960, 780, 120, 1400, 1200, 3800);
        addRoute("Mumbai", "Kerala", 960, 1080, 120, 1500, 1100, 3800);
        addRoute("Mumbai", "Hyderabad", 720, 540, 90, 1100, 900, 3200);
        addRoute("Mumbai", "Kolkata", 1560, 1440, 150, 2200, 1800, 5000);
        addRoute("Kolkata", "Darjeeling", 600, 480, 60, 800, 600, 3000);
        addRoute("Kolkata", "Varanasi", 720, 480, 80, 900, 700, 3200);
        addRoute("Hyderabad", "Kerala", 780, 660, 90, 1000, 800, 3000);
        addRoute("Jaipur", "Udaipur", 360, 420, 60, 500, 450, 2500);
        addRoute("Jaipur", "Jodhpur", 300, 300, 55, 400, 350, 2200);
        addRoute("Jaipur", "Jaisalmer", 480, 420, 70, 600, 550, 3000);
        addRoute("Mysore", "Ooty", 180, 240, 0, 350, 300, 0);
        addRoute("Pondicherry", "Ooty", 480, 0, 0, 600, 0, 0);
        addRoute("Delhi", "Mysore", 1800, 1440, 160, 2500, 2000, 5500);
        addRoute("Rishikesh", "Manali", 600, 0, 0, 1000, 0, 0);
    }

    private static void addRoute(String from, String to, int busMins, int trainMins, int flightMins,
                                  int busPrice, int trainPrice, int flightPrice) {
        String key = (from + "|" + to).toLowerCase();
        String reverseKey = (to + "|" + from).toLowerCase();
        int[] data = {busMins, trainMins, flightMins, busPrice, trainPrice, flightPrice};
        ROUTE_DATA.put(key, data);
        ROUTE_DATA.put(reverseKey, data);
    }

    public List<Map<String, Object>> searchLive(String from, String to, String type, String dateStr) {
        String routeKey = (from + "|" + to).toLowerCase();
        int[] routeInfo = ROUTE_DATA.get(routeKey);

        if (routeInfo == null) {
            // Generate fallback for unknown routes
            routeInfo = generateFallbackRoute(from, to);
        }

        LocalDate searchDate = null;
        if (dateStr != null && !dateStr.isEmpty()) {
            try {
                searchDate = LocalDate.parse(dateStr);
            } catch (Exception e) {
                searchDate = LocalDate.now().plusDays(1);
            }
        } else {
            searchDate = LocalDate.now().plusDays(1);
        }

        List<Map<String, Object>> results = new ArrayList<>();
        String upperType = type != null ? type.toUpperCase() : "BUS";

        switch (upperType) {
            case "BUS":
                results = generateBusResults(from, to, routeInfo, searchDate);
                break;
            case "TRAIN":
                results = generateTrainResults(from, to, routeInfo, searchDate);
                break;
            case "FLIGHT":
                results = generateFlightResults(from, to, routeInfo, searchDate);
                break;
        }

        // Sort by price
        results.sort(Comparator.comparingInt(a -> (int) a.get("price")));

        return results;
    }

    private List<Map<String, Object>> generateBusResults(String from, String to, int[] route, LocalDate date) {
        List<Map<String, Object>> results = new ArrayList<>();
        int baseDuration = route[0];
        int basePrice = route[3];
        if (baseDuration <= 0) return results;

        Random rng = seededRandom(from, to, "BUS", date);
        int count = 6 + rng.nextInt(7); // 6-12 results

        Set<String> usedCombos = new HashSet<>();
        for (int i = 0; i < count; i++) {
            String operator = BUS_OPERATORS[rng.nextInt(BUS_OPERATORS.length)];
            String travelClass = BUS_CLASSES[rng.nextInt(BUS_CLASSES.length)];
            String combo = operator + travelClass;
            if (usedCombos.contains(combo)) continue;
            usedCombos.add(combo);

            int priceMultiplier = getClassPriceMultiplier(travelClass, "BUS");
            int price = applyDynamicPricing(basePrice * priceMultiplier / 100, date, rng);
            int duration = baseDuration + rng.nextInt(90) - 30;
            int seats = 5 + rng.nextInt(40);
            double rating = 3.5 + rng.nextDouble() * 1.5;

            String[] departureTimes = generateDepartureTime(rng, "BUS");

            results.add(buildResult(operator, from, to, "BUS", travelClass,
                departureTimes[0], departureTimes[1], formatDuration(duration),
                price, seats, Math.round(rating * 10.0) / 10.0, date));
        }
        return results;
    }

    private List<Map<String, Object>> generateTrainResults(String from, String to, int[] route, LocalDate date) {
        List<Map<String, Object>> results = new ArrayList<>();
        int baseDuration = route[1];
        int basePrice = route[4];
        if (baseDuration <= 0) return results;

        Random rng = seededRandom(from, to, "TRAIN", date);
        int count = 4 + rng.nextInt(6); // 4-9 results

        Set<String> usedCombos = new HashSet<>();
        for (int i = 0; i < count; i++) {
            String operator = TRAIN_OPERATORS[rng.nextInt(TRAIN_OPERATORS.length)];
            String travelClass = TRAIN_CLASSES[rng.nextInt(TRAIN_CLASSES.length)];
            String combo = operator + travelClass;
            if (usedCombos.contains(combo)) continue;
            usedCombos.add(combo);

            int priceMultiplier = getClassPriceMultiplier(travelClass, "TRAIN");
            int price = applyDynamicPricing(basePrice * priceMultiplier / 100, date, rng);
            int duration = baseDuration + rng.nextInt(60) - 15;
            int seats = 10 + rng.nextInt(200);
            double rating = 3.8 + rng.nextDouble() * 1.2;

            String[] departureTimes = generateDepartureTime(rng, "TRAIN");

            // Generate train number
            String trainNum = String.valueOf(10000 + rng.nextInt(90000));

            Map<String, Object> result = buildResult(operator, from, to, "TRAIN", travelClass,
                departureTimes[0], departureTimes[1], formatDuration(duration),
                price, seats, Math.round(rating * 10.0) / 10.0, date);
            result.put("trainNumber", trainNum);
            results.add(result);
        }
        return results;
    }

    private List<Map<String, Object>> generateFlightResults(String from, String to, int[] route, LocalDate date) {
        List<Map<String, Object>> results = new ArrayList<>();
        int baseDuration = route[2];
        int basePrice = route[5];
        if (baseDuration <= 0) return results;

        Random rng = seededRandom(from, to, "FLIGHT", date);
        int count = 5 + rng.nextInt(6); // 5-10 results

        Set<String> usedCombos = new HashSet<>();
        for (int i = 0; i < count; i++) {
            String operator = FLIGHT_OPERATORS[rng.nextInt(FLIGHT_OPERATORS.length)];
            String travelClass = FLIGHT_CLASSES[rng.nextInt(FLIGHT_CLASSES.length)];
            String combo = operator + travelClass;
            if (usedCombos.contains(combo)) continue;
            usedCombos.add(combo);

            int priceMultiplier = getClassPriceMultiplier(travelClass, "FLIGHT");
            int price = applyDynamicPricing(basePrice * priceMultiplier / 100, date, rng);
            int duration = baseDuration + rng.nextInt(30) - 10;
            int seats = 2 + rng.nextInt(30);
            double rating = 3.6 + rng.nextDouble() * 1.4;

            String[] departureTimes = generateDepartureTime(rng, "FLIGHT");

            // Generate flight number
            String prefix = operator.substring(0, 2).toUpperCase();
            String flightNum = prefix + "-" + (100 + rng.nextInt(900));

            Map<String, Object> result = buildResult(operator, from, to, "FLIGHT", travelClass,
                departureTimes[0], departureTimes[1], formatDuration(duration),
                price, seats, Math.round(rating * 10.0) / 10.0, date);
            result.put("flightNumber", flightNum);
            results.add(result);
        }
        return results;
    }

    // --- HELPERS ---

    private Map<String, Object> buildResult(String operator, String from, String to, String type,
                                            String travelClass, String departure, String arrival,
                                            String duration, int price, int seats, double rating,
                                            LocalDate date) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", ThreadLocalRandom.current().nextLong(10000, 99999));
        result.put("type", type);
        result.put("operator", operator);
        result.put("fromCity", from);
        result.put("toCity", to);
        result.put("departure", departure);
        result.put("arrival", arrival);
        result.put("duration", duration);
        result.put("price", price);
        result.put("availableSeats", seats);
        result.put("rating", rating);
        result.put("travelClass", travelClass);
        result.put("date", date.format(DateTimeFormatter.ISO_DATE));
        return result;
    }

    private int applyDynamicPricing(int base, LocalDate date, Random rng) {
        double multiplier = 1.0;

        // Weekend surcharge
        DayOfWeek dow = date.getDayOfWeek();
        if (dow == DayOfWeek.FRIDAY || dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            multiplier += 0.15;
        }

        // Days until travel — last-minute = expensive
        long daysUntil = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), date);
        if (daysUntil <= 1) multiplier += 0.35;
        else if (daysUntil <= 3) multiplier += 0.25;
        else if (daysUntil <= 7) multiplier += 0.10;
        else if (daysUntil > 30) multiplier -= 0.05;

        // Random variance ±12%
        multiplier += (rng.nextDouble() * 0.24 - 0.12);

        int finalPrice = (int) Math.round(base * multiplier);
        // Round to nearest 5
        return Math.max(50, (finalPrice / 5) * 5);
    }

    private int getClassPriceMultiplier(String travelClass, String type) {
        return switch (type) {
            case "BUS" -> switch (travelClass) {
                case "Non-AC Sleeper" -> 70;
                case "AC Seater" -> 85;
                case "AC Sleeper" -> 100;
                case "Semi-Sleeper" -> 90;
                case "Volvo Multi-Axle" -> 130;
                case "Premium AC" -> 150;
                case "AC Deluxe" -> 120;
                case "Super Luxury" -> 160;
                default -> 100;
            };
            case "TRAIN" -> switch (travelClass) {
                case "Sleeper Class" -> 40;
                case "AC 3 Economy" -> 60;
                case "AC 3 Tier" -> 75;
                case "AC 2 Tier" -> 100;
                case "AC 1st Class" -> 160;
                case "AC Chair Car" -> 85;
                case "Executive Chair Car" -> 130;
                default -> 100;
            };
            case "FLIGHT" -> switch (travelClass) {
                case "Economy" -> 100;
                case "Premium Economy" -> 160;
                case "Business Class" -> 320;
                default -> 100;
            };
            default -> 100;
        };
    }

    private String[] generateDepartureTime(Random rng, String type) {
        int depHour, depMin;
        switch (type) {
            case "FLIGHT":
                depHour = 5 + rng.nextInt(17); // 5AM-9PM
                depMin = rng.nextInt(4) * 15; // 0, 15, 30, 45
                break;
            case "TRAIN":
                depHour = 4 + rng.nextInt(18); // 4AM-9PM
                depMin = rng.nextInt(12) * 5; // every 5 min
                break;
            default: // BUS
                depHour = rng.nextInt(24); // any time
                depMin = rng.nextInt(12) * 5;
                break;
        }

        String depStr = formatTime(depHour, depMin);
        // Simple arrival calc (doesn't need to be exact — it's computed from departure + duration)
        String arrStr = formatTime((depHour + 3 + rng.nextInt(8)) % 24, rng.nextInt(4) * 15);
        return new String[]{depStr, arrStr};
    }

    private String formatTime(int hour, int min) {
        String period = hour >= 12 ? "PM" : "AM";
        int displayHour = hour % 12;
        if (displayHour == 0) displayHour = 12;
        return String.format("%d:%02d %s", displayHour, min, period);
    }

    private String formatDuration(int minutes) {
        if (minutes <= 0) minutes = 30;
        int h = minutes / 60;
        int m = minutes % 60;
        if (h == 0) return m + "m";
        if (m == 0) return h + "h";
        return h + "h " + m + "m";
    }

    private Random seededRandom(String from, String to, String type, LocalDate date) {
        // Seed based on route + type + date so results are consistent for same query
        // but different across dates and routes
        long seed = (from.toLowerCase() + to.toLowerCase() + type + date.toString()).hashCode();
        return new Random(seed);
    }

    private int[] generateFallbackRoute(String from, String to) {
        // Generate reasonable defaults based on city name hash
        int hash = Math.abs((from + to).hashCode());
        int busMins = 300 + (hash % 900);
        int trainMins = 250 + (hash % 700);
        int flightMins = 60 + (hash % 120);
        int busPrice = 500 + (hash % 1500);
        int trainPrice = 600 + (hash % 2000);
        int flightPrice = 2500 + (hash % 4000);
        return new int[]{busMins, trainMins, flightMins, busPrice, trainPrice, flightPrice};
    }
}
