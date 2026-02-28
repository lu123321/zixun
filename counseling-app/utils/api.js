const app = getApp();

// 后端基础地址（你的电脑局域网IP + 后端端口）
const baseUrl = app.globalData.baseUrl || 'http://192.168.71.3:8080';

export function get(url, data = {}, options = {}) {
  return request({
    url,
    method: 'GET',
    data,
    showLoading: false,
    ...options
  });
}

/**
 * 封装 POST 请求
 */
export function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    showLoading: false,
    ...options
  });
}

/**
 * API请求封装
 * @param {Object} options - 请求选项
 */
function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    showLoading = true,
    loadingText = '加载中...'
  } = options;
  
  // 显示加载提示
  if (showLoading) {
    wx.showLoading({
      title: loadingText,
      mask: true
    });
  }
  
  // 获取token
  const token = app.globalData.token || wx.getStorageSync('token');
  
  // 设置请求头
  const headers = {
    'Content-Type': 'application/json',
    ...header
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // 返回Promise
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}${url}`,
      method,
      data,
      header: headers,
      success: (res) => {
        if (showLoading) {
          wx.hideLoading();
        }
        
        const { statusCode, data: responseData } = res;

        // 兼容后端返回 HTTP 200 + 业务 code=401 的情况
        if (statusCode >= 200 && statusCode < 300 && responseData && Number(responseData.code) === 401) {
          handleUnauthorized();
          reject(new Error(responseData.msg || '未授权，请重新登录'));
          return;
        }
        
        // 状态码处理
        if (statusCode >= 200 && statusCode < 300) {
          // 成功响应
          resolve(responseData);
        } else if (statusCode === 401) {
          // 未授权，跳转到登录
          handleUnauthorized();
          reject(new Error('未授权，请重新登录'));
        } else if (statusCode === 403) {
          // 权限不足
          wx.showToast({
            title: '权限不足',
            icon: 'error'
          });
          reject(new Error('权限不足'));
        } else {
          // 其他错误
          const errorMsg = responseData.message || `请求失败，状态码：${statusCode}`;
          wx.showToast({
            title: errorMsg,
            icon: 'error'
          });
          reject(new Error(errorMsg));
        }
      },
      fail: (error) => {
        if (showLoading) {
          wx.hideLoading();
        }
        
        console.error('请求失败:', error);
        
        // 网络错误处理
        wx.showToast({
          title: '网络连接失败，请检查网络',
          icon: 'error'
        });
        
        reject(new Error('网络连接失败'));
      }
    });
  });
}

/**
 * 处理未授权状态
 */
function handleUnauthorized() {
  // 清除登录状态
  if (typeof app.logout === 'function') {
    app.logout();
  } else {
    app.globalData.token = '';
    app.globalData.userInfo = null;
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
  }

  // 提示用户
  wx.showModal({
    title: '登录已过期',
    content: '您的登录状态已过期，请重新登录',
    showCancel: false,
    success: () => {
      // 登录页是 tab 外页面，使用 reLaunch 避免返回到鉴权页面
      wx.reLaunch({
        url: '/pages/login/login'
      });
    }
  });
}


/**
 * PUT请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @param {Object} options - 其他选项
 */
function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
}

/**
 * DELETE请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求参数
 * @param {Object} options - 其他选项
 */
function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  });
}

/**
 * 文件上传
 * @param {string} url - 上传URL
 * @param {string} filePath - 文件路径
 * @param {Object} formData - 表单数据
 * @param {string} name - 文件字段名
 * @param {Object} options - 其他选项
 */
function uploadFile(url, filePath, formData = {}, name = 'file', options = {}) {
  const { showLoading = true, loadingText = '上传中...' } = options;
  
  if (showLoading) {
    wx.showLoading({
      title: loadingText,
      mask: true
    });
  }
  
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${baseUrl}${url}`,
      filePath,
      name,
      formData,
      header: {
        'Authorization': `Bearer ${app.globalData.token || wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (showLoading) {
          wx.hideLoading();
        }
        
        try {
          const data = JSON.parse(res.data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            wx.showToast({
              title: data.message || '上传失败',
              icon: 'error'
            });
            reject(new Error(data.message || '上传失败'));
          }
        } catch (error) {
          wx.showToast({
            title: '上传失败',
            icon: 'error'
          });
          reject(new Error('上传失败'));
        }
      },
      fail: (error) => {
        if (showLoading) {
          wx.hideLoading();
        }
        
        wx.showToast({
          title: '上传失败',
          icon: 'error'
        });
        reject(new Error('上传失败'));
      }
    });
  });
}

/**
 * 下载文件
 * @param {string} url - 文件URL
 * @param {Object} options - 其他选项
 */
function downloadFile(url, options = {}) {
  const { showLoading = true, loadingText = '下载中...' } = options;
  
  if (showLoading) {
    wx.showLoading({
      title: loadingText,
      mask: true
    });
  }
  
   // 返回Promise
   return new Promise((resolve, reject) => {
    wx.request({
      // 优化：如果url已包含http，直接使用（用于文件下载等），否则拼接baseUrl
      url: url.startsWith('http') ? url : `${baseUrl}${url}`,
      method,
      data,
      header: headers,
      success: (res) => {
        if (showLoading) {
          wx.hideLoading();
        }
        
        const { statusCode, data: responseData } = res;
        
        // 状态码处理
        if (statusCode >= 200 && statusCode < 300) {
          // 成功响应
          resolve(responseData);
        } else if (statusCode === 401) {
          // 未授权，跳转到登录
          handleUnauthorized();
          reject(new Error('未授权，请重新登录'));
        } else if (statusCode === 403) {
          // 权限不足
          wx.showToast({
            title: '权限不足',
            icon: 'error'
          });
          reject(new Error('权限不足'));
        } else {
          // 其他错误
          const errorMsg = responseData.msg || `请求失败，状态码：${statusCode}`;
          wx.showToast({
            title: errorMsg,
            icon: 'error'
          });
          reject(new Error(errorMsg));
        }
      },
      fail: (error) => {
        if (showLoading) {
          wx.hideLoading();
        }
        
        console.error('请求失败:', error);
        
        // 网络错误处理
        wx.showToast({
          title: '网络连接失败，请检查网络',
          icon: 'error'
        });
        
        reject(new Error('网络连接失败'));
      }
    });
  });
}

/**
 * 检查网络状态
 */
function checkNetwork() {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      success: (res) => {
        const networkType = res.networkType;
        if (networkType === 'none') {
          wx.showToast({
            title: '网络连接已断开',
            icon: 'error'
          });
          reject(new Error('网络连接已断开'));
        } else {
          resolve(networkType);
        }
      },
      fail: () => {
        reject(new Error('获取网络状态失败'));
      }
    });
  });
}

module.exports = {
  request,
  get,
  post,
  put,
  delete: del,
  uploadFile,
  downloadFile,
  checkNetwork
};