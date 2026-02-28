package com.example.counselingappjava.dto;

import lombok.Data;

/**
 * 小程序登录请求DTO（前端传递code）
 */
@Data
public class WxLoginDTO {
    // 小程序端获取的登录凭证code
    private String code;
}
