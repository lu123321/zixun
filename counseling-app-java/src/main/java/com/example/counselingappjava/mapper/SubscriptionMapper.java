package com.example.counselingappjava.mapper;

import com.example.counselingappjava.entity.Subscription;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Mapper
public interface SubscriptionMapper {

    // 基本CRUD操作
    int insert(Subscription subscription);
    int update(Subscription subscription);
    int deleteById(Long id);
    Subscription selectById(Long id);
    List<Subscription> selectAll();

    // 条件查询
    List<Subscription> selectByUserId(Long userId);
    Subscription selectByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Integer status);
    List<Subscription> selectByUserIdAndStatuses(@Param("userId") Long userId, @Param("statuses") List<Integer> statuses);

    // 即将过期订阅查询
    List<Subscription> selectExpiringSubscriptions(@Param("date") Date date, @Param("status") Integer status);

    // 关联查询（包含用户和订单信息）
    Subscription selectDetailById(Long id);
    List<Subscription> selectDetailByUserId(Long userId);

    // 更新状态
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    // 自动续费
    int updateAutoRenew(@Param("id") Long id, @Param("autoRenew") Integer autoRenew);

    // 批量操作
    int batchInsert(List<Subscription> subscriptions);
    int batchUpdate(List<Subscription> subscriptions);
    int batchDelete(List<Long> ids);
}