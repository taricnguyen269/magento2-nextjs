"use client";
import { HomeContext } from "@/context";
import { FC } from "react";
import { HomeContent } from "@/components";

export interface CmsPage {
  title?: string;
  content?: string;
  content_heading?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  page_layout?: string;
  url_key?: string;
  identifier?: string;
}

export interface HomeContainerProps {
  ssrData: {
    cmsPageContent: CmsPage | null;
  };
}

export const HomeContainer: FC<HomeContainerProps> = ({ ssrData }) => {
  const { cmsPageContent } = ssrData;

  return (
    <HomeContext.Provider
      value={{
        cmsPageContent
      }}
    >
      <HomeContent />
    </HomeContext.Provider>
  );
};
