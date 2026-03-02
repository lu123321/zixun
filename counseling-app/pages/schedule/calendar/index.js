// pages/schedule/calendar/index.js
const app = getApp();
const utils = require('../../../utils/util.js');
const api = require('../../../utils/api.js');

Page({
  data: {
    // 当前显示的月份
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    
    // 星期标题
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    
    // 日历数据
    calendarDays: [],
    
    // 日程类型筛选
    scheduleTypes: [
      { id: 0, name: '全部', icon: '📅' },
      { id: 1, name: '咨询', icon: '💬' },
      { id: 2, name: '督导', icon: '👨‍🏫' },
      { id: 3, name: '写报告', icon: '📝' },
      { id: 4, name: '培训', icon: '🎓' },
      { id: 5, name: '会议', icon: '👥' },
      { id: 6, name: '休息', icon: '☕' }
    ],
    activeType: 0,
    
    // 选中的日期
    selectedDate: '',
    selectedDateStr: '',
    
    // 选中的日程
    selectedDaySchedules: [],
    
    // 所有日程数据（模拟）
    allSchedules: [],
    
    // 加载状态
    loading: false
  },

  onLoad() {
    this.setData({ selectedDate: this.formatDateToLocalStr(new Date()) });
    this.initPage();
  },

  onShow() {
    // 刷新日程数据
    this.loadSchedules();
  },

  initPage() {
    // 初始化日期
    this.setSelectedDateStr();
    
    // 生成日历
    this.generateCalendar();
    
    // 加载日程数据
    this.loadSchedules();
  },

  formatDateToLocalStr(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  parseDateFromStr(dateStr) {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  },

  // 设置选中日期显示文本
  setSelectedDateStr() {
    const date = this.parseDateFromStr(this.data.selectedDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    let dateStr = '';
    if (date.toDateString() === today.toDateString()) {
      dateStr = '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateStr = '明天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateStr = '昨天';
    } else {
      dateStr = `${date.getMonth() + 1}月${date.getDate()}日 ${this.data.weekDays[date.getDay()]}`;
    }
    
    this.setData({ selectedDateStr: dateStr });
  },

  // 生成日历
  generateCalendar() {
    const { currentYear, currentMonth } = this.data;
    const calendarDays = [];
    
    // 获取当月第一天
    const firstDay = new Date(currentYear, currentMonth, 1);
    const firstDayWeek = firstDay.getDay(); // 0-6，0代表周日
    
    // 获取上个月最后几天
    const lastMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      const day = lastMonthLastDay - i;
      const date = new Date(currentYear, currentMonth - 1, day);
      calendarDays.push({
        day,
        date: this.formatDateToLocalStr(date),
        isCurrentMonth: false,
        isToday: false,
        hasSchedule: false,
        scheduleCount: 0
      });
    }
    
    // 获取当月天数
    const currentMonthDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    
    for (let i = 1; i <= currentMonthDays; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dateStr = this.formatDateToLocalStr(date);
      const isToday = date.toDateString() === today.toDateString();
      
      calendarDays.push({
        day: i,
        date: dateStr,
        isCurrentMonth: true,
        isToday,
        hasSchedule: false,
        scheduleCount: 0
      });
    }
    
    // 获取下个月前几天
    const totalCells = 42; // 6行 * 7列
    const nextMonthDays = totalCells - calendarDays.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      calendarDays.push({
        day: i,
        date: this.formatDateToLocalStr(date),
        isCurrentMonth: false,
        isToday: false,
        hasSchedule: false,
        scheduleCount: 0
      });
    }
    
    this.setData({ calendarDays });
    
    // 标记有日程的日期
    this.markScheduleDays();
  },

  // 标记有日程的日期
  markScheduleDays() {
    const { calendarDays, allSchedules } = this.data;
    const updatedDays = [...calendarDays];
    
    // 重置所有标记
    updatedDays.forEach(day => {
      day.hasSchedule = false;
      day.scheduleCount = 0;
    });
    
    // 标记有日程的日期
    allSchedules.forEach(schedule => {
      const scheduleDate = this.formatDateToLocalStr(new Date(schedule.startTime));
      const dayIndex = updatedDays.findIndex(day => day.date === scheduleDate);
      
      if (dayIndex !== -1) {
        updatedDays[dayIndex].hasSchedule = true;
        updatedDays[dayIndex].scheduleCount += 1;
      }
    });
    
    this.setData({ calendarDays: updatedDays });
  },

  // 加载日程数据
  async loadSchedules() {
    this.setData({ loading: true });

    try {
      const startDate = `${this.data.currentYear}-${String(this.data.currentMonth + 1).padStart(2, '0')}-01`;
      const monthLastDay = new Date(this.data.currentYear, this.data.currentMonth + 1, 0).getDate();
      const endDate = `${this.data.currentYear}-${String(this.data.currentMonth + 1).padStart(2, '0')}-${String(monthLastDay).padStart(2, '0')}`;

      const result = await api.get('/api/schedule/list', { startDate, endDate });
      if (result.code === 200) {
        this.setData({ allSchedules: result.data || [] }, () => {
          this.markScheduleDays();
          this.filterSelectedDaySchedules();
        });
      } else {
        throw new Error(result.msg || '加载失败');
      }
    } catch (error) {
      console.error('加载日程失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 筛选选中日期的日程
  filterSelectedDaySchedules() {
    const { selectedDate, allSchedules, activeType } = this.data;
    
    let filtered = allSchedules.filter(schedule => {
      const scheduleDate = this.formatDateToLocalStr(new Date(schedule.startTime));
      return scheduleDate === selectedDate;
    });
    
    // 按类型筛选
    if (activeType !== 0) {
      filtered = filtered.filter(schedule => schedule.scheduleType === activeType);
    }
    
    // 按时间排序
    filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    
    this.setData({ selectedDaySchedules: filtered });
  },

  // ==================== 格式化方法 ====================
  
  // 格式化时间范围
  formatTimeRange(startTime, endTime) {
    if (!startTime || !endTime) return '';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const formatTime = (date) => {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };
    
    return `${formatTime(start)} - ${formatTime(end)}`;
  },

  // 计算持续时间
  getDuration(startTime, endTime) {
    if (!startTime || !endTime) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end - start) / (1000 * 60));
  },

  // 获取日程类型文本
  getScheduleTypeText(type) {
    const typeMap = {
      1: '咨询',
      2: '督导',
      3: '写报告',
      4: '培训',
      5: '会议',
      6: '休息',
      7: '其他'
    };
    return typeMap[type] || '其他';
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
      1: 'status-pending',
      2: 'status-completed',
      3: 'status-cancelled',
      4: 'status-in-progress'
    };
    return classMap[status] || 'status-pending';
  },

  // ==================== 事件处理 ====================
  
  // 上个月
  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
    
    this.setData({ currentYear, currentMonth }, () => {
      this.generateCalendar();
    });
  },

  // 下个月
  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
    
    this.setData({ currentYear, currentMonth }, () => {
      this.generateCalendar();
    });
  },

  // 点击日期
  onDayClick(e) {
    const date = e.currentTarget.dataset.date;
    this.setData({ selectedDate: date }, () => {
      this.setSelectedDateStr();
      this.filterSelectedDaySchedules();
    });
  },

  // 类型筛选
  onTypeFilter(e) {
    const type = parseInt(e.currentTarget.dataset.type);
    this.setData({ activeType: type }, () => {
      this.filterSelectedDaySchedules();
    });
  },

  // 添加日程
  onAddSchedule() {
    const { selectedDate } = this.data;
    wx.navigateTo({
      url: `/pages/schedule/edit/index?date=${selectedDate}`
    });
  },

  // 日程项点击
  onScheduleItemClick(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/schedule/detail/index?id=${id}`
    });
  }
});