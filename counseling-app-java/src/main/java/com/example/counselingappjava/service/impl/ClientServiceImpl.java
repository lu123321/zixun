package com.example.counselingappjava.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.counselingappjava.dto.ClientDetailDTO;
import com.example.counselingappjava.dto.ClientListQueryDTO;
import com.example.counselingappjava.dto.ClientSaveDTO;
import com.example.counselingappjava.dto.PageResult;
import com.example.counselingappjava.entity.Client;
import com.example.counselingappjava.mapper.ClientMapper;
import com.example.counselingappjava.service.ClientService;
import com.example.counselingappjava.util.ClientNoGenerator;
import com.example.counselingappjava.util.UserContextHolder;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * 来访者Service实现类
 * 核心：数据隔离（仅查当前咨询师的来访者）、条件查询、分页排序
 */
@Service
@RequiredArgsConstructor
public class ClientServiceImpl extends ServiceImpl<ClientMapper, Client> implements ClientService {

    // 注入Jackson解析器，处理tagsJSON字符串转数组
    private final ObjectMapper objectMapper;
    private final ClientMapper clientMapper;

    // 日期格式化器（转yyyy-MM-dd字符串，详情返回用）
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");

    @Override
    public PageResult<Client> getClientList(ClientListQueryDTO queryDTO) {
        // 1. 获取当前登录咨询师ID（数据隔离核心，非空校验）
        Long currentUserId = UserContextHolder.getUserId();
        if (currentUserId == null) {
            throw new RuntimeException("未获取到当前登录用户，请重新登录");
        }

        // 2. 构建MyBatis-Plus分页对象
        Page<Client> page = new Page<>(queryDTO.getCurrentPage(), queryDTO.getPageSize());

        // 3. 规范化关键词（兼容前端传入字符串 'null'/'undefined'）
        String normalizedKeyword = normalizeKeyword(queryDTO.getKeyword());

        // 4. 构建条件查询Wrapper
        LambdaQueryWrapper<Client> queryWrapper = new LambdaQueryWrapper<Client>()
                // 核心：数据隔离，仅查询当前咨询师的来访者
                .eq(Client::getUserId, currentUserId)
                // 状态筛选：非null时添加条件（前端all时传null）
                .eq(queryDTO.getStatus() != null, Client::getStatus, queryDTO.getStatus())
                // 关键词模糊搜索：姓名/联系电话（非空时）
                .and(StringUtils.isNotBlank(normalizedKeyword), wrapper ->
                        wrapper.like(Client::getName, normalizedKeyword)
                                .or()
                                .like(Client::getContactPhone, normalizedKeyword)
                )
                // 排序：默认按创建时间降序
                .orderBy(true, "desc".equals(queryDTO.getSortOrder()),
                        // 前端sortField=create_time → 实体createTime；last_session暂兼容createTime（后续关联咨询记录修改）
                        "create_time".equals(queryDTO.getSortField()) ? Client::getCreateTime : Client::getCreateTime);

        // 5. 执行分页查询（MyBatis-Plus自动分页，无需手动写limit）
        IPage<Client> clientIPage = clientMapper.selectPage(page, queryWrapper);

        // 6. 封装分页结果返回
        PageResult<Client> pageResult = new PageResult<>();
        pageResult.setList(clientIPage.getRecords());
        pageResult.setTotalCount(clientIPage.getTotal());
        pageResult.setCurrentPage(queryDTO.getCurrentPage());
        pageResult.setPageSize(queryDTO.getPageSize());

        return pageResult;
    }

    // ========== 新增：编辑来访者 ==========
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateClient(ClientSaveDTO saveDTO) {
        // 1. 获取当前咨询师ID，数据隔离
        Long currentUserId = UserContextHolder.getUserId();
        checkLogin(currentUserId);
        // 2. 校验来访者ID非空
        if (saveDTO.getId() == null) {
            throw new RuntimeException("来访者ID不能为空");
        }

        // 3. 校验当前咨询师是否拥有该来访者（防越权）
        Client existClient = clientMapper.selectById(saveDTO.getId());
        if (existClient == null) {
            throw new RuntimeException("来访者不存在");
        }
        if (!Objects.equals(existClient.getUserId(), currentUserId)) {
            throw new RuntimeException("无权限编辑该来访者");
        }

        // 4. 后端业务校验
        checkBusinessRule(saveDTO);

        // 5. DTO转实体，保留原有核心字段（userId/clientNo不允许修改）
        Client client = convertToClient(saveDTO);
        client.setId(saveDTO.getId())
                .setUserId(existClient.getUserId()) // 保留原有咨询师ID
                .setClientNo(existClient.getClientNo()); // 保留原有编号

        // 6. 更新到数据库
        clientMapper.updateById(client);
    }

    @Override
    @Transactional(rollbackFor = Exception.class) // 事务控制，失败回滚
    public Long createClient(ClientSaveDTO saveDTO) {
        // 1. 获取当前咨询师ID，数据隔离
        Long currentUserId = UserContextHolder.getUserId();
        checkLogin(currentUserId);

        // 2. 后端业务校验（表单注解校验之外的业务规则）
        checkBusinessRule(saveDTO);

        // 3. DTO转实体，处理字段转换
        Client client = convertToClient(saveDTO);
        // 4. 自动填充核心字段
        client.setUserId(currentUserId) // 绑定当前咨询师
                .setClientNo(ClientNoGenerator.generate()); // 生成唯一编号

        // 5. 保存到数据库
        clientMapper.insert(client);
        return client.getId();
    }


    // ========== 新增：获取来访者详情 ==========
    @Override
    public ClientDetailDTO getClientDetail(Long clientId) {
        // 1. 获取当前咨询师ID，数据隔离
        Long currentUserId = UserContextHolder.getUserId();
        checkLogin(currentUserId);
        // 2. 查询来访者
        Client client = clientMapper.selectById(clientId);
        if (client == null) {
            throw new RuntimeException("来访者不存在");
        }
        // 3. 校验权限（防越权）
        if (!Objects.equals(client.getUserId(), currentUserId)) {
            throw new RuntimeException("无权限查看该来访者");
        }

        // 4. 实体转详情DTO，处理日期/标签格式
        return convertToClientDetailDTO(client);
    }

    // ========== 私有工具方法 ==========

    /**
     * 规范化关键词：过滤前端误传的"null"/"undefined"文本
     */
    private String normalizeKeyword(String keyword) {
        if (StringUtils.isBlank(keyword)) {
            return null;
        }
        String trimmed = keyword.trim();
        if ("null".equalsIgnoreCase(trimmed) || "undefined".equalsIgnoreCase(trimmed)) {
            return null;
        }
        return trimmed;
    }

    /**
     * 校验是否登录
     */
    private void checkLogin(Long userId) {
        if (userId == null) {
            throw new RuntimeException("未获取到当前登录用户，请重新登录");
        }
    }

    /**
     * 业务规则校验（表单注解之外的规则）
     * 1. 已结案状态必须有结束日期
     * 2. 结束日期不能早于首次咨询日期
     */
    private void checkBusinessRule(ClientSaveDTO saveDTO) {
        // 1. 已结案（status=2）必须有结束日期
        if (Client.Status.CLOSED.getCode().equals(saveDTO.getStatus()) && saveDTO.getEndDate() == null) {
            throw new RuntimeException("已结案必须填写结束咨询日期");
        }
        // 2. 有结束日期时，不能早于首次咨询日期
        if (saveDTO.getEndDate() != null && saveDTO.getStartDate() != null) {
            if (saveDTO.getEndDate().before(saveDTO.getStartDate())) {
                throw new RuntimeException("结束咨询日期不能早于首次咨询日期");
            }
        }
    }

    /**
     * DTO转实体，处理标签List<String>转JSON字符串
     */
    private Client convertToClient(ClientSaveDTO saveDTO) {
        Client client = new Client();
        // 基本信息
        client.setName(saveDTO.getName())
                .setGender(saveDTO.getGender() == null ? 0 : saveDTO.getGender())
                .setAge(saveDTO.getAge())
                .setBirthDate(saveDTO.getBirthDate());
        // 联系信息
        client.setContactPhone(saveDTO.getContactPhone())
                .setEmergencyContact(saveDTO.getEmergencyContact())
                .setEmergencyPhone(saveDTO.getEmergencyPhone());
        // 咨询信息
        client.setStartDate(saveDTO.getStartDate())
                .setStatus(saveDTO.getStatus() == null ? 1 : saveDTO.getStatus())
                .setEndDate(saveDTO.getEndDate());
        // 备注/诊断/方案
        client.setRemark(saveDTO.getRemark())
                .setDiagnosis(saveDTO.getDiagnosis())
                .setTreatmentPlan(saveDTO.getTreatmentPlan());
        // 标签：List<String>转JSON字符串
        if (saveDTO.getTags() != null && !saveDTO.getTags().isEmpty()) {
            try {
                client.setTags(objectMapper.writeValueAsString(saveDTO.getTags()));
            } catch (Exception e) {
                throw new RuntimeException("标签格式错误");
            }
        } else {
            client.setTags(null);
        }
        return client;
    }

    /**
     * 实体转详情DTO，处理：
     * 1. 日期转yyyy-MM-dd字符串
     * 2. 标签JSON字符串转List<String>
     */
    private ClientDetailDTO convertToClientDetailDTO(Client client) {
        ClientDetailDTO dto = new ClientDetailDTO();
        // 基础ID/编号
        dto.setId(client.getId());
        dto.setClientNo(client.getClientNo());
        // 基本信息
        dto.setName(client.getName());
        dto.setGender(client.getGender());
        dto .setAge(client.getAge());
        dto.setBirthDate(client.getBirthDate() != null ? DATE_FORMAT.format(client.getBirthDate()) : null);
        // 联系信息
        dto.setContactPhone(client.getContactPhone());
        dto.setEmergencyContact(client.getEmergencyContact());
        dto.setEmergencyPhone(client.getEmergencyPhone());
        // 咨询信息
        dto.setStartDate(client.getStartDate() != null ? DATE_FORMAT.format(client.getStartDate()) : null);
        dto   .setStatus(client.getStatus());
        dto  .setEndDate(client.getEndDate() != null ? DATE_FORMAT.format(client.getEndDate()) : null);
        // 标签：JSON字符串转List<String>
        if (StringUtils.isNotBlank(client.getTags())) {
            try {
                List<String> tags = objectMapper.readValue(client.getTags(), new TypeReference<List<String>>() {});
                dto.setTags(tags);
            } catch (Exception e) {
                dto.setTags(Collections.emptyList());
            }
        } else {
            dto.setTags(Collections.emptyList());
        }
        // 备注/诊断/方案
        dto.setRemark(client.getRemark());
        dto.setDiagnosis(client.getDiagnosis());
        dto.setTreatmentPlan(client.getTreatmentPlan());
        // 创建/更新时间
        dto.setCreateTime(client.getCreateTime());
        dto.setUpdateTime(client.getUpdateTime());
        return dto;
    }



}