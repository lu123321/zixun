package com.example.counselingappjava.util;

/**
 * 当前用户上下文（基于 ThreadLocal，保证线程安全）
 * 存储当前登录用户的 ID，供后续业务逻辑使用
 */
public class UserContextHolder {

    // ThreadLocal 存储当前线程的用户 ID
    private static final ThreadLocal<Long> USER_ID_HOLDER = new ThreadLocal<>();

    /**
     * 设置当前用户 ID
     */
    public static void setUserId(Long userId) {
        USER_ID_HOLDER.set(userId);
    }

    /**
     * 获取当前用户 ID
     */
    public static Long getUserId() {
        return USER_ID_HOLDER.get();
    }

    /**
     * 清除当前用户 ID（请求结束后释放，避免内存泄漏）
     */
    public static void clear() {
        USER_ID_HOLDER.remove();
    }
}