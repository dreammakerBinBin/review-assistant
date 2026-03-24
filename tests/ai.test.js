/**
 * Review Assistant - AI Module Tests
 * TDD RED: 测试 AI 回复生成功能
 */

// Mock fetch
global.fetch = jest.fn();

const { generateReply, generateInviteMessage } = require('../src/ai.js');

describe('AI Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateReply', () => {
    test('使用 API Key 生成回复', async () => {
      const mockGetSettings = jest.fn().mockResolvedValue({
        apiKey: 'test-key-123'
      });

      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ type: 'text', text: '感谢您的好评！期待再次为您服务。' }]
        })
      });

      const review = {
        content: '商品质量很好，物流也很快！',
        rating: 5,
        buyerName: '张三',
        product: '商品A'
      };

      const reply = await generateReply(review, { getSettingsFn: mockGetSettings });

      expect(reply).toContain('感谢您的好评');
      expect(fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'test-key-123',
            'anthropic-version': '2023-06-01'
          })
        })
      );
    });

    test('未设置 API Key 时抛出错误', async () => {
      const mockGetSettings = jest.fn().mockResolvedValue({
        apiKey: ''
      });

      const review = { content: '测试评价', rating: 5 };

      await expect(generateReply(review, { getSettingsFn: mockGetSettings }))
        .rejects.toThrow('API Key 未设置');
    });

    test('API 请求失败时抛出错误', async () => {
      const mockGetSettings = jest.fn().mockResolvedValue({
        apiKey: 'test-key'
      });

      fetch.mockResolvedValue({
        ok: false,
        status: 401
      });

      const review = { content: '测试评价', rating: 5 };

      await expect(generateReply(review, { getSettingsFn: mockGetSettings }))
        .rejects.toThrow('API 请求失败');
    });
  });

  describe('generateInviteMessage', () => {
    test('生成好评邀请语', async () => {
      const mockGetSettings = jest.fn().mockResolvedValue({
        apiKey: 'test-key'
      });

      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ type: 'text', text: '亲，如果满意的话，希望能给个五星好评哦~' }]
        })
      });

      const message = await generateInviteMessage('商品A', { getSettingsFn: mockGetSettings });

      expect(message).toContain('五星好评');
    });

    test('未设置 API Key 时抛出错误', async () => {
      const mockGetSettings = jest.fn().mockResolvedValue({
        apiKey: ''
      });

      await expect(generateInviteMessage('商品A', { getSettingsFn: mockGetSettings }))
        .rejects.toThrow('API Key 未设置');
    });
  });
});
