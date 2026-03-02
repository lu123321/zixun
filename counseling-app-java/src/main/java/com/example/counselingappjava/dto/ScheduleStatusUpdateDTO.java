package com.example.counselingappjava.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class ScheduleStatusUpdateDTO {
    @NotNull(message = "日程ID不能为空")
    private Long id;

    @NotNull(message = "日程状态不能为空")
    private Integer status;
}