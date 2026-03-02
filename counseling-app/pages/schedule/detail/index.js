const api = require('../../../utils/api.js');
Page({
  data: {
    scheduleId: null,
    scheduleData: null,
    
    // 类型图标映射
    typeIcons: {
      1: '/images/icons/consultation.png',  // 咨询
      2: '/images/icons/supervision.png',   // 督导
      3: '/images/icons/report.png',        // 写报告
      4: '/images/icons/training.png',      // 培训
      5: '/images/icons/meeting.png',       // 会议
      6: '/images/icons/rest.png',          // 休息
      7: '/images/icons/other.png'          // 其他
    },
    
    // 类型文本映射
    typeTexts: {
      1: '咨询',
      2: '督导',
      3: '写报告',
      4: '培训',
      5: '会议',
      6: '休息',
      7: '其他'
    },
    
    // 状态文本映射
    statusTexts: {
      1: '待办',
      2: '完成',
      3: '取消',
      4: '进行中'
    },
    
    // 提醒类型文本映射
    remindTexts: {
      1: '不提醒',
      2: '开始时提醒',
      3: '提前5分钟',
      4: '提前15分钟',
      5: '提前30分钟',
      6: '提前1小时',
      7: '提前1天'
    },
    
    // 重复类型文本映射
    recurringTypeTexts: {
      daily: '每日重复',
      weekly: '每周重复',
      monthly: '每月重复'
    }
  },

  onLoad(options) {
    // 获取日程ID
    const scheduleId = options.id;
    this.setData({
      scheduleId: scheduleId
    });
    
    // 加载日程数据
    this.loadScheduleData(scheduleId);
    
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '日程详情'
    });
  },

  async loadScheduleData(scheduleId) {
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await api.get(`/api/schedule/detail/${scheduleId}`);
      if (res.code !== 200 || !res.data) {
        throw new Error(res.msg || '加载失败');
      }
      const processedData = this.processScheduleData(res.data);
      this.setData({ scheduleData: processedData });
      await this.loadClientInfoIfNeeded(processedData);
    } catch (error) {
      console.error('加载日程失败:', error);
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  getMockScheduleData(scheduleId) {
    // 模拟不同的日程数据
    const mockSchedules = {
      '1': {
        id: 1,
        title: '个体咨询 - 王小明',
        scheduleType: 1,
        startTime: '2024-01-26 14:30:00',
        endTime: '2024-01-26 15:20:00',
        duration: '50分钟',
        location: '咨询室A',
        description: '本次咨询主要讨论来访者的工作压力管理问题，进行放松训练指导。\n需要重点关注来访者最近一周的情绪变化。',
        color: '#1890ff',
        remindType: 4, // 提前15分钟
        remindSent: false,
        status: 1, // 待办
        isRecurring: true,
        recurringType: 'weekly',
        recurringDays: [1, 3, 5], // 周一、周三、周五
        recurringEndDate: '2024-06-30',
        clientId: 1,
        sessionId: 101,
        clientInfo: {
          id: 1,
          name: '王小明',
          avatar: '/images/avatars/client1.png',
          clientNo: 'C2024001',
          gender: '男',
          age: 32
        },
        sessionInfo: {
          id: 101,
          sessionTime: '14:30',
          duration: '50分钟',
          summary: '工作压力管理与放松训练'
        }
      },
      '2': {
        id: 2,
        title: '团体督导',
        scheduleType: 2,
        startTime: '2024-01-27 10:00:00',
        endTime: '2024-01-27 12:00:00',
        duration: '2小时',
        location: '督导会议室',
        description: '讨论近期困难案例，特别是关于青少年抑郁治疗的个案。',
        color: '#52c41a',
        remindType: 6, // 提前1小时
        remindSent: true,
        status: 2, // 完成
        isRecurring: false,
        clientId: null,
        sessionId: null
      },
      '3': {
        id: 3,
        title: '撰写咨询报告',
        scheduleType: 3,
        startTime: '2024-01-26 16:00:00',
        endTime: '2024-01-26 17:00:00',
        duration: '1小时',
        location: '办公室',
        description: '完成李小红的咨询报告撰写，整理评估结果和治疗计划。',
        color: '#fa8c16',
        remindType: 5, // 提前30分钟
        remindSent: false,
        status: 1, // 待办
        isRecurring: false,
        clientId: 2,
        sessionId: 102,
        clientInfo: {
          id: 2,
          name: '李小红',
          avatar: '/images/avatars/client2.png',
          clientNo: 'C2024002',
          gender: '女',
          age: 28
        },
        sessionInfo: {
          id: 102,
          sessionTime: '15:00',
          duration: '50分钟',
          summary: '人际关系与自我认同探索'
        }
      }
    };
    
    return mockSchedules[scheduleId] || mockSchedules['1'];
  },


  async loadClientInfoIfNeeded(scheduleData) {
    const clientInfo = scheduleData && scheduleData.clientInfo;
    const clientId = clientInfo && clientInfo.id;
    if (!clientId) return;

    const hasUsableName = clientInfo.name && clientInfo.name !== '来访者';
    const hasUsableNo = clientInfo.clientNo && clientInfo.clientNo !== '未设置编号';
    if (hasUsableName && hasUsableNo) return;

    try {
      const res = await api.get(`/api/client/detail/${clientId}`);
      if (res.code !== 200 || !res.data) return;

      this.setData({
        'scheduleData.clientInfo': {
          id: clientId,
          name: res.data.name || clientInfo.name || '来访者',
          clientNo: res.data.clientNo || clientInfo.clientNo || '未设置编号',
          avatar: res.data.avatar || clientInfo.avatar || ''
        }
      });
    } catch (error) {
      console.warn('加载关联来访者失败:', error);
    }
  },

  processScheduleData(rawData) {
    // 格式化时间显示
    const startDate = new Date(rawData.startTime);
    const endDate = new Date(rawData.endTime);

    const startTimeText = `${startDate.getMonth() + 1}月${startDate.getDate()}日 ${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
    const endTimeText = `${endDate.getMonth() + 1}月${endDate.getDate()}日 ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    const durationMinutes = Math.max(0, Math.round((endDate - startDate) / (1000 * 60)));
    const durationText = rawData.duration || `${durationMinutes}分钟`;

    // 计算重复规则文本
    let recurringRuleText = '';
    if (rawData.isRecurring && rawData.recurringType === 'weekly' && rawData.recurringDays) {
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const dayNames = rawData.recurringDays.map(day => weekDays[day]).join('、');
      recurringRuleText = `每周 ${dayNames}`;
    } else if (rawData.isRecurring && rawData.recurringType === 'monthly' && rawData.recurringDayOfMonth) {
      recurringRuleText = `每月 ${rawData.recurringDayOfMonth} 日`;
    }

    const clientInfoSource = rawData.clientInfo || rawData.client || {};
    const resolvedClientId = rawData.clientId || clientInfoSource.id || null;
    const resolvedClientName = rawData.clientName || clientInfoSource.name || '';
    const resolvedClientNo = rawData.clientNo || clientInfoSource.clientNo || '';
    const resolvedClientAvatar = rawData.clientAvatar || clientInfoSource.avatar || '';

    const clientInfo = (resolvedClientId || resolvedClientName || resolvedClientNo)
      ? {
          id: resolvedClientId,
          name: resolvedClientName || '来访者',
          clientNo: resolvedClientNo || '未设置编号',
          avatar: resolvedClientAvatar
        }
      : null;

    return {
      ...rawData,
      startTime: startTimeText,
      endTime: endTimeText,
      scheduleTypeText: this.data.typeTexts[rawData.scheduleType] || '其他',
      typeIcon: this.data.typeIcons[rawData.scheduleType] || '/images/icons/other.png',
      statusText: this.data.statusTexts[rawData.status] || '未知',
      remindTypeText: this.data.remindTexts[rawData.remindType] || '不提醒',
      recurringTypeText: this.data.recurringTypeTexts[rawData.recurringType] || '',
      recurringRuleText,
      duration: durationText,
      sessionTime: rawData.sessionInfo ? rawData.sessionInfo.sessionTime : '',
      sessionDuration: rawData.sessionInfo ? rawData.sessionInfo.duration : '',
      sessionSummary: rawData.sessionInfo ? rawData.sessionInfo.summary : '',
      clientInfo,
      recurringEndDate: rawData.recurringEndDate
        ? `${rawData.recurringEndDate.split('-')[1]}月${rawData.recurringEndDate.split('-')[2]}日`
        : ''
    };
  },

  // 跳转到来访者详情
  goToClientDetail() {
    const clientId = this.data.scheduleData.clientInfo && this.data.scheduleData.clientInfo.id;
    if (!clientId) return;

    wx.navigateTo({
      url: `/pages/client/detail/index?id=${clientId}`
    });
  },

  // 跳转到咨询记录详情
  goToSessionDetail() {
    if (!this.data.scheduleData.sessionId) return;
    
    wx.navigateTo({
      url: `/pages/session/detail/index?id=${this.data.scheduleData.sessionId}`
    });
  },

  // 跳转到编辑页面
  goToEdit() {
    wx.navigateTo({
      url: `/pages/schedule/edit/index?id=${this.data.scheduleId}`
    });
  },

  // 切换状态（完成/待办）
  toggleStatus() {
    const currentStatus = this.data.scheduleData.status;
    const newStatus = currentStatus === 2 ? 1 : 2;
    const statusText = newStatus === 2 ? '完成' : '待办';
    
    wx.showModal({
      title: '确认操作',
      content: `确定要标记为${statusText}吗？`,
      success: (res) => {
        if (res.confirm) {
          api.post('/api/schedule/status/update', {
            id: Number(this.data.scheduleId),
            status: newStatus
          }).then((res) => {
            if (res.code !== 200) {
              throw new Error(res.msg || '更新失败');
            }
            wx.showToast({ title: `已标记为${statusText}`, icon: 'success', duration: 1200 });
            this.loadScheduleData(this.data.scheduleId);
          }).catch((error) => {
            wx.showToast({ title: error.message || '更新失败', icon: 'none' });
          });
        }
      }
    });
  },

  // 删除日程
  deleteSchedule() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个日程吗？删除后无法恢复。',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          api.delete(`/api/schedule/delete/${this.data.scheduleId}`).then((res) => {
            wx.hideLoading();
            if (res.code !== 200) {
              throw new Error(res.msg || '删除失败');
            }
            wx.showToast({ title: '删除成功', icon: 'success', duration: 1200 });
            setTimeout(() => wx.navigateBack(), 1200);
          }).catch((error) => {
            wx.hideLoading();
            wx.showToast({ title: error.message || '删除失败', icon: 'none' });
          });
        }
      }
    });
  },

  // 页面分享
  onShareAppMessage() {
    const schedule = this.data.scheduleData;
    return {
      title: `日程：${schedule.title}`,
      path: `/pages/schedule/detail/index?id=${this.data.scheduleId}`
    };
  },

  // 页面分享到朋友圈
  onShareTimeline() {
    const schedule = this.data.scheduleData;
    return {
      title: `日程：${schedule.title}`,
      query: `id=${this.data.scheduleId}`
    };
  }
});