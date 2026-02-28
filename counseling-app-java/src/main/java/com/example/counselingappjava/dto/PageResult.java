package com.example.counselingappjava.dto;

import lombok.Data;
import java.util.List;

/**
 * 通用分页结果返回DTO
 * 适配前端分页、总条数展示需求
 */
@Data
public class PageResult<T> {
    /** 列表数据 */
    private List<T> list;
    /** 总记录数（前端需要显示「共X位来访者」） */
    private Long totalCount;
    /** 当前页码（前端分页用） */
    private Integer currentPage;
    /** 每页条数（前端分页用） */
    private Integer pageSize;
}