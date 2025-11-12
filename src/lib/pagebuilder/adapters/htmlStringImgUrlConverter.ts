/**
 * Adapter for @magento/peregrine/lib/util/htmlStringImgUrlConverter
 * Converts relative image URLs in HTML strings to absolute URLs
 */

import { processMediaUrls } from "@/utils/helper";

/**
 * Convert relative image URLs in HTML string to absolute URLs
 * 
 * @param htmlString - HTML string that may contain relative image URLs
 * @param mediaBackendUrl - Base media backend URL (optional, will use from store config if available)
 * @returns HTML string with absolute image URLs
 */
export default function htmlStringImgUrlConverter(
  htmlString: string,
  mediaBackendUrl?: string
): string {
  if (!htmlString) {
    return htmlString;
  }

  // Use processMediaUrls utility which handles relative media URLs
  return processMediaUrls(htmlString, mediaBackendUrl);
}

