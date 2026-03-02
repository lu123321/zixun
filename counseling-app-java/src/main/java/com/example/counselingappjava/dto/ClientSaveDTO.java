package com.example.counselingappjava.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.util.Date;
import java.util.List;

/**
 * 来访者新增/编辑请求DTO
 * 字段与小程序pages/client/edit 提交的clientData完全一致
 * 包含JSR380校验注解，后端自动校验表单
 */
@Data
public class ClientSaveDTO {
    /** 编辑时传，新增时不传 */
    private Long id;

    // ========== 基本信息 ==========
    /** 姓名（必填） */
    @NotBlank(message = "姓名不能为空")
    @Size(max = 20, message = "姓名不能超过20个字符")
    private String name;

    /** 性别 0=未知,1=男,2=女（前端默认null，后端处理为0） */
    private Integer gender = 0;

    /** 年龄 */
    private Integer age;

    /** 出生日期（yyyy-MM-dd） */
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private Date birthDate;

    // ========== 联系信息 ==========
    /** 联系电话（选填，填则校验格式） */
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "联系电话格式不正确")
    private String contactPhone;

    /** 邮箱（选填） */
    private String email;

    /** 紧急联系人 */
    private String emergencyContact;

    /** 紧急联系电话（选填，填则校验格式） */
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "紧急联系电话格式不正确")
    private String emergencyPhone;

    // ========== 咨询信息 ==========
    /** 首次咨询日期（yyyy-MM-dd，必填，前端默认当前日期） */
    @NotNull(message = "首次咨询日期不能为空")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private Date startDate;

    /** 状态 1=进行中,2=已结案,3=中断,4=转介（默认1） */
    private Integer status = 1;

    /** 结束咨询日期（yyyy-MM-dd，状态为2时必填） */
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private Date endDate;

    // ========== 标签 ==========
    /** 标签列表（前端合并常用+自定义标签，List<String>） */
    private List<String> tags;

    // ========== 备注/诊断/方案 ==========
    /** 备注（最多1000字） */
    @Size(max = 1000, message = "备注不能超过1000个字符")
    private String remark;

    /** 初步诊断（最多500字） */
    @Size(max = 500, message = "初步诊断不能超过500个字符")
    private String diagnosis;

    /** 治疗方案（最多500字） */
    @Size(max = 500, message = "治疗方案不能超过500个字符")
    private String treatmentPlan;
}