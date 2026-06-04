package in.macvillan.cloudshareapi.service;

import in.macvillan.cloudshareapi.document.UserCredits;
import in.macvillan.cloudshareapi.repository.UserCreditsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserCreditsService {

    private final UserCreditsRepository userCreditsRepository;
    private final ProfileService profileService;

    public UserCredits createInitialCredits(String clerkId) {
        log.info("Creating initial credits for clerkId={}", clerkId);
        UserCredits userCredits = UserCredits.builder()
                .clerkId(clerkId)
                .credits(5)
                .plan("BASIC")
                .build();
        return userCreditsRepository.save(userCredits);
    }

    public UserCredits getUserCredits(String clerkId) {
        return userCreditsRepository.findByClerkId(clerkId)
                .orElseGet(() -> createInitialCredits(clerkId));
    }

    public UserCredits getUserCredits() {
        String clerkId = profileService.getCurrentProfile().getClerkId();
        return getUserCredits(clerkId);
    }

    public Boolean hasEnoughCredits(int requiredCredits) {
        UserCredits userCredits = getUserCredits();
        boolean sufficient = userCredits.getCredits() >= requiredCredits;
        if (!sufficient) {
            log.warn("Insufficient credits: clerkId={}, has={}, required={}", userCredits.getClerkId(), userCredits.getCredits(), requiredCredits);
        }
        return sufficient;
    }

    public UserCredits consumeCredit() {
        UserCredits userCredits = getUserCredits();

        if (userCredits.getCredits() <= 0) {
            log.warn("Consume credit failed — zero balance: clerkId={}", userCredits.getClerkId());
            return null;
        }

        userCredits.setCredits(userCredits.getCredits() - 1);
        log.info("Credit consumed: clerkId={}, remaining={}", userCredits.getClerkId(), userCredits.getCredits());
        return userCreditsRepository.save(userCredits);
    }

    public UserCredits addCredits(String clerkId, Integer creditsToAdd, String plan) {
        UserCredits userCredits = userCreditsRepository.findByClerkId(clerkId)
                .orElseGet(() -> createInitialCredits(clerkId));

        int before = userCredits.getCredits();
        userCredits.setCredits(before + creditsToAdd);
        userCredits.setPlan(plan);
        log.info("Credits added: clerkId={}, added={}, total={}, plan={}", clerkId, creditsToAdd, userCredits.getCredits(), plan);
        return userCreditsRepository.save(userCredits);
    }
}
