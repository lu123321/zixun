// pages/client/select/index.js
const app = getApp();
const utils = require('../../../utils/util.js');
const api = require('../../../utils/api.js');

Page({
  data: {
    // 页面来源（用于返回时跳转）
    fromPage: '',
    
    // 搜索相关
    searchKeyword: '',
    
    // 快捷筛选
    quickFilters: [
      { value: 'all', icon: '👥', text: '全部' },
      { value: 'active', icon: '🎯', text: '进行中' },
      { value: 'recent', icon: '🕐', text: '最近咨询' },
      { value: 'frequent', icon: '⭐', text: '常客' }
    ],
    activeFilter: 'all',
    
    // 列表数据
    clients: [],
    totalCount: 0,
    selectedCount: 0,
    
    // 选择状态管理
    selectedClients: {}, // {id: true} 格式
    
    // 分页相关
    currentPage: 1,
    pageSize: 20,
    hasMore: true,
    loadingMore: false,
    
    // 刷新状态
    refreshing: false,
    
    // 支持多选还是单选
    multiSelect: false,
    
    // 最大选择数量（多选时有效）
    maxSelect: 1
  },

  onLoad(options) {
    console.log('选择页面参数:', options);
    
    // 解析参数
    const { from, select, max } = options || {};
    
    // 设置页面配置
    this.setData({
      fromPage: from || '',
      multiSelect: select === 'multi',
      maxSelect: max ? parseInt(max) : (select === 'multi' ? 10 : 1)
    });
    
    // 根据来源页面设置标题
    if (from === 'session') {
      wx.setNavigationBarTitle({
        title: '选择来访者'
      });
    }
    
    // 加载数据
    this.loadClients(true);
  },

  onShow() {
    // 每次显示页面时检查是否需要刷新
    const needRefresh = wx.getStorageSync('clientListNeedRefresh');
    if (needRefresh) {
      wx.removeStorageSync('clientListNeedRefresh');
      this.loadClients(true);
    }
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
      // 构建查询参数
      const params = {
        currentPage: this.data.currentPage,
        pageSize: this.data.pageSize,
        keyword: this.data.searchKeyword ? this.data.searchKeyword.trim() : null
      };

      // 根据筛选条件调整参数
      if (this.data.activeFilter === 'active') {
        params.status = 1; // 进行中
      } else if (this.data.activeFilter === 'recent') {
        params.sortField = 'last_session';
        params.sortOrder = 'desc';
      } else if (this.data.activeFilter === 'frequent') {
        // 后端暂不支持按咨询次数排序，先按创建时间降序兜底
        params.sortField = 'create_time';
        params.sortOrder = 'desc';
      }

      const result = await api.get('/api/client/list', params);

      if (result.code === 200) {
        const pageData = result.data || {};
        const clients = Array.isArray(pageData.list) ? pageData.list : [];
        const totalCount = Number(pageData.totalCount || 0);

        const mergedClients = this.normalizeClientList(reset ? clients : [...this.data.clients, ...clients]);

        // 如果是重置，替换整个列表；否则追加
        this.setData({
          clients: mergedClients,
          totalCount
        });

        // 更新分页状态
        const hasMore = mergedClients.length < totalCount;
        this.setData({ hasMore, loadingMore: false });

        // 更新统计信息
        this.updateSelectedCount();
      } else {
        throw new Error(result.msg || '加载失败');
      }
    } catch (error) {
      console.error('加载来访者失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
      this.setData({ loadingMore: false });
    }
  },

  normalizeClientList(clients) {
    return (clients || []).map(item => ({
      ...item,
      statusText: utils.getStatusText(item.status, 'client') || '未知状态',
      lastSessionText: this.formatLastSession(item.lastSessionTime),
      sessionCountText: `${item.sessionCount || 0}次咨询`,
      tags: Array.isArray(item.tags) ? item.tags : []
    }));
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

  // 更新已选数量
  updateSelectedCount() {
    const selectedCount = Object.values(this.data.selectedClients).filter(v => v).length;
    this.setData({ selectedCount });
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

  // 快捷筛选
  onQuickFilter(e) {
    const value = e.currentTarget.dataset.value;
    if (this.data.activeFilter === value) return;
    
    this.setData({ activeFilter: value }, () => {
      this.loadClients(true);
    });
  },

  // 添加来访者
  onAddClient() {
    wx.navigateTo({
      url: '/pages/client/edit/index?from=select'
    });
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

  // 查看来访者详情
  onViewClientDetail(e) {
    const clientId = e.currentTarget.dataset.id;
    if (!clientId) return;
    wx.navigateTo({
      url: `/pages/client/detail/index?id=${clientId}`
    });
  },

  // 选择来访者
  onClientSelect(e) {
    const clientId = e.currentTarget.dataset.id;
    const { multiSelect, maxSelect, selectedClients } = this.data;
    
    // 判断当前选择状态
    const isSelected = selectedClients[clientId];
    
    if (!multiSelect) {
      // 单选模式：直接选择
      const newSelection = { [clientId]: true };
      this.setData({ selectedClients: newSelection }, () => {
        this.updateSelectedCount();
      });
    } else {
      // 多选模式：切换选择状态
      if (isSelected) {
        // 取消选择
        const newSelection = { ...selectedClients };
        delete newSelection[clientId];
        this.setData({ selectedClients: newSelection }, () => {
          this.updateSelectedCount();
        });
      } else {
        // 检查是否达到最大选择数量
        const selectedCount = Object.values(selectedClients).filter(v => v).length;
        if (selectedCount >= maxSelect) {
          wx.showToast({
            title: `最多只能选择${maxSelect}位来访者`,
            icon: 'none'
          });
          return;
        }
        
        // 添加选择
        const newSelection = {
          ...selectedClients,
          [clientId]: true
        };
        this.setData({ selectedClients: newSelection }, () => {
          this.updateSelectedCount();
        });
      }
    }
  },

  // 清空选择
  onClearSelection() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有选择吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ selectedClients: {} }, () => {
            this.updateSelectedCount();
          });
        }
      }
    });
  },

  // 确认选择
  onConfirmSelection() {
    const { selectedClients, multiSelect, fromPage } = this.data;
    
    // 获取已选来访者信息
    const selectedIds = Object.keys(selectedClients).filter(id => selectedClients[id]);
    
    if (selectedIds.length === 0) {
      wx.showToast({
        title: '请至少选择一位来访者',
        icon: 'none'
      });
      return;
    }
    
    // 获取已选来访者详细信息
    const selectedClientDetails = this.data.clients.filter(client => 
      selectedIds.includes(client.id.toString())
    );
    
    if (selectedClientDetails.length === 0) {
      wx.showToast({
        title: '获取来访者信息失败',
        icon: 'error'
      });
      return;
    }
    
    // 根据页面来源处理返回数据
    if (fromPage === 'session') {
      // 返回咨询记录编辑页
      if (multiSelect) {
        // 多选：返回数组
        wx.setStorageSync('selectedClients', selectedClientDetails);
      } else {
        // 单选：返回单个对象
        wx.setStorageSync('selectedClient', selectedClientDetails[0]);
      }
      
      wx.navigateBack();
    } else {
      // 其他来源，暂时返回上一页
      const pages = getCurrentPages();
      if (pages.length >= 2) {
        const prevPage = pages[pages.length - 2];
        
        // 尝试调用回调函数
        if (prevPage.onClientsSelected) {
          prevPage.onClientsSelected(selectedClientDetails);
        }
        
        wx.navigateBack();
      }
    }
  },

  // 页面返回处理
  onBack() {
    // 检查是否有选择
    if (this.data.selectedCount > 0) {
      wx.showModal({
        title: '确认返回',
        content: '您已选择了来访者，返回将丢失选择，确定返回吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  }
});