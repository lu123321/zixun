Page({
  data: {
    clientId: null,
    clientInfo: null,
    sessionList: [],
    filterStatus: 0, // 0=全部，2=已完成，1=已预约，3=已取消
    filterText: '全部状态',
    sortBy: 'date_desc', // date_desc=最新在前，date_asc=最旧在前，fee_desc=费用高在前
    sortText: '最新优先',
    showFilterPanel: false,
    loading: false,
    loadingMore: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad(options) {
    // 获取来访者ID
    const clientId = options.id || '1';
    this.setData({
      clientId: clientId
    });
    
    // 加载数据
    this.loadClientInfo(clientId);
    this.loadSessionList();
  },

  onPullDownRefresh() {
    console.log('下拉刷新');
    this.setData({
      page: 1,
      hasMore: true
    });
    this.loadSessionList(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    
    console.log('加载更多');
    this.setData({
      loadingMore: true
    });
    
    this.loadMoreSessions();
  },

  loadClientInfo(clientId) {
    // Mock数据：来访者信息
    const mockClients = {
      '1': {
        id: 1,
        name: '王小明',
        avatar: '/images/avatars/client1.png',
        gender: 1,
        genderText: '男',
        age: 32,
        clientNo: 'C2024001',
        status: 1,
        statusText: '进行中',
        totalSessions: 12,
        completedSessions: 10,
        firstSession: '2023-11-01'
      },
      '2': {
        id: 2,
        name: '李小红',
        avatar: '/images/avatars/client2.png',
        gender: 2,
        genderText: '女',
        age: 28,
        clientNo: 'C2024002',
        status: 1,
        statusText: '进行中',
        totalSessions: 8,
        completedSessions: 7,
        firstSession: '2023-12-10'
      },
      '3': {
        id: 3,
        name: '张伟',
        avatar: '/images/avatars/client3.png',
        gender: 1,
        genderText: '男',
        age: 45,
        clientNo: 'C2024003',
        status: 2,
        statusText: '已结案',
        totalSessions: 20,
        completedSessions: 20,
        firstSession: '2023-08-15'
      }
    };
    
    this.setData({
      clientInfo: mockClients[clientId] || mockClients['1']
    });
  },

  loadSessionList(callback) {
    this.setData({
      loading: true
    });
    
    // Mock数据：咨询历史列表
    setTimeout(() => {
      const mockSessions = this.generateMockSessions(this.data.clientId, 1, this.data.pageSize);
      
      this.setData({
        sessionList: mockSessions,
        loading: false,
        page: 1
      });
      
      callback && callback();
    }, 500);
  },

  loadMoreSessions() {
    const nextPage = this.data.page + 1;
    
    setTimeout(() => {
      const moreSessions = this.generateMockSessions(this.data.clientId, nextPage, this.data.pageSize);
      
      if (moreSessions.length === 0) {
        this.setData({
          hasMore: false,
          loadingMore: false
        });
        return;
      }
      
      this.setData({
        sessionList: [...this.data.sessionList, ...moreSessions],
        page: nextPage,
        loadingMore: false
      });
    }, 800);
  },

  generateMockSessions(clientId, page, pageSize) {
    // 生成模拟数据
    const baseDate = new Date();
    const sessions = [];
    
    for (let i = 0; i < pageSize; i++) {
      const offsetDays = (page - 1) * pageSize + i;
      const sessionDate = new Date(baseDate);
      sessionDate.setDate(sessionDate.getDate() - offsetDays * 3);
      
      // 随机状态
      const status = Math.floor(Math.random() * 4) + 1;
      const statusTexts = { 1: '已预约', 2: '已完成', 3: '取消', 4: '缺席' };
      const statusColors = { 1: '#fa8c16', 2: '#52c41a', 3: '#999', 4: '#ff4d4f' };
      
      // 随机咨询方式
      const mode = Math.floor(Math.random() * 3) + 1;
      const modeTexts = { 1: '面对面', 2: '视频', 3: '电话' };
      
      // 随机咨询类型
      const type = Math.floor(Math.random() * 4) + 1;
      const typeTexts = { 1: '个体咨询', 2: '家庭治疗', 3: '团体咨询', 4: '督导' };
      
      sessions.push({
        id: `${clientId}_${page}_${i}`,
        sessionDate: this.formatDate(sessionDate, 'MM-DD'),
        sessionWeek: this.getWeekDay(sessionDate),
        sessionTime: `${9 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '30' : '00'}`,
        sessionTypeText: typeTexts[type],
        sessionModeText: modeTexts[mode],
        duration: [50, 60, 90][Math.floor(Math.random() * 3)],
        fee: (Math.random() * 200 + 200).toFixed(0),
        status: status,
        statusText: statusTexts[status],
        statusColor: statusColors[status],
        contentSummary: '本次咨询讨论了来访者的焦虑情绪和压力管理技巧，来访者表示有所收获。',
        tags: ['焦虑', '压力管理', '情绪调节'].slice(0, Math.floor(Math.random() * 3) + 1)
      });
    }
    
    // 根据筛选状态过滤
    if (this.data.filterStatus !== 0) {
      return sessions.filter(session => session.status === this.data.filterStatus);
    }
    
    // 根据排序规则排序
    return this.sortSessions(sessions, this.data.sortBy);
  },

  formatDate(date, format) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    if (format === 'MM-DD') {
      return `${month}-${day}`;
    }
    
    return `${date.getFullYear()}-${month}-${day}`;
  },

  getWeekDay(date) {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekDays[date.getDay()];
  },

  sortSessions(sessions, sortBy) {
    const sorted = [...sessions];
    
    switch (sortBy) {
      case 'date_asc':
        return sorted.reverse(); // 因为我们的mock数据是按日期倒序生成的
      case 'fee_desc':
        return sorted.sort((a, b) => parseFloat(b.fee) - parseFloat(a.fee));
      default: // date_desc
        return sorted;
    }
  },

  showFilter() {
    this.setData({
      showFilterPanel: !this.data.showFilterPanel
    });
  },

  setFilter(e) {
    const status = parseInt(e.currentTarget.dataset.status);
    const filterTexts = { 0: '全部状态', 2: '已完成', 1: '已预约', 3: '已取消' };
    
    this.setData({
      filterStatus: status,
      filterText: filterTexts[status],
      showFilterPanel: false,
      page: 1,
      hasMore: true
    });
    
    this.loadSessionList();
  },

  toggleSort() {
    const sortOptions = [
      { value: 'date_desc', text: '最新优先' },
      { value: 'date_asc', text: '最早优先' },
      { value: 'fee_desc', text: '费用最高' }
    ];
    
    const currentIndex = sortOptions.findIndex(opt => opt.value === this.data.sortBy);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    const nextSort = sortOptions[nextIndex];
    
    wx.showActionSheet({
      itemList: sortOptions.map(opt => opt.text),
      success: (res) => {
        const selectedSort = sortOptions[res.tapIndex];
        this.setData({
          sortBy: selectedSort.value,
          sortText: selectedSort.text,
          page: 1
        });
        
        // 重新排序当前列表
        const sortedList = this.sortSessions(this.data.sessionList, selectedSort.value);
        this.setData({ sessionList: sortedList });
      }
    });
  },

  onSearch() {
    wx.navigateTo({
      url: '/pages/search/index?type=sessions&clientId=' + this.data.clientId,
    });
  },

  goToDetail(e) {
    const sessionId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/session/detail/index?id=${sessionId}&clientId=${this.data.clientId}`,
    });
  },

  onAddSession() {
    wx.navigateTo({
      url: `/pages/session/edit/index?clientId=${this.data.clientId}`,
    });
  }
});