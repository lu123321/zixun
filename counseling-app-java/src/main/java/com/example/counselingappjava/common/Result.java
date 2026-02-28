package com.example.counselingappjava.common;

import lombok.Data;

/**
 * 统一API响应结果
 */
@Data
public class Result<T> {
    // 响应状态码（200成功，500失败，400参数错误，401未登录）
    private Integer code;
    // 响应消息
    private String msg;
    // 响应数据
    private T data;

    // 成功响应（无数据）
    public static <T> Result<T> success() {
        return new Result<T>(200, "操作成功", null);
    }

    // 成功响应（带数据）
    public static <T> Result<T> success(T data) {
        return new Result<T>(200, "操作成功", data);
    }

    // 失败响应
    public static <T> Result<T> error(String msg) {
        return new Result<T>(500, msg, null);
    }

    // 自定义响应
    public static <T> Result<T> result(Integer code, String msg, T data) {
        Result<T> result = new Result<T>();
        result.setCode(code);
        result.setMsg(msg);
        result.setData(data);
        return result;
    }

    public Result() {}

    public Result(Integer code, String msg, T data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }
}