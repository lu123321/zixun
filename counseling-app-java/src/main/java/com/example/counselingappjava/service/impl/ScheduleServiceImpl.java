package com.example.counselingappjava.service.impl;

import com.example.counselingappjava.dto.ScheduleDTO;
import com.example.counselingappjava.dto.ScheduleQueryDTO;
import com.example.counselingappjava.entity.Client;
import com.example.counselingappjava.entity.Schedule;
import com.example.counselingappjava.mapper.ClientMapper;
import com.example.counselingappjava.mapper.ScheduleMapper;
import com.example.counselingappjava.service.ScheduleService;
import com.example.counselingappjava.util.UserContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleMapper scheduleMapper;
    private final ClientMapper clientMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createSchedule(ScheduleDTO dto) {
        Long userId = requireUserId();
        validateClientOwnership(userId, dto.getClientId());
        validateTime(dto.getStartTime(), dto.getEndTime());

        Date now = new Date();
        Schedule schedule = new Schedule()
                .setUserId(userId)
                .setClientId(dto.getClientId())
                .setTitle(dto.getTitle())
                .setScheduleType(dto.getScheduleType())
                .setStartTime(dto.getStartTime())
                .setEndTime(dto.getEndTime())
                .setLocation(dto.getLocation())
                .setDescription(dto.getDescription())
                .setColor(dto.getColor())
                .setRemindType(dto.getRemindType())
                .setIsRecurring(dto.getIsRecurring())
                .setRecurringRule(dto.getRecurringRule())
                .setStatus(resolveStatusByStartTime(dto.getStartTime()))
                .setCreateTime(now)
                .setUpdateTime(now);

        scheduleMapper.insert(schedule);
        return schedule.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateSchedule(Long id, ScheduleDTO dto) {
        Long userId = requireUserId();
        Schedule existed = requireOwnedSchedule(id, userId);
        validateClientOwnership(userId, dto.getClientId());
        validateTime(dto.getStartTime(), dto.getEndTime());

        Schedule update = new Schedule()
                .setId(existed.getId())
                .setClientId(dto.getClientId())
                .setTitle(dto.getTitle())
                .setScheduleType(dto.getScheduleType())
                .setStartTime(dto.getStartTime())
                .setEndTime(dto.getEndTime())
                .setLocation(dto.getLocation())
                .setDescription(dto.getDescription())
                .setColor(dto.getColor())
                .setRemindType(dto.getRemindType())
                .setIsRecurring(dto.getIsRecurring())
                .setRecurringRule(dto.getRecurringRule())
                .setUpdateTime(new Date());

        // 仅在当前为待办/进行中时，按时间自动更新
        if (Objects.equals(existed.getStatus(), Schedule.Status.PENDING.getCode())
                || Objects.equals(existed.getStatus(), Schedule.Status.IN_PROGRESS.getCode())) {
            update.setStatus(resolveStatusByStartTime(dto.getStartTime()));
        }

        scheduleMapper.update(update);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteSchedule(Long id) {
        Long userId = requireUserId();
        requireOwnedSchedule(id, userId);
        scheduleMapper.deleteById(id);
    }

    @Override
    public Schedule getScheduleDetail(Long id) {
        Long userId = requireUserId();
        return requireOwnedSchedule(id, userId);
    }

    @Override
    public List<Schedule> getScheduleList(ScheduleQueryDTO queryDTO) {
        Long userId = requireUserId();
        Date start = queryDTO.getStartDate();
        Date end = queryDTO.getEndDate();

        List<Schedule> schedules;
        if (start != null && end != null) {
            Date endOfDay = getEndOfDay(end);
            schedules = scheduleMapper.selectByTimeRange(userId, start, endOfDay);
        } else {
            schedules = scheduleMapper.selectByUserId(userId);
        }

        return schedules.stream()
                .filter(s -> queryDTO.getScheduleType() == null || Objects.equals(s.getScheduleType(), queryDTO.getScheduleType()))
                .filter(s -> queryDTO.getStatus() == null || Objects.equals(s.getStatus(), queryDTO.getStatus()))
                .collect(Collectors.toList());
    }

    @Override
    public List<Schedule> getTodaySchedules() {
        Long userId = requireUserId();
        Date now = new Date();
        Date start = getStartOfDay(now);
        Date end = getEndOfDay(now);
        return scheduleMapper.selectByTimeRange(userId, start, end);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, Integer status) {
        Long userId = requireUserId();
        requireOwnedSchedule(id, userId);
        if (status == null || status < 1 || status > 4) {
            throw new RuntimeException("日程状态不合法");
        }
        scheduleMapper.update(new Schedule().setId(id).setStatus(status).setUpdateTime(new Date()));
    }

    private Long requireUserId() {
        Long userId = UserContextHolder.getUserId();
        if (userId == null) {
            throw new RuntimeException("未获取到当前登录用户，请重新登录");
        }
        return userId;
    }

    private Schedule requireOwnedSchedule(Long id, Long userId) {
        Schedule schedule = scheduleMapper.selectById(id);
        if (schedule == null) {
            throw new RuntimeException("日程不存在");
        }
        if (!Objects.equals(schedule.getUserId(), userId)) {
            throw new RuntimeException("无权限操作该日程");
        }
        return schedule;
    }

    private void validateClientOwnership(Long userId, Long clientId) {
        if (clientId == null) return;
        Client client = clientMapper.selectById(clientId);
        if (client == null) {
            throw new RuntimeException("来访者不存在");
        }
        if (!Objects.equals(client.getUserId(), userId)) {
            throw new RuntimeException("无权限关联该来访者");
        }
    }

    private void validateTime(Date start, Date end) {
        if (start == null || end == null) {
            throw new RuntimeException("开始和结束时间不能为空");
        }
        if (!end.after(start)) {
            throw new RuntimeException("结束时间必须晚于开始时间");
        }
    }

    private Integer resolveStatusByStartTime(Date startTime) {
        if (startTime == null) return Schedule.Status.PENDING.getCode();
        return startTime.after(new Date())
                ? Schedule.Status.PENDING.getCode()
                : Schedule.Status.COMPLETED.getCode();
    }

    private Date getStartOfDay(Date date) {
        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c.getTime();
    }

    private Date getEndOfDay(Date date) {
        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.set(Calendar.HOUR_OF_DAY, 23);
        c.set(Calendar.MINUTE, 59);
        c.set(Calendar.SECOND, 59);
        c.set(Calendar.MILLISECOND, 999);
        return c.getTime();
    }
}