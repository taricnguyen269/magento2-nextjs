/**
 * Adapter for @magento/venia-ui/lib/components/Gallery/item
 * Product card component for gallery display
 */
"use client";

import { FC } from "react";
import Link from "next/link";
import Image from "next/image";

export interface GalleryItemProps {
  item: any; // Product item
  storeConfig?: any;
}

const GalleryItem: FC<GalleryItemProps> = ({ item, storeConfig }) => {
  if (!item) return null;

  const productUrl = item.url_key ? `/${item.url_key}` : "#";
  const imageUrl = item.small_image?.url || item.image?.url || "";
  const productName = item.name || "";

  return (
    <div className="gallery-item">
      <Link href={productUrl}>
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={productName}
            width={300}
            height={300}
            className="product-image"
          />
        )}
        <h3>{productName}</h3>
      </Link>
    </div>
  );
};

export default GalleryItem;

