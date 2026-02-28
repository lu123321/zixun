package com.example.counselingappjava.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable() // 必须保留：禁用CSRF，否则POST/PUT/DELETE请求会被Security拦截报403
                .authorizeRequests()
                // 核心：放行所有接口（开发阶段专用）
                .anyRequest().permitAll()
                .and()
                .httpBasic().disable() // 禁用默认的httpBasic认证
                .formLogin().disable(); // 禁用默认的表单登录（前后端分离用不到）

        return http.build();
    }
}
