package in.macvillan.cloudshareapi.dto;

import lombok.Data;

@Data
public class FinalizeUploadDTO {
    private String supabasePath;
    private String name;
    private String type;
    private long size;
}
