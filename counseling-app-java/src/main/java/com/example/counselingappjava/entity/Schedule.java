package com.example.counselingappjava.entity;

import com.example.counselingappjava.config.jackson.BooleanToIntegerDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;
import lombok.experimental.Accessors;

import java.util.Date;

@Data
@Accessors(chain = true)
public class Schedule {

    private Long id;
    private Long userId;
    private Long clientId;
    private Long sessionId;
    private String title;
    private Integer scheduleType = 1; // 1=咨询,2=督导,3=写报告,4=培训,5=会议,6=休息,7=其他
    private Date startTime;
    private Date endTime;
    private String location;
    private String description;
    private String color = "#1890ff"; // 日程颜色
    private Integer remindType = 1; // 1=不提醒,2=开始时,3=提前5分钟,4=提前15分钟,5=提前30分钟,6=提前1小时,7=提前1天
    private Integer remindSent = 0; // 提醒是否已发送
    private Integer status = 1; // 1=待办,2=完成,3=取消,4=进行中
    @JsonDeserialize(using = BooleanToIntegerDeserializer.class)
    private Integer isRecurring = 0; //
    private String recurringRule; // 重复规则JSON
    private Date createTime;
    private Date updateTime;

    // 日程类型枚举
    public enum ScheduleType {
        CONSULTATION(1, "咨询"),
        SUPERVISION(2, "督导"),
        REPORT_WRITING(3, "写报告"),
        TRAINING(4, "培训"),
        MEETING(5, "会议"),
        REST(6, "休息"),
        OTHER(7, "其他");

        private final int code;
        private final String desc;

        ScheduleType(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public int getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static ScheduleType fromCode(int code) {
            for (ScheduleType type : ScheduleType.values()) {
                if (type.code == code) {
                    return type;
                }
            }
            return CONSULTATION;
        }
    }

    // 提醒类型枚举
    public enum RemindType {
        NONE(1, "不提醒"),
        START_TIME(2, "开始时"),
        MINUTES_5(3, "提前5分钟"),
        MINUTES_15(4, "提前15分钟"),
        MINUTES_30(5, "提前30分钟"),
        HOUR_1(6, "提前1小时"),
        DAY_1(7, "提前1天");

        private final int code;
        private final String desc;

        RemindType(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public int getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static RemindType fromCode(int code) {
            for (RemindType type : RemindType.values()) {
                if (type.code == code) {
                    return type;
                }
            }
            return NONE;
        }
    }

    // 日程状态枚举
    public enum Status {
        PENDING(1, "待办"),
        COMPLETED(2, "完成"),
        CANCELLED(3, "取消"),
        IN_PROGRESS(4, "进行中");

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
            return PENDING;
        }
    }
}