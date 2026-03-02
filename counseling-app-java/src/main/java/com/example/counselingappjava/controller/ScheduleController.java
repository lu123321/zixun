package com.example.counselingappjava.controller;

import com.example.counselingappjava.common.Result;
import com.example.counselingappjava.dto.ScheduleDTO;
import com.example.counselingappjava.dto.ScheduleQueryDTO;
import com.example.counselingappjava.dto.ScheduleStatusUpdateDTO;
import com.example.counselingappjava.entity.Schedule;
import com.example.counselingappjava.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/schedule")
@RequiredArgsConstructor
@CrossOrigin
@Slf4j
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/list")
    public Result<List<Schedule>> getScheduleList(ScheduleQueryDTO queryDTO) {
        try {
            return Result.success(scheduleService.getScheduleList(queryDTO));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("查询日程列表失败", e);
            return Result.error("查询日程列表失败");
        }
    }

    @GetMapping("/today")
    public Result<List<Schedule>> getTodaySchedules() {
        try {
            return Result.success(scheduleService.getTodaySchedules());
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("查询今日日程失败", e);
            return Result.error("查询今日日程失败");
        }
    }

    @GetMapping("/detail/{id}")
    public Result<Schedule> getScheduleDetail(@PathVariable Long id) {
        try {
            return Result.success(scheduleService.getScheduleDetail(id));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("查询日程详情失败", e);
            return Result.error("查询日程详情失败");
        }
    }

    @PostMapping("/create")
    public Result<Long> createSchedule(@Validated @RequestBody ScheduleDTO dto, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return Result.error(bindingResult.getFieldError().getDefaultMessage());
        }
        try {
            return Result.success(scheduleService.createSchedule(dto));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("创建日程失败", e);
            return Result.error("创建日程失败");
        }
    }

    @PutMapping("/update/{id}")
    public Result<Void> updateSchedule(@PathVariable Long id,
                                       @Validated @RequestBody ScheduleDTO dto,
                                       BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return Result.error(bindingResult.getFieldError().getDefaultMessage());
        }
        try {
            scheduleService.updateSchedule(id, dto);
            return Result.success();
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("更新日程失败", e);
            return Result.error("更新日程失败");
        }
    }

    @PostMapping("/status/update")
    public Result<Void> updateStatus(@Validated @RequestBody ScheduleStatusUpdateDTO dto,
                                     BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return Result.error(bindingResult.getFieldError().getDefaultMessage());
        }
        try {
            scheduleService.updateStatus(dto.getId(), dto.getStatus());
            return Result.success();
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("更新日程状态失败", e);
            return Result.error("更新日程状态失败");
        }
    }

    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteSchedule(@PathVariable Long id) {
        try {
            scheduleService.deleteSchedule(id);
            return Result.success();
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("删除日程失败", e);
            return Result.error("删除日程失败");
        }
    }
}