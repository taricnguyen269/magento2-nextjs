/**
 * Adapter for @magento/venia-ui/lib/classify
 * Simple class merging utility for Next.js
 */

import React from 'react';

/**
 * Merge multiple class objects into one
 * Similar to @magento/peregrine/lib/util/shallowMerge
 */
export function mergeClasses(...classObjects: (Record<string, string> | null | undefined)[]): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const classObj of classObjects) {
    if (!classObj) continue;
    
    for (const [key, value] of Object.entries(classObj)) {
      if (value) {
        // Merge class names, handling existing values
        result[key] = result[key] ? `${result[key]} ${value}` : value;
      }
    }
  }
  
  return result;
}

/**
 * useStyle hook - alias for mergeClasses
 * Used by PageBuilder components
 */
export function useStyle(
  defaultClasses: Record<string, string>,
  customClasses?: Record<string, string> | null
): Record<string, string> {
  return mergeClasses(defaultClasses, customClasses);
}

/**
 * classify HOC - Higher Order Component for adding default classes
 * Not used in functional components, but provided for compatibility
 */
export default function classify(defaultClasses: Record<string, string>) {
  return function<P extends { classes?: Record<string, string>; className?: string }>(
    WrappedComponent: React.ComponentType<P>
  ) {
    return function ClassifiedComponent(props: P) {
      const classNameAsObject = props.className ? { root: props.className } : null;
      const finalClasses = mergeClasses(defaultClasses, classNameAsObject, props.classes);
      
      return React.createElement(WrappedComponent, { ...props, classes: finalClasses });
    };
  };
}

