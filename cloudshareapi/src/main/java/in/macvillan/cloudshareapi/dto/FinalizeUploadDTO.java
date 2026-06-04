package in.macvillan.cloudshareapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class FinalizeUploadDTO {

    @NotBlank(message = "supabasePath is required")
    private String supabasePath;

    @NotBlank(message = "name is required")
    private String name;

    @NotBlank(message = "type is required")
    private String type;

    @Positive(message = "size must be positive")
    private long size;
}
