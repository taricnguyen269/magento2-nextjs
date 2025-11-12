"use client";
import { FC, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useStoreConfig } from "@/hooks";
import { processMediaUrls } from "@/utils/helper";
import styles from "./richContent.module.css";

// Dynamically import PageBuilder from internal package to avoid SSR issues (it uses DOMParser which is browser-only)
const PageBuilder = dynamic(
  () => import("@/lib/pagebuilder").then((mod) => mod.default || mod) as Promise<React.ComponentType<{ html: string; classes?: { root?: string } }>>,
  {
    ssr: false,
    loading: () => <div className="rich-content-loading">Loading content...</div>
  }
);

/**
 * Detect if content is Page Builder format
 * Checks for data-content-type attributes in HTML
 */
function detectPageBuilder(content: string): boolean {
  return /data-content-type=/.test(content);
}

/**
 * Get internal domains from environment variable
 * Format: comma-separated list of domains
 * Example: "pwa-dev.arielbath.com,pwa-stg.arielbath.com,arielbath.com,www.arielbath.com"
 *
 * @returns Array of internal domain strings
 */
function getInternalDomains(): string[] {
  const envDomains = process.env.NEXT_PUBLIC_INTERNAL_DOMAINS;
  return envDomains ?
    envDomains.split(',')
    .map(domain => domain.trim())
    .filter(domain => domain.length > 0) : [];
}

/**
 * Convert absolute URLs from same domain to relative internal links
 * Example: https://pwa-stg.arielbath.com/storage -> /storage
 *
 * @param htmlContent - The HTML content string
 * @param baseUrl - The base URL from store config (e.g., "https://pwa-stg.arielbath.com")
 * @returns Processed HTML with internal links converted to relative paths
 */
function convertInternalLinks(htmlContent: string, baseUrl?: string): string {
  if (!htmlContent) {
    return htmlContent;
  }

  // Get current origin for comparison
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  // List of domains that should be treated as internal
  // Include the base URL domain and common staging/production domains
  const internalDomains: string[] = [];

  if (baseUrl) {
    try {
      const baseUrlObj = new URL(baseUrl);
      internalDomains.push(baseUrlObj.origin);
      // Also add variations (stg, staging, etc.)
      if (baseUrlObj.hostname.includes('stg')) {
        internalDomains.push(baseUrlObj.origin.replace('stg', ''));
      }
    } catch (e) {
      // Invalid URL, skip
    }
  }

  if (currentOrigin) {
    internalDomains.push(currentOrigin);
  }

  // Get internal domains from environment variable
  const arielbathDomains = getInternalDomains();

  let processed = htmlContent;

  // Replace href="https://domain.com/path" with href="/path" for internal domains
  processed = processed.replace(
    /(href=["'])(https?:\/\/[^"']+)(["'])/gi,
    (match, prefix, fullUrl, suffix) => {
      try {
        const urlObj = new URL(fullUrl);
        const urlOrigin = urlObj.origin;
        const urlPath = urlObj.pathname + urlObj.search + urlObj.hash;

        // Check if this is an internal domain
        const isInternal =
          internalDomains.some(domain => urlOrigin === domain) ||
          arielbathDomains.some(domain =>
            urlObj.hostname === domain ||
            urlObj.hostname.endsWith('.' + domain) ||
            urlObj.hostname.includes(domain)
          );

        if (isInternal) {
          // Convert to relative path
          return `${prefix}${urlPath}${suffix}`;
        }
      } catch (e) {
        // Invalid URL, keep original
      }
      return match;
    }
  );

  return processed;
}

export interface RichContentProps {
  html: string;
  className?: string;
}

/**
 * RichContent component for rendering CMS/pagebuilder HTML content
 * Similar to @magento/venia-ui/lib/components/RichContent
 *
 * Features:
 * - Detects Page Builder content and renders with PageBuilder component
 * - Falls back to plain HTML for regular content
 * - Handles internal link clicks using Next.js router
 * - Processes relative media URLs to absolute URLs
 */
export const RichContent: FC<RichContentProps> = ({ html, className = "" }) => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const { storeConfig } = useStoreConfig();

  // Process HTML content:
  // 1. Convert internal absolute URLs to relative paths
  // 2. Convert relative media URLs to absolute URLs
  let processedHtml = convertInternalLinks(
    html || "",
    storeConfig?.base_link_url || storeConfig?.baseLinkUrl
  );
  processedHtml = processMediaUrls(
    processedHtml,
    storeConfig?.secure_base_media_url
  );

  // Check if content is Page Builder format
  const isPageBuilder = detectPageBuilder(processedHtml);

  // Handle click events on links to prevent full page reloads
  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const handleClick = (event: MouseEvent | KeyboardEvent) => {
      const target = event.target as HTMLElement;

      // Check if element is a link or inside a link
      const linkElement = target.closest("a");
      if (!linkElement) return;

      // Check if it's a click or keyboard event (Enter/Space)
      const shouldIntercept =
        event.type === "click" ||
        (event instanceof KeyboardEvent && (event.code === "Enter" || event.code === "Space"));

      if (!shouldIntercept) return;

      let href = linkElement.getAttribute("href");
      if (!href) return;

      // Check if it's an external link or opens in new tab
      const isExternal =
        linkElement.target === "_blank" ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:");

      // Check if it's an absolute URL from same domain (should have been converted, but handle just in case)
      let isInternalAbsoluteUrl = false;
      if (href.startsWith("http://") || href.startsWith("https://")) {
        try {
          const urlObj = new URL(href);
          const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
          // Get internal domains from environment variable
          const arielbathDomains = getInternalDomains();
          isInternalAbsoluteUrl =
            urlObj.origin === currentOrigin ||
            arielbathDomains.some(domain =>
              urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
            );
        } catch (e) {
          // Invalid URL, treat as external
        }
      }

      // Skip external links and links that open in new tab
      if (isExternal && !isInternalAbsoluteUrl) {
        return; // Let browser handle external links
      }

      // If it's an internal absolute URL, convert to relative path
      if (isInternalAbsoluteUrl) {
        try {
          const urlObj = new URL(href);
          href = urlObj.pathname + urlObj.search + urlObj.hash;
        } catch (e) {
          // Keep original href if URL parsing fails
        }
      }

      // Prevent default navigation
      event.preventDefault();

      // Handle internal links with Next.js router
      if (href.startsWith("/")) {
        router.push(href);
      } else {
        // Fallback to window.location for relative URLs
        window.location.href = href;
      }
    };

    contentElement.addEventListener("click", handleClick);
    contentElement.addEventListener("keydown", handleClick);

    return () => {
      contentElement.removeEventListener("click", handleClick);
      contentElement.removeEventListener("keydown", handleClick);
    };
  }, [router, processedHtml]);

  // Render Page Builder content with React components
  if (isPageBuilder) {
    return (
      <div ref={contentRef} className={`${styles.root} rich-content pagebuilder ${className}`}>
        <PageBuilder html={processedHtml} classes={{ root: className || "" }} />
      </div>
    );
  }

  // Render plain HTML content
  return (
    <div
      ref={contentRef}
      className={`${styles.root} rich-content plain-html ${className}`}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
};

