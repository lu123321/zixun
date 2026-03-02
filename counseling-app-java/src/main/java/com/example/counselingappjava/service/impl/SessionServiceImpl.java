package com.example.counselingappjava.service.impl;

import com.example.counselingappjava.dto.SessionSaveDTO;
import com.example.counselingappjava.entity.Client;
import com.example.counselingappjava.entity.Session;
import com.example.counselingappjava.mapper.ClientMapper;
import com.example.counselingappjava.mapper.SessionMapper;
import com.example.counselingappjava.service.SessionService;
import com.example.counselingappjava.util.UserContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService {

    private final SessionMapper sessionMapper;
    private final ClientMapper clientMapper;

    private static final SimpleDateFormat NO_DATE_FORMAT = new SimpleDateFormat("yyyyMMddHHmmss");

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createSession(SessionSaveDTO saveDTO) {
        Long currentUserId = UserContextHolder.getUserId();
        if (currentUserId == null) {
            throw new RuntimeException("未获取到当前登录用户，请重新登录");
        }

        Client client = clientMapper.selectById(saveDTO.getClientId());
        if (client == null) {
            throw new RuntimeException("来访者不存在");
        }
        if (!Objects.equals(client.getUserId(), currentUserId)) {
            throw new RuntimeException("无权限为该来访者记录咨询");
        }

        Session session = new Session()
                .setUserId(currentUserId)
                .setClientId(saveDTO.getClientId())
                .setSessionNo(generateSessionNo())
                .setSessionTime(saveDTO.getStartTime())
                .setDuration(saveDTO.getDuration())
                .setSessionType(saveDTO.getSessionType())
                .setSessionMode(saveDTO.getSessionMode())
                .setFee(saveDTO.getFee())
                .setHasSupervision(saveDTO.getHasSupervision())
                .setSupervisionType(saveDTO.getSupervisionType())
                .setSupervisionFee(saveDTO.getSupervisionFee())
                .setContentSummary(saveDTO.getContentSummary())
                .setClientStatus(saveDTO.getClientStatus())
                .setHomework(saveDTO.getHomework())
                .setNextPlan(saveDTO.getNextPlan())
                .setSubjective(saveDTO.getSubjective())
                .setObjective(saveDTO.getObjective())
                .setAssessment(saveDTO.getAssessment())
                .setPlan(saveDTO.getPlan())
                .setSessionNotes(saveDTO.getSessionNotes())
                .setAttachments(saveDTO.getAttachments())
                .setStatus(resolveInitStatus(saveDTO.getStartTime(), saveDTO.getStatus()))
                .setCreateTime(new Date())
                .setUpdateTime(new Date());

        sessionMapper.insert(session);
        return session.getId();
    }

    @Override
    public List<Session> getSessionList(Long clientId) {
        Long currentUserId = UserContextHolder.getUserId();
        if (currentUserId == null) {
            throw new RuntimeException("未获取到当前登录用户，请重新登录");
        }

        if (clientId != null) {
            Client client = clientMapper.selectById(clientId);
            if (client == null) {
                throw new RuntimeException("来访者不存在");
            }
            if (!Objects.equals(client.getUserId(), currentUserId)) {
                throw new RuntimeException("无权限查看该来访者咨询记录");
            }
            return sessionMapper.selectByClientId(clientId);
        }
        return sessionMapper.selectByUserId(currentUserId);
    }


    @Override
    public Session getSessionDetail(Long sessionId) {
        Long currentUserId = UserContextHolder.getUserId();
        if (currentUserId == null) {
            throw new RuntimeException("未获取到当前登录用户，请重新登录");
        }

        Session session = sessionMapper.selectById(sessionId);
        if (session == null) {
            throw new RuntimeException("咨询记录不存在");
        }
        if (!Objects.equals(session.getUserId(), currentUserId)) {
            throw new RuntimeException("无权限查看该咨询记录");
        }
        return session;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateSessionStatus(Long sessionId, Integer status) {
        if (status == null || status < 1 || status > 4) {
            throw new RuntimeException("咨询状态不合法");
        }

        Session session = getSessionDetail(sessionId);
        Session update = new Session()
                .setId(session.getId())
                .setStatus(status)
                .setUpdateTime(new Date());
        sessionMapper.update(update);
    }

    private Integer resolveInitStatus(Date startTime, Integer statusFromRequest) {
        if (statusFromRequest != null) {
            return statusFromRequest;
        }
        Date now = new Date();
        // 历史/当前时间：已完成；未来时间：已预约
        return startTime == null || !startTime.after(now)
                ? Session.Status.COMPLETED.getCode()
                : Session.Status.SCHEDULED.getCode();
    }

    private String generateSessionNo() {
        return "S" + NO_DATE_FORMAT.format(new Date());
    }
}
