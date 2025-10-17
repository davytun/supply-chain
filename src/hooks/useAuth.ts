import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface User {
  name: string;
  email: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('auth');
      const userData = localStorage.getItem('user');
      
      if (isAuth === 'true' && userData) {
        setUser(JSON.parse(userData));
      } else if (router.pathname !== '/login') {
        router.push('/login');
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const logout = () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, logout };
};