package com.leenjae.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * 관리자 PIN 게이트 인증.
 * - PIN 검증은 서버에서만 수행 (프론트에 PIN 미노출)
 * - 토큰 = "{만료시각epochMillis}.{HMAC-SHA256(만료시각, secret)}" — 상태 저장 없음
 */
@Service
public class AdminAuthService {

    private static final long TOKEN_TTL_MILLIS = 8L * 60 * 60 * 1000; // 8시간

    @Value("${admin.pin}")
    private String adminPin;

    @Value("${admin.token-secret}")
    private String tokenSecret;

    public record LoginResult(String token, long expiresAt) {}

    public LoginResult login(String pin) {
        boolean matched = pin != null && MessageDigest.isEqual(
                pin.getBytes(StandardCharsets.UTF_8),
                adminPin.getBytes(StandardCharsets.UTF_8)
        );
        if (!matched) {
            // 브루트포스 완화: 실패 시 1초 지연
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "PIN이 올바르지 않습니다.");
        }
        long expiresAt = System.currentTimeMillis() + TOKEN_TTL_MILLIS;
        return new LoginResult(expiresAt + "." + sign(String.valueOf(expiresAt)), expiresAt);
    }

    public boolean isValid(String token) {
        if (token == null || token.isBlank()) return false;
        int dot = token.indexOf('.');
        if (dot <= 0 || dot == token.length() - 1) return false;

        String expiryPart = token.substring(0, dot);
        String signaturePart = token.substring(dot + 1);

        long expiresAt;
        try {
            expiresAt = Long.parseLong(expiryPart);
        } catch (NumberFormatException e) {
            return false;
        }
        if (expiresAt < System.currentTimeMillis()) return false;

        return MessageDigest.isEqual(
                sign(expiryPart).getBytes(StandardCharsets.UTF_8),
                signaturePart.getBytes(StandardCharsets.UTF_8)
        );
    }

    private String sign(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(tokenSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("관리자 토큰 서명에 실패했습니다.", e);
        }
    }
}
