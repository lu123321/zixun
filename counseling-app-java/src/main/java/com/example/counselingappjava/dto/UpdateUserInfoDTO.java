package com.example.counselingappjava.dto;

import lombok.Data;

/**
 * @author luyaozong
 * @date 2026/2/2
 **/
@Data
public class UpdateUserInfoDTO {
    private String nickname;
    private String avatar;
    private String phone;
    private String realName;
    private String email;
    private String qualification;
    private String introduction;
}