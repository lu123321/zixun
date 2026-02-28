package com.example.counselingappjava.dto;

import lombok.Data;

import java.util.Date;
import java.util.List;

/**
 * 来访者详情返回DTO
 * 字段与小程序pages/client/edit 加载的clientData完全一致
 * 日期转yyyy-MM-dd字符串，标签转List<String>
 */
@Data
public class ClientDetailDTO {
    /** 来访者ID */
    private Long id;

    /** 来访者编号 */
    private String clientNo;

    // ========== 基本信息 ==========
    private String name;
    private Integer gender;
    private Integer age;
    /** 出生日期（yyyy-MM-dd） */
    private String birthDate;
    // ========== 联系信息 ==========
    private String contactPhone;
    private String email;
    private String emergencyContact;
    private String emergencyPhone;
    // ========== 咨询信息 ==========
    /** 首次咨询日期（yyyy-MM-dd） */
    private String startDate;
    private Integer status;
    /** 结束咨询日期（yyyy-MM-dd） */
    private String endDate;
    // ========== 标签 ==========
    private List<String> tags;
    // ========== 备注/诊断/方案 ==========
    private String remark;
    private String diagnosis;
    private String treatmentPlan;
    // ========== 基础信息 ==========
    private Date createTime;
    private Date updateTime;
}