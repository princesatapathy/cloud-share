package in.macvillan.cloudshareapi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class ApiInfoController {

    @GetMapping({"", "/"})
    public Map<String, String> apiInfo() {
        return Map.of(
                "name", "Cloud Share API",
                "health", "/api/v1.0/health",
                "frontend", "https://cloudsharewebapp-eight.vercel.app"
        );
    }
}
