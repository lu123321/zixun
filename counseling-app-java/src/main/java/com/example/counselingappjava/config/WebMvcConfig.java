package com.example.counselingappjava.config;

import com.example.counselingappjava.interceptor.JwtInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.annotation.Resource;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    @Resource
    private JwtInterceptor jwtInterceptor;

    // 全局跨域配置（核心：解决小程序跨域403）
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 对所有接口生效
                .allowedOriginPatterns("*") // 允许所有来源（开发阶段，生产可指定小程序域名）
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 允许所有请求方式，必须包含OPTIONS（小程序预检请求）
                .allowedHeaders("*") // 允许所有请求头，包含Authorization（JWT令牌头）
                .allowCredentials(true) // 允许携带凭证（跨域请求携带Cookie/令牌的核心）
                .maxAge(3600); // 预检请求缓存时间，避免重复预检
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                // 拦截所有请求
                .addPathPatterns("/**")
                // 排除免授权接口（登录接口、错误页面）
                .excludePathPatterns(
                        "/api/user/wx/login",
                        "/error"
                );
    }
}