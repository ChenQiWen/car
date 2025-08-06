import React, { useState } from 'react';
import { User, RefreshCw, Save, Trash2 } from 'lucide-react';

interface UserSetupProps {
  onUserSet: (user: { id: string; username: string }) => void;
  onClearStorage: () => void;
}

// 随机用户名列表
const RANDOM_USERNAMES = [
  '购物达人', '数码爱好者', '科技迷', '苹果粉', '极客用户',
  '时尚买手', '品质生活', '智能家居', '潮流先锋', '生活家',
  '数码控', '科技咖', '品味人士', '精致生活', '智慧消费者'
];

// 生成随机用户ID
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 生成随机用户名
function generateUsername(): string {
  const randomIndex = Math.floor(Math.random() * RANDOM_USERNAMES.length);
  const randomSuffix = Math.floor(Math.random() * 1000);
  return `${RANDOM_USERNAMES[randomIndex]}${randomSuffix}`;
}

export function UserSetup({ onUserSet, onClearStorage }: UserSetupProps) {
  const [username, setUsername] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateRandomUser = () => {
    setIsGenerating(true);
    const randomUsername = generateUsername();
    setUsername(randomUsername);
    
    setTimeout(() => {
      setIsGenerating(false);
    }, 500);
  };

  const handleSaveUser = () => {
    if (username.trim()) {
      const newUser = {
        id: generateUserId(),
        username: username.trim()
      };
      onUserSet(newUser);
    }
  };

  const handleClearStorage = () => {
    if (confirm('确定要清除所有用户数据吗？这将重置您的用户信息。')) {
      onClearStorage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            设置用户信息
          </h1>
          <p className="text-gray-600">
            请设置您的用户名以开始使用实时购物车
          </p>
        </div>

        {/* 用户名输入 */}
        <div className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入您的用户名"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              maxLength={20}
            />
          </div>

          {/* 按钮组 */}
          <div className="space-y-3">
            {/* 随机生成按钮 */}
            <button
              onClick={handleGenerateRandomUser}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? '生成中...' : '随机生成用户名'}
            </button>

            {/* 保存按钮 */}
            <button
              onClick={handleSaveUser}
              disabled={!username.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              保存并开始使用
            </button>

            {/* 清除存储按钮 */}
            <button
              onClick={handleClearStorage}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清除存储数据
            </button>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 提示：您可以输入自定义用户名，或点击随机生成按钮获取一个随机用户名。
          </p>
        </div>
      </div>
    </div>
  );
}