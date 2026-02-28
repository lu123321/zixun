package com.example.counselingappjava.entity;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.Date;

@Data
@Accessors(chain = true)
public class FinanceCategory {

    private Long id;
    private Long userId;
    private String name;
    private Integer type; // 1=收入分类,2=支出分类
    private String icon;
    private Integer sortOrder = 0;
    private Integer status = 1;
    private Date createTime;

    // 分类类型枚举
    public enum Type {
        INCOME(1, "收入分类"),
        EXPENSE(2, "支出分类");

        private final int code;
        private final String desc;

        Type(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public int getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static Type fromCode(int code) {
            for (Type type : Type.values()) {
                if (type.code == code) {
                    return type;
                }
            }
            return INCOME;
        }
    }
}