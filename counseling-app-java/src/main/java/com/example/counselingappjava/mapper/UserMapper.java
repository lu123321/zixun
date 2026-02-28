package com.example.counselingappjava.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.counselingappjava.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface UserMapper extends BaseMapper<User> {

    // 基本CRUD操作
    int insert(User user);
    int update(User user);
    int deleteById(Long id);
    User selectById(Long id);
    List<User> selectAll();

    // 条件查询
    User selectByOpenid(String openid);
    User selectByPhone(String phone);
    User selectByEmail(String email);

    // 检查存在性
    int existsByOpenid(String openid);
    int existsByPhone(String phone);
    int existsByEmail(String email);

    // 更新登录时间
    int updateLastLoginTime(@Param("id") Long id, @Param("lastLoginTime") java.util.Date lastLoginTime);

    // 分页查询
    List<User> selectByCondition(Map<String, Object> params);
    long countByCondition(Map<String, Object> params);

    // 批量操作
    int batchInsert(List<User> users);
    int batchUpdate(List<User> users);
    int batchDelete(List<Long> ids);
}