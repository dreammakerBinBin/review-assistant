/**
 * Review Assistant - Storage Module Tests
 * TDD RED: 测试数据存储功能
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

const { saveReview, getReviews, deleteReview } = require('../src/storage.js');

describe('Storage Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveReview', () => {
    test('保存评价到本地存储', async () => {
      mockStorage.get.mockResolvedValue({ reviews: [] });
      mockStorage.set.mockResolvedValue(undefined);

      const review = {
        id: 'test-123',
        buyerName: '张三',
        product: '商品A',
        rating: 5,
        content: '很不错的商品！',
        date: '2026-03-24'
      };

      await saveReview(review);

      expect(mockStorage.set).toHaveBeenCalledWith({
        reviews: expect.arrayContaining([
          expect.objectContaining({
            id: 'test-123',
            buyerName: '张三'
          })
        ])
      });
    });

    test('更新已存在的评价', async () => {
      const existingReviews = [{
        id: 'test-123',
        buyerName: '张三',
        product: '商品A',
        rating: 5,
        content: '很不错的商品！',
        date: '2026-03-24',
        replied: false
      }];

      mockStorage.get.mockResolvedValue({ reviews: existingReviews });
      mockStorage.set.mockResolvedValue(undefined);

      await saveReview({
        ...existingReviews[0],
        replied: true,
        replyContent: '感谢好评！'
      });

      const calls = mockStorage.set.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0].reviews[0].replied).toBe(true);
    });
  });

  describe('getReviews', () => {
    test('获取空列表返回空数组', async () => {
      mockStorage.get.mockResolvedValue({ reviews: [] });

      const reviews = await getReviews();
      expect(reviews).toEqual([]);
    });

    test('获取评价列表', async () => {
      const mockReviews = [
        { id: '1', buyerName: '张三', rating: 5 },
        { id: '2', buyerName: '李四', rating: 3 }
      ];

      mockStorage.get.mockResolvedValue({ reviews: mockReviews });

      const reviews = await getReviews();
      expect(reviews).toHaveLength(2);
      expect(reviews[0].buyerName).toBe('张三');
    });
  });

  describe('deleteReview', () => {
    test('删除指定评价', async () => {
      const mockReviews = [
        { id: '1', buyerName: '张三' },
        { id: '2', buyerName: '李四' }
      ];

      mockStorage.get.mockResolvedValue({ reviews: mockReviews });
      mockStorage.set.mockResolvedValue(undefined);

      await deleteReview('1');

      const calls = mockStorage.set.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0].reviews).toHaveLength(1);
      expect(lastCall[0].reviews[0].id).toBe('2');
    });
  });
});
