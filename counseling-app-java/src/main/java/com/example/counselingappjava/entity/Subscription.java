package com.example.counselingappjava.entity;

import lombok.Data;
import lombok.experimental.Accessors;

import java.math.BigDecimal;
import java.util.Date;

@Data
@Accessors(chain = true)
public class Subscription {

    private Long id;
    private Long userId;
    private String planCode; // 套餐代码：monthly/yearly/professional
    private String planName;
    private BigDecimal price;
    private Date startTime;
    private Date endTime;
    private Integer status = 1; // 1=有效,2=即将过期,3=已过期,4=已取消
    private Integer autoRenew = 1; // 是否自动续费
    private String features; // 套餐包含的功能权限JSON
    private Long orderId;
    private Date createTime;
    private Date updateTime;

    // 订阅状态枚举
    public enum Status {
        ACTIVE(1, "有效"),
        EXPIRING(2, "即将过期"),
        EXPIRED(3, "已过期"),
        CANCELLED(4, "已取消");

        private final int code;
        private final String desc;

        Status(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public int getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static Status fromCode(int code) {
            for (Status status : Status.values()) {
                if (status.code == code) {
                    return status;
                }
            }
            return ACTIVE;
        }
    }

    // 套餐代码枚举
    public enum PlanCode {
        MONTHLY("monthly", "月度套餐"),
        YEARLY("yearly", "年度套餐"),
        PROFESSIONAL("professional", "专业套餐");

        private final String code;
        private final String desc;

        PlanCode(String code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public String getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static PlanCode fromCode(String code) {
            for (PlanCode planCode : PlanCode.values()) {
                if (planCode.code.equals(code)) {
                    return planCode;
                }
            }
            return MONTHLY;
        }
    }
}