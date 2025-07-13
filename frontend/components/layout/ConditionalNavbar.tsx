"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide navbar in meeting rooms and AI assistant pages
  const shouldHideNavbar = pathname?.startsWith('/meeting-room') || 
                          pathname?.startsWith('/ai-assistant');
  
  if (shouldHideNavbar) {
    return null;
  }
  
  return <Navbar />;
} 