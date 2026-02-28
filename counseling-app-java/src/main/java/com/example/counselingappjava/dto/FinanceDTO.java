package com.example.counselingappjava.dto;

import lombok.Data;

import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Date;

@Data
public class FinanceDTO {

    @NotNull(message = "记录日期不能为空")
    private Date recordDate;

    @NotNull(message = "记录类型不能为空")
    private Integer recordType;

    private Long categoryId;

    private String categoryName;

    @NotNull(message = "金额不能为空")
    @DecimalMin(value = "0.01", message = "金额必须大于0")
    private BigDecimal amount;

    private Long clientId;

    private Long sessionId;

    private Integer paymentMethod;

    private Integer isReimbursable = 0;

    private String invoiceNo;

    private String remark;

    private String attachments;
}