/**
 * Review Assistant - Templates Module
 * 模板管理
 */

const { getTemplates, saveTemplate, deleteTemplate: removeTemplate } = require('./storage.js');

/**
 * 应用变量到模板
 * @param {string} template - 模板内容
 * @param {Object} variables - 变量对象
 * @returns {string}
 */
function applyVariables(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

/**
 * 删除模板
 * @param {string} templateId - 模板ID
 */
async function deleteTemplate(templateId) {
  return removeTemplate(templateId);
}

module.exports = {
  getTemplates,
  saveTemplate,
  deleteTemplate,
  applyVariables
};
