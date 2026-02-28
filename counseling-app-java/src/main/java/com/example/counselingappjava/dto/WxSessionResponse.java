package com.example.counselingappjava.dto;

import lombok.Data;

/**
 * @author luyaozong
 * @date 2026/2/2
 **/
@Data
public class WxSessionResponse {
    private String openid; // 用户唯一标识
    private String session_key; // 会话密钥
    private String unionid; // 统一用户标识（需小程序绑定微信开放平台）
    private Integer errcode; // 错误码
    private String errmsg; // 错误信息
}
