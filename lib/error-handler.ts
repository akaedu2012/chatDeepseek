/**
 * 错误处理工具模块
 * 
 * 本文件提供 API 错误分类和用户友好错误消息生成功能
 * 涉及需求: 10.1, 10.2, 10.3, 10.4
 */

import { APIError } from '@/types/chat';

/**
 * 将 HTTP 状态码和错误消息分类为结构化的 APIError
 * 
 * 根据不同的 HTTP 状态码，将错误分类为以下类型：
 * - auth (401): API 密钥认证错误
 * - rate_limit (429): 请求频率限制错误
 * - server (5xx): 服务器端错误
 * - network: 网络连接错误
 * - unknown: 其他未知错误
 * 
 * 需求覆盖:
 * - 10.1: 网络请求失败的错误提示
 * - 10.2: 401 错误的 API 密钥无效提示
 * - 10.3: 429 错误的请求频繁提示
 * - 10.4: 其他错误的通用提示
 * 
 * @param statusCode - HTTP 状态码（0 表示网络错误）
 * @param message - 原始错误消息
 * @returns APIError 对象，包含分类后的错误类型和用户友好消息
 * 
 * @example
 * ```typescript
 * // 认证错误
 * const error = classifyAPIError(401, 'Unauthorized');
 * // { statusCode: 401, message: 'API 密钥无效，请检查配置', type: 'auth' }
 * 
 * // 频率限制错误
 * const error = classifyAPIError(429, 'Too Many Requests');
 * // { statusCode: 429, message: '请求过于频繁，请稍后再试', type: 'rate_limit' }
 * 
 * // 网络错误
 * const error = classifyAPIError(0, 'fetch failed');
 * // { statusCode: 0, message: '网络连接失败，请检查您的网络设置', type: 'network' }
 * ```
 */
export function classifyAPIError(statusCode: number, message: string): APIError {
  // 网络连接错误（statusCode 为 0 或 fetch 失败相关消息）
  if (statusCode === 0 || message.toLowerCase().includes('fetch') || message.toLowerCase().includes('network')) {
    return {
      statusCode,
      message: '网络连接失败，请检查您的网络设置',
      type: 'network'
    };
  }
  
  // 401 - 认证错误（需求 10.2）
  if (statusCode === 401) {
    return {
      statusCode,
      message: 'API 密钥无效，请检查配置',
      type: 'auth'
    };
  }
  
  // 429 - 请求频率限制错误（需求 10.3）
  if (statusCode === 429) {
    return {
      statusCode,
      message: '请求过于频繁，请稍后再试',
      type: 'rate_limit'
    };
  }
  
  // 5xx - 服务器错误
  if (statusCode >= 500 && statusCode < 600) {
    return {
      statusCode,
      message: '服务暂时不可用，请稍后再试',
      type: 'server'
    };
  }
  
  // 其他错误（需求 10.4）
  return {
    statusCode,
    message: '发生未知错误，请重试',
    type: 'unknown'
  };
}
