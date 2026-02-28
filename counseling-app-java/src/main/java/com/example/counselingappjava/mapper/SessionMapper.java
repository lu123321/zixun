package com.example.counselingappjava.mapper;

import com.example.counselingappjava.entity.Session;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Mapper
public interface SessionMapper {

    // 基本CRUD操作
    int insert(Session session);
    int update(Session session);
    int deleteById(Long id);
    Session selectById(Long id);
    List<Session> selectAll();

    // 条件查询
    List<Session> selectByUserId(Long userId);
    List<Session> selectByClientId(Long clientId);
    List<Session> selectByStatus(@Param("userId") Long userId, @Param("status") Integer status);

    // 时间范围查询
    List<Session> selectByTimeRange(@Param("userId") Long userId,
                                    @Param("startTime") Date startTime,
                                    @Param("endTime") Date endTime);

    Session selectDetailById(Long id);
    List<Session> selectDetailByUserId(Long userId);
    List<Session> selectDetailByClientId(Long clientId);

    // 统计
    long countByUserId(Long userId);
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Integer status);
    BigDecimal sumFeeByCondition(@Param("userId") Long userId,
                                 @Param("status") Integer status,
                                 @Param("startDate") Date startDate,
                                 @Param("endDate") Date endDate);

    // 分页查询
    List<Session> selectByCondition(Map<String, Object> params);
    long countByCondition(Map<String, Object> params);

    // 批量操作
    int batchInsert(List<Session> sessions);
    int batchUpdate(List<Session> sessions);
    int batchDelete(List<Long> ids);

    // 更新记账状态
    int updateBilledStatus(@Param("id") Long id, @Param("isBilled") Integer isBilled);

    // 获取咨询编号
    String generateSessionNo(@Param("prefix") String prefix, @Param("date") Date date);
}