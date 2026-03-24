/**
 * Review Assistant - Templates Module Tests
 * TDD RED: 测试模板管理功能
 */

// Mock chrome before any requires
const mockStorage = {
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn()
};

global.chrome = {
  storage: {
    local: mockStorage
  }
};

const { getTemplates, saveTemplate, deleteTemplate, applyVariables } = require('../src/templates.js');

describe('Templates Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTemplates', () => {
    test('获取预设模板列表', async () => {
      mockStorage.get.mockResolvedValue({
        templates: [
          { id: '1', name: '感谢好评', content: '感谢您的支持！' },
          { id: '2', name: '道歉回复', content: '抱歉给您带来不便...' }
        ]
      });

      const templates = await getTemplates();

      expect(templates).toHaveLength(2);
      expect(templates[0].name).toBe('感谢好评');
    });

    test('无模板时返回默认模板', async () => {
      mockStorage.get.mockResolvedValue({ templates: [] });

      const templates = await getTemplates();

      expect(templates.length).toBeGreaterThan(0);
    });
  });

  describe('saveTemplate', () => {
    test('保存新模板', async () => {
      mockStorage.get.mockResolvedValue({ templates: [] });
      mockStorage.set.mockResolvedValue(undefined);

      const template = {
        id: 'new-1',
        name: '新模板',
        content: '这是新模板内容',
        category: 'reply'
      };

      await saveTemplate(template);

      expect(mockStorage.set).toHaveBeenCalledWith({
        templates: expect.arrayContaining([
          expect.objectContaining({ name: '新模板' })
        ])
      });
    });
  });

  describe('deleteTemplate', () => {
    test('删除模板', async () => {
      const mockTemplates = [
        { id: '1', name: '模板1' },
        { id: '2', name: '模板2' }
      ];

      mockStorage.get.mockResolvedValue({ templates: mockTemplates });
      mockStorage.set.mockResolvedValue(undefined);

      await deleteTemplate('1');

      const calls = mockStorage.set.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0].templates).toHaveLength(1);
      expect(lastCall[0].templates[0].id).toBe('2');
    });
  });

  describe('applyVariables', () => {
    test('替换模板变量', () => {
      const template = '尊敬的 {buyerName}，感谢您购买 {product}！';
      const variables = {
        buyerName: '张三',
        product: '商品A'
      };

      const result = applyVariables(template, variables);

      expect(result).toBe('尊敬的 张三，感谢您购买 商品A！');
    });

    test('未提供的变量保持原样', () => {
      const template = '尊敬的 {buyerName}，您购买的是 {product}！';
      const variables = { buyerName: '张三' };

      const result = applyVariables(template, variables);

      expect(result).toBe('尊敬的 张三，您购买的是 {product}！');
    });
  });
});
