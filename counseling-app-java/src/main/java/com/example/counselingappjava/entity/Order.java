package com.example.counselingappjava.entity;

import lombok.Data;
import lombok.experimental.Accessors;

import java.math.BigDecimal;
import java.util.Date;

@Data
@Accessors(chain = true)
public class Order {

    private Long id;
    private Long userId;
    private String orderNo;
    private Long subscriptionId;
    private BigDecimal amount;
    private Integer payStatus = 0; // 0=待支付,1=支付成功,2=支付失败,3=已退款
    private Date payTime;
    private String tradeNo; // 微信支付单号
    private String payChannel; // 支付渠道：wechat,alipay
    private Integer orderStatus = 1; // 1=正常,2=已取消
    private BigDecimal refundAmount = BigDecimal.ZERO;
    private Date refundTime;
    private Date createTime;
    private Date updateTime;

    // 支付状态枚举
    public enum PayStatus {
        PENDING(0, "待支付"),
        SUCCESS(1, "支付成功"),
        FAILED(2, "支付失败"),
        REFUNDED(3, "已退款");

        private final int code;
        private final String desc;

        PayStatus(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public int getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static PayStatus fromCode(int code) {
            for (PayStatus status : PayStatus.values()) {
                if (status.code == code) {
                    return status;
                }
            }
            return PENDING;
        }
    }

    // 订单状态枚举
    public enum OrderStatus {
        NORMAL(1, "正常"),
        CANCELLED(2, "已取消");

        private final int code;
        private final String desc;

        OrderStatus(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public int getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static OrderStatus fromCode(int code) {
            for (OrderStatus status : OrderStatus.values()) {
                if (status.code == code) {
                    return status;
                }
            }
            return NORMAL;
        }
    }

    // 支付渠道枚举
    public enum PayChannel {
        WECHAT("wechat", "微信支付"),
        ALIPAY("alipay", "支付宝");

        private final String code;
        private final String desc;

        PayChannel(String code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public String getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static PayChannel fromCode(String code) {
            for (PayChannel channel : PayChannel.values()) {
                if (channel.code.equals(code)) {
                    return channel;
                }
            }
            return WECHAT;
        }
    }
}