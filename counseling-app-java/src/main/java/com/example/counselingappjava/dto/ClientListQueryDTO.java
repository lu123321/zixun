package com.example.counselingappjava.dto;

import lombok.Data;

/**
 * 来访者列表查询请求DTO
 * 接收前端：筛选、搜索、分页、排序参数
 */
@Data
public class ClientListQueryDTO {
    /** 当前页码，默认1 */
    private Integer currentPage = 1;
    /** 每页条数，默认20（与前端pageSize一致） */
    private Integer pageSize = 20;
    /** 状态筛选：1=进行中,2=已结案,3=中断,4=转介；all则为null */
    private Integer status;
    /** 搜索关键词：模糊匹配姓名/联系电话 */
    private String keyword;
    /** 排序字段：create_time（创建时间）、last_session（最后咨询，暂兼容创建时间），默认create_time */
    private String sortField = "create_time";
    /** 排序顺序：desc（降序）、asc（升序），默认desc */
    private String sortOrder = "desc";
}