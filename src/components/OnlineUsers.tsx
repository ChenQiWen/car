import React from 'react';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { User } from '../../shared/types';

interface OnlineUsersProps {
  users: User[];
  connected: boolean;
  currentUserId?: string;
}

export function OnlineUsers({ users, connected, currentUserId }: OnlineUsersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">在线用户</h3>
        </div>
        
        {/* 连接状态指示器 */}
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <Wifi className="w-4 h-4 text-green-500" />
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <WifiOff className="w-4 h-4 text-red-500" />
            </>
          )}
        </div>
      </div>

      {/* 用户计数 */}
      <div className="text-sm text-gray-600 mb-3">
        {connected ? (
          <span>当前在线: {users.length} 人</span>
        ) : (
          <span className="text-red-600">连接已断开</span>
        )}
      </div>

      {/* 用户列表 */}
      {users.length > 0 ? (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {users.map((user) => {
            const isCurrentUser = user.id === currentUserId;
            
            return (
              <div 
                key={`user-${user.id}`}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  isCurrentUser 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {/* 用户头像 */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  isCurrentUser 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-400 text-white'
                }`}>
                  {user.username.charAt(0)}
                </div>
                
                {/* 用户名 */}
                <span className={`text-sm truncate flex-1 ${
                  isCurrentUser 
                    ? 'font-medium text-blue-900' 
                    : 'text-gray-700'
                }`}>
                  {user.username}
                  {isCurrentUser && (
                    <span className="text-blue-600 ml-1">(我)</span>
                  )}
                </span>
                
                {/* 在线状态 */}
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            {connected ? '暂无其他用户在线' : '等待连接...'}
          </p>
        </div>
      )}
    </div>
  );
}