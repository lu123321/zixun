package com.example.counselingappjava.controller;

import com.example.counselingappjava.common.Result;
import com.example.counselingappjava.dto.SessionSaveDTO;
import com.example.counselingappjava.dto.SessionStatusUpdateDTO;
import com.example.counselingappjava.entity.Session;
import com.example.counselingappjava.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/session")
@RequiredArgsConstructor
@CrossOrigin
@Slf4j
public class SessionController {

    private final SessionService sessionService;

    @PostMapping("/create")
    public Result<Long> createSession(@Validated @RequestBody SessionSaveDTO saveDTO, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return Result.error(bindingResult.getFieldError().getDefaultMessage());
        }
        try {
            return Result.success(sessionService.createSession(saveDTO));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("创建咨询记录失败", e);
            return Result.error("创建咨询记录失败");
        }
    }

    @GetMapping("/list")
    public Result<List<Session>> getSessionList(@RequestParam(required = false) Long clientId) {
        try {
            return Result.success(sessionService.getSessionList(clientId));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("查询咨询记录失败", e);
            return Result.error("查询咨询记录失败");
        }
    }

    @GetMapping("/detail/{id}")
    public Result<Session> getSessionDetail(@PathVariable("id") Long id) {
        try {
            return Result.success(sessionService.getSessionDetail(id));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("查询咨询记录详情失败", e);
            return Result.error("查询咨询记录详情失败");
        }
    }

    @PostMapping("/status/update")
    public Result<Void> updateSessionStatus(@Validated @RequestBody SessionStatusUpdateDTO updateDTO,
                                            BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return Result.error(bindingResult.getFieldError().getDefaultMessage());
        }
        try {
            sessionService.updateSessionStatus(updateDTO.getId(), updateDTO.getStatus());
            return Result.success();
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("更新咨询记录状态失败", e);
            return Result.error("更新咨询记录状态失败");
        }
    }
}
