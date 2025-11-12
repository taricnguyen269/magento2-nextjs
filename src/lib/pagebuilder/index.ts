/**
 * Internal PageBuilder package
 * Adapted from @magento/pagebuilder for Next.js compatibility
 */

export { default } from './lib/pagebuilder';
export { default as Component } from './lib/pagebuilder';
export { default as canRender } from './lib/detectPageBuilder';
export * from './lib/config';
export * from './lib/detectPageBuilder';
export * from './lib/factory';
export * from './lib/parseStorageHtml';

// Export adapters for use in content types
export * from './adapters/classify';
export * from './adapters/resolveLinkProps';
export * from './adapters/makeUrl';
export * from './adapters/react-router-dom';
export * from './adapters/peregrine-hooks';
export * from './adapters/Button';
export * from './adapters/CmsBlock';
export * from './adapters/Shimmer';
export * from './adapters/Gallery';
export * from './adapters/GalleryItem';
export * from './adapters/useCustomerWishlistSkus';
export * from './adapters/shallowMerge';
export * from './adapters/htmlStringImgUrlConverter';

// Export custom config utilities
export * from './config-custom';

