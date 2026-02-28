package com.example.counselingappjava.controller;

import com.example.counselingappjava.common.Result;
import com.example.counselingappjava.dto.LoginResponseDTO;
import com.example.counselingappjava.dto.UpdateUserInfoDTO;
import com.example.counselingappjava.dto.UserInfoDTO;
import com.example.counselingappjava.dto.WxLoginDTO;
import com.example.counselingappjava.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 用户相关接口Controller
 * 对应小程序：我的页面、登录页面
 */
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@CrossOrigin // 开发环境允许跨域（生产环境需配置指定域名）
public class UserController {

    private final UserService userService;

    /**
     * 小程序微信登录接口
     * 前端传递：{ "code": "小程序获取的登录凭证" }
     */
    @PostMapping("/wx/login")
    public Result<LoginResponseDTO> wxLogin(@RequestBody WxLoginDTO wxLoginDTO) {
        try {
            LoginResponseDTO loginResponseDTO = userService.wxLogin(wxLoginDTO);
            return Result.success(loginResponseDTO);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/current")
    public Result<UserInfoDTO> getCurrentUser() {
        try {
            UserInfoDTO userInfoDTO = userService.getCurrentUser();
            return Result.success(userInfoDTO);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 根据用户ID查询用户信息
     * （前端登录后，携带用户ID查询详情）
     */
    @GetMapping("/info/{userId}")
    public Result<UserInfoDTO> getUserInfo(@PathVariable Long userId) {
        try {
            UserInfoDTO userInfoDTO = userService.getUserInfoById(userId);
            return Result.success(userInfoDTO);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新用户信息
     * 前端传递：用户ID + 需更新的字段
     */
    @PutMapping("/info/{userId}")
    public Result<Boolean> updateUserInfo(
            @PathVariable Long userId,
            @RequestBody UpdateUserInfoDTO updateUserInfoDTO) {
        try {
            Boolean success = userService.updateUserInfo(userId, updateUserInfoDTO);
            return Result.success(success);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
}