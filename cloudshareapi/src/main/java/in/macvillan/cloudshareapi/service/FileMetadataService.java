package in.macvillan.cloudshareapi.service;

import in.macvillan.cloudshareapi.document.FileMetadataDocument;
import in.macvillan.cloudshareapi.document.ProfileDocument;
import in.macvillan.cloudshareapi.dto.FileMetadataDTO;
import in.macvillan.cloudshareapi.repository.FileMetadataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
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
        log.info("Saving file metadata: name={}, type={}, size={}, clerkId={}", name, type, size, clerkId);
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
        FileMetadataDocument saved = fileMetadataRepository.save(doc);
        log.info("File metadata saved: id={}", saved.getId());
        return mapToDTO(saved);
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
        log.info("Delete requested: fileId={}, requestedBy={}", id, currentProfile.getClerkId());
        FileMetadataDocument file = fileMetadataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getClerkId().equals(currentProfile.getClerkId())) {
            log.warn("Unauthorized delete attempt: fileId={}, owner={}, attacker={}", id, file.getClerkId(), currentProfile.getClerkId());
            throw new RuntimeException("File does not belong to current user");
        }

        // Delete from Supabase Storage
        if (file.getSupabasePath() != null) {
            try {
                supabaseStorageService.deleteFile(file.getSupabasePath());
            } catch (Exception e) {
                log.error("Supabase delete failed for path={}, proceeding with metadata deletion", file.getSupabasePath(), e);
            }
        }

        fileMetadataRepository.deleteById(id);
        log.info("File deleted: fileId={}", id);
    }

    public FileMetadataDTO togglePublic(String id) {
        ProfileDocument currentProfile = profileService.getCurrentProfile();
        FileMetadataDocument file = fileMetadataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getClerkId().equals(currentProfile.getClerkId())) {
            log.warn("Unauthorized togglePublic attempt: fileId={}, owner={}, attacker={}", id, file.getClerkId(), currentProfile.getClerkId());
            throw new RuntimeException("File does not belong to current user");
        }

        file.setIsPublic(!file.getIsPublic());
        fileMetadataRepository.save(file);
        log.info("File visibility toggled: fileId={}, isPublic={}", id, file.getIsPublic());
        return mapToDTO(file);
    }
}
