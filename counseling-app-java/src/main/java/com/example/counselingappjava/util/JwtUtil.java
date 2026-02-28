package com.example.counselingappjava.util;

import com.example.counselingappjava.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JWT 工具类（生成Token、验证Token、解析Token）
 */
@Component
@RequiredArgsConstructor
public class JwtUtil {

    private final SecretKey jwtSecretKey;
    private final com.example.counselingappjava.config.JwtConfig jwtConfig;

    /**
     * 生成JWT Token
     * @param user 用户信息
     * @return Token字符串
     */
    public String generateToken(User user) {
        // 当前时间
        long currentTime = System.currentTimeMillis();
        // 过期时间
        long expireTime = currentTime + jwtConfig.getJwtExpire() * 1000;

        // 构建JWT Token
        return Jwts.builder()
                // 主题（用户ID）
                .setSubject(user.getId().toString())
                // 自定义声明（用户OpenId、角色）
                .claim("openid", user.getOpenid())
                .claim("role", user.getRole())
                // 签发时间
                .setIssuedAt(new Date(currentTime))
                // 过期时间
                .setExpiration(new Date(expireTime))
                // 签名加密
                .signWith(jwtSecretKey)
                // 构建
                .compact();
    }

    // 新增：解析 Token，获取 Claims（JWT 中的所有信息）
    private Claims parseToken(String token) {
        // 去掉 "Bearer " 前缀（如果有的话）
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        // 解析 Token，验证签名和过期时间
        return Jwts.parserBuilder()
                .setSigningKey(jwtSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 新增：从 Token 中获取当前用户 ID
    public Long getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return Long.parseLong(claims.getSubject()); // 主题中存储的是用户 ID
    }

    // 新增：从 Token 中获取当前用户 Openid
    public String getOpenidFromToken(String token) {
        Claims claims = parseToken(token);
        return (String) claims.get("openid");
    }

    // 新增：验证 Token 是否过期
    public boolean isTokenExpired(String token) {
        Claims claims = parseToken(token);
        return claims.getExpiration().before(new Date());
    }
}