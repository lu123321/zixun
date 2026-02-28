package com.example.counselingappjava.util;

import java.util.Random;

/**
 * 来访者编号生成工具
 * 格式：C + 时间戳后8位 + 3位随机数（如C260207123456）
 * 保证唯一性
 */
public class ClientNoGenerator {
    private static final String PREFIX = "C";
    private static final Random RANDOM = new Random();

    public static String generate() {
        // 1. 获取当前时间戳后8位（秒级，避免过长）
        String timePart = String.valueOf(System.currentTimeMillis()).substring(4);
        // 2. 生成3位随机数（000-999）
        String randomPart = String.format("%03d", RANDOM.nextInt(1000));
        // 3. 拼接前缀
        return PREFIX + timePart + randomPart;
    }
}