package com.example.counselingappjava.service;

import com.example.counselingappjava.dto.ScheduleDTO;
import com.example.counselingappjava.dto.ScheduleQueryDTO;
import com.example.counselingappjava.entity.Schedule;

import java.util.List;

public interface ScheduleService {
    Long createSchedule(ScheduleDTO dto);

    void updateSchedule(Long id, ScheduleDTO dto);

    void deleteSchedule(Long id);

    Schedule getScheduleDetail(Long id);

    List<Schedule> getScheduleList(ScheduleQueryDTO queryDTO);

    List<Schedule> getTodaySchedules();

    void updateStatus(Long id, Integer status);
}