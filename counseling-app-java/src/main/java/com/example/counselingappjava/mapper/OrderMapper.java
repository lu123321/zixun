package com.example.counselingappjava.mapper;

import com.example.counselingappjava.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Mapper
public interface OrderMapper {

    // 基本CRUD操作
    int insert(Order order);
    int update(Order order);
    int deleteById(Long id);
    Order selectById(Long id);
    List<Order> selectAll();

    // 条件查询
    List<Order> selectByUserId(Long userId);
    Order selectByOrderNo(String orderNo);
    Order selectByTradeNo(String tradeNo);
    List<Order> selectByPayStatus(@Param("userId") Long userId, @Param("payStatus") Integer payStatus);

    // 超时订单查询
    List<Order> selectTimeoutOrders(@Param("payStatus") Integer payStatus, @Param("createTime") Date createTime);

    Order selectDetailById(Long id);
    List<Order> selectDetailByUserId(Long userId);

    // 更新支付状态
    int updatePayStatus(@Param("id") Long id,
                        @Param("payStatus") Integer payStatus,
                        @Param("payTime") Date payTime,
                        @Param("tradeNo") String tradeNo);

    // 退款相关
    int updateRefund(@Param("id") Long id,
                     @Param("refundAmount") java.math.BigDecimal refundAmount,
                     @Param("refundTime") Date refundTime,
                     @Param("payStatus") Integer payStatus);

    // 批量操作
    int batchInsert(List<Order> orders);
    int batchUpdate(List<Order> orders);
    int batchDelete(List<Long> ids);

    // 订单号生成
    String generateOrderNo(@Param("prefix") String prefix);
}