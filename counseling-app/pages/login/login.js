// pages/login/login.js
const app = getApp();
const api = require('../../utils/api.js');

Page({
  data: {
    // 登录加载状态
    logging: false
  },

  onLoad(options) {
    // 页面加载时，检查是否已登录
    this.checkLoginStatus();
  },

  /**
   * 检查登录状态（已登录则直接跳转首页）
   */
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');

    if (token && userInfo) {
      // 更新全局数据
      app.globalData.token = token;
      app.globalData.userInfo = userInfo;

      // 跳转首页（TabBar页面用switchTab）
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },

  /**
   * 微信快捷登录（核心逻辑）
   */
  async onWechatLogin() {
    if (this.data.logging) return;

    try {
      this.setData({ logging: true });
      app.showLoading('登录中...');

      // 1. 小程序端获取微信登录凭证code
      const loginRes = await this.getWxLoginCode();
      if (!loginRes.code) {
        throw new Error('获取登录凭证失败');
      }

      // 2. 调用后端登录接口（传递code）
      const loginResult = await api.post('/api/user/wx/login', {
        code: loginRes.code
      });

      // 3. 处理登录结果（存储token和用户信息）
      if (loginResult && loginResult.code === 200 && loginResult.data) {
        const { token, userInfo } = loginResult.data;

        // 3.1 存储到本地缓存（持久化）
        wx.setStorageSync('token', token);
        wx.setStorageSync('userInfo', userInfo);

        // 3.2 更新全局数据
        app.globalData.token = token;
        app.globalData.userInfo = userInfo;

        // 3.3 跳转首页
        app.showSuccess('登录成功');
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 1500);
      } else {
        throw new Error(loginResult.msg || '登录失败，请重试');
      }

    } catch (error) {
      console.error('登录异常:', error);
      app.showError(error.message || '登录失败，请重试');
    } finally {
      this.setData({ logging: false });
      app.hideLoading();
    }
  },

  /**
   * 封装：获取微信登录code
   * @returns {Promise} 登录结果
   */
  getWxLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      });
    });
  },

  /**
   * 跳转协议页面（预留）
   */
  onProtocolClick() {
    wx.showToast({
      title: '协议页面开发中',
      icon: 'none'
    });
  }
});