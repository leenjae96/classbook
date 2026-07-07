package com.leenjae.config;

import com.leenjae.service.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

/**
 * /api/administrator/** 요청에 대해 X-Admin-Token 헤더를 검증한다.
 * (로그인 엔드포인트는 WebConfig에서 제외)
 */
@Component
@RequiredArgsConstructor
public class AdminAuthInterceptor implements HandlerInterceptor {

    public static final String TOKEN_HEADER = "X-Admin-Token";

    private final AdminAuthService adminAuthService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        // CORS preflight는 통과
        if (HttpMethod.OPTIONS.matches(request.getMethod())) return true;

        if (adminAuthService.isValid(request.getHeader(TOKEN_HEADER))) return true;

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\":\"관리자 인증이 필요합니다.\"}");
        return false;
    }
}
