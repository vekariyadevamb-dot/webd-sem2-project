package com.yatramind.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class BookingRequest {

    @NotBlank(message = "Booking type is required")
    private String type; // TRANSPORT, HOTEL, FOOD

    @NotNull(message = "Reference ID is required")
    private Long referenceId;

    private String details;

    private Integer passengers;

    @NotNull(message = "Total amount is required")
    @Positive(message = "Amount must be positive")
    private Integer totalAmount;

    private LocalDate travelDate;

    private String paymentMethod; // UPI, CARD, NETBANKING, COD

    private String paymentId;

    private String deliveryAddress;
}
