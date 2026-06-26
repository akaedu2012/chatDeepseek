/**
 * 错误处理工具模块单元测试
 * 
 * 测试 classifyAPIError 函数的错误分类和消息生成功能
 * 涉及需求: 10.1, 10.2, 10.3, 10.4
 */

import { classifyAPIError } from './error-handler';
import { APIError } from '@/types/chat';

describe('classifyAPIError', () => {
  describe('认证错误 (需求 10.2)', () => {
    it('应将 401 状态码分类为 auth 类型', () => {
      const error: APIError = classifyAPIError(401, 'Unauthorized');
      
      expect(error.type).toBe('auth');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('API 密钥无效，请检查配置');
    });
    
    it('应为 401 错误返回固定的用户友好消息', () => {
      // 测试不同的原始错误消息都返回统一的用户友好消息
      const error1 = classifyAPIError(401, 'Invalid API key');
      const error2 = classifyAPIError(401, 'Authentication failed');
      
      expect(error1.message).toBe('API 密钥无效，请检查配置');
      expect(error2.message).toBe('API 密钥无效，请检查配置');
    });
  });
  
  describe('频率限制错误 (需求 10.3)', () => {
    it('应将 429 状态码分类为 rate_limit 类型', () => {
      const error: APIError = classifyAPIError(429, 'Too Many Requests');
      
      expect(error.type).toBe('rate_limit');
      expect(error.statusCode).toBe(429);
      expect(error.message).toBe('请求过于频繁，请稍后再试');
    });
    
    it('应为 429 错误返回固定的用户友好消息', () => {
      const error = classifyAPIError(429, 'Rate limit exceeded');
      
      expect(error.message).toBe('请求过于频繁，请稍后再试');
    });
  });
  
  describe('服务器错误', () => {
    it('应将 500 状态码分类为 server 类型', () => {
      const error: APIError = classifyAPIError(500, 'Internal Server Error');
      
      expect(error.type).toBe('server');
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('服务暂时不可用，请稍后再试');
    });
    
    it('应将 502 状态码分类为 server 类型', () => {
      const error: APIError = classifyAPIError(502, 'Bad Gateway');
      
      expect(error.type).toBe('server');
      expect(error.message).toBe('服务暂时不可用，请稍后再试');
    });
    
    it('应将 503 状态码分类为 server 类型', () => {
      const error: APIError = classifyAPIError(503, 'Service Unavailable');
      
      expect(error.type).toBe('server');
      expect(error.message).toBe('服务暂时不可用，请稍后再试');
    });
    
    it('应将 599 状态码分类为 server 类型', () => {
      const error: APIError = classifyAPIError(599, 'Server Error');
      
      expect(error.type).toBe('server');
      expect(error.message).toBe('服务暂时不可用，请稍后再试');
    });
    
    it('应为所有 5xx 错误返回统一消息', () => {
      const errors = [500, 502, 503, 504, 599].map(code => 
        classifyAPIError(code, 'Server error')
      );
      
      errors.forEach(error => {
        expect(error.type).toBe('server');
        expect(error.message).toBe('服务暂时不可用，请稍后再试');
      });
    });
  });
  
  describe('网络错误 (需求 10.1)', () => {
    it('应将 statusCode 0 分类为 network 类型', () => {
      const error: APIError = classifyAPIError(0, 'fetch failed');
      
      expect(error.type).toBe('network');
      expect(error.statusCode).toBe(0);
      expect(error.message).toBe('网络连接失败，请检查您的网络设置');
    });
    
    it('应识别包含 "fetch" 的错误消息为网络错误', () => {
      const error = classifyAPIError(0, 'fetch failed: connection timeout');
      
      expect(error.type).toBe('network');
      expect(error.message).toBe('网络连接失败，请检查您的网络设置');
    });
    
    it('应识别包含 "network" 的错误消息为网络错误', () => {
      const error = classifyAPIError(0, 'network error occurred');
      
      expect(error.type).toBe('network');
      expect(error.message).toBe('网络连接失败，请检查您的网络设置');
    });
    
    it('应对大小写不敏感地识别网络错误关键词', () => {
      const error1 = classifyAPIError(200, 'FETCH failed');
      const error2 = classifyAPIError(200, 'Network Error');
      
      expect(error1.type).toBe('network');
      expect(error2.type).toBe('network');
    });
  });
  
  describe('未知错误 (需求 10.4)', () => {
    it('应将 400 状态码分类为 unknown 类型', () => {
      const error: APIError = classifyAPIError(400, 'Bad Request');
      
      expect(error.type).toBe('unknown');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('发生未知错误，请重试');
    });
    
    it('应将 404 状态码分类为 unknown 类型', () => {
      const error: APIError = classifyAPIError(404, 'Not Found');
      
      expect(error.type).toBe('unknown');
      expect(error.message).toBe('发生未知错误，请重试');
    });
    
    it('应将 403 状态码分类为 unknown 类型', () => {
      const error: APIError = classifyAPIError(403, 'Forbidden');
      
      expect(error.type).toBe('unknown');
      expect(error.message).toBe('发生未知错误，请重试');
    });
    
    it('应为未明确处理的状态码返回通用错误消息', () => {
      const statusCodes = [300, 301, 400, 403, 404, 418]; // 各种未明确处理的状态码
      
      statusCodes.forEach(code => {
        const error = classifyAPIError(code, 'Some error');
        expect(error.type).toBe('unknown');
        expect(error.message).toBe('发生未知错误，请重试');
      });
    });
  });
  
  describe('边界情况', () => {
    it('应正确处理空错误消息', () => {
      const error = classifyAPIError(401, '');
      
      expect(error.type).toBe('auth');
      expect(error.message).toBe('API 密钥无效，请检查配置');
    });
    
    it('应正确处理负数状态码', () => {
      const error = classifyAPIError(-1, 'unknown error');
      
      expect(error.type).toBe('unknown');
      expect(error.message).toBe('发生未知错误，请重试');
    });
    
    it('应返回包含所有必需字段的 APIError 对象', () => {
      const error = classifyAPIError(429, 'Rate limited');
      
      expect(error).toHaveProperty('statusCode');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('type');
      expect(typeof error.statusCode).toBe('number');
      expect(typeof error.message).toBe('string');
      expect(typeof error.type).toBe('string');
    });
    
    it('应正确处理 499 状态码 (边界)', () => {
      // 499 不在 5xx 范围内，应被分类为 unknown
      const error = classifyAPIError(499, 'Client closed request');
      
      expect(error.type).toBe('unknown');
    });
    
    it('应正确处理 600 状态码 (边界)', () => {
      // 600 超出 5xx 范围，应被分类为 unknown
      const error = classifyAPIError(600, 'Unknown error');
      
      expect(error.type).toBe('unknown');
    });
  });
  
  describe('错误消息映射完整性验证', () => {
    it('所有错误类型都应返回非空的用户友好消息', () => {
      const testCases: Array<[number, string]> = [
        [0, 'fetch failed'],        // network
        [401, 'Unauthorized'],      // auth
        [429, 'Too Many Requests'], // rate_limit
        [500, 'Server Error'],      // server
        [404, 'Not Found']          // unknown
      ];
      
      testCases.forEach(([statusCode, message]) => {
        const error = classifyAPIError(statusCode, message);
        expect(error.message).toBeTruthy();
        expect(error.message.length).toBeGreaterThan(0);
      });
    });
    
    it('错误消息应为中文', () => {
      const testCases = [
        classifyAPIError(0, 'fetch failed'),
        classifyAPIError(401, 'Unauthorized'),
        classifyAPIError(429, 'Too Many Requests'),
        classifyAPIError(500, 'Server Error'),
        classifyAPIError(404, 'Not Found')
      ];
      
      testCases.forEach(error => {
        // 验证消息包含中文字符
        expect(error.message).toMatch(/[\u4e00-\u9fa5]/);
      });
    });
  });
  
  describe('需求覆盖验证', () => {
    it('需求 10.1: 网络连接失败应显示正确提示', () => {
      const error = classifyAPIError(0, 'fetch failed');
      expect(error.message).toBe('网络连接失败，请检查您的网络设置');
    });
    
    it('需求 10.2: 401 错误应显示 API 密钥无效提示', () => {
      const error = classifyAPIError(401, 'Unauthorized');
      expect(error.message).toBe('API 密钥无效，请检查配置');
    });
    
    it('需求 10.3: 429 错误应显示请求频繁提示', () => {
      const error = classifyAPIError(429, 'Too Many Requests');
      expect(error.message).toBe('请求过于频繁，请稍后再试');
    });
    
    it('需求 10.4: 其他错误应显示通用错误提示并记录详细信息', () => {
      const error = classifyAPIError(404, 'Not Found');
      expect(error.message).toBe('发生未知错误，请重试');
      expect(error.statusCode).toBe(404); // 状态码被保留用于日志记录
    });
  });
});
