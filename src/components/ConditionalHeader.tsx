'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';

const NO_HEADER_ROUTES = [
  '/showing-shield/session',
];

export default function ConditionalHeader() {
  const pathname = usePathname();
  const hide = NO_HEADER_ROUTES.some((route) => pathname.startsWith(route));
  if (hide) return null;
  return <Header />;
}
