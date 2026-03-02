package com.example.counselingappjava.dto;

import com.example.counselingappjava.config.jackson.BooleanToIntegerDeserializer;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;

import javax.validation.constraints.Future;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Date;

@Data
public class ScheduleDTO {

    @NotBlank(message = "日程标题不能为空")
    @Size(max = 100, message = "日程标题长度不能超过100个字符")
    private String title;

    @NotNull(message = "日程类型不能为空")
    private Integer scheduleType;

    private Long clientId;

    @NotNull(message = "开始时间不能为空")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone = "GMT+8")
    private Date startTime;

    @NotNull(message = "结束时间不能为空")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone = "GMT+8")
    private Date endTime;

    @Size(max = 200, message = "地点长度不能超过200个字符")
    private String location;

    private String description;

    private String color = "#1890ff";

    private Integer remindType = 1;

    @JsonDeserialize(using = BooleanToIntegerDeserializer.class)
    private Integer isRecurring = 0;

    private String recurringRule;
}