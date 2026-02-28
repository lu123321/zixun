package com.example.counselingappjava.mapper;

import com.example.counselingappjava.entity.Finance;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Mapper
public interface FinanceMapper {

    // 基本CRUD操作
    int insert(Finance finance);
    int update(Finance finance);
    int deleteById(Long id);
    Finance selectById(Long id);
    List<Finance> selectAll();

    // 条件查询
    List<Finance> selectByUserId(Long userId);
    List<Finance> selectByRecordType(@Param("userId") Long userId, @Param("recordType") Integer recordType);
    List<Finance> selectByDateRange(@Param("userId") Long userId,
                                    @Param("startDate") Date startDate,
                                    @Param("endDate") Date endDate);

    // 关联查询（包含用户、分类、来访者和咨询记录信息）
    Finance selectDetailById(Long id);
    List<Finance> selectDetailByUserId(Long userId);

    // 统计汇总
    BigDecimal sumAmountByCondition(@Param("userId") Long userId,
                                    @Param("recordType") Integer recordType,
                                    @Param("startDate") Date startDate,
                                    @Param("endDate") Date endDate);

    // 分类统计
    List<Map<String, Object>> selectCategorySummary(@Param("userId") Long userId,
                                                    @Param("recordType") Integer recordType,
                                                    @Param("startDate") Date startDate,
                                                    @Param("endDate") Date endDate);

    // 月度统计
    List<Map<String, Object>> selectMonthlySummary(@Param("userId") Long userId, @Param("year") Integer year);

    // 最近交易记录
    List<Finance> selectRecentRecords(@Param("userId") Long userId, @Param("limit") Integer limit);

    // 分页查询
    List<Finance> selectByCondition(Map<String, Object> params);
    long countByCondition(Map<String, Object> params);

    // 批量操作
    int batchInsert(List<Finance> finances);
    int batchUpdate(List<Finance> finances);
    int batchDelete(List<Long> ids);
}