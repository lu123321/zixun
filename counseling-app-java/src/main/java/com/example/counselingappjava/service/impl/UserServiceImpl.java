package com.example.counselingappjava.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.counselingappjava.dto.*;
import com.example.counselingappjava.entity.User;
import com.example.counselingappjava.mapper.UserMapper;
import com.example.counselingappjava.service.UserService;
import com.example.counselingappjava.util.JwtUtil;
import com.example.counselingappjava.util.UserContextHolder;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Date;

/**
 * 用户服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    // 注入微信小程序配置
    @Value("${spring.wx.mini.appid}")
    private String wxAppId;

    @Value("${spring.wx.mini.secret}")
    private String wxSecret;

    // 微信code换取openid的接口地址
    private static final String WX_JS_CODE_2_SESSION_URL = "https://api.weixin.qq.com/sns/jscode2session";

    private final ObjectMapper objectMapper;

    private final JwtUtil jwtUtil;

    /**
     * 小程序微信授权登录核心逻辑
     */
    @Override
    public LoginResponseDTO wxLogin(WxLoginDTO wxLoginDTO) {
        if (wxLoginDTO == null || wxLoginDTO.getCode() == null || wxLoginDTO.getCode().trim().isEmpty()) {
            throw new RuntimeException("登录凭证code不能为空");
        }

        // 1. 调用微信接口，通过code换取openid和session_key
        WxSessionResponse wxSession = this.getWxSession(wxLoginDTO.getCode());
        if (wxSession == null || wxSession.getErrcode() != null || wxSession.getOpenid() == null) {
            throw new RuntimeException("微信登录失败：" + (wxSession != null ? wxSession.getErrmsg() : "获取session信息失败"));
        }

        // 2. 根据openid查询用户是否存在
        User user = this.getUserByOpenid(wxSession.getOpenid());
        if (user == null) {
            // 3. 用户不存在，创建新用户（默认角色：咨询师，状态：正常）
            user = this.createNewUser(wxSession);
        } else {
            // 4. 用户存在，更新最后登录时间
            user.setLastLoginTime(new Date());
            this.updateById(user);
        }

        // 5. 生成JWT Token
        String token = jwtUtil.generateToken(user);

        // 6. 封装返回结果（Token + 用户信息DTO）
        LoginResponseDTO loginResponseDTO = new LoginResponseDTO();
        loginResponseDTO.setToken(token);
        loginResponseDTO.setUserInfo(this.convertToUserInfoDTO(user));

        return loginResponseDTO;
    }

    @Override
    public UserInfoDTO getCurrentUser() {
        // 1. 从用户上下文获取当前登录用户 ID
        Long userId = UserContextHolder.getUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前登录用户");
        }

        // 2. 根据用户 ID 查询数据库
        User user = this.getById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 3. 转换为 UserInfoDTO 返回
        return this.convertToUserInfoDTO(user);
    }
    /**
     * 根据用户ID查询用户信息
     */
    @Override
    public UserInfoDTO getUserInfoById(Long userId) {
        if (userId == null || userId <= 0) {
            throw new RuntimeException("用户ID无效");
        }

        User user = this.getById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        return this.convertToUserInfoDTO(user);
    }

    /**
     * 根据openid查询用户实体
     */
    @Override
    public User getUserByOpenid(String openid) {
        if (openid == null || openid.trim().isEmpty()) {
            return null;
        }

        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<User>();
        queryWrapper.eq(User::getOpenid, openid);
        return this.getOne(queryWrapper);
    }

    /**
     * 更新用户信息
     */
    @Override
    public Boolean updateUserInfo(Long userId, UpdateUserInfoDTO updateUserInfoDTO) {
        if (userId == null || userId <= 0 || updateUserInfoDTO == null) {
            throw new RuntimeException("参数无效");
        }

        User user = this.getById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 复制可更新的字段（忽略null值，避免覆盖原有有效数据）
        BeanUtils.copyProperties(updateUserInfoDTO, user, "id", "openid", "role", "status", "createTime");
        user.setUpdateTime(new Date());

        // 执行更新
        return this.updateById(user);
    }

    // ---------------------- 私有辅助方法 ----------------------

    /**
     * 调用微信接口，获取session信息（openid、session_key等）
     */
    private WxSessionResponse getWxSession(String code) {
        try {
            // 使用WebClient调用微信接口（非阻塞，推荐）
            String responseStr = WebClient.create()
                    .get()
                    .uri(WX_JS_CODE_2_SESSION_URL, uriBuilder -> uriBuilder
                            .queryParam("appid", wxAppId)
                            .queryParam("secret", wxSecret)
                            .queryParam("js_code", code)
                            .queryParam("grant_type", "authorization_code")
                            .build())
                    .retrieve()
                    .toEntity(String.class)
                    .map(ResponseEntity::getBody)
                    .block();

            log.info("微信session接口返回结果：{}", responseStr);

            // 转换为WxSessionResponse对象
            return objectMapper.readValue(responseStr, WxSessionResponse.class);
        } catch (Exception e) {
            log.error("调用微信session接口异常", e);
            return null;
        }
    }

    /**
     * 创建新用户（默认配置）
     */
    private User createNewUser(WxSessionResponse wxSession) {
        User newUser = new User()
                .setOpenid(wxSession.getOpenid())
                .setUnionid(wxSession.getUnionid())
                .setRole(User.Role.CONSULTANT.getCode()) // 默认：咨询师
                .setStatus(User.Status.NORMAL.getCode()) // 默认：正常状态
                .setCreateTime(new Date())
                .setUpdateTime(new Date())
                .setLastLoginTime(new Date());

        // 保存新用户
        this.save(newUser);
        return newUser;
    }

    /**
     * User实体转换为UserInfoDTO（隐藏敏感字段）
     */
    private UserInfoDTO convertToUserInfoDTO(User user) {
        if (user == null) {
            return null;
        }

        UserInfoDTO userInfoDTO = new UserInfoDTO();
        BeanUtils.copyProperties(user, userInfoDTO);
        return userInfoDTO;
    }
}