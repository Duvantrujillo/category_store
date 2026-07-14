import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import FloatingWhatsAppButton from '../../pages/public/Home/components/shared/FloatingWhatsAppButton';

export default function PublicLayout() {
  useEffect(() => {
    document.documentElement.classList.add('public');
    return () => document.documentElement.classList.remove('public');
  }, []);

  return (
    <>
      <Outlet />
      <FloatingWhatsAppButton />
    </>
  );
}
