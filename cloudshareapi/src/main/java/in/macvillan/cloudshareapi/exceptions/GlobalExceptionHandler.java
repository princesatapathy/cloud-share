package in.macvillan.cloudshareapi.exceptions;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<?> handleDuplicateEmailException(DuplicateKeyException ex) {
        Map<String, Object> data = new HashMap<>();
        data.put("status", HttpStatus.CONFLICT.value());
        data.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(data);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> data = new HashMap<>();
        String msg = ex.getMessage() != null ? ex.getMessage() : "An error occurred";
        data.put("message", msg);

        HttpStatus status = HttpStatus.BAD_REQUEST;
        String msgLower = msg.toLowerCase();
        if (msgLower.contains("not found")) status = HttpStatus.NOT_FOUND;
        else if (msgLower.contains("not belong") || msgLower.contains("private") || msgLower.contains("access denied")) status = HttpStatus.FORBIDDEN;

        data.put("status", status.value());
        return ResponseEntity.status(status).body(data);
    }
}
