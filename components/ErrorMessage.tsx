/**
 * ErrorMessage 组件 - 错误提示
 * 
 * 显示用户友好的错误消息
 * 涉及需求: 2.4, 10.1, 10.2, 10.3, 10.4
 */

'use client';

/**
 * ErrorMessageProps - 组件属性接口
 */
export interface ErrorMessageProps {
  /** 错误消息内容 */
  message: string;
  
  /** 关闭错误提示的回调 */
  onClose: () => void;
  
  /** 错误类型（影响样式） */
  type?: 'error' | 'warning' | 'info';
}

/**
 * ErrorMessage 组件
 * 
 * 需求覆盖:
 * - 2.4, 10.1, 10.2, 10.3, 10.4: 显示清晰的错误提示
 */
export default function ErrorMessage({ message, onClose, type = 'error' }: ErrorMessageProps) {
  // 根据类型设置样式
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconStyles = {
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  return (
    <div className={`border rounded-lg p-4 ${styles[type]} flex items-start gap-3`}>
      {/* 图标 */}
      <div className={`flex-shrink-0 ${iconStyles[type]}`}>
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* 错误消息 */}
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>

      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="关闭"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
