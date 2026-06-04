package in.macvillan.cloudshareapi.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FileMetadataDTO {
    private String id;
    private String name;
    private String type;
    private Long size;
    private String clerkId;
    private Boolean isPublic;
    @JsonIgnore
    private String supabasePath;   // internal — never sent to client
    private String fileUrl;        // sent to client for download/preview
    private LocalDateTime uploadedAt;
}
