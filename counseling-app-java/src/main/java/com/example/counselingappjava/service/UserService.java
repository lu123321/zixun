package com.example.counselingappjava.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.counselingappjava.dto.LoginResponseDTO;
import com.example.counselingappjava.dto.UpdateUserInfoDTO;
import com.example.counselingappjava.dto.UserInfoDTO;
import com.example.counselingappjava.dto.WxLoginDTO;
import com.example.counselingappjava.entity.User;

/**
 * 用户服务接口
 */
public interface UserService extends IService<User> {

    /**
     * 小程序微信授权登录（免注册，通过code换取openid，不存在则创建用户）
     * @param wxLoginDTO 登录请求（包含code）
     * @return 用户信息DTO
     */
    LoginResponseDTO wxLogin(WxLoginDTO wxLoginDTO);

    // 新增：获取当前登录用户信息
    UserInfoDTO getCurrentUser();
    
    /**
     * 根据用户ID查询用户信息
     * @param userId 用户ID
     * @return 用户信息DTO
     */
    UserInfoDTO getUserInfoById(Long userId);

    /**
     * 根据openid查询用户信息
     * @param openid 微信openid
     * @return 用户实体
     */
    User getUserByOpenid(String openid);

    /**
     * 更新用户信息
     * @param userId 用户ID
     * @param updateUserInfoDTO 更新的用户信息
     * @return 是否更新成功
     */
    Boolean updateUserInfo(Long userId, UpdateUserInfoDTO updateUserInfoDTO);
}