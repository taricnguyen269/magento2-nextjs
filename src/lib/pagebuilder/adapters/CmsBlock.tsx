/**
 * Adapter for @magento/venia-ui/lib/components/CmsBlock/block
 * Renders CMS block content using RichContent component
 */
"use client";

import { FC } from "react";
import { RichContent } from "@/components/common/RichContent";

export interface CmsBlockProps {
  content?: string;
}

const CmsBlock: FC<CmsBlockProps> = ({ content }) => {
  if (!content) {
    return null;
  }

  return <RichContent html={content} />;
};

export default CmsBlock;

