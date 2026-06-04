package in.macvillan.cloudshareapi.controller;

import in.macvillan.cloudshareapi.document.UserCredits;
import in.macvillan.cloudshareapi.dto.FileMetadataDTO;
import in.macvillan.cloudshareapi.dto.FinalizeUploadDTO;
import in.macvillan.cloudshareapi.dto.InitiateUploadDTO;
import in.macvillan.cloudshareapi.service.FileMetadataService;
import in.macvillan.cloudshareapi.service.ProfileService;
import in.macvillan.cloudshareapi.service.SupabaseStorageService;
import in.macvillan.cloudshareapi.service.UserCreditsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/files")
public class FileController {

    private final FileMetadataService fileMetadataService;
    private final UserCreditsService userCreditsService;
    private final SupabaseStorageService supabaseStorageService;
    private final ProfileService profileService;

    /**
     * Step 1 of upload: validate file type, check credits, return pre-signed Supabase upload URL.
     * Client uploads directly to Supabase — server never receives file bytes.
     */
    @PostMapping("/upload/initiate")
    public ResponseEntity<?> initiateUpload(@RequestBody InitiateUploadDTO dto) {
        supabaseStorageService.validateFileType(dto.getMimeType(), dto.getFileName());

        if (!userCreditsService.hasEnoughCredits(1)) {
            throw new RuntimeException("Not enough credits to upload files. Please purchase more credits");
        }

        String clerkId = profileService.getCurrentProfile().getClerkId();
        String path = "uploads/" + clerkId + "/" + UUID.randomUUID() + "-" + dto.getFileName();

        Map<String, String> signed = supabaseStorageService.createUploadSignedUrl(path);

        return ResponseEntity.ok(Map.of(
                "uploadUrl", signed.get("uploadUrl"),
                "token", signed.get("token"),
                "supabasePath", path
        ));
    }

    /**
     * Step 2 of upload: client finished uploading to Supabase, save metadata and deduct credit.
     */
    @PostMapping("/upload/finalize")
    public ResponseEntity<?> finalizeUpload(@RequestBody FinalizeUploadDTO dto) {
        String clerkId = profileService.getCurrentProfile().getClerkId();

        // 10-year signed URL for persistent access; generate fresh on download
        String fileUrl = supabaseStorageService.createDownloadSignedUrl(dto.getSupabasePath(), 315360000);

        FileMetadataDTO file = fileMetadataService.saveFromSupabase(
                dto.getSupabasePath(), fileUrl, dto.getName(), dto.getType(), dto.getSize(), clerkId);

        userCreditsService.consumeCredit();
        UserCredits credits = userCreditsService.getUserCredits();

        return ResponseEntity.ok(Map.of(
                "file", file,
                "remainingCredits", credits.getCredits()
        ));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getFilesForCurrentUser() {
        List<FileMetadataDTO> files = fileMetadataService.getFiles();
        return ResponseEntity.ok(files);
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<?> getPublicFile(@PathVariable String id) {
        FileMetadataDTO file = fileMetadataService.getPublicFile(id);
        return ResponseEntity.ok(file);
    }

    /**
     * Generate a fresh 1-hour signed URL and redirect the client to it.
     * File is served directly from Supabase CDN — server streams nothing.
     */
    @GetMapping("/download/{id}")
    public ResponseEntity<?> download(@PathVariable String id) {
        FileMetadataDTO meta = fileMetadataService.getDownloadableFile(id);
        String signedUrl = supabaseStorageService.createDownloadSignedUrl(meta.getSupabasePath(), 3600);
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, signedUrl)
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable String id) {
        fileMetadataService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-public")
    public ResponseEntity<?> togglePublic(@PathVariable String id) {
        FileMetadataDTO file = fileMetadataService.togglePublic(id);
        return ResponseEntity.ok(file);
    }
}
