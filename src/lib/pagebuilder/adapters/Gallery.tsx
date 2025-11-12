/**
 * Adapter for @magento/venia-ui/lib/components/Gallery
 * Simple gallery component for displaying products
 */
"use client";

import { FC, ReactNode } from "react";

export interface GalleryProps {
  items?: ReactNode[];
  children?: ReactNode;
  className?: string;
}

const Gallery: FC<GalleryProps> = ({ items, children, className = "" }) => {
  return (
    <div className={`gallery ${className}`}>
      {items || children}
    </div>
  );
};

export default Gallery;

