/**
 * Hook for detecting breakpoints
 * Adapted from pwa-arielbath
 */

"use client";

import { useEffect, useMemo, useState } from 'react';

export const MOBILE_SCREEN = 989;
export const TABLET_SCREEN = 1023;

export type UseBreakPoint = {
    isMobile?: boolean;
    isTablet?: boolean;
    isDesktop?: boolean;
    innerWidth: number;
    innerHeight: number;
    outerHeight: number;
    outerWidth: number;
};

const useBreakPoint = () => {
    const [windowSize, setWindowSize] = useState<{
        innerWidth: number;
        innerHeight: number;
        outerWidth: number;
        outerHeight: number;
    }>(() => {
        if (typeof window !== 'undefined') {
            return {
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                outerWidth: window.outerWidth,
                outerHeight: window.outerHeight,
            };
        }
        return {
            innerWidth: 0,
            innerHeight: 0,
            outerWidth: 0,
            outerHeight: 0,
        };
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowSize({
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                outerWidth: window.outerWidth,
                outerHeight: window.outerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isSafari = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }, []);

    const query = useMemo(
        () =>
            ({
                ...windowSize,
                isMobile: windowSize.innerWidth <= MOBILE_SCREEN,
                isTablet:
                    windowSize.innerWidth > MOBILE_SCREEN && windowSize.innerWidth <= TABLET_SCREEN,
                isDesktop: windowSize.innerWidth > MOBILE_SCREEN + (isSafari ? 15 : 0)
            } as UseBreakPoint),
        [windowSize, isSafari]
    );

    return query;
};

export default useBreakPoint;

