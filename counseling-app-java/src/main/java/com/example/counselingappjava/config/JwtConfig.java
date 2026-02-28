package com.example.counselingappjava.config;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * JWT配置类
 */
@Configuration
public class JwtConfig {

    // JWT 密钥（生产环境请使用复杂密钥，存储在配置中心）
    @Value("${jwt.secret}")
    private String jwtSecret;

    // JWT 过期时间（单位：秒），默认7天
    @Value("${jwt.expire:604800}")
    private long jwtExpire;

    /**
     * 生成JWT 加密密钥
     */
    @Bean
    public SecretKey jwtSecretKey() {
        // 密钥长度至少32位，否则会报错
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public long getJwtExpire() {
        return jwtExpire;
    }
}