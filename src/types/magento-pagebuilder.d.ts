/**
 * TypeScript declarations for @magento/pagebuilder
 * Since the package doesn't include TypeScript definitions, we provide our own
 */

declare module '@magento/pagebuilder' {
  import { ComponentType } from 'react';

  export interface PageBuilderProps {
    html: string;
    classes?: {
      root?: string;
    };
  }

  const PageBuilder: ComponentType<PageBuilderProps>;
  export default PageBuilder;
}

declare module '@magento/pagebuilder/lib/detectPageBuilder' {
  function detectPageBuilder(content: string): boolean;
  export default detectPageBuilder;
}

declare module '@magento/pagebuilder/lib/config' {
  import { ComponentType } from 'react';

  export interface ContentTypeConfig {
    component: ComponentType<any>;
    configAggregator?: (node: HTMLElement, props: any) => any;
    componentShimmer?: ComponentType<any>;
  }

  export function getContentTypeConfig(
    contentType: string
  ): ContentTypeConfig | undefined;

  export function setContentTypeConfig(
    contentType: string,
    config: ContentTypeConfig
  ): ContentTypeConfig;
}

