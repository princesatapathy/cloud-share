package in.macvillan.cloudshareapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentDTO {
    @NotBlank(message = "planId is required")
    private String planId;

    @NotNull(message = "amount is required")
    @Positive(message = "amount must be positive")
    private Integer amount;

    @NotBlank(message = "currency is required")
    private String currency;

    // Response-only fields — no validation needed
    private Integer credits;
    private Boolean success;
    private String message;
    private String orderId;
}
