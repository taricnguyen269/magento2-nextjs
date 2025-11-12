import { HomeContainer } from "@/container";
import { Metadata } from "next";
import { graphqlFetch } from "@/utils/graphqlFetch";
import { Queries } from "@/utils/graphql";
import { RichContentServer } from "@/components/common/RichContent/RichContentServer";
import { RichContentHydration } from "@/components/common/RichContent/RichContentHydration";
import { processMediaUrls } from "@/utils/helper";
import styles from "@/components/homepage/HomeContent/homeContent.module.css";

/**
 * Get store config from build-time environment variable
 */
function getStoreConfig() {
  try {
    if (process.env.STORE_CONFIG_DATA) {
      return JSON.parse(process.env.STORE_CONFIG_DATA);
    }
  } catch (error) {
    console.warn("Could not parse store config:", error);
  }
  return null;
}

/**
 * Convert internal absolute URLs to relative internal links (server-side)
 */
function convertInternalLinks(htmlContent: string, baseUrl?: string): string {
  if (!htmlContent) {
    return htmlContent;
  }

  const internalDomains: string[] = [];
  const envDomains = process.env.NEXT_PUBLIC_INTERNAL_DOMAINS;
  const arielbathDomains = envDomains
    ? envDomains.split(",").map((domain) => domain.trim()).filter((domain) => domain.length > 0)
    : [];

  if (baseUrl) {
    try {
      const baseUrlObj = new URL(baseUrl);
      internalDomains.push(baseUrlObj.origin);
      if (baseUrlObj.hostname.includes("stg")) {
        internalDomains.push(baseUrlObj.origin.replace("stg", ""));
      }
    } catch (e) {
      // Invalid URL, skip
    }
  }

  internalDomains.push(...arielbathDomains);

  let processed = htmlContent;

  // Replace href="https://domain.com/path" with href="/path" for internal domains
  processed = processed.replace(
    /(href=["'])(https?:\/\/[^"']+)(["'])/gi,
    (match, prefix, fullUrl, suffix) => {
      try {
        const urlObj = new URL(fullUrl);
        const urlPath = urlObj.pathname + urlObj.search + urlObj.hash;

        const isInternal =
          internalDomains.some((domain) => urlObj.origin === domain) ||
          arielbathDomains.some(
            (domain) =>
              urlObj.hostname === domain ||
              urlObj.hostname.endsWith("." + domain) ||
              urlObj.hostname.includes(domain)
          );

        if (isInternal) {
          return `${prefix}${urlPath}${suffix}`;
        }
      } catch (e) {
        // Invalid URL, keep original
      }
      return match;
    }
  );

  return processed;
}

/**
 * Get CMS home page identifier from store config
 * Falls back to 'home' if not available
 */
function getCmsHomePageIdentifier(): string {
  try {
    if (process.env.STORE_CONFIG_DATA) {
      const storeConfig = JSON.parse(process.env.STORE_CONFIG_DATA)

      if (storeConfig?.cms_home_page) {
        return storeConfig.cms_home_page;
      }
    }
  } catch (error) {
    console.warn("Could not parse store config for CMS home page:", error);
  }

  // Fallback to default
  return "home";
}

/**
 * Generate metadata for the home page
 * Uses build-time store config and CMS page content for SEO
 */
export async function generateMetadata(): Promise<Metadata> {
  const cmsHomePageIdentifier = getCmsHomePageIdentifier();

  try {
    // Fetch CMS page for metadata
    const data = await graphqlFetch<{ cmsPage: any }>(Queries.GET_CMS_HOME_PAGE, {
      identifier: cmsHomePageIdentifier,
    });

    const cmsPage = data?.cmsPage;

    if (cmsPage) {
      return {
        title: cmsPage.meta_title || cmsPage.title || "ArielBath",
        description: cmsPage.meta_description || "",
        keywords: cmsPage.meta_keywords || "",
      };
    }
  } catch (error) {
    console.error("Error fetching CMS page metadata:", error);
  }

  // Fallback to store config metadata
  try {
    if (process.env.STORE_CONFIG_DATA) {
      const storeConfig = JSON.parse(process.env.STORE_CONFIG_DATA);

      return {
        title: storeConfig?.default_title || storeConfig?.store_name || "ArielBath",
        description: storeConfig?.default_description || "ARIEL Bath | Shop Bathroom Vanities, Whirlpool Bathtubs, Free Standing Bathtubs, Showers, and more.",
        keywords: storeConfig?.default_keywords || "",
      };
    }
  } catch (error) {
    console.warn("Could not parse store config for metadata:", error);
  }

  // Fallback metadata
  return {
    title: "ArielBath",
    description: "ARIEL Bath | Shop Bathroom Vanities, Whirlpool Bathtubs, Free Standing Bathtubs, Showers, and more.",
  };
}

/**
 * Home page - Server Component
 * Fetches CMS content server-side for SSR
 */
export default async function Home() {
  const { GET_CMS_HOME_PAGE } = Queries;

  // Get CMS home page identifier from build-time store config
  const cmsHomePageIdentifier = getCmsHomePageIdentifier();

  // Fetch CMS page content server-side using graphqlFetch
  let cmsPageContent = null;
  try {
    const data = await graphqlFetch<{ cmsPage: any }>(GET_CMS_HOME_PAGE, {
      identifier: cmsHomePageIdentifier,
    });
    cmsPageContent = data?.cmsPage;
  } catch (error) {
    console.error("Error fetching CMS home page content:", error);
  }

  // Render CMS content server-side
  const cmsContent = cmsPageContent?.content;
  const isPageBuilder = cmsContent ? /data-content-type=/.test(cmsContent) : false;

  // Process HTML server-side for both plain HTML and PageBuilder
  let processedContent = cmsContent;
  if (cmsContent) {
    const storeConfig = getStoreConfig();
    processedContent = convertInternalLinks(
      cmsContent,
      storeConfig?.base_link_url || storeConfig?.baseLinkUrl
    );
    processedContent = processMediaUrls(
      processedContent,
      storeConfig?.secure_base_media_url
    );
  }

  return (
    <>
      {/* Server-side rendered CMS content - always rendered for SEO */}
      {processedContent && (
        <div className={`${styles.root} home-page`}>
          {isPageBuilder ? (
            /* PageBuilder: render placeholder server-side, then hydrate client-side */
            <>
              <RichContentServer html={processedContent} />
              <RichContentHydration html={processedContent} isPageBuilder={isPageBuilder} />
            </>
          ) : (
            /* Plain HTML: fully server-side rendered */
            <RichContentServer html={processedContent} />
          )}
        </div>
      )}
      {/* Client-side container for other interactive features */}
      <HomeContainer
        ssrData={{
          cmsPageContent: cmsPageContent || null,
        }}
      />
    </>
  );
}
