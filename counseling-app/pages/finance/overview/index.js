Page({
  data: {
    // 当前显示的时间
    currentYear: 2024,
    currentMonth: 1, // 1-12
    currentMonthText: '2024年1月',
    
    // 财务概览数据
    overviewData: {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      incomeChange: 0,
      expenseChange: 0
    },
    
    // 月度数据（用于图表）
    monthlyData: [],
    
    // 分类数据
    incomeCategories: [],
    expenseCategories: [],
    
    // 最近记录
    recentRecords: [],
    
    // 加载状态
    loading: false,
    hasData: true
  },

  onLoad(options) {
    // 初始化当前时间（显示当月）
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    this.setData({
      currentYear: year,
      currentMonth: month,
      currentMonthText: `${year}年${month}月`
    });
    
    // 加载数据
    this.loadFinanceData();
  },

  onPullDownRefresh() {
    console.log('下拉刷新财务数据');
    this.loadFinanceData(() => {
      wx.stopPullDownRefresh();
    });
  },

  loadFinanceData(callback) {
    this.setData({ loading: true });
    
    // 模拟API调用延迟
    setTimeout(() => {
      // 生成mock数据
      this.generateMockData();
      
      this.setData({
        loading: false,
        hasData: true
      });
      
      callback && callback();
    }, 800);
  },

  generateMockData() {
    const { currentYear, currentMonth } = this.data;
    
    // 1. 生成概览数据
    const totalIncome = 12800 + Math.random() * 5000;
    const totalExpense = 3200 + Math.random() * 2000;
    const balance = totalIncome - totalExpense;
    
    // 随机生成变化百分比（-20% 到 30%）
    const incomeChange = (Math.random() * 50 - 20).toFixed(1);
    const expenseChange = (Math.random() * 50 - 20).toFixed(1);
    
    // 2. 生成月度数据（最近6个月）
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i - 1, 1);
      const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      const monthName = monthNames[date.getMonth()];
      
      const income = 8000 + Math.random() * 8000;
      const expense = 2000 + Math.random() * 4000;
      
      // 计算百分比（最大值为数据中的最大值）
      const maxIncome = 16000;
      const maxExpense = 6000;
      const incomePercentage = (income / maxIncome) * 100;
      const expensePercentage = (expense / maxExpense) * 100;
      
      monthlyData.push({
        month: monthName,
        income,
        expense,
        incomePercentage,
        expensePercentage
      });
    }
    
    // 3. 生成收入分类数据
    const incomeCategories = [
      {
        id: 1,
        name: '咨询收入',
        icon: '/images/icons/consultation.png',
        color: '#1890ff',
        amount: totalIncome * 0.7,
        count: 24,
        percentage: 70
      },
      {
        id: 2,
        name: '督导收入',
        icon: '/images/icons/supervision.png',
        color: '#52c41a',
        amount: totalIncome * 0.2,
        count: 6,
        percentage: 20
      },
      {
        id: 3,
        name: '培训收入',
        icon: '/images/icons/training.png',
        color: '#fa8c16',
        amount: totalIncome * 0.1,
        count: 2,
        percentage: 10
      }
    ];
    
    // 4. 生成支出分类数据
    const expenseCategories = [
      {
        id: 4,
        name: '督导支出',
        icon: '/images/icons/supervision-cost.png',
        color: '#ff4d4f',
        amount: totalExpense * 0.4,
        count: 8,
        percentage: 40
      },
      {
        id: 5,
        name: '培训学习',
        icon: '/images/icons/study.png',
        color: '#722ed1',
        amount: totalExpense * 0.25,
        count: 5,
        percentage: 25
      },
      {
        id: 6,
        name: '办公用品',
        icon: '/images/icons/office.png',
        color: '#13c2c2',
        amount: totalExpense * 0.15,
        count: 12,
        percentage: 15
      },
      {
        id: 7,
        name: '其他支出',
        icon: '/images/icons/other.png',
        color: '#666',
        amount: totalExpense * 0.2,
        count: 10,
        percentage: 20
      }
    ];
    
    // 5. 生成最近交易记录
    const recentRecords = [
      {
        id: 1,
        type: 1, // 收入
        categoryName: '咨询收入',
        amount: 300,
        remark: '王小明个体咨询',
        recordDate: '今天 14:30',
        paymentMethod: 2,
        paymentMethodText: '微信'
      },
      {
        id: 2,
        type: 2, // 支出
        categoryName: '督导支出',
        amount: 500,
        remark: '李老师个体督导',
        recordDate: '今天 10:00',
        paymentMethod: 3,
        paymentMethodText: '支付宝'
      },
      {
        id: 3,
        type: 1,
        categoryName: '咨询收入',
        amount: 350,
        remark: '李小红视频咨询',
        recordDate: '昨天 16:00',
        paymentMethod: 2,
        paymentMethodText: '微信'
      },
      {
        id: 4,
        type: 2,
        categoryName: '培训学习',
        amount: 280,
        remark: '购买专业书籍',
        recordDate: '昨天 09:30',
        paymentMethod: 4,
        paymentMethodText: '银行卡'
      },
      {
        id: 5,
        type: 1,
        categoryName: '督导收入',
        amount: 400,
        remark: '团体督导',
        recordDate: '前天 15:00',
        paymentMethod: 3,
        paymentMethodText: '支付宝'
      }
    ];
    
    this.setData({
      overviewData: {
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        balance: balance,
        incomeChange: parseFloat(incomeChange),
        expenseChange: parseFloat(expenseChange)
      },
      monthlyData: monthlyData,
      incomeCategories: incomeCategories,
      expenseCategories: expenseCategories,
      recentRecords: recentRecords
    });
  },

  // 时间筛选相关
  onPrevMonth() {
    let { currentYear, currentMonth } = this.data;
    
    if (currentMonth === 1) {
      currentYear--;
      currentMonth = 12;
    } else {
      currentMonth--;
    }
    
    this.updateCurrentMonth(currentYear, currentMonth);
  },

  onNextMonth() {
    let { currentYear, currentMonth } = this.data;
    
    if (currentMonth === 12) {
      currentYear++;
      currentMonth = 1;
    } else {
      currentMonth++;
    }
    
    this.updateCurrentMonth(currentYear, currentMonth);
  },

  showMonthPicker() {
    // 使用小程序原生的日期选择器选择年月
    const { currentYear, currentMonth } = this.data;
    const currentDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
    
    wx.showActionSheet({
      itemList: ['选择年月', '快速切换'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 使用日期选择器，但只选择年月
          wx.navigateTo({
            url: '/pages/finance/month-picker/index?current=' + currentDate
          });
        } else {
          // 快速切换到当前月
          const now = new Date();
          this.updateCurrentMonth(now.getFullYear(), now.getMonth() + 1);
        }
      }
    });
  },

  updateCurrentMonth(year, month) {
    this.setData({
      currentYear: year,
      currentMonth: month,
      currentMonthText: `${year}年${month}月`,
      loading: true
    });
    
    // 重新加载数据
    setTimeout(() => {
      this.generateMockData();
      this.setData({ loading: false });
    }, 500);
  },

  // 图表交互
  onBarTap(e) {
    const index = e.currentTarget.dataset.index;
    const data = this.data.monthlyData[index];
    
    wx.showToast({
      title: `${data.month} 收入: ¥${data.income.toFixed(2)} 支出: ¥${data.expense.toFixed(2)}`,
      icon: 'none',
      duration: 2000
    });
  },

  // 导航相关
  goToIncomeCategories() {
    wx.navigateTo({
      url: '/pages/finance/categories/index?type=1'
    });
  },

  goToExpenseCategories() {
    wx.navigateTo({
      url: '/pages/finance/categories/index?type=2'
    });
  },

  goToCategoryRecords(e) {
    const categoryId = e.currentTarget.dataset.id;
    const type = e.currentTarget.dataset.type; // 1=收入, 2=支出
    
    wx.navigateTo({
      url: `/pages/finance/records/index?categoryId=${categoryId}&type=${type}`
    });
  },

  goToFinanceList() {
    wx.navigateTo({
      url: '/pages/finance/list/index'
    });
  },

  goToRecordDetail(e) {
    const recordId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/finance/detail/index?id=${recordId}`
    });
  },

  goToAddRecord() {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/schedule/detail/index?id=${id}`
    });
  }
});