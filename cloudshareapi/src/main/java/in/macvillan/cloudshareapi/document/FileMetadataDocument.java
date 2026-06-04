package in.macvillan.cloudshareapi.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "files")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class FileMetadataDocument {

    @Id
    private String id;
    private String name;
    private String type;
    private Long size;
    @Indexed
    private String clerkId;
    private Boolean isPublic;
    private String supabasePath;   // e.g. "uploads/clerk_123/uuid-file.pdf"
    private String fileUrl;        // Signed URL stored at finalize time
    private LocalDateTime uploadedAt;
}
