package com.example.counselingappjava.dto;

import lombok.Data;
import java.util.Date;
import java.util.List;

/**
 * 来访者列表返回DTO
 * 字段与小程序pages/client/list 完全一致，前端直接渲染
 */
@Data
public class ClientDTO {
    /** 来访者ID */
    private Long id;
    /** 来访者编号（实体中clientNo） */
    private String clientNo;
    /** 姓名 */
    private String name;
    /** 性别：0=未知,1=男,2=女,3=其他 */
    private Integer gender;
    /** 年龄 */
    private Integer age;
    /** 联系电话 */
    private String contactPhone;
    /** 状态：1=进行中,2=已结案,3=中断,4=转介 */
    private Integer status;
    /** 标签数组（实体中JSON字符串转数组） */
    private List<String> tags;
    /** 咨询次数（暂默认0，后续关联咨询记录表补充） */
    private Integer sessionCount = 0;
    /** 最后一次咨询时间（暂默认null，后续关联咨询记录表补充） */
    private Date lastSessionTime;
    /** 创建时间（前端排序用：create_time） */
    private Date create_time;
}