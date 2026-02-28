Page({
  data: {
    sessionData: {
      sessionTime: '2024-01-15 14:30',
      duration: 50,
      sessionModeText: '面对面',
      fee: '300.00',
      clientName: '王小明',
      status: 2,
      statusText: '已完成',
      subjective: '来访者报告本周情绪有所好转，但仍然感觉工作压力很大，睡眠质量有所改善。',
      objective: '来访者今天准时到达，穿着整洁。谈话过程中眼神接触良好，但多次表现出紧张情绪，如搓手、频繁变换坐姿。',
      assessment: '来访者的焦虑症状有所缓解，但工作压力导致的焦虑仍然是主要问题。需要继续关注其压力管理能力。',
      plan: '1. 继续使用放松训练技巧\n2. 下周讨论工作与生活的平衡策略\n3. 鼓励增加户外活动',
      contentSummary: '本次咨询主要讨论了来访者工作压力管理问题，进行了放松训练指导。',
      homework: '每天进行10分钟的深呼吸练习，记录情绪变化。',
      nextPlan: '下周同一时间继续咨询，讨论工作环境适应策略。',
      attachments: [
        { type: 1, name: '放松训练指导文档.pdf' },
        { type: 3, name: '情绪记录表.jpg' }
      ]
    }
  },

  onLoad(options) {
    // 从页面参数获取 sessionId
    const sessionId = options.id;
    console.log('加载咨询记录详情，ID:', sessionId);
    
    // 这里应该是调用API获取数据，暂时使用mock数据
    this.loadSessionData(sessionId);
  },

  loadSessionData(sessionId) {
    // Mock API调用
    setTimeout(() => {
      // 模拟不同的数据
      const mockData = this.getMockData(sessionId);
      this.setData({
        sessionData: mockData
      });
    }, 300);
  },

  getMockData(sessionId) {
    // 根据不同的ID返回不同的mock数据
    const sessions = {
      '1': {
        sessionTime: '2024-01-15 14:30',
        duration: 50,
        sessionModeText: '面对面',
        fee: '300.00',
        clientName: '王小明',
        status: 2,
        statusText: '已完成',
        subjective: '来访者报告本周情绪有所好转，但仍然感觉工作压力很大，睡眠质量有所改善。',
        objective: '来访者今天准时到达，穿着整洁。谈话过程中眼神接触良好，但多次表现出紧张情绪，如搓手、频繁变换坐姿。',
        assessment: '来访者的焦虑症状有所缓解，但工作压力导致的焦虑仍然是主要问题。需要继续关注其压力管理能力。',
        plan: '1. 继续使用放松训练技巧\n2. 下周讨论工作与生活的平衡策略\n3. 鼓励增加户外活动',
        contentSummary: '本次咨询主要讨论了来访者工作压力管理问题，进行了放松训练指导。',
        homework: '每天进行10分钟的深呼吸练习，记录情绪变化。',
        nextPlan: '下周同一时间继续咨询，讨论工作环境适应策略。',
        attachments: [
          { type: 1, name: '放松训练指导文档.pdf' },
          { type: 3, name: '情绪记录表.jpg' }
        ]
      },
      '2': {
        sessionTime: '2024-01-10 10:00',
        duration: 60,
        sessionModeText: '视频咨询',
        fee: '350.00',
        clientName: '李小红',
        status: 2,
        statusText: '已完成',
        subjective: '来访者表示最近与家人的关系有所改善，但仍然感到孤独。',
        objective: '视频连接良好，来访者穿着居家服装，看起来有些疲惫。谈话时偶尔会停顿思考。',
        assessment: '来访者在人际关系方面有所进步，但自我认同感仍需加强。孤独感可能与自我价值感有关。',
        plan: '1. 继续探索自我价值\n2. 尝试参加社交活动\n3. 练习自我关怀技巧',
        contentSummary: '讨论了来访者的孤独感和自我认同问题。',
        homework: '每天写三条自我欣赏的话。',
        nextPlan: '下周讨论社交技能训练。',
        attachments: []
      }
    };
    
    return sessions[sessionId] || sessions['1'];
  },

  onEdit() {
    const sessionId = 1; // 实际应该从data中获取
    wx.navigateTo({
      url: `/pages/session/edit/index?id=${sessionId}`,
    });
  },

  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条咨询记录吗？删除后无法恢复。',
      success: (res) => {
        if (res.confirm) {
          // 这里应该是调用API删除记录
          console.log('删除咨询记录');
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 1500,
            success: () => {
              setTimeout(() => {
                wx.navigateBack();
              }, 1500);
            }
          });
        }
      }
    });
  }
});