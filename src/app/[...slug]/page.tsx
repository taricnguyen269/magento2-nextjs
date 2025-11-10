import { resolveUrl, getPageType, hasRedirect, getRedirectUrl } from "@/utils/resolveUrl";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import { readFileSync } from "fs";
import { join } from "path";
import { graphqlFetch } from "@/utils/graphqlFetch";
import { ProductDetailsContainer } from "@/container/ProductDetailsContainer";
import { FullPageLoading } from "@/components";

// Read GraphQL queries as strings (for server components)
const PRODUCT_DETAILS_QUERY = readFileSync(
  join(process.cwd(), "src/graphql/query/product-details.graphql"),
  "utf-8"
);
const PRODUCTS_LIST_QUERY = readFileSync(
  join(process.cwd(), "src/graphql/query/products-list.graphql"),
  "utf-8"
);
const PRODUCT_SIDEBAR_FILTER_QUERY = readFileSync(
  join(process.cwd(), "src/graphql/query/product-sidebar-filter.graphql"),
  "utf-8"
);

interface DynamicPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

/**
 * Dynamic catch-all route that resolves any URL
 * This replaces the need for separate product/category/cms routes
 *
 * Usage: Handles URLs like:
 * - /product-url -> Product page
 * - /category-url -> Category page
 * - /cms-page-url -> CMS page
 */
export default async function DynamicPage({ params }: DynamicPageProps) {
  // In Next.js 15+, params is a Promise and needs to be awaited
  const resolvedParams = await params;
  
  // Reconstruct URL from slug array
  // Handle cases where slug might be undefined/empty
  const slugArray = resolvedParams?.slug || [];
  const url = slugArray.length > 0 ? "/" + slugArray.join("/") : "/";

  // Resolve the URL to determine page type
  const route = await resolveUrl(url);

  if (!route) {
    notFound();
  }

  console.log('Route resolved:', {
    type: route.type,
    relative_url: route.relative_url,
    redirect_code: route.redirect_code,
    url: url
  });

  // Handle redirects - only redirect if it's different from current URL
  if (hasRedirect(route)) {
    const redirectUrl = getRedirectUrl(route);
    if (redirectUrl) {
      // Normalize URLs for comparison (remove trailing slashes, lowercase, etc.)
      const normalizedCurrentUrl = url.toLowerCase().replace(/\/$/, '').replace(/\/+/g, '/');
      const normalizedRedirectUrl = redirectUrl.toLowerCase().replace(/\/$/, '').replace(/\/+/g, '/');
      
      if (normalizedRedirectUrl !== normalizedCurrentUrl) {
        // Prevent redirect loops - only redirect if URL is different
        console.log('Redirecting from:', url, 'to:', redirectUrl);
        redirect(redirectUrl);
      } else {
        console.log('Skipping redirect - same URL (preventing loop):', redirectUrl, '===', url);
      }
    }
  }

  // Handle external redirects (only if not already handled above)
  if (!hasRedirect(route) && route.relative_url && route.relative_url.startsWith("http")) {
    redirect(route.relative_url);
  }

  const pageType = getPageType(route);

  // Render based on page type
  switch (pageType) {
    case "product":
      return <ProductPage route={route} />;

    case "category":
      return <CategoryPage route={route} />;

    case "cms":
      return <CmsPage route={route} />;

    default:
      notFound();
  }
}

/**
 * Product Page Component
 */
async function ProductPage({
  route,
}: {
  route: NonNullable<Awaited<ReturnType<typeof resolveUrl>>>;
}) {
  if (!route.sku) {
    notFound();
  }

  try {
    // Use url_key if available, otherwise fall back to sku
    const data = await graphqlFetch<{ products: any }>(PRODUCT_DETAILS_QUERY, {
      url_key: route.url_key || route.url_path || route.relative_url?.replace(/^\//, '') || route.sku
    });

    const productDetails = data?.products;
    if (!productDetails || !productDetails.items?.[0]) {
      notFound();
    }

    return (
      <ProductDetailsContainer
        ssrData={{ productDetails }}
      />
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }
}

/**
 * Category Page Component
 * Note: This is a Server Component that fetches data and passes it to a Client Component
 */
async function CategoryPage({
  route,
}: {
  route: NonNullable<Awaited<ReturnType<typeof resolveUrl>>>;
}) {
  if (!route.uid) {
    notFound();
  }

  try {
    // Fetch both product list and sidebar filter data
    const [productsData, filterData] = await Promise.all([
      graphqlFetch<{ products: any }>(PRODUCTS_LIST_QUERY, {
        filters: {
          category_uid: {
            eq: route.uid,
          },
        },
        pageSize: 20,
        currentPage: 1,
      }),
      graphqlFetch<{ products: any }>(PRODUCT_SIDEBAR_FILTER_QUERY, {
        categoryIdFilter: { eq: route.uid },
      }),
    ]);

    const productsList = productsData?.products;
    const productSidebarFilter = filterData?.products;

    if (!productsList) {
      notFound();
    }

    // Ensure productSidebarFilter has the correct structure
    // The GraphQL query returns { products: { aggregations: [...] } }
    // We need to pass the full products object
    const sidebarFilterData = productSidebarFilter || { aggregations: [] };

    // Import and use client component for interactive features
    const { CategoryPageClient } = await import("./CategoryPageClient");

    return (
      <Suspense fallback={<FullPageLoading />}>
        <CategoryPageClient
          ssrData={{
            productSidebarFilter: sidebarFilterData,
            productsList,
          }}
          categoryUid={route.uid}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Error fetching category:", error);
    notFound();
  }
}

/**
 * CMS Page Component
 */
function CmsPage({
  route,
}: {
  route: NonNullable<Awaited<ReturnType<typeof resolveUrl>>>;
}) {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <article>
          {route.title && (
            <h1 className="text-3xl font-bold mb-4">{route.title}</h1>
          )}
          {route.content_heading && (
            <h2 className="text-2xl font-semibold mb-4">
              {route.content_heading}
            </h2>
          )}
          {/* CMS content would be fetched separately if needed */}
          <div className="prose max-w-none">
            <p className="text-gray-600">CMS Page: {route.identifier}</p>
            {route.meta_description && (
              <p className="text-gray-700">{route.meta_description}</p>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: DynamicPageProps) {
  const resolvedParams = await params;
  const slugArray = resolvedParams?.slug || [];
  const url = slugArray.length > 0 ? "/" + slugArray.join("/") : "/";
  const route = await resolveUrl(url);

  if (!route) {
    return {
      title: "Page Not Found",
    };
  }

  // Product metadata
  if (route.type === "PRODUCT" && route.meta_title) {
    return {
      title: route.meta_title,
      description: route.meta_description || route.name,
    };
  }

  // Category metadata
  if (route.type === "CATEGORY" && route.meta_title) {
    return {
      title: route.meta_title,
      description: route.name,
    };
  }

  // CMS metadata
  if (route.type === "CMS_PAGE" && route.meta_title) {
    return {
      title: route.meta_title,
      description: route.meta_description,
      keywords: route.meta_keywords,
    };
  }

  return {
    title: route.name || route.title || "Ariel Bath",
  };
}

