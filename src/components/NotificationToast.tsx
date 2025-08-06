import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export function NotificationToast({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // 入场动画
    const timer1 = setTimeout(() => {
      setIsAnimating(true);
    }, 100);

    // 自动关闭
    const timer2 = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      transform transition-all duration-300 ease-in-out
      ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={`
        ${getBackgroundColor()}
        border rounded-lg shadow-lg p-4
        flex items-start gap-3
      `}>
        {/* 图标 */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        {/* 消息内容 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

// 通知管理器组件
interface NotificationManagerProps {
  message: string;
  error: string | null;
}

export function NotificationManager({ message, error }: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>>([]);

  // 处理新消息
  useEffect(() => {
    if (message) {
      const id = `msg_${Date.now()}`;
      setNotifications(prev => [...prev, {
        id,
        message,
        type: 'info'
      }]);
    }
  }, [message]);

  // 处理错误消息
  useEffect(() => {
    if (error) {
      const id = `err_${Date.now()}`;
      setNotifications(prev => [...prev, {
        id,
        message: error,
        type: 'error'
      }]);
    }
  }, [error]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ top: `${1 + index * 5}rem` }}
          className="fixed right-4 z-50"
        >
          <NotificationToast
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </>
  );
}