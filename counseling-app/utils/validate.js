// utils/validate.js

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
 * 验证身份证号（简单验证）
 * @param {string} idCard - 身份证号
 * @returns {boolean} 是否有效
 */
function validateIdCard(idCard) {
  return /^\d{17}[\dXx]$/.test(idCard);
}

/**
 * 验证URL
 * @param {string} url - URL
 * @returns {boolean} 是否有效
 */
function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {Object} 验证结果
 */
function validatePassword(password) {
  const result = {
    isValid: false,
    strength: 0,
    messages: []
  };
  
  if (!password || password.length < 6) {
    result.messages.push('密码至少6位');
    return result;
  }
  
  // 检查长度
  if (password.length >= 8) result.strength += 1;
  if (password.length >= 12) result.strength += 1;
  
  // 检查包含数字
  if (/\d/.test(password)) result.strength += 1;
  
  // 检查包含小写字母
  if (/[a-z]/.test(password)) result.strength += 1;
  
  // 检查包含大写字母
  if (/[A-Z]/.test(password)) result.strength += 1;
  
  // 检查包含特殊字符
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) result.strength += 1;
  
  result.isValid = result.strength >= 3;
  
  if (!result.isValid) {
    result.messages.push('密码需包含数字、大小写字母或特殊字符');
  }
  
  return result;
}

/**
 * 验证日期格式
 * @param {string} dateStr - 日期字符串
 * @param {string} format - 格式，如 'YYYY-MM-DD'
 * @returns {boolean} 是否有效
 */
function validateDate(dateStr, format = 'YYYY-MM-DD') {
  if (!dateStr) return false;
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  
  // 简单格式验证
  const formatMap = {
    'YYYY-MM-DD': /^\d{4}-\d{2}-\d{2}$/,
    'YYYY/MM/DD': /^\d{4}\/\d{2}\/\d{2}$/,
    'YYYY年MM月DD日': /^\d{4}年\d{2}月\d{2}日$/
  };
  
  const regex = formatMap[format];
  if (regex && !regex.test(dateStr)) return false;
  
  return true;
}

/**
 * 验证时间格式
 * @param {string} timeStr - 时间字符串
 * @returns {boolean} 是否有效
 */
function validateTime(timeStr) {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr);
}

/**
 * 验证数字范围
 * @param {number} value - 数值
 * @param {Object} options - 选项
 * @returns {boolean} 是否在范围内
 */
function validateNumberRange(value, options = {}) {
  const { min, max, integer } = options;
  
  if (isNaN(value)) return false;
  
  if (integer && !Number.isInteger(Number(value))) return false;
  
  if (min !== undefined && value < min) return false;
  
  if (max !== undefined && value > max) return false;
  
  return true;
}

/**
 * 验证必填字段
 * @param {*} value - 字段值
 * @param {string} fieldName - 字段名
 * @returns {Object} 验证结果
 */
function validateRequired(value, fieldName = '字段') {
  const result = {
    isValid: false,
    message: ''
  };
  
  if (value === undefined || value === null || value === '') {
    result.message = `${fieldName}不能为空`;
    return result;
  }
  
  if (Array.isArray(value) && value.length === 0) {
    result.message = `${fieldName}不能为空`;
    return result;
  }
  
  result.isValid = true;
  return result;
}

/**
 * 验证表单数据
 * @param {Object} data - 表单数据
 * @param {Object} rules - 验证规则
 * @returns {Object} 验证结果
 */
function validateForm(data, rules) {
  const errors = {};
  let isValid = true;
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    // 必填验证
    if (rule.required) {
      const result = validateRequired(value, rule.label || field);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
        continue;
      }
    }
    
    // 类型验证
    if (rule.type === 'phone' && value) {
      if (!validatePhone(value)) {
        errors[field] = '手机号格式不正确';
        isValid = false;
      }
    } else if (rule.type === 'email' && value) {
      if (!validateEmail(value)) {
        errors[field] = '邮箱格式不正确';
        isValid = false;
      }
    } else if (rule.type === 'number' && value !== undefined && value !== '') {
      if (!validateNumberRange(Number(value), rule)) {
        errors[field] = rule.message || '数字格式不正确';
        isValid = false;
      }
    } else if (rule.type === 'date' && value) {
      if (!validateDate(value, rule.format)) {
        errors[field] = '日期格式不正确';
        isValid = false;
      }
    }
    
    // 自定义验证函数
    if (rule.validator && typeof rule.validator === 'function' && value) {
      const customResult = rule.validator(value, data);
      if (!customResult.isValid) {
        errors[field] = customResult.message || '验证失败';
        isValid = false;
      }
    }
  }
  
  return {
    isValid,
    errors
  };
}

module.exports = {
  validatePhone,
  validateEmail,
  validateIdCard,
  validateUrl,
  validatePassword,
  validateDate,
  validateTime,
  validateNumberRange,
  validateRequired,
  validateForm
};