/**
 * 流式数据解析工具
 * 
 * 本文件实现了 DeepSeek API 返回的 SSE 格式流式数据的解析功能
 * 涉及需求: 2.2 (流式数据处理), 4.1 (流式响应渲染)
 */

import { StreamChunk, DeepSeekStreamChunk } from '@/types/chat';

/**
 * parseStreamChunk - 解析流式数据块
 * 
 * 将 DeepSeek API 返回的 SSE 格式数据解析为 StreamChunk 对象
 * 
 * @param rawData - 原始 SSE 数据字符串
 * @returns 解析后的 StreamChunk 对象，如果解析失败则返回 null
 * 
 * 处理的数据格式:
 * 1. 正常数据块: `data: {"choices":[{"delta":{"content":"你好"},"finish_reason":null}]}`
 * 2. 结束标记: `data: [DONE]`
 * 3. 格式错误数据: 返回 null
 * 
 * 需求覆盖: 2.2 (实时显示流式数据), 4.1 (接收流式数据块)
 * 
 * @example
 * // 解析正常内容块
 * const chunk1 = parseStreamChunk('{"choices":[{"delta":{"content":"你好"},"finish_reason":null}]}');
 * // 返回: { delta: "你好", isDone: false }
 * 
 * @example
 * // 解析结束标记
 * const chunk2 = parseStreamChunk('[DONE]');
 * // 返回: { delta: "", isDone: true }
 * 
 * @example
 * // 处理格式错误
 * const chunk3 = parseStreamChunk('invalid json');
 * // 返回: null
 */
export function parseStreamChunk(rawData: string): StreamChunk | null {
  // 处理结束标记 [DONE]
  if (rawData.trim() === '[DONE]') {
    return {
      delta: '',
      isDone: true,
    };
  }

  try {
    // 尝试解析 JSON 数据
    const json = JSON.parse(rawData) as DeepSeekStreamChunk;

    // 提取增量内容
    // 如果 choices[0]?.delta?.content 存在则使用，否则为空字符串
    const delta = json.choices?.[0]?.delta?.content || '';

    // 提取完成原因
    // 如果 finish_reason 不为 null，说明流已结束
    const finishReason = json.choices?.[0]?.finish_reason;

    return {
      delta,
      isDone: finishReason !== null,
      finishReason: finishReason || undefined,
    };
  } catch (error) {
    // JSON 解析失败，返回 null
    // 这可能是由于网络传输错误或数据格式不正确导致的
    return null;
  }
}
