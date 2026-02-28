// pages/client/detail/index.js
const app = getApp();
const utils = require('../../../utils/util.js');
const mockApi = require('../../../utils/mockData.js').mockApi;

Page({
  data: {
    // 来访者ID
    clientId: null,
    
    // 来访者信息
    clientInfo: {
      id: null,
      clientNo: '',
      name: '',
      gender: null,
      age: null,
      contactPhone: '',
      emergencyContact: '',
      emergencyPhone: '',
      startDate: '',
      endDate: '',
      status: 1,
      remark: '',
      diagnosis: '',
      treatmentPlan: '',
      tags: [],
      createTime: '',
      sessionCount: 0,
      totalFee: 0,
      firstSession: null,
      lastSession: null
    },
    
    // 咨询记录
    sessions: [],
    
    // 操作菜单
    showActionMenu: false,
    
    // 加载状态
    loading: false,
    
    // 页面配置
    pageConfig: {
      showClinicalInfo: true,
      showRemark: true,
      showTags: true
    }
  },

  onLoad(options) {
    console.log('来访者详情页参数:', options);
    
    // 获取来访者ID
    const clientId = options.id;
    if (!clientId) {
      wx.showToast({
        title: '来访者不存在',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    this.setData({ clientId }, () => {
      this.loadClientData();
    });
  },

  onShow() {
    // 页面显示时刷新数据
    if (this.data.clientId) {
      this.loadClientData();
    }
  },

  onPullDownRefresh() {
    this.loadClientData(true);
  },

  // 加载来访者数据
  async loadClientData(showLoading = false) {
    if (showLoading) {
      app.showLoading('加载中...');
    }
    
    this.setData({ loading: true });
    
    try {
      // 并行加载来访者信息和咨询记录
      const [clientRes, sessionsRes] = await Promise.all([
        mockApi.getClientDetail(this.data.clientId),
        mockApi.getSessionList({ clientId: this.data.clientId })
      ]);
      
      if (clientRes.code === 200) {
        const clientInfo = clientRes.data;
        
        // 计算咨询统计
        if (sessionsRes.code === 200) {
          const sessions = sessionsRes.data;
          const stats = this.calculateSessionStats(sessions);
          
          // 合并统计信息
          this.setData({
            clientInfo: {
              ...clientInfo,
              ...stats
            },
            sessions: sessions
          });
        } else {
          this.setData({
            clientInfo: clientInfo,
            sessions: []
          });
        }
      } else {
        wx.showToast({
          title: '加载失败',
          icon: 'error'
        });
      }
      
    } catch (error) {
      console.error('加载来访者数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      if (showLoading) {
        app.hideLoading();
      }
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  // 计算咨询统计
  calculateSessionStats(sessions) {
    if (!sessions || sessions.length === 0) {
      return {
        sessionCount: 0,
        totalFee: 0,
        firstSession: null,
        lastSession: null
      };
    }
    
    // 按时间排序
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.sessionTime) - new Date(b.sessionTime)
    );
    
    // 计算总费用
    const totalFee = sortedSessions.reduce((sum, session) => {
      return sum + (parseFloat(session.fee) || 0);
    }, 0);
    
    return {
      sessionCount: sortedSessions.length,
      totalFee: totalFee,
      firstSession: sortedSessions[0].sessionTime,
      lastSession: sortedSessions[sortedSessions.length - 1].sessionTime
    };
  },

  // ==================== 格式化函数 ====================
  
  // 格式化日期
  formatDate(dateStr, format = 'yyyy-MM-dd') {
    if (!dateStr) return '';
    return utils.formatDate(dateStr, format);
  },

  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  },

  // 格式化日期（日）
  formatDay(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.getDate().toString().padStart(2, '0');
  },

  // 格式化日期（月）
  formatMonth(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['一月', '二月', '三月', '四月', '五月', '六月', 
                   '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return months[date.getMonth()];
  },

  // 格式化金额
  formatMoney(amount) {
    return utils.formatMoney(amount);
  },

  // 获取状态文本
  getStatusText(status) {
    return utils.getStatusText(status, 'client');
  },

  // 获取咨询类型文本
  getSessionTypeText(type) {
    const typeMap = {
      1: '个体咨询',
      2: '家庭治疗',
      3: '团体咨询',
      4: '督导'
    };
    return typeMap[type] || '咨询';
  },

  // 获取咨询状态文本
  getSessionStatusText(status) {
    const statusMap = {
      1: '待办',
      2: '完成',
      3: '取消',
      4: '缺席'
    };
    return statusMap[status] || '';
  },

  // ==================== 事件处理 ====================
  
  // 返回
  onBack() {
    wx.navigateBack();
  },

  // 编辑来访者
  onEditClient() {
    wx.navigateTo({
      url: `/pages/client/edit/index?id=${this.data.clientId}`
    });
  },

  // 记录咨询
  onAddSession() {
    wx.navigateTo({
      url: `/pages/session/edit/index?clientId=${this.data.clientId}`
    });
  },

  // 查看所有咨询记录
  onViewAllSessions() {
    wx.navigateTo({
      url: `/pages/client/sessions/index?clientId=${this.data.clientId}&name=${this.data.clientInfo.name}`
    });
  },

  // 查看咨询详情
  onViewSession(e) {
    const sessionId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/session/detail/index?id=${sessionId}`
    });
  },

  // 更多操作
  onMoreActions() {
    this.setData({ showActionMenu: true });
  },

  // 关闭操作菜单
  closeActionMenu() {
    this.setData({ showActionMenu: false });
  },

  // 导出数据
  onExportData() {
    this.closeActionMenu();
    
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 更改状态
  onChangeStatus() {
    this.closeActionMenu();
    
    const { clientInfo } = this.data;
    const newStatus = clientInfo.status === 1 ? 2 : 1;
    const actionText = newStatus === 2 ? '结束咨询' : '重新开始咨询';
    
    wx.showModal({
      title: '确认操作',
      content: `确定要${actionText}吗？`,
      success: async (res) => {
        if (res.confirm) {
          await this.updateClientStatus(newStatus);
        }
      }
    });
  },

  // 更新来访者状态
  async updateClientStatus(newStatus) {
    app.showLoading('更新中...');
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新本地数据
      this.setData({
        'clientInfo.status': newStatus,
        'clientInfo.endDate': newStatus === 2 ? new Date().toISOString().split('T')[0] : null
      });
      
      app.showSuccess('更新成功');
      
    } catch (error) {
      console.error('更新状态失败:', error);
      app.showError('更新失败');
    } finally {
      app.hideLoading();
    }
  },

  // 转介
  onTransferClient() {
    this.closeActionMenu();
    
    wx.showToast({
      title: '转介功能开发中',
      icon: 'none'
    });
  },

  // 删除来访者
  onDeleteClient() {
    this.closeActionMenu();
    
    wx.showModal({
      title: '确认删除',
      content: '删除来访者将同时删除相关的咨询记录，此操作不可恢复。确认删除吗？',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          await this.deleteClient();
        }
      }
    });
  },

  // 删除来访者
  async deleteClient() {
    app.showLoading('删除中...');
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 显示成功提示
      app.showSuccess('删除成功');
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      
    } catch (error) {
      console.error('删除失败:', error);
      app.showError('删除失败');
    } finally {
      app.hideLoading();
    }
  },

  // 编辑来访者（从操作栏）
  onClientEdit() {
    this.onEditClient();
  }
});