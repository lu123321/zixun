// pages/client/edit/index.js
const app = getApp();
const utils = require('../../../utils/util.js');
const validate = require('../../../utils/validate.js');
const api = require('../../../utils/api.js');

Page({
  data: {
    // 新增这一行：提前计算当前日期，供WXML绑定
    currentDate: utils.formatDate(new Date(), 'yyyy-MM-dd'),
    // 页面模式
    isEditMode: false,
    clientId: null,
    fromPage: '',
    
    // 表单数据
    formData: {
      // 基本信息
      name: '',
      gender: 0,
      age: '',
      birthDate: '',
      
      // 联系信息
      contactPhone: '',
      email: '',
      emergencyContact: '',
      emergencyPhone: '',
      
      // 咨询信息
      startDate: '',
      status: 1, // 1=进行中
      endDate: '',
      
      // 标签
      tags: [],
      
      // 备注信息
      remark: '',
      diagnosis: '',
      treatmentPlan: ''
    },
    
    // 表单验证错误
    formErrors: {},
    
    // 验证状态
    isFormValid: false,
    
    // 选项数据
    genderOptions: [
      { value: 0, label: '未知' },
      { value: 1, label: '男' },
      { value: 2, label: '女' }
    ],
    
    statusOptions: [
      { value: 1, label: '进行中', color: '#52c41a' },
      { value: 2, label: '已结案', color: '#1890ff' },
      { value: 3, label: '中断', color: '#faad14' },
      { value: 4, label: '转介', color: '#666666' }
    ],
    
    // 标签管理
    commonTags: [
      '焦虑', '抑郁', '压力', '关系', '亲子',
      '职场', '情绪', '睡眠', '创伤', '社交'
    ],
    customTags: [],
    selectedTags: {},
    newTagInput: '',
    
    // 加载状态
    loading: false
  },

  onLoad(options) {
    console.log('来访者编辑页参数:', options);
    
    // 解析参数
    const { id, from } = options || {};
    
    // 设置页面模式
    if (id) {
      this.setData({
        isEditMode: true,
        clientId: id,
        fromPage: from || ''
      });
      
      // 加载来访者数据
      this.loadClientData(id);
    } else {
      this.setData({
        isEditMode: false,
        fromPage: from || ''
      });
      
      // 设置默认值
      this.setDefaultValues();
    }
    
    // 初始化表单验证
    this.validateForm();
  },

  onShow() {
    // 页面显示时，如果有需要可以刷新数据
  },

  // 加载来访者数据（编辑模式）
  async loadClientData(id) {
    app.showLoading('加载中...');
    
    try {
      // 调用真实详情接口：GET /api/client/detail/{id}
      const result = await api.get(`/api/client/detail/${id}`);
      
      if (result.code === 200) {
        const clientData = result.data;
        
        // 原有标签处理逻辑不变...
        const tags = clientData.tags || [];
        const selectedTags = {};
        const customTags = [];
        
        tags.forEach(tag => {
          if (this.data.commonTags.includes(tag)) {
            selectedTags[tag] = true;
          } else {
            customTags.push(tag);
          }
        });
        
        // 设置表单数据（原有逻辑不变，字段完全匹配）
        this.setData({
          'formData.name': clientData.name || '',
          'formData.gender': clientData.gender || null,
          'formData.age': clientData.age || '',
          'formData.birthDate': clientData.birthDate || '',
          'formData.contactPhone': clientData.contactPhone || '',
          'formData.email': clientData.email || '',
          'formData.emergencyContact': clientData.emergencyContact || '',
          'formData.emergencyPhone': clientData.emergencyPhone || '',
          'formData.startDate': clientData.startDate || '',
          'formData.status': clientData.status || 1,
          'formData.endDate': clientData.endDate || '',
          'formData.remark': clientData.remark || '',
          'formData.diagnosis': clientData.diagnosis || '',
          'formData.treatmentPlan': clientData.treatmentPlan || '',
          customTags: customTags,
          selectedTags: selectedTags
        });
        
        this.validateForm();
      } else {
        wx.showToast({
          title: result.msg || '加载失败',
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
      app.hideLoading();
    }
  },

  // 设置默认值
  setDefaultValues() {
    const today = utils.formatDate(new Date(), 'yyyy-MM-dd');
    
    this.setData({
      'formData.startDate': today,
      'formData.status': 1,
      customTags: [],
      selectedTags: {}
    });
  },

  // ==================== 表单验证 ====================
  
  // 验证整个表单
  validateForm() {
    const { formData } = this.data;
    const errors = {};
    let hasError = false;
    // 1. 验证姓名（必填）
    if (!formData.name || formData.name.trim() === '') {
      errors.name = '姓名不能为空';
      hasError = true;
    } else if (formData.name.length > 20) {
      errors.name = '姓名不能超过20个字符';
      hasError = true;
    }
    
    // 2. 验证联系电话（如果填写了）
    if (formData.contactPhone && !validate.validatePhone(formData.contactPhone)) {
      errors.contactPhone = '联系电话格式不正确';
      hasError = true;
    }
    
    // 3. 验证紧急联系电话（如果填写了）
    if (formData.emergencyPhone && !validate.validatePhone(formData.emergencyPhone)) {
      errors.emergencyPhone = '紧急联系电话格式不正确';
      hasError = true;
    }
    
    // 4. 验证年龄（如果填写了）
    if (formData.age && (formData.age < 0 || formData.age > 150)) {
      errors.age = '年龄必须在0-150之间';
      hasError = true;
    }
    
    // 5. 验证结束日期（如果状态是已结案）
    if (formData.status === 2 && !formData.endDate) {
      errors.endDate = '已结案必须填写结束日期';
      hasError = true;
    }
    this.setData({
      formErrors: errors,
      isFormValid: !hasError
    });
    return !hasError;
  },

  // 验证单个字段
  validateField(e) {
    const field = e.currentTarget.dataset.field;
    const value = this.data.formData[field];
    const errors = { ...this.data.formErrors };
    
    switch (field) {
      case 'name':
        if (!value || value.trim() === '') {
          errors.name = '姓名不能为空';
        } else if (value.length > 20) {
          errors.name = '姓名不能超过20个字符';
        } else {
          delete errors.name;
        }
        break;
        
      case 'contactPhone':
        if (value && !validate.validatePhone(value)) {
          errors.contactPhone = '联系电话格式不正确';
        } else {
          delete errors.contactPhone;
        }
        break;
        
      case 'emergencyPhone':
        if (value && !validate.validatePhone(value)) {
          errors.emergencyPhone = '紧急联系电话格式不正确';
        } else {
          delete errors.emergencyPhone;
        }
        break;
        
      case 'age':
        if (value && (value < 0 || value > 150)) {
          errors.age = '年龄必须在0-150之间';
        } else {
          delete errors.age;
        }
        break;
    }
    
    this.setData({
      formErrors: errors
    });
    
    // 重新验证整个表单
    this.validateForm();
  },

  // ==================== 格式化函数 ====================
  
  formatDate(dateStr) {
    return utils.formatDate(dateStr, 'yyyy-MM-dd');
  },

  // ==================== 事件处理函数 ====================
  
  // 返回
  onBack() {
    this.onCancel();
  },

  // 取消
  onCancel() {
    // 检查是否有未保存的更改
    const hasChanges = this.hasFormChanges();
    
    if (hasChanges) {
      wx.showModal({
        title: '确认取消',
        content: '您有未保存的更改，确定要取消吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  // 检查表单是否有更改
  hasFormChanges() {
    // 这里可以添加逻辑来检查表单是否有更改
    // 简化处理，总是返回true，或者可以根据实际情况判断
    return true;
  },

  // 滚动处理
  onScroll() {
    // 处理滚动到底部
  },

  // 姓名输入
  onNameInput(e) {
    console.log('onNameInput 被触发，输入值为:', e.detail.value);
    this.setData({
      'formData.name': e.detail.value
    }, () => {
      // 在 setData 回调中执行验证，确保数据已更新
      console.log('formData.name 已更新为:', this.data.formData.name);
      
      // 立即验证
      const isValid = this.validateForm();
      console.log('validateForm 返回值:', isValid);
      console.log('isFormValid 值:', this.data.isFormValid);
      console.log('formErrors:', this.data.formErrors);
    });
  },

  // 性别选择
  onGenderSelect(e) {
    const gender = parseInt(e.currentTarget.dataset.value);
    this.setData({
      'formData.gender': gender
    });
  },

  // 年龄输入
  onAgeInput(e) {
    this.setData({
      'formData.age': e.detail.value
    });
  },

  // 出生日期选择
  onBirthDateChange(e) {
    this.setData({
      'formData.birthDate': e.detail.value // picker返回的直接是yyyy-MM-dd字符串，无需处理
    });
  },

  // 联系电话输入
  onContactPhoneInput(e) {
    this.setData({
      'formData.contactPhone': e.detail.value
    });
  },

  // 邮箱输入
  onEmailInput(e) {
    this.setData({
      'formData.email': e.detail.value
    });
  },

  // 紧急联系人输入
  onEmergencyContactInput(e) {
    this.setData({
      'formData.emergencyContact': e.detail.value
    });
  },

  // 紧急联系电话输入
  onEmergencyPhoneInput(e) {
    this.setData({
      'formData.emergencyPhone': e.detail.value
    });
  },

// 2. 首次咨询日期选择变化
onStartDateChange(e) {
  this.setData({
    'formData.startDate': e.detail.value
  });
},

  // 状态选择
  onStatusSelect(e) {
    const status = parseInt(e.currentTarget.dataset.value);
    this.setData({
      'formData.status': status
    });
    
    // 如果状态不是已结案，清空结束日期
    if (status !== 2) {
      this.setData({
        'formData.endDate': ''
      });
    }
    
    // 重新验证表单
    this.validateForm();
  },

  // 结束日期选择
// 3. 结束咨询日期选择变化
onEndDateChange(e) {
  this.setData({
    'formData.endDate': e.detail.value
  });
  this.validateForm(); // 验证已结案的结束日期必填
},

  // 标签切换
  onTagToggle(e) {
    const tag = e.currentTarget.dataset.tag;
    const selectedTags = { ...this.data.selectedTags };
    
    if (selectedTags[tag]) {
      delete selectedTags[tag];
    } else {
      selectedTags[tag] = true;
    }
    
    this.setData({ selectedTags });
  },

  // 新标签输入
  onNewTagInput(e) {
    this.setData({ newTagInput: e.detail.value });
  },

  // 添加自定义标签
  onAddCustomTag() {
    const newTag = this.data.newTagInput.trim();
    
    if (!newTag) {
      wx.showToast({
        title: '请输入标签',
        icon: 'none'
      });
      return;
    }
    
    if (newTag.length > 10) {
      wx.showToast({
        title: '标签不能超过10个字符',
        icon: 'none'
      });
      return;
    }
    
    // 检查是否已存在
    if (this.data.customTags.includes(newTag) || this.data.commonTags.includes(newTag)) {
      wx.showToast({
        title: '标签已存在',
        icon: 'none'
      });
      return;
    }
    
    // 添加到自定义标签列表
    const customTags = [...this.data.customTags, newTag];
    this.setData({
      customTags,
      newTagInput: ''
    });
  },

  // 删除自定义标签
  onRemoveCustomTag(e) {
    const index = e.currentTarget.dataset.index;
    const customTags = [...this.data.customTags];
    customTags.splice(index, 1);
    this.setData({ customTags });
  },

  // 备注输入
  onRemarkInput(e) {
    this.setData({
      'formData.remark': e.detail.value
    });
  },

  // 诊断输入
  onDiagnosisInput(e) {
    this.setData({
      'formData.diagnosis': e.detail.value
    });
  },

  // 治疗方案输入
  onTreatmentPlanInput(e) {
    this.setData({
      'formData.treatmentPlan': e.detail.value
    });
  },

  // ==================== 表单提交 ====================
  
  // 保存表单
  onSave() {
    // 验证表单
    if (!this.validateForm()) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
    
    // 确认保存
    const title = this.data.isEditMode ? '确认修改' : '确认创建';
    const content = this.data.isEditMode ? '确定要修改来访者信息吗？' : '确定要创建新的来访者吗？';
    
    wx.showModal({
      title: title,
      content: content,
      success: (res) => {
        if (res.confirm) {
          this.saveClient();
        }
      }
    });
  },

  // 保存来访者数据
  async saveClient() {
    this.setData({ loading: true });
    
    try {
      // 准备数据
      const clientData = {
        ...this.data.formData,
        // 合并标签
        tags: this.getAllTags()
      };
      
      // 清理数据
      Object.keys(clientData).forEach(key => {
        if (clientData[key] === null || clientData[key] === '') {
          delete clientData[key];
        }
      });
      
      // 模拟API调用
      let result;
      if (this.data.isEditMode) {
        // 编辑模式
        result = await this.updateClient(clientData);
      } else {
        // 添加模式
        result = await this.createClient(clientData);
      }
      
      if (result.code === 200) {
        // 显示成功消息
        app.showSuccess(this.data.isEditMode ? '修改成功' : '创建成功');
        
        // 根据来源页面跳转
        this.handleSaveSuccess();
        
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

  // 获取所有标签
  getAllTags() {
    const selectedCommonTags = Object.keys(this.data.selectedTags).filter(tag => this.data.selectedTags[tag]);
    return [...selectedCommonTags, ...this.data.customTags];
  },

  // 模拟创建来访者
  async createClient(data) {
    // 调用真实新增接口：POST /api/client/create
    return await api.post('/api/client/create', data);
  },

  // 模拟更新来访者
  async updateClient(data) {
    // 调用真实编辑接口：PUT /api/client/update
    return await api.put('/api/client/update', data);
  },

  // 处理保存成功
  handleSaveSuccess() {
    // 根据来源页面决定跳转逻辑
    const { fromPage, isEditMode, clientId } = this.data;
    
    setTimeout(() => {
      if (fromPage === 'select') {
        // 从来访者选择页跳转过来，返回并刷新选择页
        wx.setStorageSync('clientListNeedRefresh', true);
        wx.navigateBack();
      } else if (fromPage === 'detail') {
        // 从来访者详情页跳转过来，返回详情页并刷新
        wx.navigateBack();
      } else {
        // 默认跳转逻辑
        if (isEditMode) {
          // 编辑模式，返回上一页
          wx.navigateBack();
        } else {
          // 添加模式，返回来访者列表页
          wx.switchTab({
            url: '/pages/client/list/index'
          });
        }
      }
    }, 1500);
  }
});