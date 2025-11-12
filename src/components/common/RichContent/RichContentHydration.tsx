"use client";
import { FC, useEffect, useRef, useState } from "react";
import { RichContent } from "./RichContent";

export interface RichContentHydrationProps {
  html: string;
  className?: string;
  isPageBuilder: boolean;
}

/**
 * Client-side hydration component for PageBuilder content
 * Replaces the server-rendered HTML with interactive PageBuilder React components
 * The server-rendered HTML is already in the DOM for SEO, this component hydrates it
 */
export const RichContentHydration: FC<RichContentHydrationProps> = ({
  html,
  className = "",
  isPageBuilder,
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only hydrate PageBuilder content
    if (!isPageBuilder) {
      return;
    }

    // Find the server-rendered PageBuilder container
    const serverRendered = containerRef.current?.parentElement?.querySelector('[data-pagebuilder="true"]');
    if (!serverRendered || !serverRendered.parentElement) {
      return;
    }

    // Remove the server-rendered HTML
    serverRendered.remove();
    
    // Render the React component
    setShouldRender(true);
  }, [isPageBuilder]);

  // Only render for PageBuilder content (plain HTML doesn't need hydration)
  if (!isPageBuilder || !shouldRender) {
    return <div ref={containerRef} style={{ display: 'none' }} />;
  }

  // Render the interactive PageBuilder component within App Router context
  return (
    <div ref={containerRef}>
      <RichContent html={html} className={className} />
    </div>
  );
};

