const app = getApp();
const api = require('../../../utils/api.js');
const utils = require('../../../utils/util.js');

Page({
  data: {
    sessionId: null,
    loading: false,
    sessionData: {}
  },

  onLoad(options) {
    const sessionId = options.id;
    if (!sessionId) {
      app.showError('咨询记录ID不能为空');
      setTimeout(() => wx.navigateBack(), 1200);
      return;
    }
    this.setData({ sessionId });
    this.loadSessionData();
  },

  async loadSessionData() {
    this.setData({ loading: true });
    try {
      const res = await api.get(`/api/session/detail/${this.data.sessionId}`);
      if (res.code !== 200 || !res.data) {
        throw new Error(res.msg || '加载咨询记录失败');
      }
      this.setData({
        sessionData: this.normalizeSession(res.data)
      });
    } catch (error) {
      console.error('加载咨询记录详情失败', error);
      app.showError(error.message || '加载咨询记录失败');
    } finally {
      this.setData({ loading: false });
    }
  },

  normalizeSession(session) {
    const status = Number(session.status || 1);
    return {
      ...session,
      sessionTimeText: session.sessionTime ? utils.formatDate(session.sessionTime, 'yyyy-MM-dd HH:mm') : '-',
      durationText: `${session.duration || 0}分钟`,
      sessionModeText: this.getSessionModeText(session.sessionMode),
      feeText: session.fee != null ? utils.formatMoney(session.fee) : '0.00',
      status,
      statusText: this.getStatusText(status),
      statusClass: `status-${status}`,
      attachmentsParsed: this.parseAttachments(session.attachments)
    };
  },

  parseAttachments(attachments) {
    if (!attachments) return [];
    if (Array.isArray(attachments)) return attachments;
    try {
      const parsed = JSON.parse(attachments);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') {
        return [...(parsed.images || []), ...(parsed.files || []), ...(parsed.audios || [])];
      }
      return [];
    } catch (e) {
      return [];
    }
  },

  getStatusText(status) {
    const map = { 1: '已预约', 2: '已完成', 3: '已取消', 4: '缺席' };
    return map[status] || '未知';
  },

  getSessionModeText(mode) {
    const map = { 1: '面对面', 2: '视频', 3: '电话' };
    return map[Number(mode)] || '-';
  },

  onEdit() {
    wx.navigateTo({
      url: `/pages/session/edit/index?id=${this.data.sessionId}`
    });
  },

  onChangeStatus() {
    const statusOptions = [
      { text: '已预约', value: 1 },
      { text: '已完成', value: 2 },
      { text: '已取消', value: 3 },
      { text: '缺席', value: 4 }
    ];

    wx.showActionSheet({
      itemList: statusOptions.map(item => item.text),
      success: async (res) => {
        const status = statusOptions[res.tapIndex].value;
        await this.updateStatus(status);
      }
    });
  },

  async updateStatus(status) {
    try {
      const res = await api.post('/api/session/status/update', {
        id: Number(this.data.sessionId),
        status
      });
      if (res.code !== 200) {
        throw new Error(res.msg || '更新状态失败');
      }
      app.showSuccess('状态已更新');
      this.loadSessionData();
    } catch (error) {
      console.error('更新状态失败', error);
      app.showError(error.message || '更新状态失败');
    }
  }
});