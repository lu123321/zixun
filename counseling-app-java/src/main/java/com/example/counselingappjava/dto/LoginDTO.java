package com.example.counselingappjava.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class LoginDTO {

    @NotBlank(message = "微信code不能为空")
    private String code;

    private String encryptedData;

    private String iv;

    private String rawData;

    private String signature;
}