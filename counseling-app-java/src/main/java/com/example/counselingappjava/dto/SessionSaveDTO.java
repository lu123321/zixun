package com.example.counselingappjava.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.Date;

@Data
public class SessionSaveDTO {

    @NotNull(message = "来访者ID不能为空")
    private Long clientId;

    /**
     * 前端传入 yyyy-MM-dd HH:mm:ss
     */
    @NotNull(message = "咨询开始时间不能为空")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date startTime;

    @Positive(message = "咨询时长必须大于0")
    private Integer duration = 50;

    @NotNull(message = "咨询类型不能为空")
    private Integer sessionType;

    @NotNull(message = "咨询方式不能为空")
    private Integer sessionMode;

    private BigDecimal fee;

    private Integer hasSupervision = 0;
    private Integer supervisionType;
    private BigDecimal supervisionFee;

    private String contentSummary;
    private String clientStatus;
    private String homework;
    private String nextPlan;
    private String subjective;
    private String objective;
    private String assessment;
    private String plan;
    private String sessionNotes;
    private String attachments;

    private Integer status;
}