// pages/index/index.js
const app = getApp();
const utils = require('../../utils/util.js');
const mockApi = require('../../utils/mockData.js').mockApi;

Page({
  data: {
    // 用户信息
    userInfo: {},
    
    // 页面数据
    currentDate: '',
    greeting: '',
    unreadCount: 0,
    
    // 统计数据
    statistics: {
      todayScheduleCount: 0,
      monthSessionCount: 0,
      monthIncome: 0,
      monthExpense: 0,
      activeClientCount: 0
    },
    
    // 列表数据
    todaySchedules: [],
    recentClients: [],
    
    // 页面状态
    loading: false,
    refreshing: false,
    hasError: false
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.refreshData();
  },

  onPullDownRefresh() {
    this.refreshData(true);
  },

  initPage() {
    // 设置当前日期
    this.setCurrentDate();
    
    // 设置问候语
    this.setGreeting();
    
    // 加载用户信息
    this.loadUserInfo();
    
    // 加载首页数据
    this.loadDashboardData();
  },

  setCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    
    this.setData({
      currentDate: dateStr
    });
  },

  setGreeting() {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 6) {
      greeting = '夜深了';
    } else if (hour < 9) {
      greeting = '早上好';
    } else if (hour < 12) {
      greeting = '上午好';
    } else if (hour < 14) {
      greeting = '中午好';
    } else if (hour < 18) {
      greeting = '下午好';
    } else if (hour < 22) {
      greeting = '晚上好';
    } else {
      greeting = '夜深了';
    }
    
    this.setData({ greeting });
  },

  async loadUserInfo() {
    try {
      const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
      
      if (userInfo) {
        this.setData({ userInfo });
      } else {
        // 如果没有用户信息，模拟登录
        const result = await mockApi.getUserInfo();
        if (result.code === 200) {
          this.setData({ userInfo: result.data });
          app.globalData.userInfo = result.data;
        }
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  },

  async loadDashboardData() {
    this.setData({ loading: true, hasError: false });
    
    try {
      // 并行加载数据
      const [statsRes, schedulesRes, clientsRes] = await Promise.all([
        mockApi.getDashboardStats(),
        mockApi.getTodaySchedules(),
        mockApi.getRecentClients(3)
      ]);
      
      if (statsRes.code === 200) {
        this.setData({
          statistics: {
            ...statsRes.data,
            monthIncome: utils.formatMoney(statsRes.data.monthIncome)
          }
        });
      }
      
      if (schedulesRes.code === 200) {
        this.setData({ todaySchedules: schedulesRes.data });
      }
      
      if (clientsRes.code === 200) {
        this.setData({ recentClients: clientsRes.data });
      }
      
    } catch (error) {
      console.error('加载首页数据失败:', error);
      this.setData({ hasError: true });
    } finally {
      this.setData({ loading: false, refreshing: false });
      wx.stopPullDownRefresh();
    }
  },

  async refreshData(showLoading = false) {
    if (showLoading) {
      app.showLoading('刷新中...');
    }
    
    this.setData({ refreshing: true });
    await this.loadDashboardData();
    
    if (showLoading) {
      app.hideLoading();
    }
  },

  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  },

  // 计算持续时间
  getDuration(startTime, endTime) {
    if (!startTime || !endTime) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end - start) / (1000 * 60));
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      1: '待办',
      2: '完成',
      3: '取消',
      4: '进行中'
    };
    return statusMap[status] || '未知';
  },

  // 获取状态类名
  getStatusClass(status) {
    const classMap = {
      1: 'pending',
      2: 'completed',
      3: 'cancelled',
      4: 'in-progress'
    };
    return classMap[status] || 'pending';
  },

  // 格式化相对时间
  formatRelativeTime(timeStr) {
    return utils.formatRelativeTime(timeStr);
  },

  // ==================== 事件处理 ====================
  
  // 通知点击
  onNotificationClick() {
    wx.showToast({
      title: '消息功能开发中',
      icon: 'none'
    });
  },

  // 今日日程点击
  onTodayScheduleClick() {
    console.log('今日日程被点击了！')
    wx.switchTab({
      url: '/pages/schedule/calendar/index'
    });
  },

  // 本月咨询点击
  onMonthSessionClick() {
    wx.navigateTo({
      url: '/pages/session/list/index'
    });
  },

  // 财务点击
  onFinanceClick() {
    wx.navigateTo({
      url: '/pages/finance/overview/index'
    });
  },

  // 更多操作
  onMoreActions() {
    wx.showActionSheet({
      itemList: ['扫一扫', '分享给同事', '数据备份', '设置'],
      success(res) {
        console.log(res.tapIndex);
      }
    });
  },

  // 快速记录咨询
  onQuickRecord() {
    wx.navigateTo({
      url: '/pages/session/edit/index?type=quick'
    });
  },

  // 添加来访者
  onAddClient() {
    wx.navigateTo({
      url: '/pages/client/edit/index'
    });
  },

  // 添加日程
  onAddSchedule() {
    wx.navigateTo({
      url: '/pages/schedule/edit/index'
    });
  },

  // 快速记账
  onQuickAccounting() {
    wx.navigateTo({
      url: '/pages/finance/edit/index'
    });
  },

  // 查看全部日程
  onViewAllSchedule() {
    wx.switchTab({
      url: '/pages/schedule/calendar/index'
    });
  },

  // 查看全部来访者
  onViewAllClients() {
    wx.switchTab({
      url: '/pages/client/list/index'
    });
  },

  // 日程项点击
  onScheduleItemClick(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/schedule/detail/index?id=${id}`
    });
  },

  // 来访者卡片点击
  onClientCardClick(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/client/detail/index?id=${id}`
    });
  },

  // 升级点击
  onUpgradeClick() {
    wx.navigateTo({
      url: '/pages/subscription/plans/index'
    });
  },

  // 错误重试
  onRetry() {
    this.refreshData(true);
  }
});