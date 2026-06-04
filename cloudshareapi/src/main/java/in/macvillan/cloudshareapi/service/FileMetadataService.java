package in.macvillan.cloudshareapi.service;

import in.macvillan.cloudshareapi.document.FileMetadataDocument;
import in.macvillan.cloudshareapi.document.ProfileDocument;
import in.macvillan.cloudshareapi.dto.FileMetadataDTO;
import in.macvillan.cloudshareapi.repository.FileMetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileMetadataService {

    private final ProfileService profileService;
    private final UserCreditsService userCreditsService;
    private final FileMetadataRepository fileMetadataRepository;
    private final SupabaseStorageService supabaseStorageService;

    /**
     * Save file metadata after client has successfully uploaded to Supabase.
     */
    public FileMetadataDTO saveFromSupabase(String supabasePath, String fileUrl,
            String name, String type, long size, String clerkId) {
        FileMetadataDocument doc = FileMetadataDocument.builder()
                .supabasePath(supabasePath)
                .fileUrl(fileUrl)
                .name(name)
                .type(type)
                .size(size)
                .clerkId(clerkId)
                .isPublic(false)
                .uploadedAt(LocalDateTime.now())
                .build();
        return mapToDTO(fileMetadataRepository.save(doc));
    }

    public FileMetadataDTO mapToDTO(FileMetadataDocument doc) {
        return FileMetadataDTO.builder()
                .id(doc.getId())
                .supabasePath(doc.getSupabasePath())
                .fileUrl(doc.getFileUrl())
                .name(doc.getName())
                .size(doc.getSize())
                .type(doc.getType())
                .clerkId(doc.getClerkId())
                .isPublic(doc.getIsPublic())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }

    public List<FileMetadataDTO> getFiles() {
        ProfileDocument currentProfile = profileService.getCurrentProfile();
        return fileMetadataRepository.findByClerkId(currentProfile.getClerkId())
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public FileMetadataDTO getPublicFile(String id) {
        Optional<FileMetadataDocument> fileOptional = fileMetadataRepository.findById(id);
        if (fileOptional.isEmpty() || !fileOptional.get().getIsPublic()) {
            throw new RuntimeException("Unable to get the file");
        }
        return mapToDTO(fileOptional.get());
    }

    public FileMetadataDTO getDownloadableFile(String id) {
        FileMetadataDocument file = fileMetadataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentClerkId = (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof String)
                ? (String) auth.getPrincipal() : null;

        if (!file.getIsPublic() && !file.getClerkId().equals(currentClerkId)) {
            throw new RuntimeException("File is private");
        }
        return mapToDTO(file);
    }

    public void deleteFile(String id) {
        ProfileDocument currentProfile = profileService.getCurrentProfile();
        FileMetadataDocument file = fileMetadataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getClerkId().equals(currentProfile.getClerkId())) {
            throw new RuntimeException("File does not belong to current user");
        }

        // Delete from Supabase Storage
        if (file.getSupabasePath() != null) {
            try {
                supabaseStorageService.deleteFile(file.getSupabasePath());
            } catch (Exception e) {
                // Log but don't block deletion of metadata
            }
        }

        fileMetadataRepository.deleteById(id);
    }

    public FileMetadataDTO togglePublic(String id) {
        ProfileDocument currentProfile = profileService.getCurrentProfile();
        FileMetadataDocument file = fileMetadataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getClerkId().equals(currentProfile.getClerkId())) {
            throw new RuntimeException("File does not belong to current user");
        }

        file.setIsPublic(!file.getIsPublic());
        fileMetadataRepository.save(file);
        return mapToDTO(file);
    }
}
