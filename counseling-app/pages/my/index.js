// pages/my/index.js
const app = getApp();
const utils = require('../../utils/util.js');
const api = require('../../utils/api.js');

Page({
  data: {
    // 用户信息
    userInfo: {},
    
    // 统计数据
    statistics: {
      activeClientCount: 0,
      monthSessionCount: 0,
      totalSessionCount: 0,
      monthIncome: 0
    },
    
    // 订阅信息
    subscription: {
      planName: '免费版',
      endTime: null,
      status: 0 // 0: 免费版, 1: 已订阅
    },
    
    // 版本信息
    version: '1.0.0',
    
    // 加载状态
    loading: false
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    // 每次显示页面时刷新数据
    console.log("进入页面")
    this.loadUserData();
  },

  initPage() {
    // 加载用户信息
    this.loadUserInfo();
    
    // 加载统计数据
    this.loadStatistics();
    
    // 加载订阅信息
    this.loadSubscription();
    
    // 获取版本信息
    this.getVersionInfo();
  },

  normalizeUserInfo(rawUserInfo = {}) {
    return {
      ...rawUserInfo,
      avatar: rawUserInfo.avatarUrl || rawUserInfo.avatar || '',
      realName: rawUserInfo.realName || rawUserInfo.nickName || rawUserInfo.nickname || '',
      qualification: rawUserInfo.qualification || rawUserInfo.title || '国家认证心理咨询师'
    };
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const cachedUserInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');

      // 先显示缓存，避免空白闪烁
      if (cachedUserInfo && Object.keys(cachedUserInfo).length > 0) {
        this.setData({ userInfo: this.normalizeUserInfo(cachedUserInfo) });
      }

      // 再拉取真实用户信息覆盖缓存
      const result = await api.get('/api/user/current');
      if (result.code === 200 && result.data) {
        const userInfo = this.normalizeUserInfo(result.data);
        this.setData({ userInfo });
        app.globalData.userInfo = userInfo;
        wx.setStorageSync('userInfo', userInfo);
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      if (!this.data.userInfo || Object.keys(this.data.userInfo).length === 0) {
        app.showError('加载用户信息失败，请稍后重试');
      }
    }
  },


  // 加载统计数据
  async loadStatistics() {
    try {
      const [sessionsRes, clientsRes] = await Promise.all([
        api.get('/api/session/list'),
        api.get('/api/client/list', { currentPage: 1, pageSize: 1 })
      ]);

      const sessions = sessionsRes.code === 200 && Array.isArray(sessionsRes.data)
        ? sessionsRes.data
        : [];

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const monthSessions = sessions.filter((item) => {
        const sessionDateRaw = item.sessionTime || item.sessionDate || item.startTime || item.createTime;
        if (!sessionDateRaw) return false;
        const sessionDate = new Date(sessionDateRaw);
        if (Number.isNaN(sessionDate.getTime())) return false;
        return sessionDate.getFullYear() === currentYear && sessionDate.getMonth() === currentMonth;
      });

      const monthIncome = monthSessions.reduce((sum, item) => {
        const fee = Number(item.fee || item.amount || 0);
        return sum + (Number.isNaN(fee) ? 0 : fee);
      }, 0);

      const activeClientCount = clientsRes.code === 200 && clientsRes.data
        ? Number(clientsRes.data.totalCount || 0)
        : 0;

      this.setData({
        statistics: {
          activeClientCount,
          monthSessionCount: monthSessions.length,
          totalSessionCount: sessions.length,
          monthIncome
        }
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  },

  // 加载订阅信息
  async loadSubscription() {
    try {
      // 模拟订阅信息（后续可替换为真实接口调用）
      const subscription = {
        planName: app.globalData.subscriptionStatus === 1 ? '专业版' : '免费版',
        endTime: app.globalData.subscriptionStatus === 1 ? '2024-12-31' : null,
        status: app.globalData.subscriptionStatus || 0
      };
      
      this.setData({ subscription });
    } catch (error) {
      console.error('加载订阅信息失败:', error);
    }
  },

  // 获取版本信息
  getVersionInfo() {
    try {
      const accountInfo = wx.getAccountInfoSync();
      this.setData({
        version: accountInfo.miniProgram.version || '1.0.0'
      });
    } catch (error) {
      console.log('获取版本信息失败，使用默认版本号');
    }
  },

  // 加载所有用户数据
  async loadUserData() {
    this.setData({ loading: true });
    
    try {
      await Promise.all([
        this.loadUserInfo(),
        this.loadStatistics(),
        this.loadSubscription()
      ]);
    } catch (error) {
      console.error('加载用户数据失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return '';
    return utils.formatDate(dateStr, 'yyyy-MM-dd');
  },

  // ==================== 事件处理 ====================
  
  // 编辑头像
  onEditAvatar() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.takePhoto();
        } else if (res.tapIndex === 1) {
          this.chooseImage();
        }
      }
    });
  },

  // 拍照
  takePhoto() {
    wx.chooseImage({
      count: 1,
      sourceType: ['camera'],
      success: (res) => {
        this.uploadImage(res.tempFilePaths[0]);
      }
    });
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sourceType: ['album'],
      success: (res) => {
        this.uploadImage(res.tempFilePaths[0]);
      }
    });
  },

  // 上传图片
  uploadImage(tempFilePath) {
    app.showLoading('上传中...');
    
    // 模拟上传
    setTimeout(() => {
      // 更新头像（模拟）
      const userInfo = {
        ...this.data.userInfo,
        avatar: tempFilePath
      };
      
      this.setData({ userInfo });
      app.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);
      
      app.hideLoading();
      app.showSuccess('头像更新成功');
    }, 1000);
  },

  // 设置点击
  onSettingsClick() {
    wx.navigateTo({
      url: '/pages/my/settings/index'
    });
  },

  // 订阅点击
  onSubscriptionClick() {
    wx.navigateTo({
      url: '/pages/subscription/plans/index'
    });
  },

  // 数据备份
  onDataBackup() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 数据导出
  onDataExport() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 数据分析
  onDataAnalysis() {
    wx.navigateTo({
      url: '/pages/finance/statistics/index'
    });
  },

  // 数据同步
  onDataSync() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 个人资料
  onProfileClick() {
    wx.navigateTo({
      url: '/pages/my/profile/index'
    });
  },

  // 提醒设置
  onReminderSetting() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 隐私设置
  onPrivacySetting() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 主题设置
  onThemeSetting() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 意见反馈
  onFeedback() {
    wx.navigateTo({
      url: '/pages/my/feedback/index'
    });
  },

  // 帮助中心
  onHelpCenter() {
    wx.navigateTo({
      url: '/pages/my/about/index?type=help'
    });
  },

  // 关于我们
  onAboutApp() {
    wx.navigateTo({
      url: '/pages/my/about/index'
    });
  },

  // 评估量表
  onAssessmentTools() {
    wx.showToast({
      title: '专业功能需要升级',
      icon: 'none',
      duration: 2000
    });
  },

  // 报告模板
  onTemplateLibrary() {
    wx.showToast({
      title: '专业功能需要升级',
      icon: 'none',
      duration: 2000
    });
  },

  // 督导网络
  onSupervisorNetwork() {
    wx.showToast({
      title: '专业功能需要升级',
      icon: 'none',
      duration: 2000
    });
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          this.logout();
        }
      }
    });
  },

  // 执行退出登录
  logout() {
    app.showLoading('正在退出...');
    
    // 清除登录状态（调用 app 的 logout 方法，清空全局+缓存）
    app.logout();
    
    // 跳转到登录页（替换原有跳转到首页，确保退出后需要重新登录）
    setTimeout(() => {
      app.hideLoading();
      app.showSuccess('退出成功');
      
      wx.redirectTo({
        url: '/pages/login/login' // 替换为你的登录页路径，确保正确
      });
    }, 1000);
  }
});