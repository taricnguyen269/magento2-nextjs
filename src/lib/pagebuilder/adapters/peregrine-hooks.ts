/**
 * Adapters for @magento/peregrine hooks
 * Simplified implementations for Next.js
 */

import { useState, useEffect, useRef, RefObject } from 'react';

/**
 * useIntersectionObserver hook adapter
 * Returns the IntersectionObserver constructor for use in components
 */
export function useIntersectionObserver(
  options?: IntersectionObserverInit
): typeof IntersectionObserver | null {
  // Return the IntersectionObserver constructor if available
  // This allows components to use: new intersectionObserver(callback)
  if (typeof window !== 'undefined' && typeof IntersectionObserver !== 'undefined') {
    return IntersectionObserver;
  }
  return null;
}

/**
 * useMediaQuery hook adapter
 * Checks if media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}

/**
 * useDetectScrollWidth hook adapter
 * Detects scroll width for responsive layouts
 */
export function useDetectScrollWidth(
  elementRef?: RefObject<HTMLElement> | null
): { isScrollable: boolean; scrollWidth: number; clientWidth: number } {
  const [scrollInfo, setScrollInfo] = useState({
    isScrollable: false,
    scrollWidth: 0,
    clientWidth: 0,
  });

  useEffect(() => {
    // Handle case where no ref is provided or ref is null
    if (!elementRef || !elementRef.current) {
      return;
    }

    const updateScrollInfo = () => {
      if (elementRef?.current) {
        const { scrollWidth, clientWidth } = elementRef.current;
        setScrollInfo({
          isScrollable: scrollWidth > clientWidth,
          scrollWidth,
          clientWidth,
        });
      }
    };

    updateScrollInfo();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateScrollInfo);
      return () => window.removeEventListener('resize', updateScrollInfo);
    }
  }, [elementRef]);

  return scrollInfo;
}

