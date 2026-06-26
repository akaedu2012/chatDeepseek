/**
 * 主页面组件 - 聊天界面
 * 
 * 整合所有组件，实现完整的聊天功能
 * 涉及需求: 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 4.1, 4.2, 4.3, 4.4, 9.1, 9.2, 10.1, 10.2, 10.3, 10.4
 */

'use client';

import { useState } from 'react';
import { Message, ChatState } from '@/types/chat';
import { validateUserInput } from '@/lib/validation';
import { parseStreamChunk } from '@/lib/stream-parser';
import { classifyAPIError } from '@/lib/error-handler';
import MessageList from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';
import ErrorMessage from '@/components/ErrorMessage';

export default function Home() {
  // 聊天状态管理（需求 3.1, 9.2）
  const [state, setState] = useState<ChatState>({
    messages: [],
    streamingContent: '',
    isLoading: false,
    error: null,
    isStreaming: false,
  });

  /**
   * 清空错误状态
   */
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  /**
   * 添加消息到历史（需求 3.1, 9.2）
   */
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const message: Message = {
      role,
      content,
      timestamp: Date.now(),
      id: `${Date.now()}-${Math.random()}`,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));

    return message;
  };

  /**
   * 处理流式响应（需求 2.2, 2.3, 4.1, 4.2, 4.3, 4.4）
   */
  const handleStreamResponse = async (response: Response) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法读取响应流');
    }

    setState(prev => ({ ...prev, isStreaming: true, streamingContent: '' }));

    try {
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // 解码数据块
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          // 解析 SSE 格式: data: {json}
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            // 处理流结束标记
            if (data === '[DONE]') {
              // 将完整内容添加到消息历史（需求 2.3, 4.4）
              if (fullContent) {
                addMessage('assistant', fullContent);
              }
              setState(prev => ({
                ...prev,
                isStreaming: false,
                streamingContent: '',
                isLoading: false,
              }));
              return;
            }

            // 解析数据块（需求 4.1）
            const parsed = parseStreamChunk(data);

            if (parsed && parsed.delta) {
              fullContent += parsed.delta;

              // 实时更新流式内容显示（需求 4.2）
              setState(prev => ({
                ...prev,
                streamingContent: fullContent,
              }));
            }

            // 检查是否已完成（需求 4.4）
            if (parsed && parsed.isDone) {
              if (fullContent) {
                addMessage('assistant', fullContent);
              }
              setState(prev => ({
                ...prev,
                isStreaming: false,
                streamingContent: '',
                isLoading: false,
              }));
              return;
            }
          }
        }
      }
    } catch (error) {
      console.error('流式响应错误:', error);
      setState(prev => ({
        ...prev,
        error: '接收响应时发生错误，请重试',
        isStreaming: false,
        isLoading: false,
      }));
    } finally {
      reader.releaseLock();
    }
  };

  /**
   * 处理发送消息（需求 1.2, 1.3, 2.1, 9.1, 10.1）
   */
  const handleSendMessage = async (userInput: string) => {
    // 验证输入（需求 1.4, 10.1）
    const validation = validateUserInput(userInput);
    if (!validation.valid) {
      setState(prev => ({ ...prev, error: validation.error || '输入无效' }));
      return;
    }

    // 清空之前的错误
    clearError();

    // 添加用户消息到历史（需求 1.2, 9.2）
    addMessage('user', userInput);

    // 设置加载状态（需求 1.3）
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // 构造完整的消息历史发送给 API（需求 9.1）
      const messagesToSend = [
        ...state.messages,
        { role: 'user' as const, content: userInput },
      ];

      // 调用 API（需求 2.1）
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messagesToSend }),
      });

      if (!response.ok) {
        // 处理 API 错误（需求 10.1, 10.2, 10.3, 10.4）
        const errorData = await response.json();
        const apiError = classifyAPIError(
          response.status,
          errorData.error || 'Unknown error'
        );

        setState(prev => ({
          ...prev,
          error: apiError.message,
          isLoading: false,
        }));
        return;
      }

      // 处理流式响应（需求 2.2, 4.1）
      await handleStreamResponse(response);

    } catch (error) {
      console.error('发送消息错误:', error);

      // 处理网络错误（需求 10.1）
      const apiError = classifyAPIError(
        0,
        error instanceof Error ? error.message : 'Unknown error'
      );

      setState(prev => ({
        ...prev,
        error: apiError.message,
        isLoading: false,
        isStreaming: false,
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            DeepSeek 聊天助手
          </h1>
          <p className="text-sm text-gray-500">基于 DeepSeek 大模型的智能对话系统</p>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 overflow-hidden flex flex-col max-w-4xl w-full mx-auto bg-white shadow-lg">
        {/* 错误提示 */}
        {state.error && (
          <div className="p-4">
            <ErrorMessage
              message={state.error}
              onClose={clearError}
              type="error"
            />
          </div>
        )}

        {/* 消息列表 */}
        <MessageList
          messages={state.messages}
          streamingContent={state.streamingContent}
          isStreaming={state.isStreaming}
        />

        {/* 输入框 */}
        <MessageInput
          onSend={handleSendMessage}
          disabled={state.isLoading || state.isStreaming}
          placeholder="输入您的问题..."
        />
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 p-3">
        <div className="max-w-4xl mx-auto text-center text-xs text-gray-500">
          Powered by DeepSeek API | 使用 Next.js 14 构建
        </div>
      </footer>
    </div>
  );
}
