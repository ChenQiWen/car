import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
}

interface UseUserReturn {
  user: User | null;
  setUser: (user: User) => void;
  generateRandomUser: () => User;
  clearUser: () => void;
  regenerateUser: () => void;
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

export function useUser(): UseUserReturn {
  const [user, setUserState] = useState<User | null>(null);

  // 从localStorage加载用户信息
  useEffect(() => {
    console.log('=== useUser useEffect Called ===');
    console.log('useUser: Loading user from localStorage...');
    console.log('useUser: Current user state before loading:', user);
    
    const savedUser = localStorage.getItem('websocket-cart-user');
    console.log('useUser: savedUser from localStorage:', savedUser);
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('useUser: Parsed user from localStorage:', parsedUser);
        console.log('useUser: Parsed user type:', typeof parsedUser);
        console.log('useUser: Parsed user has id:', !!parsedUser.id);
        console.log('useUser: Parsed user has username:', !!parsedUser.username);
        
        // 验证用户数据格式
        if (parsedUser && parsedUser.id && parsedUser.username) {
          setUserState(parsedUser);
          console.log('useUser: Valid user data set to state:', parsedUser);
        } else {
          console.warn('useUser: Invalid user data format, generating new user');
          const newUser = generateRandomUser();
          console.log('useUser: Generated new user after validation error:', newUser);
          setUserState(newUser);
          localStorage.setItem('websocket-cart-user', JSON.stringify(newUser));
          console.log('useUser: Saved new user to localStorage');
        }
      } catch (error) {
        console.error('useUser: Error parsing saved user:', error);
        // 如果解析失败，生成新用户
        const newUser = generateRandomUser();
        console.log('useUser: Generated new user after parse error:', newUser);
        setUserState(newUser);
        localStorage.setItem('websocket-cart-user', JSON.stringify(newUser));
        console.log('useUser: Saved new user to localStorage');
      }
    } else {
      // 如果没有保存的用户，生成新用户
      console.log('useUser: No saved user found, generating new user...');
      const newUser = generateRandomUser();
      console.log('useUser: Generated new user:', newUser);
      setUserState(newUser);
      localStorage.setItem('websocket-cart-user', JSON.stringify(newUser));
      console.log('useUser: Saved new user to localStorage');
    }
    
    console.log('=== useUser useEffect End ===');
  }, []);

  // 生成随机用户
  const generateRandomUser = (): User => {
    return {
      id: generateUserId(),
      username: generateUsername()
    };
  };

  // 设置用户并保存到localStorage
  const setUser = (newUser: User) => {
    console.log('useUser: setUser called with:', newUser);
    console.log('useUser: Previous user state:', user);
    setUserState(newUser);
    localStorage.setItem('websocket-cart-user', JSON.stringify(newUser));
    console.log('useUser: User state updated and saved to localStorage');
  };

  // 清除用户数据
  const clearUser = () => {
    localStorage.removeItem('websocket-cart-user');
    setUserState(null);
    console.log('User data cleared');
  };

  // 重新生成用户
  const regenerateUser = () => {
    console.log('useUser: Regenerating user...');
    const newUser = generateRandomUser();
    console.log('useUser: Generated new user:', newUser);
    setUserState(newUser);
    localStorage.setItem('websocket-cart-user', JSON.stringify(newUser));
    console.log('useUser: New user saved to localStorage');
  };

  return {
    user,
    setUser,
    generateRandomUser,
    clearUser,
    regenerateUser
  };
}