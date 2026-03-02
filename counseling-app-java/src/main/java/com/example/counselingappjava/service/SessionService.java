package com.example.counselingappjava.service;

import com.example.counselingappjava.dto.SessionSaveDTO;
import com.example.counselingappjava.entity.Session;

import java.util.List;

public interface SessionService {

    Long createSession(SessionSaveDTO saveDTO);

    List<Session> getSessionList(Long clientId);

    Session getSessionDetail(Long sessionId);

    void updateSessionStatus(Long sessionId, Integer status);
}
