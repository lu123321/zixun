package com.example.counselingappjava.dto;

import lombok.Data;

/**
 * 登录成功返回DTO（包含Token和用户信息）
 */
@Data
public class LoginResponseDTO {
    // JWT Token
    private String token;
    // 用户信息
    private UserInfoDTO userInfo;
}