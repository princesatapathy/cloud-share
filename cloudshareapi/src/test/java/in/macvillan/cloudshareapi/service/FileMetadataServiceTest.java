package in.macvillan.cloudshareapi.service;

import in.macvillan.cloudshareapi.document.FileMetadataDocument;
import in.macvillan.cloudshareapi.document.ProfileDocument;
import in.macvillan.cloudshareapi.repository.FileMetadataRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileMetadataServiceTest {

    @Mock
    FileMetadataRepository fileMetadataRepository;

    @Mock
    ProfileService profileService;

    @Mock
    UserCreditsService userCreditsService;

    @Mock
    SupabaseStorageService supabaseStorageService;

    @InjectMocks
    FileMetadataService fileMetadataService;

    @Test
    void getPublicFile_throwsWhenFileIsPrivate() {
        FileMetadataDocument privateFile = FileMetadataDocument.builder()
                .id("f1").clerkId("c1").isPublic(false).build();
        when(fileMetadataRepository.findById("f1")).thenReturn(Optional.of(privateFile));

        assertThatThrownBy(() -> fileMetadataService.getPublicFile("f1"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Unable to get the file");
    }

    @Test
    void togglePublic_throwsWhenUserDoesNotOwnFile() {
        ProfileDocument attacker = ProfileDocument.builder().clerkId("attacker").build();
        FileMetadataDocument file = FileMetadataDocument.builder()
                .id("f1").clerkId("owner").isPublic(false).build();

        when(profileService.getCurrentProfile()).thenReturn(attacker);
        when(fileMetadataRepository.findById("f1")).thenReturn(Optional.of(file));

        assertThatThrownBy(() -> fileMetadataService.togglePublic("f1"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("File does not belong to current user");
    }

    @Test
    void deleteFile_throwsWhenFileNotFound() {
        ProfileDocument profile = ProfileDocument.builder().clerkId("c1").build();
        when(profileService.getCurrentProfile()).thenReturn(profile);
        when(fileMetadataRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> fileMetadataService.deleteFile("missing"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("File not found");
    }
}
