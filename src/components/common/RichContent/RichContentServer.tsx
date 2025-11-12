import { FC } from "react";
import { processMediaUrls } from "@/utils/helper";
import styles from "./richContent.module.css";

/**
 * Get internal domains from environment variable (server-side)
 */
function getInternalDomains(): string[] {
  const envDomains = process.env.NEXT_PUBLIC_INTERNAL_DOMAINS;
  return envDomains
    ? envDomains.split(",").map((domain) => domain.trim()).filter((domain) => domain.length > 0)
    : [];
}

/**
 * Convert absolute URLs from same domain to relative internal links (server-side)
 * Example: https://pwa-stg.arielbath.com/storage -> /storage
 */
function convertInternalLinks(htmlContent: string, baseUrl?: string): string {
  if (!htmlContent) {
    return htmlContent;
  }

  const internalDomains: string[] = [];

  if (baseUrl) {
    try {
      const baseUrlObj = new URL(baseUrl);
      internalDomains.push(baseUrlObj.origin);
      if (baseUrlObj.hostname.includes("stg")) {
        internalDomains.push(baseUrlObj.origin.replace("stg", ""));
      }
    } catch (e) {
      // Invalid URL, skip
    }
  }

  const arielbathDomains = getInternalDomains();
  internalDomains.push(...arielbathDomains);

  let processed = htmlContent;

  // Replace href="https://domain.com/path" with href="/path" for internal domains
  processed = processed.replace(
    /(href=["'])(https?:\/\/[^"']+)(["'])/gi,
    (match, prefix, fullUrl, suffix) => {
      try {
        const urlObj = new URL(fullUrl);
        const urlOrigin = urlObj.origin;
        const urlPath = urlObj.pathname + urlObj.search + urlObj.hash;

        const isInternal =
          internalDomains.some((domain) => urlOrigin === domain) ||
          arielbathDomains.some(
            (domain) =>
              urlObj.hostname === domain ||
              urlObj.hostname.endsWith("." + domain) ||
              urlObj.hostname.includes(domain)
          );

        if (isInternal) {
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

/**
 * Detect if content is Page Builder format
 */
function detectPageBuilder(content: string): boolean {
  return /data-content-type=/.test(content);
}

/**
 * Get store config from build-time environment variable
 */
function getStoreConfig() {
  try {
    if (process.env.STORE_CONFIG_DATA) {
      return JSON.parse(process.env.STORE_CONFIG_DATA);
    }
  } catch (error) {
    console.warn("Could not parse store config:", error);
  }
  return null;
}

export interface RichContentServerProps {
  html: string;
  className?: string;
}

/**
 * Server-side RichContent component for rendering CMS/pagebuilder HTML content
 * Processes HTML server-side and renders initial HTML structure
 * For PageBuilder content, it renders the HTML which will be hydrated client-side
 */
export const RichContentServer: FC<RichContentServerProps> = ({
  html,
  className = "",
}) => {
  if (!html) {
    return null;
  }

  // Get store config from build-time env
  const storeConfig = getStoreConfig();

  // Process HTML content server-side:
  // 1. Convert internal absolute URLs to relative paths
  // 2. Convert relative media URLs to absolute URLs
  let processedHtml = convertInternalLinks(
    html,
    storeConfig?.base_link_url || storeConfig?.baseLinkUrl
  );
  processedHtml = processMediaUrls(
    processedHtml,
    storeConfig?.secure_base_media_url
  );

  // Check if content is Page Builder format
  const isPageBuilder = detectPageBuilder(processedHtml);

  // Always render HTML server-side for SEO and initial render
  // For PageBuilder, this will be hydrated client-side by RichContentHydration
  return (
    <div
      className={`${styles.root} rich-content ${isPageBuilder ? "pagebuilder" : "plain-html"} ${className}`}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
      data-pagebuilder={isPageBuilder ? "true" : undefined}
    />
  );
};

