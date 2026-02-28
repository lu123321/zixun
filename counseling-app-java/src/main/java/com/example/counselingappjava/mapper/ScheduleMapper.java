package com.example.counselingappjava.mapper;

import com.example.counselingappjava.entity.Schedule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Mapper
public interface ScheduleMapper {

    // 基本CRUD操作
    int insert(Schedule schedule);
    int update(Schedule schedule);
    int deleteById(Long id);
    Schedule selectById(Long id);
    List<Schedule> selectAll();

    // 条件查询
    List<Schedule> selectByUserId(Long userId);
    List<Schedule> selectByTimeRange(@Param("userId") Long userId,
                                     @Param("startTime") Date startTime,
                                     @Param("endTime") Date endTime);
    List<Schedule> selectUpcomingSchedules(@Param("userId") Long userId,
                                           @Param("status") Integer status,
                                           @Param("startDate") Date startDate);

    // 提醒相关查询
    List<Schedule> selectSchedulesToRemind(@Param("userId") Long userId,
                                           @Param("startTime") Date startTime,
                                           @Param("endTime") Date endTime);

    // 更新提醒状态
    int updateRemindSent(@Param("id") Long id, @Param("remindSent") Integer remindSent);

    Schedule selectDetailById(Long id);
    List<Schedule> selectDetailByUserId(Long userId);

    // 重复日程查询
    List<Schedule> selectRecurringSchedules(@Param("userId") Long userId, @Param("status") Integer status);

    // 统计
    long countByUserId(Long userId);
    long countUpcomingSchedules(@Param("userId") Long userId,
                                @Param("status") Integer status,
                                @Param("date") Date date);

    // 分页查询
    List<Schedule> selectByCondition(Map<String, Object> params);
    long countByCondition(Map<String, Object> params);

    // 批量操作
    int batchInsert(List<Schedule> schedules);
    int batchUpdate(List<Schedule> schedules);
    int batchDelete(List<Long> ids);
}