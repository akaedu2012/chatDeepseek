/**
 * MessageInput 组件 - 消息输入框
 * 
 * 提供用户输入和发送消息的界面
 * 涉及需求: 1.1, 1.2, 1.3, 1.4
 */

'use client';

import { useState, KeyboardEvent, ChangeEvent } from 'react';

/**
 * MessageInputProps - 组件属性接口
 */
export interface MessageInputProps {
  /** 发送消息的回调函数 */
  onSend: (message: string) => void;
  
  /** 是否禁用输入（发送中状态） */
  disabled: boolean;
  
  /** 输入框占位符文本 */
  placeholder?: string;
}

/**
 * MessageInput 组件
 * 
 * 需求覆盖:
 * - 1.1: 显示用户输入的文本内容
 * - 1.2: 点击发送按钮或按下回车键发送消息
 * - 1.3: 发送中禁用输入框和发送按钮
 * - 1.4: 输入为空时禁用发送按钮
 */
export default function MessageInput({ onSend, disabled, placeholder = '输入消息...' }: MessageInputProps) {
  const [input, setInput] = useState('');

  /**
   * 处理输入变化（需求 1.1）
   */
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  /**
   * 处理发送操作（需求 1.2）
   */
  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput(''); // 发送后清空输入框
    }
  };

  /**
   * 处理回车键发送（需求 1.2）
   * Shift+回车：换行
   * 回车：发送
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 需求 1.4: 输入为空或仅包含空格时禁用发送按钮
  const isSendDisabled = disabled || input.trim().length === 0;

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          rows={1}
          style={{
            minHeight: '44px',
            maxHeight: '120px',
          }}
        />
        <button
          onClick={handleSend}
          disabled={isSendDisabled}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
        >
          发送
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        按 Enter 发送，Shift + Enter 换行
      </p>
    </div>
  );
}
