"use client";

import { ProductListContainer } from "@/container/ProductListContainer";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ProductList } from "@/types";
import { useMemo } from "react";

interface CategoryPageClientProps {
  ssrData: {
    productSidebarFilter: any;
    productsList: ProductList;
  };
  categoryUid: string;
}

/**
 * Client Component for Category Page
 * Handles filters, pagination, and search params
 */
export function CategoryPageClient({
  ssrData,
  categoryUid,
}: CategoryPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Memoize searchParams to prevent unnecessary re-renders
  const searchParamsObject = useMemo(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  const handleAddFilter = (value: any) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(value).forEach(([key, val]) => {
      if (val) {
        params.set(key, String(val));
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  const handleRemoveFilter = (value?: any) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      if (typeof value === "string") {
        params.delete(value);
      } else {
        Object.keys(value).forEach((key) => params.delete(key));
      }
    } else {
      // Clear all filters
      params.delete("price");
      params.delete("color");
      params.delete("sortBy");
      params.delete("orderBy");
      params.delete("page");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: true });
  };

  return (
    <ProductListContainer
      ssrData={ssrData}
      searchParams={searchParamsObject}
      handleAddFilter={handleAddFilter}
      handleRemoveFilter={handleRemoveFilter}
    />
  );
}

