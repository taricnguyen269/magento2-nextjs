/**
 * Helper function for onClick() HTML Events
 * Adapted for Next.js router
 * Accepts either history object (from useHistory adapter) or router object
 *
 * @param {object} historyOrRouter History object (with push method) or Next.js router object
 * @param {function} historyOrRouter.push Pushes a new route
 * @param {Event} event
 */
const handleHtmlContentClick = (historyOrRouter, event) => {
    const { code, target, type } = event;

    // Check if element is clicked or using accepted keyboard event
    const shouldIntercept =
        type === 'click' || code === 'Enter' || code === 'Space';

    // Intercept link clicks and check to see if the
    // destination is internal to avoid refreshing the page
    if (target.tagName === 'A' && shouldIntercept) {
        const { target: tabTarget, href } = target;

        // External links with target="_blank" should open in new tab
        if (tabTarget === '_blank' || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return; // Let browser handle it
        }

        // Check if it's an internal link
        try {
            const urlObj = new URL(href);
            const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
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
                event.preventDefault();
                const path = urlObj.pathname + urlObj.search + urlObj.hash;
                historyOrRouter.push(path);
            }
        } catch (e) {
            // Relative URL - treat as internal
            if (href.startsWith('/')) {
                event.preventDefault();
                historyOrRouter.push(href);
            }
        }
    }
};

export default handleHtmlContentClick;
