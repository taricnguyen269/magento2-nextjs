/**
 * Adapter for @magento/peregrine/lib/util/shallowMerge
 * Simple shallow merge utility
 */

export default function shallowMerge<T extends Record<string, any>>(
  ...objects: (T | null | undefined)[]
): T {
  const result = {} as T;
  
  for (const obj of objects) {
    if (!obj) continue;
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = obj[key];
      }
    }
  }
  
  return result;
}

