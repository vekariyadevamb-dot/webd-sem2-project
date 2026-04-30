package com.yatramind.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class FoodOrderRequest {

    @NotBlank(message = "Items are required")
    private String items; // JSON string of ordered items

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    private String deliveryCity;

    private String pincode;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // UPI, CARD, NETBANKING, COD

    private String paymentId;

    @NotNull(message = "Total amount is required")
    @Positive(message = "Amount must be positive")
    private Integer totalAmount;

    private Integer deliveryFee;
}
