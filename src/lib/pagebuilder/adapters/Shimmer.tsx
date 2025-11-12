/**
 * Adapter for @magento/venia-ui/lib/components/Shimmer
 * Simple shimmer/loading placeholder component
 */
"use client";

import { FC, CSSProperties } from "react";

export interface ShimmerProps {
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}

const Shimmer: FC<ShimmerProps> = ({ className = "", style, children }) => {
  return (
    <div
      className={`shimmer ${className}`}
      style={{
        background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
        ...style,
      }}
    >
      {children}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Shimmer;

