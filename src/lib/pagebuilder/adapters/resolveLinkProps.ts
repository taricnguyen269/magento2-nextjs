/**
 * Adapter for @magento/peregrine/lib/util/resolveLinkProps
 * Converts PWA Studio link resolution to Next.js compatible format
 */

export interface LinkProps {
  to?: string;
  href?: string;
}

/**
 * Resolve link properties for Next.js
 * Converts internal links to use 'to' prop (for Next.js Link), external links use 'href'
 * 
 * @param link - The link URL to resolve
 * @returns Object with either 'to' (internal) or 'href' (external) property
 */
export default function resolveLinkProps(link: string): LinkProps {
  if (!link) {
    return { href: '#' };
  }

  // Check if it's an external URL
  try {
    const url = new URL(link, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    
    // If it's from the same origin, treat as internal
    if (url.origin === currentOrigin) {
      return { to: url.pathname + url.search + url.hash };
    }
    
    // External URL
    return { href: link };
  } catch (e) {
    // If URL parsing fails, check if it starts with http/https
    if (link.startsWith('http://') || link.startsWith('https://')) {
      return { href: link };
    }
    
    // Relative URL - treat as internal
    return { to: link };
  }
}

