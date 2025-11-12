/**
 * Adapter for react-router-dom to work with Next.js
 * Provides Link and useHistory/useLocation hooks compatible with Next.js
 */

"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

// Export Next.js Link as react-router-dom Link
export { Link };
export default Link;

// Create a history-like object for compatibility
export function useHistory() {
  const router = useRouter();
  const pathname = usePathname();

  return {
    push: (path: string) => {
      router.push(path);
    },
    replace: (path: string) => {
      router.replace(path);
    },
    goBack: () => {
      router.back();
    },
    goForward: () => {
      router.forward();
    },
    location: {
      pathname,
      search: typeof window !== 'undefined' ? window.location.search : '',
      hash: typeof window !== 'undefined' ? window.location.hash : '',
    },
  };
}

export function useLocation() {
  const pathname = usePathname();
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const hash = typeof window !== 'undefined' ? window.location.hash : '';

  return {
    pathname,
    search,
    hash,
  };
}

