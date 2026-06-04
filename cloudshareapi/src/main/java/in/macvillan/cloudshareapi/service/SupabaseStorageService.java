package in.macvillan.cloudshareapi.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupabaseStorageService {

    private final RestTemplate restTemplate;

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key:}")
    private String serviceKey;

    @Value("${supabase.bucket:cloud-share}")
    private String bucket;

    private static final Set<String> ALLOWED_MIME = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
            "video/mp4", "video/webm",
            "audio/mpeg", "audio/wav", "audio/ogg",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain", "text/csv",
            "application/zip"
    );

    public void validateFileType(String mimeType, String fileName) {
        if (mimeType == null || !ALLOWED_MIME.contains(mimeType)) {
            log.warn("File type rejected: mimeType={}, fileName={}", mimeType, fileName);
            throw new RuntimeException("File type not allowed: " + mimeType);
        }
        if (fileName != null && (fileName.contains("..") || fileName.contains("/"))) {
            log.warn("Invalid file name rejected: fileName={}", fileName);
            throw new RuntimeException("Invalid file name");
        }
    }

    /**
     * Generate a pre-signed upload URL so the client uploads directly to Supabase.
     * Returns map with "uploadUrl" and "token".
     */
    public Map<String, String> createUploadSignedUrl(String path) {
        String url = supabaseUrl + "/storage/v1/object/upload/sign/" + bucket + "/" + path;

        HttpHeaders headers = buildHeaders();
        ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.POST, new HttpEntity<>("{}", headers), Map.class);

        return Map.of(
                "uploadUrl", (String) response.getBody().get("url"),
                "token", (String) response.getBody().get("token")
        );
    }

    /**
     * Generate a short-lived signed download URL.
     */
    public String createDownloadSignedUrl(String path, int expiresInSeconds) {
        String url = supabaseUrl + "/storage/v1/object/sign/" + bucket + "/" + path;

        HttpHeaders headers = buildHeaders();
        Map<String, Object> body = Map.of("expiresIn", expiresInSeconds);

        ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);

        return supabaseUrl + "/storage/v1" + response.getBody().get("signedURL");
    }

    /**
     * Delete a file from Supabase Storage.
     */
    public void deleteFile(String path) {
        log.info("Deleting file from Supabase: path={}", path);
        String url = supabaseUrl + "/storage/v1/object/" + bucket;

        HttpHeaders headers = buildHeaders();
        Map<String, Object> body = Map.of("prefixes", List.of(path));

        restTemplate.exchange(url, HttpMethod.DELETE, new HttpEntity<>(body, headers), Void.class);
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}
