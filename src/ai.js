/**
 * Review Assistant - AI Module
 * Claude API 集成
 */

const AI_CONFIG = {
  API_URL: 'https://api.anthropic.com/v1/messages',
  MODEL: 'claude-3-haiku-20240307',
  MAX_TOKENS: 1024
};

/**
 * 获取设置中的 API Key
 * @param {Function} storageGet - storage.get function (for DI)
 * @returns {Promise<string>}
 */
async function getApiKey(storageGet) {
  const getFn = storageGet || (() => chrome.storage.local.get('settings').then(r => r.settings || {}));
  const result = await getFn();
  return result.apiKey || '';
}

/**
 * 调用 Claude API
 * @param {Object} options - API 选项
 * @returns {Promise<string>}
 */
async function callClaude(options) {
  const { systemPrompt, userMessage, apiKey } = options;

  if (!apiKey) {
    throw new Error('API Key 未设置');
  }

  const response = await fetch(AI_CONFIG.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: AI_CONFIG.MODEL,
      max_tokens: AI_CONFIG.MAX_TOKENS,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status}`);
  }

  const data = await response.json();
  // Claude API 返回格式: content: [{ type: 'text', text: '...' }]
  const textContent = data.content && data.content.find(c => c.type === 'text');
  return textContent ? textContent.text : '';
}

/**
 * 生成回复
 * @param {Object} review - 评价对象
 * @param {Object} options - 可选配置
 * @returns {Promise<string>}
 */
async function generateReply(review, options = {}) {
  const {
    apiKey: configApiKey,
    getSettingsFn = null
  } = options;

  const apiKey = configApiKey || await getApiKey(getSettingsFn);

  if (!apiKey) {
    throw new Error('API Key 未设置');
  }

  const ratingLabels = { 5: '好评', 4: '好评', 3: '中评', 2: '差评', 1: '差评' };
  const ratingLabel = ratingLabels[review.rating] || '中评';

  const systemPrompt = `你是一个专业的电商客服，擅长生成礼貌、专业、简洁的评价回复。根据买家的评价内容，生成一条合适的回复。回复应该感谢买家，并体现出对商品的认可和对买家反馈的重视。`;

  const userMessage = `买家评价（${ratingLabel}，${review.rating}星）：\n买家：${review.buyerName}\n商品：${review.product}\n评价内容：${review.content}\n\n请生成一条回复。`;

  return callClaude({ systemPrompt, userMessage, apiKey });
}

/**
 * 生成好评邀请语
 * @param {string} productName - 商品名称
 * @param {Object} options - 可选配置
 * @returns {Promise<string>}
 */
async function generateInviteMessage(productName, options = {}) {
  const {
    apiKey: configApiKey,
    getSettingsFn = null
  } = options;

  const apiKey = configApiKey || await getApiKey(getSettingsFn);

  if (!apiKey) {
    throw new Error('API Key 未设置');
  }

  const systemPrompt = `你是一个专业的电商客服，擅长生成邀请好评的话术。生成的话术应该礼貌、诚恳、不强求，让买家感到舒适。`;

  const userMessage = `请为商品"${productName}"生成一条邀请好评的话术。`;

  return callClaude({ systemPrompt, userMessage, apiKey });
}

module.exports = {
  generateReply,
  generateInviteMessage,
  getApiKey,
  callClaude,
  AI_CONFIG
};
