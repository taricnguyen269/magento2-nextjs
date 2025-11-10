import { cookies } from "next/headers";

// GraphQL query as string for server-side fetch
const RESOLVE_URL_QUERY = `
  query resolveURL($url: String!) {
    route(url: $url) {
      relative_url
      redirect_code
      type
      ... on CmsPage {
        identifier
        meta_description
        meta_keywords
        meta_title
        title
        canonical_url
        content_heading
      }
      ... on ProductInterface {
        uid
        sku
        name
        canonical_url
        __typename
      }
      ... on CategoryTree {
        uid
        name
        image
        meta_title
        meta_keywords
        meta_description
        canonical_url
        url_path
        url_key
        breadcrumbs {
          category_uid
          category_name
          category_url_path
          category_level
        }
      }
    }
  }
`;

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
 * Get auth token from cookies (server-side)
 */
async function getAuthTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("ARIELBATH_COOKIE_PERSISTENCE__auth_token");
  
  if (!authCookie?.value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(authCookie.value);
    if (parsed.value) {
      return JSON.parse(parsed.value);
    }
    return parsed.value || authCookie.value;
  } catch {
    return authCookie.value;
  }
}

/**
 * Get GraphQL endpoint URL
 */
function getGraphQLEndpoint(): string {
  if (typeof window !== "undefined") {
    return new URL("/graphql", location.href).href;
  }
  
  return process.env.GRAPHQL_URL
    ? new URL("/graphql", process.env.GRAPHQL_URL).href
    : "/graphql";
}

/**
 * Resolve URL on the server side using direct fetch
 * Use this in Server Components or API routes
 */
export async function resolveUrl(url: string): Promise<ResolveUrlResult["route"]> {
  const token = await getAuthTokenFromCookies();
  const endpoint = getGraphQLEndpoint();
  const storeViewCode = process.env.STORE_VIEW_CODE || "";

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      store: storeViewCode,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Use the query string directly
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: RESOLVE_URL_QUERY,
        variables: { url },
      }),
      cache: "force-cache",
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      return null;
    }

    return result.data?.route || null;
  } catch (error) {
    console.error("Error resolving URL:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    return null;
  }
}

/**
 * Helper function to determine page type from resolved route
 */
export function getPageType(
  route: ResolveUrlResult["route"]
): "product" | "category" | "cms" | "unknown" {
  if (!route) return "unknown";

  switch (route.type) {
    case "PRODUCT":
      return "product";
    case "CATEGORY":
      return "category";
    case "CMS_PAGE":
      return "cms";
    default:
      return "unknown";
  }
}

/**
 * Check if route has a redirect
 * Only return true if redirect_code is a valid HTTP redirect code (301, 302, etc.)
 */
export function hasRedirect(route: ResolveUrlResult["route"]): boolean {
  if (!route?.redirect_code) {
    return false;
  }
  // Only consider it a redirect if redirect_code is a valid HTTP redirect status (301, 302, 307, 308)
  const redirectCode = route.redirect_code;
  return redirectCode === 301 || redirectCode === 302 || redirectCode === 307 || redirectCode === 308;
}

/**
 * Get redirect URL if exists
 */
export function getRedirectUrl(route: ResolveUrlResult["route"]): string | null {
  if (!hasRedirect(route) || !route?.relative_url) {
    return null;
  }

  // Ensure URL starts with /
  return route.relative_url.startsWith("/")
    ? route.relative_url
    : `/${route.relative_url}`;
}

