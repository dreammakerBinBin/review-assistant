/**
 * Review Assistant - Storage Module
 * 数据持久化存储
 */

const STORAGE_KEYS = {
  REVIEWS: 'reviews',
  TEMPLATES: 'templates',
  SETTINGS: 'settings'
};

/**
 * 从存储获取评价列表
 * @returns {Promise<Array>}
 */
async function getReviews() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.REVIEWS);
  return result[STORAGE_KEYS.REVIEWS] || [];
}

/**
 * 保存评价到存储
 * @param {Object} review - 评价对象
 */
async function saveReview(review) {
  const reviews = await getReviews();
  const existingIndex = reviews.findIndex(r => r.id === review.id);

  if (existingIndex >= 0) {
    reviews[existingIndex] = { ...reviews[existingIndex], ...review };
  } else {
    reviews.push(review);
  }

  await chrome.storage.local.set({ [STORAGE_KEYS.REVIEWS]: reviews });
}

/**
 * 从存储删除评价
 * @param {string} reviewId - 评价ID
 */
async function deleteReview(reviewId) {
  const reviews = await getReviews();
  const filtered = reviews.filter(r => r.id !== reviewId);
  await chrome.storage.local.set({ [STORAGE_KEYS.REVIEWS]: filtered });
}

/**
 * 获取模板列表
 * @returns {Promise<Array>}
 */
async function getTemplates() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TEMPLATES);
  const templates = result[STORAGE_KEYS.TEMPLATES] || [];
  if (templates.length === 0) {
    return getDefaultTemplates();
  }
  return templates;
}

/**
 * 获取默认模板
 * @returns {Array}
 */
function getDefaultTemplates() {
  return [
    {
      id: 'default-1',
      name: '感谢好评',
      content: '尊敬的 {buyerName}，感谢您的好评！期待再次为您服务。',
      category: 'reply'
    },
    {
      id: 'default-2',
      name: '好评回复',
      content: '感谢您对本店的支持，您的满意是我们最大的动力！',
      category: 'reply'
    },
    {
      id: 'default-3',
      name: '中评回复',
      content: '尊敬的 {buyerName}，感谢您的反馈。您有任何建议可以联系我们，我们会不断改进。',
      category: 'reply'
    },
    {
      id: 'default-4',
      name: '差评回复',
      content: '尊敬的 {buyerName}，非常抱歉给您带来不好的体验。请联系我们，我们会尽快为您解决问题。',
      category: 'reply'
    },
    {
      id: 'default-5',
      name: '邀请好评',
      content: '亲，如果满意的话，希望能给个五星好评哦~ 您的支持是我们最大的动力！',
      category: 'invite'
    }
  ];
}

/**
 * 保存模板
 * @param {Object} template - 模板对象
 */
async function saveTemplate(template) {
  const templates = await getTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);

  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }

  await chrome.storage.local.set({ [STORAGE_KEYS.TEMPLATES]: templates });
}

/**
 * 删除模板
 * @param {string} templateId - 模板ID
 */
async function deleteTemplate(templateId) {
  const templates = await getTemplates();
  const filtered = templates.filter(t => t.id !== templateId);
  await chrome.storage.local.set({ [STORAGE_KEYS.TEMPLATES]: filtered });
}

/**
 * 获取设置
 * @returns {Promise<Object>}
 */
async function getSettings() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return result[STORAGE_KEYS.SETTINGS] || {};
}

/**
 * 保存设置
 * @param {Object} settings - 设置对象
 */
async function saveSettings(settings) {
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });
}

module.exports = {
  getReviews,
  saveReview,
  deleteReview,
  getTemplates,
  saveTemplate,
  deleteTemplate,
  getSettings,
  saveSettings,
  STORAGE_KEYS
};
