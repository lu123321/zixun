package com.example.counselingappjava.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.util.Date;

@Data
@Accessors(chain = true)
@TableName("t_user")
public class User implements Serializable {

    private Long id;
    private String openid;
    private String unionid;
    private String nickname;
    private String avatar;
    private String phone;
    private String realName;
    private String email;
    private Integer role = 1; // 1=咨询师,2=助理,3=管理员
    private Integer gender; // 0=未知,1=男,2=女
    private String qualification;
    private String introduction;
    private Integer status = 1; // 1=正常,0=禁用,2=试用期
    private String settings; // JSON格式设置
    private Date lastLoginTime;
    private Date createTime;
    private Date updateTime;

    // 用户角色枚举
    public enum Role {
        CONSULTANT(1, "咨询师"),
        ASSISTANT(2, "助理"),
        ADMIN(3, "管理员");

        private final int code;
        private final String desc;

        Role(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }

        public int getCode() {
            return code;
        }

        public String getDesc() {
            return desc;
        }

        public static Role fromCode(int code) {
            for (Role role : Role.values()) {
                if (role.code == code) {
                    return role;
                }
            }
            return CONSULTANT;
        }
    }

    // 用户状态枚举
    public enum Status {
        NORMAL(1, "正常"),
        DISABLED(0, "禁用"),
        TRIAL(2, "试用期");

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
            return NORMAL;
        }
    }

    // 性别枚举
    public enum Gender {
        UNKNOWN(0, "未知"),
        MALE(1, "男"),
        FEMALE(2, "女");

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