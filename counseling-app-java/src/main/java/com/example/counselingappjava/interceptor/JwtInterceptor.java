package com.example.counselingappjava.interceptor;

import com.example.counselingappjava.util.JwtUtil;
import com.example.counselingappjava.util.UserContextHolder;
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
        // 1. 设置响应格式为 JSON（统一异常返回格式）
        response.setContentType("application/json;charset=UTF-8");

        // 2. 获取请求头中的 Token
        String token = request.getHeader("Authorization");

        // 3. 验证 Token 有效性
        if (token == null || !token.startsWith("Bearer ")) {
            response.getWriter().write("{\"code\":401,\"msg\":\"未授权，请先登录\",\"data\":null}");
            return false;
        }

        // 4. 提取纯 Token（去掉 Bearer 前缀）
        String pureToken = token.substring(7);

        // 5. 验证 Token 是否过期
        if (jwtUtil.isTokenExpired(pureToken)) {
            response.getWriter().write("{\"code\":401,\"msg\":\"登录状态已过期，请重新登录\",\"data\":null}");
            return false;
        }

        // 6. 解析 Token，获取用户 ID，存入当前用户上下文
        Long userId = jwtUtil.getUserIdFromToken(pureToken);
        UserContextHolder.setUserId(userId);

        // 7. 放行请求
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        // 请求结束后，清除当前用户上下文（释放 ThreadLocal 资源，避免内存泄漏）
        UserContextHolder.clear();
    }
}