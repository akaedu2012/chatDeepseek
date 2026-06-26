/**
 * 聊天 API 路由
 * 
 * 处理与 DeepSeek API 的流式通信
 * 涉及需求: 1.2, 2.1, 2.2, 4.1, 4.2, 6.1, 6.2, 6.4, 7.4, 9.1, 10.1, 10.2, 10.3, 10.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { classifyAPIError } from '@/lib/error-handler';

/**
 * POST /api/chat - 处理聊天请求并返回流式响应
 * 
 * 需求覆盖:
 * - 1.2: 接收用户消息并发送至 DeepSeek API
 * - 2.1: 调用 DeepSeek API 生成响应
 * - 2.2: 实时显示流式数据
 * - 4.1, 4.2: 流式响应转发
 * - 6.1, 6.2: 从环境变量读取 API 密钥
 * - 6.4: 确保密钥不暴露到客户端
 * - 9.1: 发送完整对话历史
 * - 10.1, 10.2, 10.3, 10.4: 错误处理
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体（需求 1.2, 9.1）
    const body = await request.json();
    const { messages } = body;

    // 2. 验证请求格式（需求 1.2）
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: '请求格式无效', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    if (messages.length === 0) {
      return NextResponse.json(
        { error: '消息列表不能为空', code: 'EMPTY_MESSAGES' },
        { status: 400 }
      );
    }

    // 3. 读取环境变量（需求 6.1, 6.2, 6.4）
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseURL = process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com';
    const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    const timeout = parseInt(process.env.API_TIMEOUT || '30000', 10);

    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY 未设置');
      return NextResponse.json(
        { error: '服务器配置错误', code: 'MISSING_API_KEY' },
        { status: 500 }
      );
    }

    // 4. 调用 DeepSeek API（需求 2.1）
    const deepseekResponse = await fetch(`${baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
      signal: AbortSignal.timeout(timeout),
    });

    // 5. 处理 API 错误（需求 10.1, 10.2, 10.3, 10.4）
    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      const apiError = classifyAPIError(deepseekResponse.status, errorText);
      
      return NextResponse.json(
        { 
          error: apiError.message, 
          code: apiError.type.toUpperCase(),
          statusCode: apiError.statusCode 
        },
        { status: deepseekResponse.status }
      );
    }

    // 6. 创建流式响应（需求 2.2, 4.1, 4.2）
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = deepseekResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // 发送完成信号
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              break;
            }

            // 解码并转发数据块
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              // SSE 格式：data: {json}
              if (line.startsWith('data: ')) {
                // 直接转发原始数据
                controller.enqueue(encoder.encode(line + '\n\n'));
              }
            }
          }
        } catch (error) {
          console.error('流式响应错误:', error);
          
          // 发送错误信息到客户端
          const errorData = JSON.stringify({
            error: '流式响应中断',
            details: error instanceof Error ? error.message : String(error)
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        } finally {
          reader.releaseLock();
        }
      },
    });

    // 7. 返回流式响应（需求 2.2, 4.1）
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API 路由错误:', error);

    // 处理网络超时和其他异常（需求 10.1, 10.4）
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: '请求超时，请重试', code: 'TIMEOUT' },
        { status: 408 }
      );
    }

    const apiError = classifyAPIError(0, error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      { 
        error: apiError.message, 
        code: apiError.type.toUpperCase() 
      },
      { status: 500 }
    );
  }
}
