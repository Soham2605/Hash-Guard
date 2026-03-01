package com.hashguard;

import java.io.IOException;
import java.security.MessageDigest;
import java.util.HexFormat;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class HashController {

    private static String hashBytes(byte[] data, String algorithm) throws Exception {
        MessageDigest md = MessageDigest.getInstance(algorithm);
        byte[] digest = md.digest(data);
        return HexFormat.of().formatHex(digest);
    }

    @PostMapping(value = "/hash", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> generateHash(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "algo", defaultValue = "SHA-256") String algo
    ) throws Exception {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "No file uploaded"));
        }

        String algorithm = normalizeAlgo(algo);
        byte[] bytes;
        try {
            bytes = file.getBytes(); // read into memory (temporary)
        } catch (IOException e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Failed to read file"));
        }

        String hex = hashBytes(bytes, algorithm);
        return ResponseEntity.ok(java.util.Map.of(
                "filename", file.getOriginalFilename(),
                "algorithm", algorithm,
                "hash", hex,
                "size", bytes.length
        ));
    }

    @PostMapping(value = "/compare", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> compareFiles(
            @RequestParam("file1") MultipartFile file1,
            @RequestParam("file2") MultipartFile file2,
            @RequestParam(value = "algo", defaultValue = "SHA-256") String algo
    ) throws Exception {
        if (file1 == null || file1.isEmpty() || file2 == null || file2.isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Both files must be uploaded"));
        }

        String algorithm = normalizeAlgo(algo);

        byte[] b1 = file1.getBytes();
        byte[] b2 = file2.getBytes();
        String h1 = hashBytes(b1, algorithm);
        String h2 = hashBytes(b2, algorithm);

        double bitMatchPercent = bitSimilarityPercentage(h1, h2);

        return ResponseEntity.ok(java.util.Map.of(
                "file1", file1.getOriginalFilename(),
                "file2", file2.getOriginalFilename(),
                "algorithm", algorithm,
                "hash1", h1,
                "hash2", h2,
                "bit_match_percentage", String.format("%.2f", bitMatchPercent)
        ));
    }

    private String normalizeAlgo(String in) {
        in = in == null ? "" : in.trim().toLowerCase();
        return switch (in) {
            case "md5" -> "MD5";
            case "sha-1", "sha1" -> "SHA-1";
            case "sha-512", "sha512" -> "SHA-512";
            default -> "SHA-256";
        };
    }

    private double bitSimilarityPercentage(String hexA, String hexB) {
        int maxLen = Math.max(hexA.length(), hexB.length());
        hexA = String.format("%" + maxLen + "s", hexA).replace(' ', '0');
        hexB = String.format("%" + maxLen + "s", hexB).replace(' ', '0');

        int totalBits = maxLen * 4;
        int same = 0;
        for (int i = 0; i < maxLen; i++) {
            int valA = Character.digit(hexA.charAt(i), 16);
            int valB = Character.digit(hexB.charAt(i), 16);
            int bitsA = valA;
            int bitsB = valB;
            for (int b = 0; b < 4; b++) {
                int bitA = (bitsA >> (3 - b)) & 1;
                int bitB = (bitsB >> (3 - b)) & 1;
                if (bitA == bitB) same++;
            }
        }
        return (same * 100.0) / totalBits;
    }
}
