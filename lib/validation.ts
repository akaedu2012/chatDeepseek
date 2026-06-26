/**
 * 输入验证工具模块
 * 
 * 本文件提供用户输入验证功能
 * 涉及需求: 1.4 (输入验证), 10.1 (错误处理)
 */

/**
 * ValidationResult - 验证结果接口
 * 
 * 返回验证是否通过以及错误信息（如有）
 */
export interface ValidationResult {
  /** 验证是否通过 */
  valid: boolean;
  
  /** 错误信息（验证失败时提供） */
  error?: string;
}

/**
 * validateUserInput - 验证用户输入
 * 
 * 验证规则：
 * 1. 不能为空字符串
 * 2. 不能为纯空格
 * 3. 长度不能超过 4000 字符
 * 
 * @param input - 用户输入的字符串
 * @returns ValidationResult - 验证结果对象
 * 
 * 需求覆盖: 1.4 (验证输入非空), 10.1 (输入验证错误处理)
 * 
 * @example
 * ```typescript
 * const result = validateUserInput('Hello');
 * if (result.valid) {
 *   // 输入有效，继续处理
 * } else {
 *   // 显示错误信息
 *   console.error(result.error);
 * }
 * ```
 */
export function validateUserInput(input: string): ValidationResult {
  // 验证规则 1: 检查是否为空字符串或纯空格
  if (input.trim().length === 0) {
    return {
      valid: false,
      error: '消息内容不能为空'
    };
  }
  
  // 验证规则 2: 检查长度是否超过 4000 字符
  if (input.length > 4000) {
    return {
      valid: false,
      error: '消息长度不能超过 4000 字符'
    };
  }
  
  // 验证通过
  return { valid: true };
}
