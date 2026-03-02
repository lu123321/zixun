package com.example.counselingappjava.controller;

import com.example.counselingappjava.common.Result;
import com.example.counselingappjava.dto.*;
import com.example.counselingappjava.entity.Client;
import com.example.counselingappjava.mapper.SessionMapper;
import com.example.counselingappjava.service.ClientService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 来访者管理Controller
 * 接口路径：/api/client
 * 支持：列表查询、新增、编辑、删除（后续补充）
 */
@RestController
@RequestMapping("/client")
@RequiredArgsConstructor
@CrossOrigin // 跨域支持（与你现有接口保持一致）
@Slf4j
public class ClientController {

    private final ClientService clientService;
    private final ObjectMapper objectMapper;
    private final SessionMapper sessionMapper;

    /**
     * 分页查询来访者列表
     * GET请求：/api/client/list
     * 传参：URL查询串（与前端现有传参逻辑兼容）
     * @param queryDTO 自动绑定查询参数
     * @return 分页结果（含映射后的前端DTO列表）
     */
    @GetMapping("/list")
    public Result<PageResult<ClientDTO>> getClientList(ClientListQueryDTO queryDTO) {
        try {
            // 1. 调用Service获取分页数据（实体列表）
            PageResult<Client> pageResult = clientService.getClientList(queryDTO);

            // 2. 实体列表 → 前端DTO列表（核心：字段映射+tagsJSON转数组）
            List<ClientDTO> clientDTOList = pageResult.getList().stream()
                    .map(this::convertToClientDTO)
                    .collect(Collectors.toList());

            // 3. 封装前端需要的分页结果
            PageResult<ClientDTO> result = new PageResult<>();
            result.setList(clientDTOList);
            result.setTotalCount(pageResult.getTotalCount());
            result.setCurrentPage(pageResult.getCurrentPage());
            result.setPageSize(pageResult.getPageSize());

            return Result.success(result);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("查询来访者列表失败", e);
            return Result.error("查询来访者列表失败");
        }
    }

    // ========== 新增：获取来访者详情 ==========
    @GetMapping("/detail/{id}")
    public Result<ClientDetailDTO> getClientDetail(@PathVariable Long id) {
        try {
            ClientDetailDTO detailDTO = clientService.getClientDetail(id);
            return Result.success(detailDTO);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("获取来访者详情失败, id:{}", id, e);
            return Result.error("获取来访者详情失败");
        }
    }

    // ========== 新增：创建来访者（POST请求，JSON传参） ==========
    @PostMapping("/create")
    public Result<Long> createClient(@Validated @RequestBody ClientSaveDTO saveDTO, BindingResult bindingResult) {
        // 1. 校验表单注解错误（如姓名为空、电话格式错误）
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            return Result.error(errorMsg);
        }
        try {
            Long clientId = clientService.createClient(saveDTO);
            return Result.success(clientId);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("创建来访者失败", e);
            return Result.error("创建来访者失败");
        }
    }

    // ========== 新增：编辑来访者（PUT请求，JSON传参） ==========
    @PutMapping("/update")
    public Result<Void> updateClient(@Validated @RequestBody ClientSaveDTO saveDTO, BindingResult bindingResult) {
        // 1. 校验表单注解错误
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            return Result.error(errorMsg);
        }
        try {
            clientService.updateClient(saveDTO);
            return Result.success(null);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("编辑来访者失败, id:{}", saveDTO.getId(), e);
            return Result.error("编辑来访者失败");
        }
    }

    /**
     * 核心映射方法：Client实体 → 前端ClientDTO
     * 处理：tagsJSON转数组、字段重命名、默认值补充
     */
    private ClientDTO convertToClientDTO(Client client) {
        ClientDTO dto = new ClientDTO();
        // 基础字段直接赋值
        dto.setId(client.getId());
        dto.setClientNo(client.getClientNo());
        dto.setName(client.getName());
        dto.setGender(client.getGender());
        dto.setAge(client.getAge());
        dto.setContactPhone(client.getContactPhone());
        dto.setStatus(client.getStatus());
        dto.setCreate_time(client.getCreateTime()); // 前端排序用的create_time

        // 关键：实体tags（JSON字符串）→ 前端DTO（数组）
        if (StringUtils.isNotBlank(client.getTags())) {
            try {
                List<String> tagList = objectMapper.readValue(client.getTags(), new TypeReference<List<String>>() {});
                dto.setTags(tagList);
            } catch (Exception e) {
                dto.setTags(Collections.emptyList()); // 解析失败返回空数组，避免前端报错
            }
        } else {
            dto.setTags(Collections.emptyList()); // 无标签返回空数组
        }

        // 真实统计：咨询次数、最后咨询时间
        long sessionCount = sessionMapper.countByClientId(client.getId());
        dto.setSessionCount((int) sessionCount);
        dto.setLastSessionTime(sessionMapper.selectLatestSessionTimeByClientId(client.getId()));

        return dto;
    }
}