// pages/test/test.js
Page({
  onLoad() {
    console.log('✅ 测试页加载成功');
    // 打印全局数据，验证全局配置
    const app = getApp();
    console.log('全局用户信息：', app.globalData.userInfo);
  },

  // 跳转到首页
  gotoIndex() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});