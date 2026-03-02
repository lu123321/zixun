// pages/session/edit/index.js
const app = getApp();
const utils = require('../../../utils/util.js');
const api = require('../../../utils/api.js');

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
    tempTime: '',
    sessionDateDisplay: '',
    sessionTimeDisplay: ''
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
        tempDate: date,
        sessionDateDisplay: this.formatDate(date)
      });
    }
    
    // 初始化展示与表单验证
    this.syncTimeDisplay();
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
      const result = await api.get(`/api/session/detail/${id}`);
      if (result.code !== 200 || !result.data) {
        throw new Error(result.msg || '加载失败');
      }

      const session = result.data;
      const sessionTime = session.sessionTime ? utils.formatDate(session.sessionTime, 'yyyy-MM-dd') : '';
      const startTime = session.sessionTime ? utils.formatDate(session.sessionTime, 'yyyy-MM-dd HH:mm:ss') : '';
      const parsedAttachments = this.parseAttachments(session.attachments);

      this.setData({
        'formData.clientId': session.clientId,
        'formData.sessionTime': sessionTime,
        'formData.startTime': startTime,
        'formData.duration': session.duration || 50,
        'formData.sessionType': session.sessionType || 1,
        'formData.sessionMode': session.sessionMode || 1,
        'formData.location': session.location || '',
        'formData.fee': session.fee != null ? String(session.fee) : '',
        'formData.hasSupervision': Number(session.hasSupervision) === 1,
        'formData.supervisionType': session.supervisionType,
        'formData.supervisionFee': session.supervisionFee != null ? String(session.supervisionFee) : '',
        'formData.subjective': session.subjective || '',
        'formData.objective': session.objective || '',
        'formData.assessment': session.assessment || '',
        'formData.plan': session.plan || '',
        'formData.contentSummary': session.contentSummary || '',
        'formData.homework': session.homework || '',
        'formData.nextPlan': session.nextPlan || '',
        'formData.syncToSchedule': session.syncToSchedule !== false,
        'formData.remindTime': session.remindTime || 3,
        tempDate: sessionTime,
        tempTime: startTime ? startTime.slice(11, 16) : '',
        sessionDateDisplay: sessionTime ? this.formatDate(sessionTime) : '',
        sessionTimeDisplay: startTime ? this.formatTime(startTime) : '',
        imageAttachments: parsedAttachments.images,
        fileAttachments: parsedAttachments.files,
        audioAttachments: parsedAttachments.audios
      });

      if (session.clientId) {
        this.preSelectClient(session.clientId);
      }

      this.validateForm();
    } catch (error) {
      console.error('加载会话数据失败:', error);
      app.showError(error.message || '加载失败');
    } finally {
      app.hideLoading();
    }
  },

  parseAttachments(attachments) {
    const empty = { images: [], files: [], audios: [] };
    if (!attachments) return empty;

    try {
      const parsed = typeof attachments === 'string' ? JSON.parse(attachments) : attachments;
      if (!parsed || typeof parsed !== 'object') return empty;
      if (Array.isArray(parsed)) {
        return { images: [], files: parsed, audios: [] };
      }
      return {
        images: Array.isArray(parsed.images) ? parsed.images : [],
        files: Array.isArray(parsed.files) ? parsed.files : [],
        audios: Array.isArray(parsed.audios) ? parsed.audios : []
      };
    } catch (e) {
      return empty;
    }
  },

  // 预选择来访者
  async preSelectClient(clientId) {
    try {
      const result = await api.get(`/api/client/detail/${clientId}`);
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
      tempTime: time,
      sessionDateDisplay: this.formatDate(today),
      sessionTimeDisplay: this.formatTime(time)
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

  syncTimeDisplay() {
    const { sessionTime, startTime } = this.data.formData;
    const dateText = sessionTime ? this.formatDate(sessionTime) : '';
    const timeText = startTime ? this.formatTime(startTime) : (this.data.tempTime ? this.formatTime(this.data.tempTime) : '');

    this.setData({
      sessionDateDisplay: dateText,
      sessionTimeDisplay: timeText
    });
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
    if (!dateStr || typeof dateStr !== 'string') return '';
    const datePart = dateStr.includes(' ') ? dateStr.split(' ')[0] : dateStr;
    const parts = datePart.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${year}年${parseInt(month, 10)}月${parseInt(day, 10)}日`;
  },

  formatTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return '';
    if (timeStr.includes(' ')) {
      return timeStr.split(' ')[1].slice(0, 5);
    }
    return timeStr.slice(0, 5);
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
  onDateChange(e) {
    const dateStr = e.detail.value;
    this.setData({
      'formData.sessionTime': dateStr,
      tempDate: dateStr,
      sessionDateDisplay: this.formatDate(dateStr)
    });
    this.updateStartTime();
    this.validateForm();
  },

  // 选择时间
  onTimeChange(e) {
    const timeStr = e.detail.value;
    this.setData({
      tempTime: timeStr,
      sessionTimeDisplay: this.formatTime(timeStr)
    });
    this.updateStartTime();
    this.validateForm();
  },

  // 更新时间
  updateStartTime() {
    const { tempDate, tempTime } = this.data;
    if (tempDate && tempTime) {
      const startTime = `${tempDate} ${tempTime}:00`;
      this.setData({
        'formData.startTime': startTime,
        sessionDateDisplay: this.formatDate(tempDate),
        sessionTimeDisplay: this.formatTime(tempTime)
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
      // 准备数据（对齐后端 /api/session/create）
      const attachments = {
        images: this.data.imageAttachments,
        files: this.data.fileAttachments,
        audios: this.data.audioAttachments
      };
      const sessionData = {
        clientId: this.data.selectedClient.id,
        startTime: this.data.formData.startTime,
        duration: Number(this.data.formData.duration) || 50,
        sessionType: Number(this.data.formData.sessionType),
        sessionMode: Number(this.data.formData.sessionMode),
        fee: this.data.formData.fee ? Number(this.data.formData.fee) : null,
        hasSupervision: this.data.formData.hasSupervision ? 1 : 0,
        supervisionType: this.data.formData.supervisionType,
        supervisionFee: this.data.formData.supervisionFee ? Number(this.data.formData.supervisionFee) : null,
        contentSummary: this.data.formData.contentSummary,
        homework: this.data.formData.homework,
        nextPlan: this.data.formData.nextPlan,
        subjective: this.data.formData.subjective,
        objective: this.data.formData.objective,
        assessment: this.data.formData.assessment,
        plan: this.data.formData.plan,
        attachments: JSON.stringify(attachments)
      };

      // 移除空值
      Object.keys(sessionData).forEach(key => {
        if (sessionData[key] === null || sessionData[key] === '') {
          delete sessionData[key];
        }
      });

      const result = await api.post('/api/session/create', sessionData);
      
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
        throw new Error(result.msg || result.message || '保存失败');
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