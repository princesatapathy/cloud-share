package in.macvillan.cloudshareapi.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentVerificationDTO {

    @NotBlank(message = "razorpay_order_id is required")
    private String razorpay_order_id;

    @NotBlank(message = "razorpay_payment_id is required")
    private String razorpay_payment_id;

    @NotBlank(message = "razorpay_signature is required")
    private String razorpay_signature;

    @NotBlank(message = "planId is required")
    private String planId;
}
