Page({
  data: {
    // 编辑模式相关
    isEditMode: false,
    scheduleId: null,
    
    // 表单数据：拆分日期和时间字段（核心修改）
    formData: {
      title: '',
      scheduleType: 1, // 1=咨询
      scheduleTypeText: '',
      scheduleTypeIndex: 0,
      clientId: null,
      clientName: '',
      clientIndex: -1,
      // 拆分开始时间为日期+时间
      startDate: '',    // 格式：YYYY-MM-DD
      startDateText: '',// 显示：X月X日
      startTime: '',    // 格式：HH:mm
      startTimeText: '',// 显示：HH:mm
      // 拆分结束时间为日期+时间
      endDate: '',      // 格式：YYYY-MM-DD
      endDateText: '',  // 显示：X月X日
      endTime: '',      // 格式：HH:mm
      endTimeText: '',  // 显示：HH:mm
      // 原有字段不变
      location: '',
      description: '',
      color: '#1890ff',
      remindType: 3, // 提前15分钟
      remindTypeText: '',
      remindTypeIndex: 2,
      isRecurring: false,
      recurringType: 'weekly',
      recurringDays: [1, 3, 5], // 周一、周三、周五
      recurringDayOfMonth: 15,
      recurringEndDate: '',
      recurringEndDateText: ''
    },
    
    // 选择器数据（不变）
    scheduleTypes: [
      { value: 1, label: '咨询', color: '#1890ff' },
      { value: 2, label: '督导', color: '#52c41a' },
      { value: 3, label: '写报告', color: '#fa8c16' },
      { value: 4, label: '培训', color: '#722ed1' },
      { value: 5, label: '会议', color: '#eb2f96' },
      { value: 6, label: '休息', color: '#13c2c2' },
      { value: 7, label: '其他', color: '#666' }
    ],
    
    clients: [],
    colorOptions: ['#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2', '#666', '#f5222d'],
    remindTypes: [
      { value: 1, label: '不提醒' },
      { value: 2, label: '开始时提醒' },
      { value: 3, label: '提前5分钟' },
      { value: 4, label: '提前15分钟' },
      { value: 5, label: '提前30分钟' },
      { value: 6, label: '提前1小时' },
      { value: 7, label: '提前1天' }
    ],
    
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    monthDayOptions: Array.from({length: 31}, (_, i) => `${i + 1}日`),
    minDate: '2024-01-01',
    
    // 计算属性
    showClientField: true
  },

  onLoad(options) {
    // 检查是否编辑模式
    if (options.id) {
      this.setData({
        isEditMode: true,
        scheduleId: options.id
      });
      wx.setNavigationBarTitle({
        title: '编辑日程'
      });
      this.loadScheduleData(options.id);
    } else {
      wx.setNavigationBarTitle({
        title: '添加日程'
      });
    }
    
    // 加载来访者数据
    this.loadClients();
    
    // 初始化时间（调整为拆分日期+时间）
    this.initTime();
    
    // 设置初始文本
    this.updateTypeText();
    this.updateRemindText();
  },

  onReady() {
    this.watchFormData();
  },

  watchFormData() {
    this.setData({
      showClientField: this.data.formData.scheduleType === 1
    });
  },

  loadScheduleData(scheduleId) {
    setTimeout(() => {
      const mockSchedule = this.getMockSchedule(scheduleId);
      
      // 转换数据格式：拆分日期和时间
      const scheduleTypeIndex = this.data.scheduleTypes.findIndex(item => item.value === mockSchedule.scheduleType);
      const remindTypeIndex = this.data.remindTypes.findIndex(item => item.value === mockSchedule.remindType);
      const clientIndex = mockSchedule.clientId ? 
        this.data.clients.findIndex(client => client.id === mockSchedule.clientId) : -1;
      
      // 拆分开始时间
      const [startDate, startTime] = mockSchedule.startTime.split(' ');
      const startDateText = this.formatDate(startDate);
      // 拆分结束时间
      const [endDate, endTime] = mockSchedule.endTime.split(' ');
      const endDateText = this.formatDate(endDate);
      
      this.setData({
        'formData.title': mockSchedule.title,
        'formData.scheduleType': mockSchedule.scheduleType,
        'formData.scheduleTypeIndex': scheduleTypeIndex,
        'formData.clientId': mockSchedule.clientId,
        'formData.clientName': mockSchedule.clientName,
        'formData.clientIndex': clientIndex,
        // 赋值拆分后的开始时间
        'formData.startDate': startDate,
        'formData.startDateText': startDateText,
        'formData.startTime': startTime,
        'formData.startTimeText': startTime,
        // 赋值拆分后的结束时间
        'formData.endDate': endDate,
        'formData.endDateText': endDateText,
        'formData.endTime': endTime,
        'formData.endTimeText': endTime,
        // 原有字段不变
        'formData.location': mockSchedule.location || '',
        'formData.description': mockSchedule.description || '',
        'formData.color': mockSchedule.color,
        'formData.remindType': mockSchedule.remindType,
        'formData.remindTypeIndex': remindTypeIndex,
        'formData.isRecurring': mockSchedule.isRecurring || false
      });
      
      this.updateTypeText();
      this.updateRemindText();
    }, 300);
  },

  getMockSchedule(id) {
    const mockSchedules = {
      '1': {
        id: 1,
        title: '个体咨询 - 王小明',
        scheduleType: 1,
        clientId: 1,
        clientName: '王小明',
        startTime: '2024-01-20 14:30',
        endTime: '2024-01-20 15:20',
        location: '咨询室A',
        description: '继续讨论工作压力管理，进行放松训练。',
        color: '#1890ff',
        remindType: 4,
        isRecurring: true,
        recurringType: 'weekly',
        recurringDays: [1, 3, 5],
        recurringEndDate: '2024-06-30'
      },
      '2': {
        id: 2,
        title: '团体督导',
        scheduleType: 2,
        startTime: '2024-01-21 10:00',
        endTime: '2024-01-21 12:00',
        location: '督导会议室',
        description: '讨论近期困难案例',
        color: '#52c41a',
        remindType: 6,
        isRecurring: false
      }
    };
    
    return mockSchedules[id] || mockSchedules['1'];
  },

  loadClients() {
    setTimeout(() => {
      const mockClients = [
        { id: 1, name: '王小明', clientNo: 'C2024001' },
        { id: 2, name: '李小红', clientNo: 'C2024002' },
        { id: 3, name: '张伟', clientNo: 'C2024003' },
        { id: 4, name: '刘芳', clientNo: 'C2024004' },
        { id: 5, name: '陈勇', clientNo: 'C2024005' }
      ];
      
      this.setData({
        clients: mockClients
      });
    }, 200);
  },

  // 初始化时间：拆分日期+时间（核心修改）
  initTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    const todayText = this.formatDate(today);
    
    // 默认开始时间：当前时间的下一个整点或半点
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const defaultStartHour = (currentMinute < 30 ? currentHour : currentHour + 1).toString().padStart(2, '0');
    const defaultStartTime = `${defaultStartHour}:30`;
    
    // 默认结束时间：开始时间+50分钟
    const startDate = new Date(`${today} ${defaultStartTime}`);
    startDate.setMinutes(startDate.getMinutes() + 50);
    const endHour = startDate.getHours().toString().padStart(2, '0');
    const endMinute = startDate.getMinutes().toString().padStart(2, '0');
    const defaultEndTime = `${endHour}:${endMinute}`;
    
    this.setData({
      // 开始时间
      'formData.startDate': this.data.formData.startDate || today,
      'formData.startDateText': this.data.formData.startDateText || todayText,
      'formData.startTime': this.data.formData.startTime || defaultStartTime,
      'formData.startTimeText': this.data.formData.startTimeText || defaultStartTime,
      // 结束时间
      'formData.endDate': this.data.formData.endDate || today,
      'formData.endDateText': this.data.formData.endDateText || todayText,
      'formData.endTime': this.data.formData.endTime || defaultEndTime,
      'formData.endTimeText': this.data.formData.endTimeText || defaultEndTime
    });
    
    console.log('初始化时间完成:', {
      startDate: today,
      startTime: defaultStartTime,
      endDate: today,
      endTime: defaultEndTime
    });
  },

  // 格式化日期：YYYY-MM-DD → X月X日
  formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${parseInt(month)}月${parseInt(day)}日`;
  },

  // 开始日期选择事件
  onStartDateChange(e) {
    const selectedDate = e.detail.value;
    const dateText = this.formatDate(selectedDate);
    this.setData({
      'formData.startDate': selectedDate,
      'formData.startDateText': dateText
    });
    // 若结束日期早于开始日期，自动同步结束日期
    if (this.data.formData.endDate && new Date(this.data.formData.endDate) < new Date(selectedDate)) {
      this.setData({
        'formData.endDate': selectedDate,
        'formData.endDateText': dateText
      });
    }
  },

  // 开始时间选择事件
  onStartTimeChangeSingle(e) {
    const selectedTime = e.detail.value;
    this.setData({
      'formData.startTime': selectedTime,
      'formData.startTimeText': selectedTime
    });
    // 自动校验结束时间
    this.checkEndTime();
  },

  // 结束日期选择事件
  onEndDateChange(e) {
    const selectedDate = e.detail.value;
    const dateText = this.formatDate(selectedDate);
    this.setData({
      'formData.endDate': selectedDate,
      'formData.endDateText': dateText
    });
    // 自动校验结束时间
    this.checkEndTime();
  },

  // 结束时间选择事件
  onEndTimeChangeSingle(e) {
    const selectedTime = e.detail.value;
    this.setData({
      'formData.endTime': selectedTime,
      'formData.endTimeText': selectedTime
    });
    // 自动校验结束时间
    this.checkEndTime();
  },

  // 校验结束时间是否晚于开始时间
  checkEndTime() {
    const { startDate, startTime, endDate, endTime } = this.data.formData;
    if (!startDate || !startTime || !endDate || !endTime) return;
    
    const startFullTime = `${startDate} ${startTime}`;
    const endFullTime = `${endDate} ${endTime}`;
    
    if (new Date(endFullTime) <= new Date(startFullTime)) {
      wx.showToast({
        title: '结束时间需晚于开始时间',
        icon: 'none'
      });
    }
  },

  updateTypeText() {
    const index = this.data.formData.scheduleTypeIndex;
    if (index >= 0 && this.data.scheduleTypes[index]) {
      this.setData({
        'formData.scheduleTypeText': this.data.scheduleTypes[index].label
      });
    }
  },

  updateRemindText() {
    const index = this.data.formData.remindTypeIndex;
    if (index >= 0 && this.data.remindTypes[index]) {
      this.setData({
        'formData.remindTypeText': this.data.remindTypes[index].label
      });
    }
  },

  // 原有事件不变
  onTypeChange(e) {
    const index = e.detail.value;
    const selectedType = this.data.scheduleTypes[index];
    
    this.setData({
      'formData.scheduleType': selectedType.value,
      'formData.scheduleTypeIndex': index,
      'formData.scheduleTypeText': selectedType.label,
      'formData.color': selectedType.color
    });
    
    this.watchFormData();
  },

  onClientChange(e) {
    const index = e.detail.value;
    if (index >= 0 && this.data.clients[index]) {
      const selectedClient = this.data.clients[index];
      this.setData({
        'formData.clientId': selectedClient.id,
        'formData.clientName': selectedClient.name,
        'formData.clientIndex': index,
        'formData.title': `${this.data.scheduleTypes[this.data.formData.scheduleTypeIndex].label} - ${selectedClient.name}`
      });
    } else {
      this.setData({
        'formData.clientId': null,
        'formData.clientName': '',
        'formData.clientIndex': -1
      });
    }
  },

  onColorSelect(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({
      'formData.color': color
    });
  },

  onRemindTypeChange(e) {
    const index = e.detail.value;
    const selectedRemind = this.data.remindTypes[index];
    
    this.setData({
      'formData.remindType': selectedRemind.value,
      'formData.remindTypeIndex': index,
      'formData.remindTypeText': selectedRemind.label
    });
  },

  onRecurringChange(e) {
    this.setData({
      'formData.isRecurring': e.detail.value
    });
  },

  setRecurringType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      'formData.recurringType': type
    });
  },

  toggleWeekDay(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const days = [...(this.data.formData.recurringDays || [])];
    
    if (days.includes(index)) {
      const dayIndex = days.indexOf(index);
      days.splice(dayIndex, 1);
    } else {
      days.push(index);
      days.sort((a, b) => a - b);
    }
    
    this.setData({
      'formData.recurringDays': days
    });
  },

  onMonthDayChange(e) {
    const day = parseInt(e.detail.value) + 1;
    this.setData({
      'formData.recurringDayOfMonth': day
    });
  },

  onRecurringEndChange(e) {
    const date = e.detail.value;
    this.setData({
      'formData.recurringEndDate': date,
      'formData.recurringEndDateText': date ? this.formatDate(date) : ''
    });
  },

  onFormSubmit(e) {
    const formData = e.detail.value;
    // 合并开始/结束时间为 YYYY-MM-DD HH:mm
    const startFullTime = `${this.data.formData.startDate} ${this.data.formData.startTime}`;
    const endFullTime = `${this.data.formData.endDate} ${this.data.formData.endTime}`;
    
    // 验证必填字段
    if (!formData.title || !formData.title.trim()) {
      wx.showToast({
        title: '请填写日程标题',
        icon: 'none'
      });
      return;
    }
    
    if (!startFullTime) {
      wx.showToast({
        title: '请选择开始时间',
        icon: 'none'
      });
      return;
    }
    
    if (!endFullTime) {
      wx.showToast({
        title: '请选择结束时间',
        icon: 'none'
      });
      return;
    }
    
    // 验证时间逻辑
    if (new Date(endFullTime) <= new Date(startFullTime)) {
      wx.showToast({
        title: '结束时间必须晚于开始时间',
        icon: 'none'
      });
      return;
    }
    
    // 准备提交数据
    const submitData = {
      ...formData,
      scheduleType: this.data.formData.scheduleType,
      clientId: this.data.formData.clientId,
      startTime: startFullTime,  // 合并后的开始时间
      endTime: endFullTime,      // 合并后的结束时间
      color: this.data.formData.color,
      remindType: this.data.formData.remindType,
      isRecurring: this.data.formData.isRecurring,
      recurringType: this.data.formData.recurringType,
      recurringDays: this.data.formData.recurringDays,
      recurringDayOfMonth: this.data.formData.recurringDayOfMonth,
      recurringEndDate: this.data.formData.recurringEndDate
    };
    
    console.log('提交的日程数据:', submitData);
    
    // 模拟API调用
    wx.showLoading({
      title: '保存中...',
    });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: this.data.isEditMode ? '更新成功' : '添加成功',
        icon: 'success',
        duration: 1500,
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
    }, 800);
  },

  onCancel() {
    wx.navigateBack();
  }
});