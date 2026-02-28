package com.example.counselingappjava.dto;

import lombok.Data;

import javax.validation.constraints.Future;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.Date;

@Data
public class SessionDTO {

    @NotNull(message = "来访者ID不能为空")
    private Long clientId;

    @NotNull(message = "咨询时间不能为空")
    @Future(message = "咨询时间必须是将来的时间")
    private Date sessionTime;

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
}