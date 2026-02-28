package com.example.counselingappjava.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.counselingappjava.entity.Client;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Mapper
public interface ClientMapper extends BaseMapper<Client> {

    // 基本CRUD操作
    int insert(Client client);
    int update(Client client);
    int deleteById(Long id);
    Client selectById(Long id);
    List<Client> selectAll();

    // 条件查询
    List<Client> selectByUserId(Long userId);
    Client selectByClientNo(String clientNo);
    List<Client> selectByStatus(@Param("userId") Long userId, @Param("status") Integer status);

    // 搜索
    List<Client> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);

    // 统计
    long countByUserId(Long userId);
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Integer status);

    // 关联查询（包含用户信息）
    Client selectDetailById(Long id);
    List<Client> selectDetailByUserId(Long userId);

    // 分页查询
    List<Client> selectByCondition(Map<String, Object> params);
    long countByCondition(Map<String, Object> params);

    // 批量操作
    int batchInsert(List<Client> clients);
    int batchUpdate(List<Client> clients);
    int batchDelete(List<Long> ids);

    // 活跃来访者查询
    List<Client> selectActiveClients(@Param("userId") Long userId, @Param("date") Date date);
}