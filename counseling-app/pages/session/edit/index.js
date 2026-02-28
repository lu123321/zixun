// pages/session/edit/index.js
const app = getApp();
const utils = require('../../../utils/util.js');
const mockApi = require('../../../utils/mockData.js').mockApi;

Page({
  data: {
    // 页面模式：添加 or 编辑
    isEditMode: false,
    sessionId: null,
    
    // 选中的来访者
    selectedClient: null,
    
    // 表单数据
    formData: {
      // 来访者信息
      clientId: null,
      
      // 咨询时间
      sessionTime: null,
      startTime: null,
      duration: 50, // 默认50分钟
      
      // 咨询设置
      sessionType: 1, // 1=个体咨询
      sessionMode: 1, // 1=面对面
      location: '',
      fee: '',
      
      // 督导信息
      hasSupervision: false,
      supervisionType: null,
      supervisionFee: '',
      
      // 咨询记录
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      contentSummary: '',
      homework: '',
      nextPlan: '',
      
      // 同步设置
      syncToSchedule: true,
      remindTime: 3, // 提前15分钟提醒
    },
    
    // 选项数据
    sessionTypes: [
      { id: 1, name: '个体咨询' },
      { id: 2, name: '家庭治疗' },
      { id: 3, name: '团体咨询' },
      { id: 4, name: '督导' }
    ],
    
    sessionModes: [
      { id: 1, name: '面对面' },
      { id: 2, name: '视频' },
      { id: 3, name: '电话' }
    ],
    
    supervisionTypes: [
      { id: 1, name: '个体督导' },
      { id: 2, name: '团体督导' }
    ],
    
    remindOptions: [
      { value: 1, label: '不提醒' },
      { value: 2, label: '开始时' },
      { value: 3, label: '提前15分钟' },
      { value: 4, label: '提前30分钟' },
      { value: 5, label: '提前1小时' },
      { value: 6, label: '提前1天' }
    ],
    
    // 附件
    imageAttachments: [],
    fileAttachments: [],
    audioAttachments: [],
    
    // 验证状态
    isFormValid: false,
    
    // 加载状态
    loading: false,
    
    // 临时数据
    tempDate: '',
    tempTime: ''
  },

  onLoad(options) {
    console.log('页面参数:', options);
    
    // 检查参数
    const { id, clientId, type, date } = options || {};
    
    // 设置页面模式
    if (id) {
      this.setData({
        isEditMode: true,
        sessionId: id
      });
      this.loadSessionData(id);
    }
    
    // 如果有来访者ID，预选择来访者
    if (clientId) {
      this.preSelectClient(clientId);
    }
    
    // 快速记录模式
    if (type === 'quick') {
      this.setupQuickMode();
    }
    
    // 预选日期
    if (date) {
      this.setData({
        'formData.sessionTime': date,
        tempDate: date
      });
    }
    
    // 初始化表单验证
    this.validateForm();
  },

  onReady() {
    // 页面加载完成
  },

  onShow() {
    // 页面显示时检查来访者选择
    const selectedClient = wx.getStorageSync('selectedClient');
    if (selectedClient) {
      wx.removeStorageSync('selectedClient');
      this.setData({
        selectedClient: selectedClient,
        'formData.clientId': selectedClient.id
      });
      this.validateForm();
    }

  },

  // 加载会话数据（编辑模式）
  async loadSessionData(id) {
    app.showLoading('加载中...');
    
    try {
      // 模拟加载会话数据
      const result = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            code: 200,
            data: {
              id: id,
              clientId: 1,
              clientName: '李小明',
              sessionTime: '2024-03-25',
              startTime: '2024-03-25 14:00:00',
              duration: 50,
              sessionType: 1,
              sessionMode: 1,
              location: '咨询室A',
              fee: '500',
              hasSupervision: false,
              supervisionType: null,
              supervisionFee: '',
              subjective: '来访者表示最近工作压力较大',
              objective: '来访者显得疲惫，语速较快',
              assessment: '可能存在轻度焦虑',
              plan: '建议学习放松技巧',
              contentSummary: '讨论了工作压力问题',
              homework: '每天练习深呼吸10分钟',
              nextPlan: '下次继续讨论放松技巧',
              syncToSchedule: true,
              remindTime: 3,
              attachments: []
            }
          });
        }, 500);
      });
      
      if (result.code === 200) {
        const session = result.data;
        
        // 设置表单数据
        this.setData({
          'formData.clientId': session.clientId,
          'formData.sessionTime': session.sessionTime,
          'formData.startTime': session.startTime,
          'formData.duration': session.duration,
          'formData.sessionType': session.sessionType,
          'formData.sessionMode': session.sessionMode,
          'formData.location': session.location || '',
          'formData.fee': session.fee || '',
          'formData.hasSupervision': session.hasSupervision || false,
          'formData.supervisionType': session.supervisionType,
          'formData.supervisionFee': session.supervisionFee || '',
          'formData.subjective': session.subjective || '',
          'formData.objective': session.objective || '',
          'formData.assessment': session.assessment || '',
          'formData.plan': session.plan || '',
          'formData.contentSummary': session.contentSummary || '',
          'formData.homework': session.homework || '',
          'formData.nextPlan': session.nextPlan || '',
          'formData.syncToSchedule': session.syncToSchedule !== false,
          'formData.remindTime': session.remindTime || 3
        });
        
        // 预选择来访者
        if (session.clientId) {
          this.preSelectClient(session.clientId);
        }
        
        // 验证表单
        this.validateForm();
      }
    } catch (error) {
      console.error('加载会话数据失败:', error);
      app.showError('加载失败');
    } finally {
      app.hideLoading();
    }
  },

  // 预选择来访者
  async preSelectClient(clientId) {
    try {
      const result = await mockApi.getClientDetail(clientId);
      if (result.code === 200) {
        this.setData({
          selectedClient: result.data,
          'formData.clientId': clientId
        });
        this.validateForm();
      }
    } catch (error) {
      console.error('预选择来访者失败:', error);
    }
  },

  // 快速记录模式设置
  setupQuickMode() {
    const now = new Date();
    const today = utils.formatDate(now, 'yyyy-MM-dd');
    const time = utils.formatDate(now, 'HH:mm');
    
    this.setData({
      'formData.sessionTime': today,
      'formData.startTime': today + ' ' + time + ':00',
      tempDate: today,
      tempTime: time
    });
    
    this.validateForm();
  },

  // 检查来访者选择
  checkClientSelection() {
    // 检查是否有从来访者页面传递的选择
    const selectedClient = wx.getStorageSync('selectedClient');
    if (selectedClient && (!this.data.selectedClient || selectedClient.id !== this.data.selectedClient.id)) {
      wx.removeStorageSync('selectedClient');
      this.setData({
        selectedClient: selectedClient,
        'formData.clientId': selectedClient.id
      });
      this.validateForm();
    }
  },

  // ==================== 表单验证 ====================
  
  validateForm() {
    const { formData, selectedClient } = this.data;
    
    // 基本验证规则
    let isValid = true;
    
    // 1. 来访者必选
    if (!selectedClient || !formData.clientId) {
      isValid = false;
    }
    
    // 2. 咨询时间必填
    if (!formData.sessionTime || !formData.startTime) {
      isValid = false;
    }
    
    // 3. 咨询费用必填
    if (!formData.fee || parseFloat(formData.fee) <= 0) {
      isValid = false;
    }
    
    this.setData({ isFormValid: isValid });
  },

  // ==================== 格式化函数 ====================
  
  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  },

  formatTime(timeStr) {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  },

  formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  },

  formatDuration(seconds) {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  // ==================== 事件处理函数 ====================
  
  // 选择来访者
  onSelectClient() {
    wx.navigateTo({
      url: '/pages/client/select/index?from=session'
    });
  },
  

  // 选择日期
  onSelectDate() {
    const currentDate = this.data.formData.sessionTime || utils.formatDate(new Date(), 'yyyy-MM-dd');
    
    wx.showDatePicker({
      currentDate: currentDate,
      startDate: '2020-01-01',
      endDate: '2030-12-31',
      success: (res) => {
        const dateStr = res.date;
        this.setData({
          'formData.sessionTime': dateStr,
          tempDate: dateStr
        });
        this.updateStartTime();
        this.validateForm();
      }
    });
  },

  // 选择时间
  onSelectTime() {
    const currentTime = this.data.tempTime || '09:00';
    
    wx.showTimePicker({
      value: currentTime,
      success: (res) => {
        const timeStr = `${res.hour.toString().padStart(2, '0')}:${res.minute.toString().padStart(2, '0')}`;
        this.setData({ tempTime: timeStr });
        this.updateStartTime();
        this.validateForm();
      }
    });
  },

  // 更新时间
  updateStartTime() {
    const { tempDate, tempTime } = this.data;
    if (tempDate && tempTime) {
      const startTime = `${tempDate} ${tempTime}:00`;
      this.setData({
        'formData.startTime': startTime
      });
    }
  },

  // 选择持续时间
  onSelectDuration(e) {
    const duration = parseInt(e.currentTarget.dataset.duration);
    this.setData({
      'formData.duration': duration
    });
  },

  // 自定义持续时间
  onCustomDuration() {
    // 激活自定义输入
  },

  onCustomDurationInput(e) {
    const value = parseInt(e.detail.value);
    if (value && value > 0 && value <= 480) { // 最多8小时
      this.setData({
        'formData.duration': value
      });
    } else if (value === 0) {
      this.setData({
        'formData.duration': ''
      });
    }
  },

  onDurationBlur(e) {
    const value = parseInt(e.detail.value);
    if (!value || value <= 0) {
      this.setData({
        'formData.duration': 50
      });
    } else if (value > 480) {
      this.setData({
        'formData.duration': 480
      });
    }
  },

  // 选择咨询类型
  onSelectSessionType(e) {
    const type = parseInt(e.currentTarget.dataset.type);
    this.setData({
      'formData.sessionType': type
    });
  },

  // 选择咨询方式
  onSelectSessionMode(e) {
    const mode = parseInt(e.currentTarget.dataset.mode);
    this.setData({
      'formData.sessionMode': mode
    });
  },

  // 地点输入
  onLocationInput(e) {
    const value = e.detail.value;
    this.setData({
      'formData.location': value
    });
  },

  // 费用输入
  onFeeInput(e) {
    const value = e.detail.value;
    this.setData({
      'formData.fee': value
    });
    this.validateForm();
  },

  // 督导开关
  onSupervisionToggle(e) {
    const checked = e.detail.value;
    this.setData({
      'formData.hasSupervision': checked,
      'formData.supervisionType': checked ? 1 : null,
      'formData.supervisionFee': checked ? '' : ''
    });
  },

  // 选择督导类型
  onSelectSupervisionType(e) {
    const type = parseInt(e.currentTarget.dataset.type);
    this.setData({
      'formData.supervisionType': type
    });
  },

  // 督导费用输入
  onSupervisionFeeInput(e) {
    const value = e.detail.value;
    this.setData({
      'formData.supervisionFee': value
    });
  },

  // SOAP输入
  onSubjectiveInput(e) {
    this.setData({
      'formData.subjective': e.detail.value
    });
  },

  onObjectiveInput(e) {
    this.setData({
      'formData.objective': e.detail.value
    });
  },

  onAssessmentInput(e) {
    this.setData({
      'formData.assessment': e.detail.value
    });
  },

  onPlanInput(e) {
    this.setData({
      'formData.plan': e.detail.value
    });
  },

  // 内容摘要输入
  onContentSummaryInput(e) {
    this.setData({
      'formData.contentSummary': e.detail.value
    });
  },

  // 家庭作业输入
  onHomeworkInput(e) {
    this.setData({
      'formData.homework': e.detail.value
    });
  },

  // 下次计划输入
  onNextPlanInput(e) {
    this.setData({
      'formData.nextPlan': e.detail.value
    });
  },

  // 附件处理
  onAddImage() {
    wx.chooseImage({
      count: 9 - this.data.imageAttachments.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFilePaths.map((path, index) => ({
          id: Date.now() + index,
          path: path,
          type: 'image'
        }));
        
        this.setData({
          imageAttachments: [...this.data.imageAttachments, ...newImages]
        });
      }
    });
  },

  onPreviewImage(e) {
    const index = e.currentTarget.dataset.index;
    const urls = this.data.imageAttachments.map(item => item.path);
    wx.previewImage({
      current: urls[index],
      urls: urls
    });
  },

  onRemoveImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.imageAttachments];
    images.splice(index, 1);
    this.setData({ imageAttachments: images });
  },

  onAddFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        const file = res.tempFiles[0];
        const newFile = {
          id: Date.now(),
          name: file.name,
          path: file.path,
          size: file.size,
          type: 'file'
        };
        
        this.setData({
          fileAttachments: [...this.data.fileAttachments, newFile]
        });
      }
    });
  },

  onPreviewFile(e) {
    const index = e.currentTarget.dataset.index;
    const file = this.data.fileAttachments[index];
    wx.openDocument({
      filePath: file.path,
      success: () => {
        console.log('打开文档成功');
      }
    });
  },

  onRemoveFile(e) {
    const index = e.currentTarget.dataset.index;
    const files = [...this.data.fileAttachments];
    files.splice(index, 1);
    this.setData({ fileAttachments: files });
  },

  onAddAudio() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['mp3', 'wav', 'm4a'],
      success: (res) => {
        const file = res.tempFiles[0];
        const newAudio = {
          id: Date.now(),
          name: file.name,
          path: file.path,
          size: file.size,
          duration: 0, // 需要额外解析
          type: 'audio'
        };
        
        this.setData({
          audioAttachments: [...this.data.audioAttachments, newAudio]
        });
      }
    });
  },

  onPlayAudio(e) {
    const index = e.currentTarget.dataset.index;
    const audio = this.data.audioAttachments[index];
    
    // 创建音频上下文
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = audio.path;
    audioContext.play();
  },

  onRemoveAudio(e) {
    const index = e.currentTarget.dataset.index;
    const audios = [...this.data.audioAttachments];
    audios.splice(index, 1);
    this.setData({ audioAttachments: audios });
  },

  // 同步开关
  onSyncToggle(e) {
    const checked = e.detail.value;
    this.setData({
      'formData.syncToSchedule': checked
    });
  },

  // 选择提醒时间
  onSelectRemindTime(e) {
    const value = parseInt(e.currentTarget.dataset.value);
    this.setData({
      'formData.remindTime': value
    });
  },

  // 滚动处理
  onScroll() {
    // 处理滚动到底部
  },

  // ==================== 表单操作 ====================
  
  // 保存草稿
  onSaveDraft() {
    const draftData = {
      formData: this.data.formData,
      selectedClient: this.data.selectedClient,
      attachments: {
        images: this.data.imageAttachments,
        files: this.data.fileAttachments,
        audios: this.data.audioAttachments
      },
      saveTime: new Date().toISOString()
    };
    
    wx.setStorageSync('sessionDraft', draftData);
    app.showSuccess('草稿已保存');
  },

  // 取消
  onCancel() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消编辑吗？未保存的内容将丢失。',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          // 检查是否有草稿
          const hasDraft = wx.getStorageSync('sessionDraft');
          if (hasDraft) {
            wx.showModal({
              title: '发现草稿',
              content: '您有未提交的草稿，是否删除？',
              success: (res) => {
                if (res.confirm) {
                  wx.removeStorageSync('sessionDraft');
                }
                wx.navigateBack();
              }
            });
          } else {
            wx.navigateBack();
          }
        }
      }
    });
  },

  // 提交表单
  onSubmit() {
    // 验证表单
    if (!this.data.isFormValid) {
      app.showError('请填写完整信息');
      return;
    }

    // 确认提交
    wx.showModal({
      title: '确认保存',
      content: this.data.isEditMode ? '确定要更新咨询记录吗？' : '确定要保存咨询记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.saveSession();
        }
      }
    });
  },

  // 保存会话
  async saveSession() {
    this.setData({ loading: true });
    
    try {
      // 准备数据
      const sessionData = {
        ...this.data.formData,
        clientId: this.data.selectedClient.id,
        clientName: this.data.selectedClient.name,
        // 计算结束时间
        endTime: this.calculateEndTime(),
        attachments: {
          images: this.data.imageAttachments,
          files: this.data.fileAttachments,
          audios: this.data.audioAttachments
        }
      };
      
      // 移除空值
      Object.keys(sessionData).forEach(key => {
        if (sessionData[key] === null || sessionData[key] === '') {
          delete sessionData[key];
        }
      });
      
      // 模拟API调用
      const result = await mockApi.addSession(sessionData);
      
      if (result.code === 200) {
        // 清除草稿
        wx.removeStorageSync('sessionDraft');
        
        // 显示成功消息
        app.showSuccess(this.data.isEditMode ? '更新成功' : '保存成功');
        
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.message || '保存失败');
      }
      
    } catch (error) {
      console.error('保存失败:', error);
      app.showError(error.message || '保存失败，请重试');
    } finally {
      this.setData({ loading: false });
    }
  },

  // 计算结束时间
  calculateEndTime() {
    const { startTime, duration } = this.data.formData;
    if (!startTime || !duration) return null;
    
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000); // 转换为毫秒
    
    return end.toISOString();
  }
});