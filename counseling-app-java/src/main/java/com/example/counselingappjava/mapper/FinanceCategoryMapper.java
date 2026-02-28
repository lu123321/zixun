package com.example.counselingappjava.mapper;

import com.example.counselingappjava.entity.FinanceCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface FinanceCategoryMapper {

    // 基本CRUD操作
    int insert(FinanceCategory category);
    int update(FinanceCategory category);
    int deleteById(Long id);
    FinanceCategory selectById(Long id);
    List<FinanceCategory> selectAll();

    // 条件查询
    List<FinanceCategory> selectByUserId(Long userId);
    List<FinanceCategory> selectByUserIdAndType(@Param("userId") Long userId, @Param("type") Integer type);

    // 检查存在性
    int existsByUserIdAndTypeAndName(@Param("userId") Long userId,
                                     @Param("type") Integer type,
                                     @Param("name") String name);

    // 关联查询（包含用户信息）
    List<FinanceCategory> selectDetailByUserId(Long userId);

    // 排序相关
    int updateSortOrder(@Param("id") Long id, @Param("sortOrder") Integer sortOrder);

    // 批量操作
    int batchInsert(List<FinanceCategory> categories);
    int batchUpdate(List<FinanceCategory> categories);
    int batchDelete(List<Long> ids);
}