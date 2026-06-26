/**
 * 流式数据解析工具单元测试
 * 
 * 测试 parseStreamChunk 函数的各种场景
 * 涉及需求: 4.4 (流式响应幂等性)
 */

import { parseStreamChunk } from './stream-parser';

describe('parseStreamChunk', () => {
  describe('正常内容块解析', () => {
    it('应正确解析包含内容的数据块', () => {
      const rawData = '{"id":"test","object":"chat.completion.chunk","created":1234567890,"model":"deepseek-chat","choices":[{"index":0,"delta":{"content":"你好"},"finish_reason":null}]}';
      const result = parseStreamChunk(rawData);

      expect(result).toEqual({
        delta: '你好',
        isDone: false,
      });
    });

    it('应正确解析多字符内容', () => {
      const rawData = '{"choices":[{"delta":{"content":"Hello, world!"},"finish_reason":null}]}';
      const result = parseStreamChunk(rawData);

      expect(result).toEqual({
        delta: 'Hello, world!',
        isDone: false,
      });
    });

    it('应正确解析包含特殊字符的内容', () => {
      const rawData = '{"choices":[{"delta":{"content":"换行\\n和制表符\\t"},"finish_reason":null}]}';
      const result = parseStreamChunk(rawData);

      expect(result).not.toBeNull();
      expect(result?.delta).toBeTruthy();
    });
  });

  describe('[DONE] 结束标记处理', () => {
    it('应识别 [DONE] 标记', () => {
      const result = parseStreamChunk('[DONE]');

      expect(result).toEqual({
        delta: '',
        isDone: true,
      });
    });

    it('应识别带空格的 [DONE] 标记', () => {
      const result = parseStreamChunk('  [DONE]  ');

      expect(result).toEqual({
        delta: '',
        isDone: true,
      });
    });
  });

  describe('格式错误数据处理', () => {
    it('应处理无效的 JSON 数据', () => {
      const result = parseStreamChunk('invalid json');

      expect(result).toBeNull();
    });

    it('应处理空字符串', () => {
      const result = parseStreamChunk('');

      expect(result).toBeNull();
    });

    it('应处理不完整的 JSON 数据', () => {
      const result = parseStreamChunk('{"choices":[{"delta":');

      expect(result).toBeNull();
    });

    it('应处理格式错误的 JSON 对象', () => {
      const result = parseStreamChunk('{"invalid": "structure"}');

      // 由于缺少 choices 数组，delta 应为空字符串
      expect(result).toEqual({
        delta: '',
        isDone: false,
      });
    });
  });

  describe('空增量内容处理', () => {
    it('应处理 delta 为空对象的情况', () => {
      const rawData = '{"choices":[{"delta":{},"finish_reason":null}]}';
      const result = parseStreamChunk(rawData);

      expect(result).toEqual({
        delta: '',
        isDone: false,
      });
    });

    it('应处理 delta.content 为空字符串的情况', () => {
      const rawData = '{"choices":[{"delta":{"content":""},"finish_reason":null}]}';
      const result = parseStreamChunk(rawData);

      expect(result).toEqual({
        delta: '',
        isDone: false,
      });
    });

    it('应处理缺少 content 字段的情况', () => {
      const rawData = '{"choices":[{"delta":{"role":"assistant"},"finish_reason":null}]}';
      const result = parseStreamChunk(rawData);

      expect(result).toEqual({
        delta: '',
        isDone: false,
      });
    });
  });

  describe('完成信号处理', () => {
    it('应识别 finish_reason 为 stop 的情况', () => {
      const rawData = '{"choices":[{"delta":{},"finish_reason":"stop"}]}';
      const result = parseStreamChunk(rawData);

      expect(result).toEqual({
        delta: '',
        isDone: true,
        finishReason: 'stop',
      });
    });

    it('应识别 finish_reason 为 length 的情况', () => {
      const rawData = '{"choices":[{"delta":{},"finish_reason":"length"}]}';
      const result = parseStreamChunk(rawData);

      expect(result).toEqual({
        delta: '',
        isDone: true,
        finishReason: 'length',
      });
    });

    it('应处理最后一块包含内容的情况', () => {
      const rawData = '{"choices":[{"delta":{"content":"。"},"finish_reason":"stop"}]}';
      const result = parseStreamChunk(rawData);

      expect(result).toEqual({
        delta: '。',
        isDone: true,
        finishReason: 'stop',
      });
    });
  });

  describe('边界情况', () => {
    it('应处理 choices 数组为空的情况', () => {
      const rawData = '{"choices":[]}';
      const result = parseStreamChunk(rawData);

      expect(result).toEqual({
        delta: '',
        isDone: false,
      });
    });

    it('应处理缺少 choices 字段的情况', () => {
      const rawData = '{"id":"test","object":"chat.completion.chunk"}';
      const result = parseStreamChunk(rawData);

      expect(result).toEqual({
        delta: '',
        isDone: false,
      });
    });

    it('应处理包含多个 choices 的情况（只使用第一个）', () => {
      const rawData = '{"choices":[{"delta":{"content":"第一个"},"finish_reason":null},{"delta":{"content":"第二个"},"finish_reason":null}]}';
      const result = parseStreamChunk(rawData);

      expect(result).toEqual({
        delta: '第一个',
        isDone: false,
      });
    });
  });
});
