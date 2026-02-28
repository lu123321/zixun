package com.example.counselingappjava.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.experimental.Accessors;

import java.util.Date;

@Data
@Accessors(chain = true)
@TableName("t_client")
public class Client {

    private Long id;
    private Long userId;
    private String clientNo;
    private String name;
    private Integer gender; // 0=未知,1=男,2=女,3=其他
    private Integer age;
    private Date birthDate;
    private String contactPhone;
    private String emergencyContact;
    private String emergencyPhone;
    private Date startDate;
    private Date endDate;
    private Integer status = 1; // 1=进行中,2=已结案,3=中断,4=转介
    private String diagnosis;
    private String treatmentPlan;
    private String remark;
    private String tags; // JSON数组，如["抑郁","焦虑"]
    private Date createTime;
    private Date updateTime;
    // 来访者状态枚举
    public enum Status {
        IN_PROGRESS(1, "进行中"),
        CLOSED(2, "已结案"),
        INTERRUPTED(3, "中断"),
        REFERRED(4, "转介");

        private final Integer code;
        private final String desc;

        Status(Integer code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public Integer getCode() {
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
            return IN_PROGRESS;
        }
    }

    // 性别枚举
    public enum Gender {
        UNKNOWN(0, "未知"),
        MALE(1, "男"),
        FEMALE(2, "女"),
        OTHER(3, "其他");

        private final int code;
        private final String desc;

        Gender(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public int getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static Gender fromCode(int code) {
            for (Gender gender : Gender.values()) {
                if (gender.code == code) {
                    return gender;
                }
            }
            return UNKNOWN;
        }
    }
}