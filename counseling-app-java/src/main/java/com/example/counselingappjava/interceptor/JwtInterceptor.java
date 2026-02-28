package com.example.counselingappjava.interceptor;

import com.example.counselingappjava.util.JwtUtil;
import com.example.counselingappjava.util.UserContextHolder;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 1. 设置响应格式为 JSON（统一异常返回格式）␊
        response.setContentType("application/json;charset=UTF-8");

        // 2. 获取请求头中的 Token
        String token = request.getHeader("Authorization");

        // 3. 验证 Token 有效性
        if (token == null || !token.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"code\":401,\"msg\":\"未授权，请先登录\",\"data\":null}");
            return false;
        }

        // 4. 提取纯 Token（去掉 Bearer 前缀）
        String pureToken = token.substring(7);

        // 5. 验证 Token 是否过期
        try {
            Long userId = jwtUtil.getUserIdFromToken(pureToken);
            UserContextHolder.setUserId(userId);
            return true;
        } catch (ExpiredJwtException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"code\":401,\"msg\":\"登录状态已过期，请重新登录\",\"data\":null}");
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"code\":401,\"msg\":\"登录凭证无效，请重新登录\",\"data\":null}");
            return false;
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        // 请求结束后，清除当前用户上下文（释放 ThreadLocal 资源，避免内存泄漏）
        UserContextHolder.clear();
    }
}