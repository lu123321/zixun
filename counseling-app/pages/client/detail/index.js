// pages/client/detail/index.js
const app = getApp();
const utils = require('../../../utils/util.js');
const api = require('../../../utils/api.js');

Page({
  data: {
    clientId: null,
    clientInfo: {
      id: null,
      clientNo: '',
      name: '',
      avatarText: '?',
      gender: null,
      age: null,
      contactPhone: '',
      emergencyContact: '',
      emergencyPhone: '',
      startDate: '',
      endDate: '',
      status: 1,
      statusText: '进行中',
      remark: '',
      diagnosis: '',
      treatmentPlan: '',
      tags: [],
      createTime: '',
      createDateText: '',
      sessionCount: 0,
      totalFee: 0,
      totalFeeText: '0.00',
      firstSession: null,
      firstSessionText: '无',
      lastSession: null,
      lastSessionText: '无'
    },
    sessions: [],
    showActionMenu: false,
    loading: false
  },

  onLoad(options) {
    const clientId = options.id;
    if (!clientId) {
      wx.showToast({ title: '来访者不存在', icon: 'error' });
      setTimeout(() => wx.navigateBack(), 1200);
      return;
    }

    this.setData({ clientId: Number(clientId) || clientId }, () => {
      this.loadClientData();
    });
  },

  onShow() {
    if (this.data.clientId) {
      this.loadClientData();
    }
  },

  onPullDownRefresh() {
    this.loadClientData(true);
  },

  async loadClientData(showLoading = false) {
    if (showLoading) {
      app.showLoading('加载中...');
    }
    this.setData({ loading: true });

    try {
      const clientRes = await api.get(`/api/client/detail/${this.data.clientId}`);
      if (clientRes.code !== 200 || !clientRes.data) {
        throw new Error(clientRes.msg || '加载失败');
      }

      const rawClient = clientRes.data;
      const sessionRes = await api.get('/api/session/list', { clientId: this.data.clientId });
      const sessions = sessionRes.code === 200 && Array.isArray(sessionRes.data) ? sessionRes.data : [];
      const stats = this.calculateSessionStats(sessions);
      const clientInfo = this.normalizeClientInfo({ ...rawClient, ...stats });

      this.setData({
        clientInfo,
        sessions: this.normalizeSessions(sessions)
      });
    } catch (error) {
      console.error('加载来访者详情失败:', error);
      wx.showToast({ title: error.message || '加载失败', icon: 'error' });
    } finally {
      if (showLoading) {
        app.hideLoading();
      }
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  normalizeClientInfo(client) {
    const name = client.name || '';
    const firstSessionText = client.firstSession ? utils.formatDate(client.firstSession, 'MM-dd') : '无';
    const lastSessionText = client.lastSession ? utils.formatDate(client.lastSession, 'MM-dd') : '无';

    return {
      ...client,
      avatarText: name ? name.charAt(0) : '?',
      statusText: this.getClientStatusText(client.status),
      totalFeeText: utils.formatMoney(client.totalFee || 0),
      firstSessionText,
      lastSessionText,
      createDateText: client.createTime ? utils.formatDate(client.createTime) : ''
    };
  },

  normalizeSessions(sessions) {
    return (sessions || []).map(session => ({
      ...session,
      dayText: this.formatDay(session.sessionTime),
      monthText: this.formatMonth(session.sessionTime),
      timeText: this.formatTime(session.sessionTime),
      sessionTypeText: this.getSessionTypeText(session.sessionType),
      feeText: utils.formatMoney(session.fee || 0),
      modeText: this.getSessionModeText(session.sessionMode),
      sessionStatusText: this.getSessionStatusText(session.status)
    }));
  },

  calculateSessionStats(sessions) {
    if (!sessions || sessions.length === 0) {
      return {
        sessionCount: 0,
        totalFee: 0,
        firstSession: null,
        lastSession: null
      };
    }

    const sorted = [...sessions].sort((a, b) => new Date(a.sessionTime) - new Date(b.sessionTime));
    const totalFee = sorted.reduce((sum, item) => sum + (parseFloat(item.fee) || 0), 0);

    return {
      sessionCount: sorted.length,
      totalFee,
      firstSession: sorted[0].sessionTime,
      lastSession: sorted[sorted.length - 1].sessionTime
    };
  },

  formatTime(timeStr) {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  },

  formatDay(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).getDate().toString().padStart(2, '0');
  },

  formatMonth(dateStr) {
    if (!dateStr) return '';
    const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return months[new Date(dateStr).getMonth()];
  },

  getClientStatusText(status) {
    const map = { 1: '进行中', 2: '已结案', 3: '中断', 4: '转介' };
    return map[Number(status)] || '未知状态';
  },

  getSessionTypeText(type) {
    const map = { 1: '个体咨询', 2: '家庭治疗', 3: '团体咨询', 4: '督导' };
    return map[type] || '咨询';
  },

  getSessionStatusText(status) {
    const map = { 1: '待办', 2: '完成', 3: '取消', 4: '缺席' };
    return map[status] || '';
  },

  getSessionModeText(mode) {
    if (mode === 1) return '面对面';
    if (mode === 2) return '视频';
    if (mode === 3) return '电话';
    return '未知方式';
  },

  onBack() { wx.navigateBack(); },
  onEditClient() { wx.navigateTo({ url: `/pages/client/edit/index?id=${this.data.clientId}` }); },
  onAddSession() { wx.navigateTo({ url: `/pages/session/edit/index?clientId=${this.data.clientId}` }); },
  onViewAllSessions() { wx.navigateTo({ url: `/pages/client/sessions/index?clientId=${this.data.clientId}&name=${this.data.clientInfo.name}` }); },

  onViewSession(e) {
    const sessionId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/session/detail/index?id=${sessionId}` });
  },

  onMoreActions() { this.setData({ showActionMenu: true }); },
  closeActionMenu() { this.setData({ showActionMenu: false }); },

  onExportData() {
    this.closeActionMenu();
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  onChangeStatus() {
    this.closeActionMenu();
    wx.showToast({ title: '请在编辑页修改状态', icon: 'none' });
  },

  onTransferClient() {
    this.closeActionMenu();
    wx.showToast({ title: '转介功能开发中', icon: 'none' });
  },

  onDeleteClient() {
    this.closeActionMenu();
    wx.showToast({ title: '删除功能开发中', icon: 'none' });
  },

  onClientEdit() { this.onEditClient(); }
});