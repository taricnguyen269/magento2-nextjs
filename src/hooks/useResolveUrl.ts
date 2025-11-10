import { useQuery } from "@apollo/client";
import { RESOLVE_URL } from "@/utils/graphql";

export interface ResolveUrlResult {
  route: {
    relative_url: string;
    redirect_code: number | null;
    type: string;
    // CMS Page fields
    identifier?: string;
    meta_description?: string;
    meta_keywords?: string;
    meta_title?: string;
    title?: string;
    canonical_url?: string;
    content_heading?: string;
    // Product fields
    uid?: string;
    sku?: string;
    name?: string;
    __typename?: string;
    // Category fields
    image?: string;
    url_path?: string;
    url_key?: string;
    breadcrumbs?: Array<{
      category_uid: string;
      category_name: string;
      category_url_path?: string;
      category_level?: number;
    }>;
  } | null;
}

/**
 * Hook to resolve a URL and determine page type
 * Use this in Client Components
 */
export function useResolveUrl(url: string | null) {
  const { data, loading, error } = useQuery<ResolveUrlResult>(RESOLVE_URL, {
    variables: { url: url || "" },
    skip: !url,
    fetchPolicy: "cache-first",
  });

  return {
    route: data?.route || null,
    loading,
    error,
    // Helper methods
    isProduct: data?.route?.type === "PRODUCT",
    isCategory: data?.route?.type === "CATEGORY",
    isCmsPage: data?.route?.type === "CMS_PAGE",
    hasRedirect: data?.route?.redirect_code !== null,
  };
}

