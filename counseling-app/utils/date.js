// utils/date.js

/**
 * 获取相对时间描述
 * @param {Date|string|number} date - 日期
 * @returns {string} 相对时间描述
 */
function getRelativeTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const target = new Date(date);
  const diff = now - target;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`;
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`;
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`;
  } else {
    return `${Math.floor(diff / year)}年前`;
  }
}

/**
 * 获取中文星期
 * @param {Date|string|number} date - 日期
 * @returns {string} 星期几
 */
function getChineseWeekday(date) {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const d = new Date(date);
  return `星期${weekdays[d.getDay()]}`;
}

/**
 * 获取时间段描述
 * @param {number} hour - 小时 (0-23)
 * @returns {string} 时间段描述
 */
function getTimePeriod(hour) {
  if (hour >= 0 && hour < 6) {
    return '凌晨';
  } else if (hour >= 6 && hour < 9) {
    return '早晨';
  } else if (hour >= 9 && hour < 12) {
    return '上午';
  } else if (hour >= 12 && hour < 14) {
    return '中午';
  } else if (hour >= 14 && hour < 18) {
    return '下午';
  } else if (hour >= 18 && hour < 22) {
    return '晚上';
  } else {
    return '深夜';
  }
}

/**
 * 格式化时间为 HH:mm
 * @param {Date|string|number} date - 日期
 * @returns {string} 格式化的时间
 */
function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * 格式化日期时间为完整字符串
 * @param {Date|string|number} date - 日期
 * @returns {string} 格式化的日期时间
 */
function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours();
  const minute = d.getMinutes();
  
  return `${year}年${month}月${day}日 ${getTimePeriod(hour)}${hour}:${minute.toString().padStart(2, '0')}`;
}

/**
 * 计算两个日期之间的天数
 * @param {Date|string|number} startDate - 开始日期
 * @param {Date|string|number} endDate - 结束日期
 * @returns {number} 天数
 */
function getDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * 获取月份的第一天
 * @param {Date|string|number} date - 日期
 * @returns {Date} 月份第一天
 */
function getMonthFirstDay(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * 获取月份的最后一天
 * @param {Date|string|number} date - 日期
 * @returns {Date} 月份最后一天
 */
function getMonthLastDay(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/**
 * 检查日期是否是今天
 * @param {Date|string|number} date - 日期
 * @returns {boolean} 是否是今天
 */
function isToday(date) {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * 检查日期是否是昨天
 * @param {Date|string|number} date - 日期
 * @returns {boolean} 是否是昨天
 */
function isYesterday(date) {
  const d = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
}

/**
 * 检查日期是否是明天
 * @param {Date|string|number} date - 日期
 * @returns {boolean} 是否是明天
 */
function isTomorrow(date) {
  const d = new Date(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.toDateString() === tomorrow.toDateString();
}

module.exports = {
  getRelativeTime,
  getChineseWeekday,
  getTimePeriod,
  formatTime,
  formatDateTime,
  getDaysBetween,
  getMonthFirstDay,
  getMonthLastDay,
  isToday,
  isYesterday,
  isTomorrow
};