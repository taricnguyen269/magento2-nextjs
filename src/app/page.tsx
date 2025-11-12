import { HomeContainer } from "@/container";
import { Metadata } from "next";
import { graphqlFetch } from "@/utils/graphqlFetch";
import { Queries } from "@/utils/graphql";

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

  return (
    <HomeContainer
      ssrData={{
        cmsPageContent: cmsPageContent || null,
      }}
    />
  );
}
