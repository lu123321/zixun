// utils/mockData.js

// 模拟用户数据
const mockUser = {
  id: 1,
  openid: 'mock-openid-123456',
  nickname: '心理咨询师张老师',
  avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
  phone: '13800138000',
  realName: '张三',
  email: 'zhangsan@example.com',
  role: 1,
  qualification: '国家二级心理咨询师',
  introduction: '专注青少年心理健康咨询，拥有10年咨询经验',
  status: 1,
  settings: {
    remindTime: '09:00',
    workStart: '09:00',
    workEnd: '18:00'
  }
};

// 模拟来访者数据
const mockClients = [
  {
    id: 1,
    clientNo: 'C2024001',
    name: '李小明',
    gender: 1,
    age: 25,
    contactPhone: '13912345678',
    startDate: '2024-01-15',
    status: 1,
    remark: '主要咨询方向：职场压力',
    tags: ['焦虑', '职场'],
    sessionCount: 8,
    lastSessionTime: '2024-03-20 14:00:00'
  },
  {
    id: 2,
    clientNo: 'C2024002',
    name: '王晓红',
    gender: 2,
    age: 32,
    contactPhone: '13887654321',
    startDate: '2024-02-10',
    status: 1,
    remark: '主要咨询方向：亲子关系',
    tags: ['亲子', '情绪管理'],
    sessionCount: 5,
    lastSessionTime: '2024-03-19 10:30:00'
  },
  {
    id: 3,
    clientNo: 'C2024003',
    name: '赵建国',
    gender: 1,
    age: 45,
    contactPhone: '13711223344',
    startDate: '2023-12-05',
    status: 2,
    remark: '已结案，咨询效果良好',
    tags: ['抑郁', '婚姻'],
    sessionCount: 12,
    lastSessionTime: '2024-03-10 16:00:00'
  }
];

// 模拟日程数据
const mockSchedules = [
  {
    id: 1,
    title: '咨询 - 李小明',
    scheduleType: 1,
    startTime: `${new Date().toDateString()} 10:00:00`,
    endTime: `${new Date().toDateString()} 11:00:00`,
    location: '咨询室A',
    color: '#1890ff',
    remindType: 3,
    status: 1,
    clientId: 1,
    clientName: '李小明'
  },
  {
    id: 2,
    title: '督导会议',
    scheduleType: 2,
    startTime: `${new Date().toDateString()} 14:00:00`,
    endTime: `${new Date().toDateString()} 16:00:00`,
    location: '线上会议',
    color: '#52c41a',
    remindType: 4,
    status: 1
  },
  {
    id: 3,
    title: '写咨询报告',
    scheduleType: 3,
    startTime: `${new Date().toDateString()} 16:30:00`,
    endTime: `${new Date().toDateString()} 17:30:00`,
    location: '办公室',
    color: '#faad14',
    remindType: 2,
    status: 1
  }
];

// 模拟咨询记录
const mockSessions = [
  {
    id: 1,
    sessionNo: 'S202403001',
    sessionTime: '2024-03-20 10:00:00',
    duration: 50,
    sessionType: 1,
    sessionMode: 1,
    fee: 500,
    clientId: 1,
    clientName: '李小明',
    contentSummary: '讨论职场压力问题，来访者情绪有所缓解',
    status: 2
  },
  {
    id: 2,
    sessionNo: 'S202403002',
    sessionTime: '2024-03-19 14:30:00',
    duration: 50,
    sessionType: 1,
    sessionMode: 2,
    fee: 500,
    clientId: 2,
    clientName: '王晓红',
    contentSummary: '亲子关系咨询，制定下一步沟通策略',
    status: 2
  }
];

// 模拟财务数据
const mockFinance = [
  {
    id: 1,
    recordDate: '2024-03-20',
    recordType: 1,
    categoryName: '咨询费',
    amount: 500,
    clientName: '李小明',
    paymentMethod: 2
  },
  {
    id: 2,
    recordDate: '2024-03-19',
    recordType: 1,
    categoryName: '咨询费',
    amount: 500,
    clientName: '王晓红',
    paymentMethod: 2
  },
  {
    id: 3,
    recordDate: '2024-03-18',
    recordType: 2,
    categoryName: '督导费',
    amount: 300,
    paymentMethod: 2
  }
];

// 模拟统计信息
const mockStatistics = {
  todayScheduleCount: 3,
  monthSessionCount: 12,
  monthIncome: 6000,
  monthExpense: 800,
  activeClientCount: 5,
  pendingSchedules: 2
};

// API模拟方法
const mockApi = {
  // 获取用户信息
  getUserInfo() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: mockUser,
          message: 'success'
        });
      }, 500);
    });
  },

  // 获取首页统计数据
  getDashboardStats() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: mockStatistics,
          message: 'success'
        });
      }, 300);
    });
  },

  // 获取今日日程
  getTodaySchedules() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const today = new Date().toDateString();
        const todaySchedules = mockSchedules.filter(schedule => 
          new Date(schedule.startTime).toDateString() === today
        );
        resolve({
          code: 200,
          data: todaySchedules,
          message: 'success'
        });
      }, 300);
    });
  },

  // 获取最近来访者
  getRecentClients(limit = 5) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: mockClients.slice(0, limit),
          message: 'success'
        });
      }, 300);
    });
  },

  // 获取来访者列表
  getClientList(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { status, keyword } = params || {};
        let filtered = [...mockClients];
        
        if (status) {
          filtered = filtered.filter(client => client.status == status);
        }
        
        if (keyword) {
          filtered = filtered.filter(client => 
            client.name.includes(keyword) || 
            client.clientNo.includes(keyword) ||
            client.tags?.some(tag => tag.includes(keyword))
          );
        }
        
        resolve({
          code: 200,
          data: filtered,
          message: 'success'
        });
      }, 400);
    });
  },

  // 获取来访者详情
  getClientDetail(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const client = mockClients.find(c => c.id == id);
        if (client) {
          // 添加咨询历史
          client.sessions = mockSessions.filter(s => s.clientId == id);
          resolve({
            code: 200,
            data: client,
            message: 'success'
          });
        } else {
          resolve({
            code: 404,
            data: null,
            message: '来访者不存在'
          });
        }
      }, 400);
    });
  },

  // 获取日程列表
  getScheduleList(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { date, type, status } = params || {};
        let filtered = [...mockSchedules];
        
        if (date) {
          filtered = filtered.filter(schedule => 
            new Date(schedule.startTime).toDateString() === new Date(date).toDateString()
          );
        }
        
        if (type) {
          filtered = filtered.filter(schedule => schedule.scheduleType == type);
        }
        
        if (status) {
          filtered = filtered.filter(schedule => schedule.status == status);
        }
        
        resolve({
          code: 200,
          data: filtered,
          message: 'success'
        });
      }, 400);
    });
  },

  // 获取咨询记录
  getSessionList(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { clientId, startDate, endDate } = params || {};
        let filtered = [...mockSessions];
        
        if (clientId) {
          filtered = filtered.filter(session => session.clientId == clientId);
        }
        
        if (startDate && endDate) {
          filtered = filtered.filter(session => {
            const sessionDate = new Date(session.sessionTime);
            return sessionDate >= new Date(startDate) && sessionDate <= new Date(endDate);
          });
        }
        
        resolve({
          code: 200,
          data: filtered,
          message: 'success'
        });
      }, 400);
    });
  },

  // 获取财务数据
  getFinanceList(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { month, type, category } = params || {};
        let filtered = [...mockFinance];
        
        if (month) {
          filtered = filtered.filter(record => {
            const recordMonth = new Date(record.recordDate).getMonth() + 1;
            return recordMonth == month;
          });
        }
        
        if (type) {
          filtered = filtered.filter(record => record.recordType == type);
        }
        
        resolve({
          code: 200,
          data: filtered,
          message: 'success'
        });
      }, 400);
    });
  },

  // 添加咨询记录
  addSession(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSession = {
          id: mockSessions.length + 1,
          ...data,
          sessionNo: `S${new Date().getFullYear()}${String(mockSessions.length + 1).padStart(3, '0')}`,
          createTime: new Date().toISOString()
        };
        
        mockSessions.unshift(newSession);
        
        resolve({
          code: 200,
          data: newSession,
          message: '添加成功'
        });
      }, 600);
    });
  }
};

module.exports = {
  mockUser,
  mockClients,
  mockSchedules,
  mockSessions,
  mockFinance,
  mockStatistics,
  mockApi
};