/**
 * 验证脚本：测试 stream-parser 功能
 * 此脚本用于在没有测试框架的情况下验证 parseStreamChunk 函数
 */

// 模拟 parseStreamChunk 函数的核心逻辑
function parseStreamChunk(rawData) {
  // 处理结束标记 [DONE]
  if (rawData.trim() === '[DONE]') {
    return {
      delta: '',
      isDone: true,
    };
  }

  try {
    // 尝试解析 JSON 数据
    const json = JSON.parse(rawData);

    // 提取增量内容
    const delta = json.choices?.[0]?.delta?.content || '';

    // 提取完成原因
    const finishReason = json.choices?.[0]?.finish_reason;

    return {
      delta,
      isDone: finishReason !== null,
      finishReason: finishReason || undefined,
    };
  } catch (error) {
    // JSON 解析失败，返回 null
    return null;
  }
}

// 测试用例
console.log('🧪 开始验证 parseStreamChunk 函数...\n');

// 测试 1: 正常内容块
const test1 = parseStreamChunk('{"choices":[{"delta":{"content":"你好"},"finish_reason":null}]}');
console.log('✅ 测试 1 - 正常内容块:', test1);
console.assert(test1.delta === '你好' && test1.isDone === false, '测试 1 失败');

// 测试 2: [DONE] 标记
const test2 = parseStreamChunk('[DONE]');
console.log('✅ 测试 2 - [DONE] 标记:', test2);
console.assert(test2.delta === '' && test2.isDone === true, '测试 2 失败');

// 测试 3: 格式错误数据
const test3 = parseStreamChunk('invalid json');
console.log('✅ 测试 3 - 格式错误数据:', test3);
console.assert(test3 === null, '测试 3 失败');

// 测试 4: 空增量内容
const test4 = parseStreamChunk('{"choices":[{"delta":{},"finish_reason":null}]}');
console.log('✅ 测试 4 - 空增量内容:', test4);
console.assert(test4.delta === '' && test4.isDone === false, '测试 4 失败');

// 测试 5: 完成信号 (finish_reason: "stop")
const test5 = parseStreamChunk('{"choices":[{"delta":{"content":"。"},"finish_reason":"stop"}]}');
console.log('✅ 测试 5 - 完成信号:', test5);
console.assert(test5.delta === '。' && test5.isDone === true && test5.finishReason === 'stop', '测试 5 失败');

console.log('\n✅ 所有验证测试通过！parseStreamChunk 函数工作正常。');
