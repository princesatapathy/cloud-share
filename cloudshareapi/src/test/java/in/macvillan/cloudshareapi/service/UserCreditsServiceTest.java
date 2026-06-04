package in.macvillan.cloudshareapi.service;

import in.macvillan.cloudshareapi.document.ProfileDocument;
import in.macvillan.cloudshareapi.document.UserCredits;
import in.macvillan.cloudshareapi.repository.UserCreditsRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserCreditsServiceTest {

    @Mock
    UserCreditsRepository userCreditsRepository;

    @Mock
    ProfileService profileService;

    @InjectMocks
    UserCreditsService userCreditsService;

    @Test
    void createInitialCredits_setsCorrectInitialValues() {
        UserCredits saved = UserCredits.builder().clerkId("c1").credits(5).plan("BASIC").build();
        when(userCreditsRepository.save(any())).thenReturn(saved);

        UserCredits result = userCreditsService.createInitialCredits("c1");

        assertThat(result.getCredits()).isEqualTo(5);
        assertThat(result.getPlan()).isEqualTo("BASIC");
        assertThat(result.getClerkId()).isEqualTo("c1");
    }

    @Test
    void hasEnoughCredits_returnsTrueWhenSufficient() {
        ProfileDocument profile = ProfileDocument.builder().clerkId("c1").build();
        when(profileService.getCurrentProfile()).thenReturn(profile);
        when(userCreditsRepository.findByClerkId("c1"))
                .thenReturn(Optional.of(UserCredits.builder().clerkId("c1").credits(5).plan("BASIC").build()));

        assertThat(userCreditsService.hasEnoughCredits(3)).isTrue();
    }

    @Test
    void hasEnoughCredits_returnsFalseWhenInsufficient() {
        ProfileDocument profile = ProfileDocument.builder().clerkId("c1").build();
        when(profileService.getCurrentProfile()).thenReturn(profile);
        when(userCreditsRepository.findByClerkId("c1"))
                .thenReturn(Optional.of(UserCredits.builder().clerkId("c1").credits(1).plan("BASIC").build()));

        assertThat(userCreditsService.hasEnoughCredits(3)).isFalse();
    }

    @Test
    void addCredits_addsCorrectAmountAndUpdatesPlan() {
        UserCredits existing = UserCredits.builder().clerkId("c1").credits(5).plan("BASIC").build();
        when(userCreditsRepository.findByClerkId("c1")).thenReturn(Optional.of(existing));
        when(userCreditsRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        UserCredits result = userCreditsService.addCredits("c1", 500, "PREMIUM");

        assertThat(result.getCredits()).isEqualTo(505);
        assertThat(result.getPlan()).isEqualTo("PREMIUM");
    }
}
