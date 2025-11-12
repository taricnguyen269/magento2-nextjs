/**
 * PageBuilder Configuration Utility
 * 
 * This file provides utilities for registering custom PageBuilder content types
 * similar to how pwa-arielbath registers custom content types.
 * 
 * Usage:
 * ```ts
 * import { registerContentType } from '@/lib/pagebuilder/config-custom';
 * import MyCustomComponent from '@/components/pagebuilder/MyCustom';
 * import myCustomConfigAggregator from '@/components/pagebuilder/MyCustom/configAggregator';
 * 
 * registerContentType('my-custom', {
 *   component: MyCustomComponent,
 *   configAggregator: myCustomConfigAggregator,
 * });
 * ```
 */

import React from 'react';
import { setContentTypeConfig } from './lib/config';

export interface ContentTypeConfig {
  component: React.ComponentType<any>;
  configAggregator?: (node: HTMLElement, props: any) => any;
  componentShimmer?: React.ComponentType<any>;
}

/**
 * Register a custom PageBuilder content type
 * 
 * @param contentType - The content type identifier (e.g., 'banner', 'products')
 * @param config - Configuration object with component and configAggregator
 */
export function registerContentType(
  contentType: string,
  config: ContentTypeConfig
): void {
  setContentTypeConfig(contentType, config);
}

/**
 * Register multiple content types at once
 * 
 * @param contentTypes - Object mapping content type names to their configs
 */
export function registerContentTypes(
  contentTypes: Record<string, ContentTypeConfig>
): void {
  Object.entries(contentTypes).forEach(([contentType, config]) => {
    registerContentType(contentType, config);
  });
}

