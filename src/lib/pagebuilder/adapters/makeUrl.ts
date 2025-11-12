/**
 * Adapter for @magento/peregrine/lib/util/makeUrl
 * Simplified version for Next.js that handles image URL optimization
 */

/**
 * Creates an optimized URL for images
 * 
 * @param path - The image path (relative or absolute)
 * @param options - Options for image optimization
 * @returns Optimized URL string
 */
export default function makeUrl(
  path: string,
  options: {
    type?: string;
    width?: number;
    height?: number;
    quality?: number;
    crop?: boolean;
    fit?: 'bounds' | 'cover' | 'crop';
  } = {}
): string {
  if (!path) {
    return path;
  }

  // If it's already an absolute URL and not an image type, return as-is
  if ((path.startsWith('http://') || path.startsWith('https://')) && !options.type?.startsWith('image-')) {
    return path;
  }

  // For image-wysiwyg type, we can use Next.js Image optimization if needed
  // For now, return the path as-is or prepend media backend URL if relative
  if (options.type === 'image-wysiwyg' && path.startsWith('/media/')) {
    // If relative media URL, it will be processed by processMediaUrls
    return path;
  }

  // For other cases, return path as-is
  return path;
}

