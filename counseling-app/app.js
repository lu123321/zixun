// app.js
App({
  // 全局数据
  globalData: {
    userInfo: null,
    token: null,
    subscriptionStatus: 0, // 0: 未订阅, 1: 已订阅
    baseUrl: 'http://10.6.233.72:8080', // Mock API地址
    mockData: true // 是否使用模拟数据
  },

  // 小程序初始化
  onLaunch(options) {
    console.log('小程序初始化', options);
    
    // 检查更新
    this.checkUpdate();
    
    // 获取系统信息
    this.getSystemInfo();
    
   // 延迟检查更新，避免干扰初始化
   setTimeout(() => {
    this.checkUpdate();
  }, 1000)
  },

  onShow(options) {
    console.log('小程序显示', options);
  },

  onHide() {
    console.log('小程序隐藏');
  },

  onError(msg) {
    console.error('小程序错误:', msg);
  },

  // 检查小程序更新
  checkUpdate() {
    if (wx.getAccountInfoSync().miniProgram.envVersion === 'release') {
      if (wx.canIUse('getUpdateManager')) {
        const updateManager = wx.getUpdateManager();
        this.globalData.updateManager = updateManager;
        
        updateManager.onCheckForUpdate((res) => {
          console.log('检查更新结果', res.hasUpdate);
        });
        
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: (res) => {
              if (res.confirm) {
                updateManager.applyUpdate();
              }
            }
          });
        });
        
        updateManager.onUpdateFailed(() => {
          console.log('更新失败');
        });
      }
    }
  },

  // 获取系统信息
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = systemInfo;
      console.log('系统信息', systemInfo);
    } catch (err) {
      console.error('获取系统信息失败', err);
    }
  },

  checkLogin() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      console.log('已获取缓存登录信息');
    } else {
      console.log('未登录，将跳转登录页面');
      // 未登录：跳转登录页面（非TabBar页面用navigateTo）
      // 注意：避免重复跳转，仅在非登录页面时跳转
      const pages = getCurrentPages();
      if (pages.length === 0 || pages[0].route !== 'pages/login/login') {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }
    }
  },

  /**
   * 登录方法（保留，供其他页面调用）
   */
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (loginRes) => {
          if (loginRes.code) {
            resolve(loginRes.code);
          } else {
            reject(new Error('获取登录凭证失败'));
          }
        },
        fail: reject
      });
    });
  },

  // 登出方法
  logout() {
    this.globalData.userInfo = null;
    this.globalData.token = null;
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('token');
  },

  // 显示加载提示
  showLoading(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    });
  },

  // 隐藏加载提示
  hideLoading() {
    wx.hideLoading();
  },

  // 显示成功提示
  showSuccess(title = '操作成功', duration = 1500) {
    wx.showToast({
      title: title,
      icon: 'success',
      duration: duration
    });
  },

  // 显示错误提示
  showError(title = '操作失败', duration = 2000) {
    wx.showToast({
      title: title,
      icon: 'error',
      duration: duration
    });
  },

  // 确认对话框
  showConfirm(content, title = '提示') {
    return new Promise((resolve) => {
      wx.showModal({
        title: title,
        content: content,
        success: (res) => {
          resolve(res.confirm);
        }
      });
    });
  }
});