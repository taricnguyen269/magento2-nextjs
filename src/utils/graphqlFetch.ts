import { cookies } from "next/headers";
import { print, DocumentNode } from "graphql";

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
 * Execute a GraphQL query using direct fetch (for server components)
 */
export async function graphqlFetch<T = any>(
  query: DocumentNode | string,
  variables?: Record<string, any>
): Promise<T> {
  const token = await getAuthTokenFromCookies();
  const endpoint = getGraphQLEndpoint();
  const storeViewCode = process.env.STORE_VIEW_CODE || "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    store: storeViewCode,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Convert DocumentNode to string if needed
  let queryString: string;
  if (typeof query === "string") {
    queryString = query;
  } else if (query && typeof query === "object" && "definitions" in query) {
    // Valid DocumentNode
    queryString = print(query as DocumentNode);
  } else {
    // Query is undefined or invalid
    console.error("Invalid GraphQL query provided to graphqlFetch:", query);
    throw new Error("Invalid GraphQL query: query must be a string or a valid DocumentNode");
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: queryString,
        variables: variables || {},
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
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data as T;
  } catch (error) {
    console.error("Error in graphqlFetch:", error);
    throw error;
  }
}

