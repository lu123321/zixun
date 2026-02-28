package com.example.counselingappjava.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.counselingappjava.dto.ClientDetailDTO;
import com.example.counselingappjava.dto.ClientListQueryDTO;
import com.example.counselingappjava.dto.ClientSaveDTO;
import com.example.counselingappjava.dto.PageResult;
import com.example.counselingappjava.entity.Client;

/**
 * 来访者Service接口
 */
public interface ClientService extends IService<Client> {
    /**
     * 分页查询来访者列表
     * 支持筛选、搜索、排序、数据隔离
     * @param queryDTO 查询参数
     * @return 分页结果（列表+总条数）
     */
    PageResult<Client> getClientList(ClientListQueryDTO queryDTO);


    /**
     * 新增来访者
     * @param saveDTO 提交的表单数据
     * @return 新增后的来访者ID
     */
    Long createClient(ClientSaveDTO saveDTO);

    /**
     * 编辑来访者
     * @param saveDTO 提交的表单数据（含id）
     */
    void updateClient(ClientSaveDTO saveDTO);

    /**
     * 获取来访者详情
     * @param clientId 来访者ID
     * @return 详情DTO
     */
    ClientDetailDTO getClientDetail(Long clientId);
}