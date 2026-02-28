package com.example.counselingappjava.entity;

import com.example.counselingappjava.entity.Client;
import com.example.counselingappjava.entity.User;
import lombok.Data;
import lombok.experimental.Accessors;

import java.math.BigDecimal;
import java.util.Date;

@Data
@Accessors(chain = true)
public class Session {

    private Long id;
    private Long userId;
    private Long clientId;
    private String sessionNo;
    private Date sessionTime;
    private Integer duration = 50; // 分钟，默认50分钟
    private Integer sessionType = 1; // 1=个体咨询,2=家庭治疗,3=团体咨询,4=督导
    private Integer sessionMode = 1; // 1=面对面,2=视频,3=电话
    private BigDecimal fee;
    private Integer hasSupervision = 0; // 是否督导
    private Integer supervisionType; // 1=个体督导,2=团体督导
    private BigDecimal supervisionFee;
    private String contentSummary;
    private String clientStatus;
    private String homework;
    private String nextPlan;
    private String subjective; // 主观感受/反思
    private String objective; // 客观观察
    private String assessment; // 评估分析
    private String plan; // 计划建议
    private String sessionNotes; // 当次咨询记录（SOAP格式）
    private String attachments; // 附件列表JSON
    private Integer isBilled = 0; // 是否已记账
    private Integer status = 1; // 1=已预约,2=已完成,3=取消,4=缺席
    private Date createTime;
    private Date updateTime;

    // 咨询类型枚举
    public enum SessionType {
        INDIVIDUAL(1, "个体咨询"),
        FAMILY(2, "家庭治疗"),
        GROUP(3, "团体咨询"),
        SUPERVISION(4, "督导");

        private final int code;
        private final String desc;

        SessionType(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public int getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static SessionType fromCode(int code) {
            for (SessionType type : SessionType.values()) {
                if (type.code == code) {
                    return type;
                }
            }
            return INDIVIDUAL;
        }
    }

    // 咨询方式枚举
    public enum SessionMode {
        FACE_TO_FACE(1, "面对面"),
        VIDEO(2, "视频"),
        PHONE(3, "电话");

        private final int code;
        private final String desc;

        SessionMode(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public int getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static SessionMode fromCode(int code) {
            for (SessionMode mode : SessionMode.values()) {
                if (mode.code == code) {
                    return mode;
                }
            }
            return FACE_TO_FACE;
        }
    }

    // 督导类型枚举
    public enum SupervisionType {
        INDIVIDUAL(1, "个体督导"),
        GROUP(2, "团体督导");

        private final int code;
        private final String desc;

        SupervisionType(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public int getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static SupervisionType fromCode(int code) {
            for (SupervisionType type : SupervisionType.values()) {
                if (type.code == code) {
                    return type;
                }
            }
            return INDIVIDUAL;
        }
    }

    // 咨询状态枚举
    public enum Status {
        SCHEDULED(1, "已预约"),
        COMPLETED(2, "已完成"),
        CANCELLED(3, "取消"),
        ABSENT(4, "缺席");

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
            return SCHEDULED;
        }
    }
}