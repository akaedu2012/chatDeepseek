/**
 * MessageList 组件 - 消息列表展示
 * 
 * 显示对话历史和流式内容
 * 涉及需求: 3.1, 3.2, 3.3, 3.4, 4.2, 4.3
 */

'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types/chat';

/**
 * MessageListProps - 组件属性接口
 */
export interface MessageListProps {
  /** 消息历史列表 */
  messages: Message[];
  
  /** 当前流式内容缓冲 */
  streamingContent: string;
  
  /** 是否正在流式传输 */
  isStreaming: boolean;
}

/**
 * MessageList 组件
 * 
 * 需求覆盖:
 * - 3.1: 按时间顺序显示所有消息
 * - 3.2: 区分用户和 AI 助手消息的视觉样式
 * - 3.3: 新消息添加时自动滚动到最新位置
 * - 3.4: 对话历史超过可视区域时提供滚动功能
 * - 4.2: 显示流式内容
 * - 4.3: 流式传输时显示加载指示器
 */
export default function MessageList({ messages, streamingContent, isStreaming }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * 自动滚动到最新消息（需求 3.3）
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* 显示历史消息（需求 3.1） */}
      {messages.map((message, index) => (
        <div
          key={message.id || index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white' // 用户消息：右对齐，蓝色背景（需求 3.2）
                : 'bg-gray-200 text-gray-900' // AI 消息：左对齐，灰色背景（需求 3.2）
            }`}
          >
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
            <div
              className={`mt-1 text-xs ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      ))}

      {/* 显示流式内容（需求 4.2） */}
      {isStreaming && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-lg bg-gray-200 px-4 py-2 text-gray-900">
            <div className="whitespace-pre-wrap break-words">
              {streamingContent}
              {/* 加载指示器（需求 4.3） */}
              <span className="inline-block ml-1 w-2 h-4 bg-gray-600 animate-pulse"></span>
            </div>
          </div>
        </div>
      )}

      {/* 滚动锚点（需求 3.3） */}
      <div ref={messagesEndRef} />
    </div>
  );
}
