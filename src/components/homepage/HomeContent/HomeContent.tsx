import { FC } from "react";

export interface HomeContentProps {}

/**
 * HomeContent component - CMS content is now rendered server-side in page.tsx
 * This component is kept for backward compatibility but no longer renders CMS content
 * The CMS content is rendered via RichContentServer in the Server Component
 */
export const HomeContent: FC<HomeContentProps> = () => {
  // CMS content is now rendered server-side in page.tsx
  // This component is kept for any client-side features that might need it
  return null;
};
