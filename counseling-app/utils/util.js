// utils/util.js

/**
 * 格式化日期时间
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式，默认 'yyyy-MM-dd'
 * @returns {string} 格式化后的日期
 */
function formatDate(date, format = 'yyyy-MM-dd') {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours();
  const minute = d.getMinutes();
  const second = d.getSeconds();
  
  return format
    .replace('yyyy', year)
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('dd', day.toString().padStart(2, '0'))
    .replace('HH', hour.toString().padStart(2, '0'))
    .replace('mm', minute.toString().padStart(2, '0'))
    .replace('ss', second.toString().padStart(2, '0'));
}

/**
 * 格式化时间（刚刚、几分钟前等）
 * @param {Date|string|number} date - 日期
 * @returns {string} 相对时间
 */
function formatRelativeTime(date) {
  const now = new Date();
  const target = new Date(date);
  const diff = Math.floor((now - target) / 1000); // 秒数差
  
  if (diff < 60) {
    return '刚刚';
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}分钟前`;
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)}小时前`;
  } else if (diff < 604800) {
    return `${Math.floor(diff / 86400)}天前`;
  } else {
    return formatDate(date, 'MM-dd');
  }
}

/**
 * 格式化金额
 * @param {number} amount - 金额
 * @returns {string} 格式化后的金额
 */
function formatMoney(amount) {
  if (amount === null || amount === undefined) return '0.00';
  return Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 深度复制对象
 * @param {*} obj - 要复制的对象
 * @returns {*} 复制后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖函数
 */
function debounce(func, wait = 300) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流函数
 */
function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 生成UUID
 * @returns {string} UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 验证手机号
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 验证邮箱
 * @param {string} email - 邮箱
 * @returns {boolean} 是否有效
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 获取状态文本
 * @param {number} status - 状态码
 * @param {string} type - 类型（client, session, schedule等）
 * @returns {string} 状态文本
 */
function getStatusText(status, type = 'client') {
  const statusMap = {
    client: {
      1: '进行中',
      2: '已结案',
      3: '中断',
      4: '转介'
    },
    session: {
      1: '已预约',
      2: '已完成',
      3: '取消',
      4: '缺席'
    },
    schedule: {
      1: '待办',
      2: '完成',
      3: '取消',
      4: '进行中'
    },
    subscription: {
      1: '有效',
      2: '即将过期',
      3: '已过期',
      4: '已取消'
    }
  };
  
  return statusMap[type]?.[status] || '未知状态';
}

/**
 * 获取状态颜色
 * @param {number} status - 状态码
 * @param {string} type - 类型
 * @returns {string} 颜色值
 */
function getStatusColor(status, type = 'client') {
  const colorMap = {
    client: {
      1: '#52c41a', // 进行中 - 绿色
      2: '#1890ff', // 已结案 - 蓝色
      3: '#faad14', // 中断 - 橙色
      4: '#666666'  // 转介 - 灰色
    },
    session: {
      1: '#faad14', // 已预约 - 橙色
      2: '#52c41a', // 已完成 - 绿色
      3: '#ff4d4f', // 取消 - 红色
      4: '#666666'  // 缺席 - 灰色
    }
  };
  
  return colorMap[type]?.[status] || '#666666';
}

module.exports = {
  formatDate,
  formatRelativeTime,
  formatMoney,
  deepClone,
  debounce,
  throttle,
  generateUUID,
  validatePhone,
  validateEmail,
  getStatusText,
  getStatusColor
};