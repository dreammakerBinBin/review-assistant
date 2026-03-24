/**
 * Review Assistant - Popup JS
 * Main UI logic for the browser extension
 */

// Icons SVG for reuse
const ICONS = {
  star: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 6 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`
};

// State
let currentFilter = 'all';
let currentReview = null;
let currentTemplateId = null;

// DOM Elements
const elements = {
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabPanels: document.querySelectorAll('.tab-panel'),
  filterTags: document.querySelectorAll('.filter-tag'),
  reviewsList: document.getElementById('reviews-list'),
  emptyState: document.getElementById('empty-state'),
  templatesList: document.getElementById('templates-list'),
  modalAddReview: document.getElementById('modal-add-review'),
  modalReply: document.getElementById('modal-reply'),
  modalAddTemplate: document.getElementById('modal-add-template'),
  toastContainer: document.getElementById('toast-container'),
  statusText: document.getElementById('status-text'),
  apiKeyInput: document.getElementById('api-key'),
  btnTestApi: document.getElementById('btn-test-api'),
  apiStatus: document.getElementById('api-status')
};

// ==================== Storage ====================

const storage = {
  async get(key) {
    return new Promise(resolve => {
      chrome.storage.local.get(key, result => {
        resolve(result[key] || (key === 'reviews' ? [] : key === 'templates' ? [] : {}));
      });
    });
  },

  async set(key, value) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    });
  },

  async getReviews() {
    return this.get('reviews');
  },

  async saveReview(review) {
    const reviews = await this.getReviews();
    const index = reviews.findIndex(r => r.id === review.id);
    if (index >= 0) {
      reviews[index] = review;
    } else {
      reviews.unshift(review);
    }
    await this.set('reviews', reviews);
    return reviews;
  },

  async deleteReview(id) {
    const reviews = await this.getReviews();
    const filtered = reviews.filter(r => r.id !== id);
    await this.set('reviews', filtered);
    return filtered;
  },

  async getTemplates() {
    const templates = await this.get('templates');
    if (templates.length === 0) {
      return this.getDefaultTemplates();
    }
    return templates;
  },

  getDefaultTemplates() {
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
  },

  async saveTemplate(template) {
    const templates = await this.getTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    await this.set('templates', templates);
    return templates;
  },

  async deleteTemplate(id) {
    const templates = await this.getTemplates();
    const filtered = templates.filter(t => t.id !== id);
    await this.set('templates', filtered);
    return filtered;
  },

  async getSettings() {
    return this.get('settings');
  },

  async saveSettings(settings) {
    await this.set('settings', settings);
    return settings;
  }
};

// ==================== Utils ====================

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRatingLabel(rating) {
  if (rating >= 4) return '好评';
  if (rating === 3) return '中评';
  return '差评';
}

function filterReviews(reviews, filter) {
  switch (filter) {
    case 'pending': return reviews.filter(r => !r.replied);
    case 'replied': return reviews.filter(r => r.replied);
    case 'negative': return reviews.filter(r => r.rating <= 2);
    default: return reviews;
  }
}

function applyVariables(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
}

// ==================== Toast ====================

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}

// ==================== Tab Navigation ====================

function initTabs() {
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;

      elements.tabBtns.forEach(b => b.classList.remove('active'));
      elements.tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`tab-${tab}`).classList.add('active');
    });
  });
}

// ==================== Filter Tags ====================

function initFilters() {
  elements.filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
      currentFilter = tag.dataset.filter;

      elements.filterTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');

      renderReviews();
    });
  });
}

// ==================== Reviews ====================

async function renderReviews() {
  const reviews = await storage.getReviews();
  const filtered = filterReviews(reviews, currentFilter);

  if (filtered.length === 0) {
    elements.reviewsList.innerHTML = '';
    elements.reviewsList.appendChild(elements.emptyState);
    elements.emptyState.style.display = 'flex';
    return;
  }

  elements.emptyState.style.display = 'none';
  elements.reviewsList.innerHTML = filtered.map(review => createReviewCard(review)).join('');

  // Attach event listeners
  elements.reviewsList.querySelectorAll('.btn-reply').forEach(btn => {
    btn.addEventListener('click', () => openReplyModal(btn.dataset.id));
  });

  elements.reviewsList.querySelectorAll('.btn-ai').forEach(btn => {
    btn.addEventListener('click', () => generateAIReply(btn.dataset.id));
  });

  elements.reviewsList.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => copyReviewReply(btn.dataset.id));
  });
}

function createReviewCard(review) {
  const ratingClass = review.rating <= 2 ? 'negative' : '';
  const stars = ICONS.star.repeat(review.rating);

  return `
    <div class="review-card" data-id="${review.id}">
      <div class="review-header">
        <div>
          <div class="review-buyer">${escapeHtml(review.buyerName)}</div>
          <div class="review-product">${escapeHtml(review.product)}</div>
        </div>
        <span class="review-status ${review.replied ? 'replied' : 'pending'}">
          ${review.replied ? '已回复' : '待回复'}
        </span>
      </div>
      <div class="review-meta">
        <span class="rating-stars ${ratingClass}">${stars}</span>
        <span>${getRatingLabel(review.rating)}</span>
        <span>${review.date || formatDate(new Date().toISOString())}</span>
      </div>
      <div class="review-content">${escapeHtml(review.content)}</div>
      <div class="review-actions">
        <button class="btn btn-secondary btn-reply" data-id="${review.id}">回复</button>
        <button class="btn btn-secondary btn-ai" data-id="${review.id}" ${review.replied ? 'disabled' : ''}>AI生成</button>
        <button class="btn btn-secondary btn-copy" data-id="${review.id}" ${!review.replied ? 'disabled' : ''}>复制</button>
      </div>
    </div>
  `;
}

async function openReplyModal(reviewId) {
  const reviews = await storage.getReviews();
  currentReview = reviews.find(r => r.id === reviewId);

  if (!currentReview) return;

  document.getElementById('reply-modal-title').textContent = '回复评价';
  document.getElementById('reply-review-info').innerHTML = `
    <p><strong>${escapeHtml(currentReview.buyerName)}</strong></p>
    <p>${escapeHtml(currentReview.product)} - ${getRatingLabel(currentReview.rating)}</p>
    <p>${escapeHtml(currentReview.content)}</p>
  `;
  document.getElementById('reply-content').value = currentReview.replyContent || '';

  elements.modalReply.classList.remove('hidden');
}

async function copyReviewReply(reviewId) {
  const reviews = await storage.getReviews();
  const review = reviews.find(r => r.id === reviewId);

  if (!review || !review.replyContent) {
    showToast('暂无回复内容', 'warning');
    return;
  }

  const success = await copyToClipboard(review.replyContent);
  if (success) {
    showToast('已复制到剪贴板');
  } else {
    showToast('复制失败', 'error');
  }
}

async function generateAIReply(reviewId) {
  const reviews = await storage.getReviews();
  const review = reviews.find(r => r.id === reviewId);

  if (!review) return;

  const settings = await storage.getSettings();
  if (!settings.apiKey) {
    showToast('请先设置 API Key', 'warning');
    elements.tabBtns.forEach(b => b.classList.remove('active'));
    elements.tabPanels.forEach(p => p.classList.remove('active'));
    document.querySelector('[data-tab="ai"]').classList.add('active');
    document.getElementById('tab-ai').classList.add('active');
    return;
  }

  const btn = document.querySelector(`.btn-ai[data-id="${reviewId}"]`);
  btn.innerHTML = '<span class="loading"></span>';
  btn.disabled = true;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: '你是一个专业的电商客服，擅长生成礼貌、专业、简洁的评价回复。',
        messages: [
          {
            role: 'user',
            content: `买家评价（${getRatingLabel(review.rating)}，${review.rating}星）：\n买家：${review.buyerName}\n商品：${review.product}\n评价内容：${review.content}\n\n请生成一条回复。`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.content && data.content.find(c => c.type === 'text');
    const reply = textContent ? textContent.text : '';

    document.getElementById('reply-content').value = reply;
    currentReview = review;
    elements.modalReply.classList.remove('hidden');
    document.getElementById('reply-review-info').innerHTML = `
      <p><strong>${escapeHtml(review.buyerName)}</strong></p>
      <p>${escapeHtml(review.product)} - ${getRatingLabel(review.rating)}</p>
      <p>${escapeHtml(review.content)}</p>
    `;

  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.innerHTML = 'AI生成';
    btn.disabled = false;
  }
}

// ==================== Add Review Modal ====================

function initAddReviewModal() {
  const modal = elements.modalAddReview;
  let selectedRating = 5;

  document.getElementById('btn-add-review').addEventListener('click', () => {
    // Reset form
    document.getElementById('review-buyer').value = '';
    document.getElementById('review-product').value = '';
    document.getElementById('review-content').value = '';
    selectedRating = 5;
    document.querySelectorAll('.rating-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.rating) === 5);
    });
    modal.classList.remove('hidden');
  });

  // Rating buttons
  modal.querySelectorAll('.rating-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.dataset.rating);
      modal.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Save
  document.getElementById('btn-save-review').addEventListener('click', async () => {
    const buyerName = document.getElementById('review-buyer').value.trim();
    const product = document.getElementById('review-product').value.trim();
    const content = document.getElementById('review-content').value.trim();

    if (!buyerName || !product || !content) {
      showToast('请填写完整信息', 'warning');
      return;
    }

    const review = {
      id: generateId(),
      buyerName,
      product,
      rating: selectedRating,
      content,
      date: formatDate(new Date().toISOString()),
      replied: false,
      replyContent: ''
    };

    await storage.saveReview(review);
    modal.classList.add('hidden');
    renderReviews();
    showToast('评价已添加');
    updateStatus();
  });
}

function initReplyModal() {
  const modal = elements.modalReply;

  // Templates dropdown
  document.getElementById('btn-use-template').addEventListener('click', async () => {
    const dropdown = document.getElementById('templates-dropdown');
    const templates = await storage.getTemplates();

    dropdown.innerHTML = templates
      .filter(t => t.category === 'reply')
      .map(t => `
        <div class="templates-dropdown-item" data-id="${t.id}" data-content="${escapeAttr(t.content)}">
          <div class="templates-dropdown-item-name">${escapeHtml(t.name)}</div>
          <div class="templates-dropdown-item-preview">${escapeHtml(t.content)}</div>
        </div>
      `)
      .join('');

    dropdown.classList.toggle('hidden');

    dropdown.querySelectorAll('.templates-dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const content = item.dataset.content;
        const variables = { buyerName: currentReview?.buyerName || '', product: currentReview?.product || '' };
        document.getElementById('reply-content').value = applyVariables(content, variables);
        dropdown.classList.add('hidden');
      });
    });
  });

  // Copy reply
  document.getElementById('btn-copy-reply').addEventListener('click', async () => {
    const content = document.getElementById('reply-content').value.trim();
    if (!content) {
      showToast('回复内容为空', 'warning');
      return;
    }

    const success = await copyToClipboard(content);
    if (success) {
      showToast('已复制到剪贴板');
    }
  });

  // Save reply
  document.getElementById('btn-save-reply').addEventListener('click', async () => {
    const replyContent = document.getElementById('reply-content').value.trim();

    if (!replyContent) {
      showToast('请输入回复内容', 'warning');
      return;
    }

    if (currentReview) {
      await storage.saveReview({
        ...currentReview,
        replied: true,
        replyContent
      });
    }

    modal.classList.add('hidden');
    renderReviews();
    showToast('回复已保存');
    updateStatus();
  });

  // AI Generate
  document.getElementById('btn-generate-ai').addEventListener('click', () => {
    if (currentReview) {
      generateAIReply(currentReview.id);
    }
  });
}

// ==================== Templates ====================

async function renderTemplates() {
  const templates = await storage.getTemplates();

  if (templates.length === 0) {
    elements.templatesList.innerHTML = '<p class="empty-hint">暂无模板</p>';
    return;
  }

  elements.templatesList.innerHTML = templates.map(t => `
    <div class="template-card" data-id="${t.id}">
      <div class="template-header">
        <span class="template-name">${escapeHtml(t.name)}</span>
        <span class="template-category">${t.category === 'reply' ? '回复' : '邀请'}</span>
      </div>
      <div class="template-preview">${escapeHtml(t.content)}</div>
      <div class="template-actions">
        <button class="btn btn-secondary btn-edit-template" data-id="${t.id}">${ICONS.edit}</button>
        <button class="btn btn-secondary btn-delete-template" data-id="${t.id}">${ICONS.trash}</button>
      </div>
    </div>
  `).join('');

  // Attach listeners
  elements.templatesList.querySelectorAll('.btn-edit-template').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditTemplateModal(btn.dataset.id);
    });
  });

  elements.templatesList.querySelectorAll('.btn-delete-template').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await storage.deleteTemplate(btn.dataset.id);
      renderTemplates();
      showToast('模板已删除');
      updateStatus();
    });
  });
}

function initAddTemplateModal() {
  const modal = elements.modalAddTemplate;

  document.getElementById('btn-add-template').addEventListener('click', () => {
    currentTemplateId = null;
    document.getElementById('template-modal-title').textContent = '新增模板';
    document.getElementById('template-name').value = '';
    document.getElementById('template-content').value = '';
    document.getElementById('template-category').value = 'reply';
    modal.classList.remove('hidden');
  });

  document.getElementById('btn-save-template').addEventListener('click', async () => {
    const name = document.getElementById('template-name').value.trim();
    const content = document.getElementById('template-content').value.trim();
    const category = document.getElementById('template-category').value;

    if (!name || !content) {
      showToast('请填写完整信息', 'warning');
      return;
    }

    const template = {
      id: currentTemplateId || generateId(),
      name,
      content,
      category
    };

    await storage.saveTemplate(template);
    modal.classList.add('hidden');
    renderTemplates();
    showToast(currentTemplateId ? '模板已更新' : '模板已添加');
    updateStatus();
  });
}

async function openEditTemplateModal(templateId) {
  const templates = await storage.getTemplates();
  const template = templates.find(t => t.id === templateId);

  if (!template) return;

  currentTemplateId = templateId;
  document.getElementById('template-modal-title').textContent = '编辑模板';
  document.getElementById('template-name').value = template.name;
  document.getElementById('template-content').value = template.content;
  document.getElementById('template-category').value = template.category;
  elements.modalAddTemplate.classList.remove('hidden');
}

// ==================== AI Settings ====================

async function initAISettings() {
  const settings = await storage.getSettings();
  elements.apiKeyInput.value = settings.apiKey || '';

  document.getElementById('btn-test-api').addEventListener('click', async () => {
    const apiKey = elements.apiKeyInput.value.trim();

    if (!apiKey) {
      elements.apiStatus.className = 'api-status error';
      elements.apiStatus.textContent = '请输入 API Key';
      return;
    }

    elements.apiStatus.innerHTML = '<span class="loading"></span> 测试中...';
    elements.apiStatus.className = 'api-status';

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }]
        })
      });

      if (response.ok) {
        elements.apiStatus.className = 'api-status success';
        elements.apiStatus.textContent = '连接成功';
        await storage.saveSettings({ ...settings, apiKey });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      elements.apiStatus.className = 'api-status error';
      elements.apiStatus.textContent = '连接失败: ' + err.message;
    }
  });
}

// ==================== Modal Close ====================

function initModals() {
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal').classList.add('hidden');
    });
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
}

// ==================== Status Bar ====================

async function updateStatus() {
  const reviews = await storage.getReviews();
  const pending = reviews.filter(r => !r.replied).length;
  elements.statusText.textContent = `${reviews.length} 条评价，${pending} 条待回复`;
}

// ==================== Helpers ====================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text) {
  return text.replace(/"/g, '&quot;');
}

// ==================== Init ====================

async function init() {
  initTabs();
  initFilters();
  initModals();
  initAddReviewModal();
  initReplyModal();
  initAddTemplateModal();
  initAISettings();

  await renderReviews();
  await renderTemplates();
  await updateStatus();
}

// Start
document.addEventListener('DOMContentLoaded', init);
