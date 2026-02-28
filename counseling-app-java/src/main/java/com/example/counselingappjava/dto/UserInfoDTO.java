package com.example.counselingappjava.dto;

import lombok.Data;


@Data
public class UserInfoDTO {
    private Long id;
    private String openid;
    private String nickname;
    private String avatar;
    private String phone;
    private String realName;
    private String email;
    private String qualification; // 资质
    private String introduction; // 个人简介
    private Integer role; // 角色
    private Integer status; // 状态
}