package in.macvillan.cloudshareapi.service;

import in.macvillan.cloudshareapi.document.ProfileDocument;
import in.macvillan.cloudshareapi.dto.PaymentDTO;
import in.macvillan.cloudshareapi.dto.PaymentVerificationDTO;
import in.macvillan.cloudshareapi.repository.PaymentTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    ProfileService profileService;

    @Mock
    UserCreditsService userCreditsService;

    @Mock
    PaymentTransactionRepository paymentTransactionRepository;

    @InjectMocks
    PaymentService paymentService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "razorpayKeyId", "test_key_id");
        ReflectionTestUtils.setField(paymentService, "razorpayKeySecret", "test_secret");
    }

    @Test
    void verifyPayment_returnsFalseWhenSignatureMismatch() {
        ProfileDocument profile = ProfileDocument.builder()
                .clerkId("c1")
                .email("test@test.com")
                .firstName("A")
                .lastName("B")
                .build();
        when(profileService.getCurrentProfile()).thenReturn(profile);
        when(paymentTransactionRepository.findByOrderId(any())).thenReturn(Optional.empty());

        PaymentVerificationDTO request = new PaymentVerificationDTO();
        request.setRazorpay_order_id("order_123");
        request.setRazorpay_payment_id("pay_456");
        request.setRazorpay_signature("totally_wrong_signature");
        request.setPlanId("premium");

        PaymentDTO result = paymentService.verifyPayment(request);

        assertThat(result.getSuccess()).isFalse();
        assertThat(result.getMessage()).contains("signature verification failed");
    }
}
