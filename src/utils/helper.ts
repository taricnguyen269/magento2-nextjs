import { BrowserPersistence } from ".";
import CookiePersistence from "./cookiePersistence";

export const storage = new BrowserPersistence();
export const cookiePersist = new CookiePersistence();

export const currencyFormatter = (param: {
  number: number;
  currency?: string;
}) => {
  return param?.number?.toLocaleString("en-US", {
    style: "currency",
    currency: param?.currency ?? "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const convertObjectToQuerystring = (obj: any) => {
  return Object.keys(obj)
    .map((key) => `${key}=${obj[key]}`)
    .join("&");
};

export function convertCamelCaseToWords(camelCaseString: string) {
  return camelCaseString
    ?.replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .replace(/^./, function (str) {
      return str.toUpperCase();
    });
}

/**
 * Process HTML content and replace relative media URLs with absolute URLs
 * Similar to pwa-arielbath's media URL handling
 * 
 * @param htmlContent - The HTML content string that may contain relative media URLs
 * @param mediaBackendUrl - The base media backend URL from store config (e.g., "https://cdn.arielbath.com")
 * @returns Processed HTML with absolute media URLs
 */
export function processMediaUrls(
  htmlContent: string,
  mediaBackendUrl?: string
): string {
  if (!htmlContent || !mediaBackendUrl) {
    return htmlContent;
  }

  // Remove trailing slash from mediaBackendUrl if present
  const baseUrl = mediaBackendUrl.replace(/\/$/, "");

  // Replace relative media URLs in various formats:
  // - /media/... -> https://cdn.arielbath.com/media/...
  // - src="/media/..." -> src="https://cdn.arielbath.com/media/..."
  // - href="/media/..." -> href="https://cdn.arielbath.com/media/..."
  // - url(/media/...) -> url(https://cdn.arielbath.com/media/...)
  
  let processed = htmlContent;

  // Replace src="/media/..." or src='/media/...'
  processed = processed.replace(
    /(src=["'])(\/media\/[^"']+)(["'])/gi,
    (match, prefix, url, suffix) => {
      // Skip if already absolute URL
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return match;
      }
      return `${prefix}${baseUrl}${url}${suffix}`;
    }
  );

  // Replace href="/media/..." or href='/media/...'
  processed = processed.replace(
    /(href=["'])(\/media\/[^"']+)(["'])/gi,
    (match, prefix, url, suffix) => {
      // Skip if already absolute URL
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return match;
      }
      return `${prefix}${baseUrl}${url}${suffix}`;
    }
  );

  // Replace url(/media/...) in CSS (background-image, etc.)
  processed = processed.replace(
    /url\(["']?(\/media\/[^"')]+)["']?\)/gi,
    (match, url) => {
      // Skip if already absolute URL
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return match;
      }
      return `url(${baseUrl}${url})`;
    }
  );

  // Replace standalone /media/ URLs (not in quotes, for edge cases)
  processed = processed.replace(
    /(\s|>)(\/media\/[^\s<>"']+)/gi,
    (match, prefix, url) => {
      // Skip if already absolute URL
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return match;
      }
      // Only replace if it looks like a URL (has file extension or common patterns)
      if (
        /\.(jpg|jpeg|png|gif|svg|webp|pdf|mp4|mp3|css|js)(\?|$)/i.test(url) ||
        url.includes("/.renditions/") ||
        url.includes("/catalog/")
      ) {
        return `${prefix}${baseUrl}${url}`;
      }
      return match;
    }
  );

  return processed;
}
