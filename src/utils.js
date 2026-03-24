/**
 * Review Assistant - Utils Module
 * 工具函数
 */

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @returns {string}
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 生成唯一 ID
 * @returns {string}
 */
function generateId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * 截断文本
 * @param {string} text - 文本
 * @param {number} maxLength - 最大长度（包含省略号）
 * @returns {string}
 */
function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

/**
 * 复制到剪贴板
 * @param {string} text - 文本
 * @returns {Promise<void>}
 */
async function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

/**
 * 获取星级标签
 * @param {number} rating - 星级（1-5）
 * @returns {string}
 */
function getRatingLabel(rating) {
  if (rating >= 4) return '好评';
  if (rating === 3) return '中评';
  return '差评';
}

/**
 * 筛选评价
 * @param {Array} reviews - 评价列表
 * @param {string} filter - 筛选条件 ('all', 'pending', 'replied', 'negative')
 * @returns {Array}
 */
function filterReviews(reviews, filter) {
  switch (filter) {
    case 'pending':
      return reviews.filter(r => !r.replied);
    case 'replied':
      return reviews.filter(r => r.replied);
    case 'negative':
      return reviews.filter(r => r.rating <= 2);
    default:
      return reviews;
  }
}

module.exports = {
  formatDate,
  generateId,
  truncateText,
  copyToClipboard,
  getRatingLabel,
  filterReviews
};
