// pages/client/list/index.js
const app = getApp();
const utils = require('../../../utils/util.js');
const api = require('../../../utils/api.js');

Page({
  data: {
    // 搜索相关
    searchKeyword: '',
    
    // 筛选相关
    statusFilters: [
      { label: '全部', value: 'all', count: 0 },
      { label: '进行中', value: '1', count: 0 },
      { label: '已结案', value: '2', count: 0 },
      { label: '中断', value: '3', count: 0 },
      { label: '转介', value: '4', count: 0 }
    ],
    activeFilter: 'all',
    
    // 排序相关
    sortField: 'create_time', // create_time 或 last_session
    sortOrder: 'desc',
    
    // 列表数据
    clients: [],
    totalCount: 0,
    
    // 分页相关
    currentPage: 1,
    pageSize: 20,
    hasMore: true,
    loadingMore: false,
    
    // 刷新状态
    refreshing: false,
    
    // 操作菜单
    showActionMenu: false,
    selectedClientId: null
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    // 刷新数据
    this.loadClients(true);
  },

  initPage() {
    this.loadClients(true);
  },

  // 加载来访者数据
  async loadClients(reset = false) {
    if (reset) {
      this.setData({
        currentPage: 1,
        hasMore: true,
        loadingMore: false
      });
    } else if (!this.data.hasMore || this.data.loadingMore) {
      return;
    }
    
    this.setData({ loadingMore: true });
    
    try {
      const params = {
        currentPage: this.data.currentPage,
        pageSize: this.data.pageSize,
        keyword: this.data.searchKeyword || null,
        sortField: this.data.sortField,
        sortOrder: this.data.sortOrder
      };
      // 仅当非all时，才添加status参数，避免传null
      if (this.data.activeFilter !== 'all') {
        params.status = Number(this.data.activeFilter);
      }
      
      const result = await api.get('/api/client/list', params);
      
      if (result.code === 200 && result.data) {
        const { list: clients, totalCount } = result.data; // 后端返回list+totalCount
        
        // 原有排序逻辑可保留（也可删除，后端已排序）
        const sortedClients = this.sortClients(clients);
        
        // 统计各状态数量（原有逻辑不变）
        this.updateStatusCounts(clients);
        
        if (reset) {
          this.setData({
            clients: sortedClients,
            totalCount: totalCount // 用后端返回的真实总条数
          });
        } else {
          this.setData({
            clients: [...this.data.clients, ...sortedClients],
            totalCount: totalCount // 用后端返回的真实总条数
          });
        }
        
        // 更新分页状态：后端返回list长度 < pageSize → 无更多数据
        const hasMore = clients.length === this.data.pageSize;
        this.setData({ hasMore, loadingMore: false });
      }
    } catch (error) {
      console.error('加载来访者失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
      this.setData({ loadingMore: false });
    }
  },


  // 排序来访者
  sortClients(clients) {
    const { sortField, sortOrder } = this.data;
    
    return [...clients].sort((a, b) => {
      let valueA, valueB;
      
      if (sortField === 'create_time') {
        valueA = new Date(a.create_time || Date.now()).getTime();
        valueB = new Date(b.create_time || Date.now()).getTime();
      } else if (sortField === 'last_session') {
        valueA = new Date(a.lastSessionTime || 0).getTime();
        valueB = new Date(b.lastSessionTime || 0).getTime();
      }
      
      if (sortOrder === 'desc') {
        return valueB - valueA;
      } else {
        return valueA - valueB;
      }
    });
  },

  // 更新状态统计
  updateStatusCounts(clients) {
    const statusFilters = [...this.data.statusFilters];
    
    // 重置计数
    statusFilters.forEach(filter => {
      if (filter.value === 'all') {
        filter.count = clients.length;
      } else {
        filter.count = clients.filter(client => client.status == filter.value).length;
      }
    });
    
    this.setData({ statusFilters });
  },

  // 格式化上次咨询时间
  formatLastSession(time) {
    if (!time) return '暂无咨询记录';
    return utils.formatRelativeTime(time);
  },

  // 获取状态文本
  getStatusText(status) {
    return utils.getStatusText(status, 'client');
  },

  // ==================== 事件处理 ====================
  
  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    
    // 防抖搜索
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.loadClients(true);
    }, 500);
  },

  // 搜索确认
  onSearchConfirm() {
    this.loadClients(true);
  },

  // 清空搜索
  clearSearch() {
    this.setData({ searchKeyword: '' }, () => {
      this.loadClients(true);
    });
  },

  // 筛选点击
  onFilterClick() {
    wx.showToast({
      title: '更多筛选功能开发中',
      icon: 'none'
    });
  },

  // 状态筛选
  onStatusFilter(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ activeFilter: value }, () => {
      this.loadClients(true);
    });
  },

  // 排序改变
  onSortChange(e) {
    const field = e.currentTarget.dataset.field;
    if (this.data.sortField === field) {
      // 切换排序顺序
      const order = this.data.sortOrder === 'desc' ? 'asc' : 'desc';
      this.setData({ sortOrder: order });
    } else {
      this.setData({ sortField: field, sortOrder: 'desc' });
    }
    
    // 重新排序当前数据
    const sortedClients = this.sortClients(this.data.clients);
    this.setData({ clients: sortedClients });
  },

  // 滚动到底部
  onScrollToLower() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.setData({
        currentPage: this.data.currentPage + 1
      });
      this.loadClients(false);
    }
  },

  // 下拉刷新
  onRefresh() {
    this.setData({ refreshing: true });
    this.loadClients(true);
    setTimeout(() => {
      this.setData({ refreshing: false });
    }, 1000);
  },

  // 来访者项点击
  onClientItemClick(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/client/detail/index?id=${id}`
    });
  },

  // 更多操作
  onMoreAction(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedClientId: id,
      showActionMenu: true
    });
  },

  // 关闭操作菜单
  closeActionMenu() {
    this.setData({ showActionMenu: false });
  },

  // 编辑来访者
  onEditClient(e) {
    const id = e.currentTarget.dataset.id;
    this.closeActionMenu();
    wx.navigateTo({
      url: `/pages/client/edit/index?id=${id}`
    });
  },

  // 记录咨询
  onAddSession(e) {
    const id = e.currentTarget.dataset.id;
    this.closeActionMenu();
    wx.navigateTo({
      url: `/pages/session/edit/index?clientId=${id}`
    });
  },

  // 查看咨询历史
  onViewSessions(e) {
    const id = e.currentTarget.dataset.id;
    this.closeActionMenu();
    wx.navigateTo({
      url: `/pages/client/sessions/index?clientId=${id}`
    });
  },

  // 删除来访者
  onDeleteClient(e) {
    const id = e.currentTarget.dataset.id;
    this.closeActionMenu();
    
    wx.showModal({
      title: '确认删除',
      content: '删除来访者将同时删除相关的咨询记录，此操作不可恢复。确认删除吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          this.deleteClient(id);
        }
      }
    });
  },

  // 删除来访者
  async deleteClient(id) {
    try {
      // 模拟删除
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 从列表中移除
      const clients = this.data.clients.filter(client => client.id != id);
      this.setData({
        clients,
        totalCount: clients.length
      });
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      // 重新统计状态数量
      this.updateStatusCounts(clients);
      
    } catch (error) {
      console.error('删除失败:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      });
    }
  },

  // 添加来访者
  onAddClient() {
    wx.navigateTo({
      url: '/pages/client/edit/index'
    });
  }
});