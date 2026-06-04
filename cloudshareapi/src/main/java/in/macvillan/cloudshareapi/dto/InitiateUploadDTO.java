package in.macvillan.cloudshareapi.dto;

import lombok.Data;

@Data
public class InitiateUploadDTO {
    private String fileName;
    private String mimeType;
    private long fileSize;
}
