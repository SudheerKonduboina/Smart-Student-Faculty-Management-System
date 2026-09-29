package com.sms.backend.service;

import com.sms.backend.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${file.upload.dir:./uploads}")
    private String uploadDir;

    @Value("${file.allowed.extensions:pdf,doc,docx,zip,txt,jpg,jpeg,png}")
    private String allowedExtensions;

    public String storeFile(MultipartFile file, String subDir) {
        validateFile(file);

        String originalName = file.getOriginalFilename();
        String extension = getExtension(originalName);
        String safeName = UUID.randomUUID() + "_" + sanitizeFilename(originalName);

        Path dirPath = Paths.get(uploadDir, subDir);
        try {
            Files.createDirectories(dirPath);
            Path dest = dirPath.resolve(safeName);
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
            return subDir + "/" + safeName;
        } catch (IOException e) {
            log.error("Failed to store file: {}", e.getMessage());
            throw new BadRequestException("Failed to store file. Please try again.");
        }
    }

    public Path getFilePath(String relativePath) {
        return Paths.get(uploadDir, relativePath).normalize();
    }

    public boolean exists(String relativePath) {
        return Files.exists(getFilePath(relativePath));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        String extension = getExtension(file.getOriginalFilename()).toLowerCase();
        List<String> allowed = Arrays.asList(allowedExtensions.split(","));
        if (!allowed.contains(extension)) {
            throw new BadRequestException("File type ." + extension + " is not allowed. Allowed: " + allowedExtensions);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "file";
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
