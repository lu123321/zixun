package com.example.counselingappjava.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class SessionStatusUpdateDTO {

    @NotNull(message = "咨询记录ID不能为空")
    private Long id;

    /** 1=已预约,2=已完成,3=取消,4=缺席 */
    @NotNull(message = "咨询状态不能为空")
    private Integer status;
}
