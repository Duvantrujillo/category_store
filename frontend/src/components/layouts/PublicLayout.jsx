import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  useEffect(() => {
    document.documentElement.classList.add('public');
    return () => document.documentElement.classList.remove('public');
  }, []);

  return <Outlet />;
}
