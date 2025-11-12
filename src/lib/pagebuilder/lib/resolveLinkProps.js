/**
 * Resolve link properties for Next.js
 * Adapted from @magento/peregrine/lib/util/resolveLinkProps
 *
 * @param {string} link
 */
export default link => {
    const linkProps = {};

    try {
        // Check if it's an absolute URL
        if (link.startsWith('http://') || link.startsWith('https://')) {
            const urlObj = new URL(link);
            const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
            
            // Check if it's an internal domain
            const internalDomains = process.env.NEXT_PUBLIC_INTERNAL_DOMAINS
                ? process.env.NEXT_PUBLIC_INTERNAL_DOMAINS.split(',').map(d => d.trim())
                : [];
            
            const isInternal = 
                urlObj.origin === currentOrigin ||
                internalDomains.some(domain => 
                    urlObj.hostname === domain || 
                    urlObj.hostname.endsWith('.' + domain)
                );

            if (isInternal) {
                linkProps['href'] = urlObj.pathname + urlObj.search + urlObj.hash;
            } else {
                linkProps['href'] = link;
                linkProps['target'] = '_blank';
                linkProps['rel'] = 'noopener noreferrer';
            }
        } else {
            // Relative URL - use as href for Next.js Link
            linkProps['href'] = link;
        }
    } catch (e) {
        linkProps['href'] = link;
    }

    return linkProps;
};
