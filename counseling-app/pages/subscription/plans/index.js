Page({
  data: {
    // 当前用户订阅状态
    currentSubscription: null,
    
    // 套餐列表
    plans: [],
    selectedPlanIndex: -1,
    
    // 功能特性分组
    featureGroups: [],
    
    // 常见问题
    faqs: [],
    
    // 支付相关
    showPaymentModal: true,
    paymentMethods: [],
    selectedPaymentMethod: 0,
    couponCode: '',
    couponApplied: false,
    couponDiscount: '',
    couponDiscountAmount: 0,
    agreedToTerms: false,
    paying: true,
    
    // 加载状态
    loading: false
  },

  onLoad(options) {
    // 加载用户当前订阅信息
    this.loadCurrentSubscription();
    
    // 加载套餐数据
    this.loadPlans();
    
    // 加载常见问题
    this.loadFAQs();
    
    // 初始化支付方式
    this.initPaymentMethods();
  },

  onShow() {
    // 每次显示页面时刷新当前订阅状态
    this.loadCurrentSubscription();
  },

  // 加载当前订阅信息
  loadCurrentSubscription() {
    // Mock数据：当前用户的订阅信息
    const mockSubscription = {
      id: 1,
      planCode: 'monthly',
      planName: '月度套餐',
      startTime: '2024-01-01',
      endTime: '2024-01-31',
      status: 1, // 1=有效
      autoRenew: true
    };
    
    this.setData({
      currentSubscription: Math.random() > 0.5 ? mockSubscription : null // 50%概率有订阅
    });
  },

  // 加载套餐数据
  loadPlans() {
    const plans = [
      {
        code: 'monthly',
        name: '基础版',
        period: '月',
        price: '99',
        originalPrice: '129',
        savePercent: 23,
        freeTrialDays: 7,
        isPopular: false,
        features: {
          maxClients: '50位',
          maxSessions: '不限',
          storage: '5GB',
          reports: '基础报表',
          support: '在线支持',
          export: '基础导出',
          customFields: false,
          apiAccess: false,
          whiteLabel: false,
          prioritySupport: false
        }
      },
      {
        code: 'yearly',
        name: '专业版',
        period: '年',
        price: '899',
        originalPrice: '1188',
        savePercent: 24,
        freeTrialDays: 14,
        isPopular: true,
        features: {
          maxClients: '不限',
          maxSessions: '不限',
          storage: '50GB',
          reports: '高级报表',
          support: '优先支持',
          export: '完整导出',
          customFields: true,
          apiAccess: true,
          whiteLabel: false,
          prioritySupport: true
        }
      },
      {
        code: 'professional',
        name: '企业版',
        period: '年',
        price: '1999',
        originalPrice: '2599',
        savePercent: 23,
        freeTrialDays: 30,
        isPopular: false,
        features: {
          maxClients: '不限',
          maxSessions: '不限',
          storage: '500GB',
          reports: '定制报表',
          support: '专属客服',
          export: '完整导出',
          customFields: true,
          apiAccess: true,
          whiteLabel: true,
          prioritySupport: true
        }
      }
    ];
    
    const featureGroups = [
      {
        title: '核心功能',
        features: [
          { name: '来访者数量限制', key: 'maxClients', desc: '最多可管理的来访者数量' },
          { name: '咨询记录数量', key: 'maxSessions', desc: '每月可记录的咨询次数' },
          { name: '存储空间', key: 'storage', desc: '附件、文档等存储空间' },
          { name: '报表功能', key: 'reports', desc: '统计分析报表类型' }
        ]
      },
      {
        title: '高级功能',
        features: [
          { name: '技术支持', key: 'support', desc: '技术支持响应方式' },
          { name: '数据导出', key: 'export', desc: '数据导出功能完整性' },
          { name: '自定义字段', key: 'customFields', desc: '支持自定义来访者字段' },
          { name: 'API访问', key: 'apiAccess', desc: '提供API接口访问' }
        ]
      },
      {
        title: '企业功能',
        features: [
          { name: '白标部署', key: 'whiteLabel', desc: '可自定义品牌标识' },
          { name: '专属支持', key: 'prioritySupport', desc: '专属客服支持' }
        ]
      }
    ];
    
    this.setData({
      plans: plans,
      featureGroups: featureGroups,
      selectedPlanIndex: 1 // 默认选中专业版（推荐套餐）
    });
  },

  // 加载常见问题
  loadFAQs() {
    const faqs = [
      {
        question: '如何开始免费试用？',
        answer: '点击套餐下方的"免费试用"按钮，即可开始试用期。试用期内可以体验所有功能，试用期结束后需要购买套餐才能继续使用。',
        expanded: false
      },
      {
        question: '购买后可以退款吗？',
        answer: '购买后7天内，如果未使用超过50%的功能，可以申请退款。超过7天或已使用较多功能，原则上不予退款。',
        expanded: false
      },
      {
        question: '如何升级或降级套餐？',
        answer: '在"我的订阅"页面可以选择升级或降级套餐。升级套餐立即生效，降级套餐在当前周期结束后生效。',
        expanded: false
      },
      {
        question: '支持哪些支付方式？',
        answer: '目前支持微信支付、支付宝支付和银行卡支付。企业用户也可以申请对公转账。',
        expanded: false
      },
      {
        question: '数据安全如何保障？',
        answer: '我们采用银行级别的加密技术保护您的数据，所有数据都会进行加密存储，并且定期备份。我们承诺不会将您的数据用于任何商业用途。',
        expanded: false
      }
    ];
    
    this.setData({ faqs: faqs });
  },

  // 初始化支付方式
  initPaymentMethods() {
    const paymentMethods = [
      {
        type: 'wechat',
        name: '微信支付',
        icon: '/images/icons/wechat-pay.png'
      },
      {
        type: 'alipay',
        name: '支付宝',
        icon: '/images/icons/alipay.png'
      },
      {
        type: 'bank',
        name: '银行卡支付',
        icon: '/images/icons/bank-card.png'
      }
    ];
    
    this.setData({ paymentMethods: paymentMethods });
  },

  // 选择套餐
  selectPlan(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      selectedPlanIndex: index
    });
    
    // 提示用户选择了哪个套餐
    wx.showToast({
      title: `已选择${this.data.plans[index].name}`,
      icon: 'success',
      duration: 1500
    });
  },

  onSelectPlan(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      selectedPlanIndex: index
    });
  },

  // 免费试用
  onTryFree(e) {
    const index = e.currentTarget.dataset.index;
    const plan = this.data.plans[index];
    
    wx.showModal({
      title: '确认免费试用',
      content: `确定要开始${plan.freeTrialDays}天的免费试用吗？`,
      success: (res) => {
        if (res.confirm) {
          // 这里应该是调用API开始试用
          wx.showLoading({
            title: '开通中...',
          });
          
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
              title: `已开通${plan.freeTrialDays}天免费试用`,
              icon: 'success',
              duration: 2000
            });
            
            // 刷新订阅状态
            this.loadCurrentSubscription();
          }, 1500);
        }
      }
    });
  },

  // 管理订阅
  onManageSubscription() {
    wx.navigateTo({
      url: '/pages/subscription/manage/index'
    });
  },

  // 续费
  onRenew() {
    this.showPaymentModal();
  },

  // 显示支付弹窗
  showPaymentModal() {
    if (this.data.selectedPlanIndex === -1) {
      wx.showToast({
        title: '请先选择套餐',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      showPaymentModal: true,
      couponApplied: false,
      couponCode: '',
      couponDiscountAmount: 0,
      agreedToTerms: false,
      paying: false
    });
  },

  // 关闭支付弹窗
  closePaymentModal() {
    this.setData({
      showPaymentModal: false
    });
  },

  // 选择支付方式
  selectPaymentMethod(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      selectedPaymentMethod: index
    });
  },

  // 优惠码输入
  onCouponInput(e) {
    this.setData({
      couponCode: e.detail.value
    });
  },

  // 应用优惠码
  applyCoupon() {
    const couponCode = this.data.couponCode.trim();
    
    if (!couponCode) {
      wx.showToast({
        title: '请输入优惠码',
        icon: 'none'
      });
      return;
    }
    
    // Mock优惠码验证
    const validCoupons = {
      'SAVE10': { discount: '9折', amount: 0.1 },
      'SAVE20': { discount: '8折', amount: 0.2 },
      'NEWUSER': { discount: '85折', amount: 0.15 }
    };
    
    if (validCoupons[couponCode.toUpperCase()]) {
      const discount = validCoupons[couponCode.toUpperCase()];
      const planPrice = parseFloat(this.data.plans[this.data.selectedPlanIndex].price);
      const discountAmount = planPrice * discount.amount;
      
      this.setData({
        couponApplied: true,
        couponDiscount: discount.discount,
        couponDiscountAmount: Math.round(discountAmount * 100) / 100
      });
      
      wx.showToast({
        title: '优惠码应用成功',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '优惠码无效',
        icon: 'none'
      });
    }
  },

  // 显示优惠码帮助
  showCouponHelp() {
    wx.showModal({
      title: '如何使用优惠码',
      content: '优惠码通常在活动期间获得，输入正确的优惠码可以享受折扣优惠。',
      showCancel: false
    });
  },

  // 同意协议
  onAgreeChange(e) {
    this.setData({
      agreedToTerms: e.detail.value
    });
  },

  // 查看服务协议
  viewTerms() {
    wx.navigateTo({
      url: '/pages/webview/index?url=https://yourdomain.com/terms'
    });
  },

  // 查看隐私政策
  viewPrivacy() {
    wx.navigateTo({
      url: '/pages/webview/index?url=https://yourdomain.com/privacy'
    });
  },

  // 确认支付
  onConfirmPayment() {
    if (!this.data.agreedToTerms) {
      wx.showToast({
        title: '请先同意协议',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ paying: true });
    
    // 模拟支付过程
    setTimeout(() => {
      // 支付成功
      this.setData({ paying: false });
      this.closePaymentModal();
      
      // 显示支付成功页面
      wx.showModal({
        title: '支付成功',
        content: '套餐已开通，现在可以开始使用所有功能了！',
        showCancel: false,
        success: () => {
          // 刷新订阅状态
          this.loadCurrentSubscription();
          
          // 跳转到订阅管理页面
          wx.navigateTo({
            url: '/pages/subscription/success/index'
          });
        }
      });
    }, 2000);
  },

  // 切换常见问题展开状态
  toggleFaq(e) {
    const index = e.currentTarget.dataset.index;
    const faqs = this.data.faqs.map((item, i) => {
      if (i === index) {
        return { ...item, expanded: !item.expanded };
      }
      return item;
    });
    
    this.setData({ faqs: faqs });
  },

  // 计算最终金额
  computed: {
    finalAmount() {
      if (this.data.selectedPlanIndex === -1) return '0';
      
      const plan = this.data.plans[this.data.selectedPlanIndex];
      const price = parseFloat(plan.price);
      const discount = this.data.couponDiscountAmount || 0;
      
      return (price - discount).toFixed(2);
    },
    
    selectedPlan() {
      if (this.data.selectedPlanIndex === -1) return null;
      return this.data.plans[this.data.selectedPlanIndex];
    }
  }
});