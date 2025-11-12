/**
 * Adapter for @magento/pagebuilder/lib/handleHtmlContentClick
 * Handles HTML content click events for Next.js
 * 
 * Note: This is used by PageBuilder components internally.
 * The actual implementation will be provided by the component using useHistory hook.
 */

import { useRouter } from 'next/navigation';

/**
 * Create a handleHtmlContentClick function compatible with PageBuilder
 * This function is called by PageBuilder components with history object
 * 
 * @param history - History-like object (from useHistory hook)
 * @param event - Click or keyboard event
 */
export default function handleHtmlContentClick(
  history: { push: (path: string) => void },
  event: MouseEvent | KeyboardEvent
): void {
  const { code, target, type } = event as any;

  // Check if element is clicked or using accepted keyboard event
  const shouldIntercept =
    type === 'click' || code === 'Enter' || code === 'Space';

  // Intercept link clicks and check to see if the
  // destination is internal to avoid refreshing the page
  if ((target as HTMLElement)?.tagName === 'A' && shouldIntercept) {
    event.preventDefault();
    const linkElement = target as HTMLAnchorElement;
    const { search: query, target: tabTarget, href } = linkElement;

    // If link opens in new tab, let browser handle it
    if (tabTarget && globalThis.open) {
      if (query) {
        globalThis.open(href + query);
      } else {
        globalThis.open(href);
      }
      return;
    }

    // Check if it's an external link
    try {
      const url = new URL(href);
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      
      if (url.origin === currentOrigin) {
        // Internal link - use history.push (which uses Next.js router)
        history.push(url.pathname + url.search + url.hash);
      } else {
        // External link - use browser navigation
        globalThis.location.assign(href);
      }
    } catch (e) {
      // Invalid URL or relative URL - use history.push
      history.push(href);
    }
  }
}

