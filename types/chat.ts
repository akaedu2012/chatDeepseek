/**
 * 聊天系统类型定义文件
 * 
 * 本文件定义了聊天应用中使用的所有核心类型和接口
 * 涉及需求: 1.2, 2.1, 3.1, 4.1, 9.1, 9.2
 */

/**
 * Message - 消息模型
 * 
 * 用于表示用户、助手或系统的单条消息
 * 需求覆盖: 1.2 (消息发送), 2.1 (响应生成), 3.1 (消息展示), 9.1 (会话状态)
 */
export interface Message {
  /** 消息角色 */
  role: 'user' | 'assistant' | 'system';
  
  /** 消息内容 */
  content: string;
  
  /** 时间戳（毫秒） */
  timestamp: number;
  
  /** 唯一标识符（可选） */
  id?: string;
}

/**
 * ChatState - 聊天状态模型
 * 
 * 用于管理聊天界面的完整状态
 * 需求覆盖: 3.1 (消息历史), 4.1 (流式响应), 9.1 (会话状态), 9.2 (状态维护)
 */
export interface ChatState {
  /** 消息历史列表 */
  messages: Message[];
  
  /** 当前流式内容缓冲 */
  streamingContent: string;
  
  /** 是否正在加载 */
  isLoading: boolean;
  
  /** 错误信息（null 表示无错误） */
  error: string | null;
  
  /** 是否正在流式传输 */
  isStreaming: boolean;
}

/**
 * APIError - API 错误模型
 * 
 * 用于统一处理和分类 API 调用错误
 * 需求覆盖: 2.1 (API 调用失败), 9.2 (错误处理)
 */
export interface APIError {
  /** HTTP 状态码 */
  statusCode: number;
  
  /** 错误消息 */
  message: string;
  
  /** 错误类型 */
  type: 'network' | 'auth' | 'rate_limit' | 'server' | 'unknown';
  
  /** 原始错误对象（可选） */
  originalError?: Error;
}

/**
 * StreamChunk - 流数据块模型
 * 
 * 用于解析和处理 DeepSeek API 返回的流式响应数据块
 * 需求覆盖: 4.1 (流式响应渲染)
 */
export interface StreamChunk {
  /** 增量文本内容 */
  delta: string;
  
  /** 是否为最后一块 */
  isDone: boolean;
  
  /** 完成原因（可选） */
  finishReason?: 'stop' | 'length' | 'error';
}

/**
 * DeepSeekChatRequest - DeepSeek API 请求接口
 * 
 * 定义发送给 DeepSeek API 的聊天请求格式
 * 需求覆盖: 2.1 (调用 DeepSeek API), 9.1 (发送对话历史)
 */
export interface DeepSeekChatRequest {
  /** 使用的模型名称 */
  model: 'deepseek-chat' | 'deepseek-v4-flash' | 'deepseek-v4-pro';
  
  /** 消息列表 */
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  
  /** 是否启用流式响应 */
  stream: boolean;
  
  /** 温度参数（0-2，默认 1，可选） */
  temperature?: number;
  
  /** 最大生成令牌数（可选） */
  max_tokens?: number;
  
  /** Top-p 采样参数（0-1，默认 1，可选） */
  top_p?: number;
}

/**
 * DeepSeekChatResponse - DeepSeek API 响应接口
 * 
 * 定义 DeepSeek API 返回的响应格式（非流式）
 * 需求覆盖: 2.1 (接收 API 响应)
 */
export interface DeepSeekChatResponse {
  /** 响应唯一标识符 */
  id: string;
  
  /** 对象类型 */
  object: 'chat.completion';
  
  /** 创建时间戳 */
  created: number;
  
  /** 使用的模型 */
  model: string;
  
  /** 响应选项列表 */
  choices: Array<{
    /** 选项索引 */
    index: number;
    
    /** 生成的消息 */
    message: {
      role: 'assistant';
      content: string;
    };
    
    /** 完成原因 */
    finish_reason: 'stop' | 'length' | null;
  }>;
  
  /** 使用情况统计（可选） */
  usage?: {
    /** 提示令牌数 */
    prompt_tokens: number;
    
    /** 完成令牌数 */
    completion_tokens: number;
    
    /** 总令牌数 */
    total_tokens: number;
  };
}

/**
 * DeepSeekStreamChunk - DeepSeek API 流式响应块接口
 * 
 * 定义 DeepSeek API 返回的流式响应数据块格式
 * 需求覆盖: 4.1 (流式响应数据解析)
 */
export interface DeepSeekStreamChunk {
  /** 响应唯一标识符 */
  id: string;
  
  /** 对象类型 */
  object: 'chat.completion.chunk';
  
  /** 创建时间戳 */
  created: number;
  
  /** 使用的模型 */
  model: string;
  
  /** 响应选项列表 */
  choices: Array<{
    /** 选项索引 */
    index: number;
    
    /** 增量内容 */
    delta: {
      role?: 'assistant';
      content?: string;
    };
    
    /** 完成原因（流结束时出现） */
    finish_reason: 'stop' | 'length' | null;
  }>;
}
