package in.macvillan.cloudshareapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class InitiateUploadDTO {

    @NotBlank(message = "fileName is required")
    private String fileName;

    @NotBlank(message = "mimeType is required")
    private String mimeType;

    @Positive(message = "fileSize must be positive")
    private long fileSize;
}
