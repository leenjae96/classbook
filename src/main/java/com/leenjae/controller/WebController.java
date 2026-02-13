package com.leenjae.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class WebController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request, HttpServletResponse response) {
        // 1. 현재 발생한 에러의 상태 코드를 가져옵니다.
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

        // 2. 원래 요청했던 URL이 뭔지 가져옵니다. (예: /attendance/grade/1)
        String originalUri = (String) request.getAttribute(RequestDispatcher.FORWARD_REQUEST_URI);

        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());

            // 3. "404 Not Found" 에러인가?
            if (statusCode == HttpStatus.NOT_FOUND.value()) {

                // 4. (중요) API 요청(/api/...)은 404 그대로 둬야 함 (JSON 응답 필요하므로)
                //    API가 아닌 페이지 요청일 때만 처리
                if (originalUri != null && !originalUri.startsWith("/api")) {

                    // 5. ★★★ 핵심: 상태 코드를 200(OK)으로 강제 변경! ★★★
                    response.setStatus(HttpStatus.OK.value());

                    // 6. index.html 내용을 반환
                    return "forward:/index.html";
                }
            }
        }
        // 404가 아니거나, /api 요청의 에러라면 원래 에러 페이지/JSON 동작 유지
        return "error";
    }
}