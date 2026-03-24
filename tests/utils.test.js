/**
 * Review Assistant - Utils Module Tests
 * TDD RED: 测试工具函数
 */

const { formatDate, generateId, truncateText, getRatingLabel, filterReviews } = require('../src/utils.js');

describe('Utils Module', () => {
  describe('formatDate', () => {
    test('格式化日期为 YYYY-MM-DD', () => {
      const date = new Date('2026-03-24T10:30:00');
      const result = formatDate(date);

      expect(result).toBe('2026-03-24');
    });
  });

  describe('generateId', () => {
    test('生成唯一 ID', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    test('ID 包含时间戳', () => {
      const id = generateId();
      const timestamp = parseInt(id.split('-')[0], 10);

      expect(timestamp).toBeGreaterThan(0);
      expect(timestamp).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('truncateText', () => {
    test('截断长文本添加省略号', () => {
      const text = '这是一段很长的评价内容，需要被截断显示';
      const result = truncateText(text, 10);

      // JavaScript 字符截取: "这是一段很长的评价内" (10字符) + "..." = 13字符
      expect(result.length).toBeLessThanOrEqual(13);
      expect(result.endsWith('...')).toBe(true);
    });

    test('短文本不截断', () => {
      const text = '短文本';
      const result = truncateText(text, 10);

      expect(result).toBe('短文本');
    });

    test('默认截断长度 100', () => {
      const longText = 'a'.repeat(200);
      const result = truncateText(longText);

      expect(result.length).toBeLessThanOrEqual(103); // 100 + '...'
      expect(result.endsWith('...')).toBe(true);
    });
  });

  describe('getRatingLabel', () => {
    test('返回正确的星级标签', () => {
      expect(getRatingLabel(5)).toBe('好评');
      expect(getRatingLabel(4)).toBe('好评');
      expect(getRatingLabel(3)).toBe('中评');
      expect(getRatingLabel(2)).toBe('差评');
      expect(getRatingLabel(1)).toBe('差评');
    });
  });

  describe('filterReviews', () => {
    test('按状态筛选评价', () => {
      const reviews = [
        { id: '1', rating: 5, replied: false },
        { id: '2', rating: 5, replied: true },
        { id: '3', rating: 2, replied: false },
        { id: '4', rating: 3, replied: true }
      ];

      expect(filterReviews(reviews, 'pending')).toHaveLength(2);
      expect(filterReviews(reviews, 'replied')).toHaveLength(2);
      expect(filterReviews(reviews, 'negative')).toHaveLength(1);
      expect(filterReviews(reviews, 'all')).toHaveLength(4);
    });
  });
});
