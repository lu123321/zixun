package com.example.counselingappjava.entity;

import lombok.Data;
import lombok.experimental.Accessors;

import java.math.BigDecimal;
import java.util.Date;

@Data
@Accessors(chain = true)
public class Finance {

    private Long id;
    private Long userId;
    private Date recordDate;
    private Integer recordType; // 1=收入,2=支出
    private Long categoryId;
    private String categoryName;
    private BigDecimal amount;
    private Long clientId;
    private Long sessionId;
    private Integer paymentMethod; // 1=现金,2=微信,3=支付宝,4=银行卡,5=其他
    private Integer isReimbursable = 0; // 是否可报销
    private String invoiceNo;
    private String remark;
    private String attachments; // 凭证附件JSON
    private Date createTime;
    private Date updateTime;

    // 记录类型枚举
    public enum RecordType {
        INCOME(1, "收入"),
        EXPENSE(2, "支出");

        private final int code;
        private final String desc;

        RecordType(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public int getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static RecordType fromCode(int code) {
            for (RecordType type : RecordType.values()) {
                if (type.code == code) {
                    return type;
                }
            }
            return INCOME;
        }
    }

    // 支付方式枚举
    public enum PaymentMethod {
        CASH(1, "现金"),
        WECHAT(2, "微信"),
        ALIPAY(3, "支付宝"),
        BANK_CARD(4, "银行卡"),
        OTHER(5, "其他");

        private final int code;
        private final String desc;

        PaymentMethod(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public int getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static PaymentMethod fromCode(int code) {
            for (PaymentMethod method : PaymentMethod.values()) {
                if (method.code == code) {
                    return method;
                }
            }
            return CASH;
        }
    }
}