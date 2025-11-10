/** @type {import('next').NextConfig} */

const { getPossibleTypes } = require('./scripts/getPossibleTypes');

// Cache possibleTypes to avoid fetching multiple times during build
// Next.js calls webpack config for client, server, and edge runtimes
let cachedPossibleTypes = null;
let possibleTypesPromise = null;

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development", // Remove console.log in production
  },
  async rewrites() {
    const rewrites = [];

    if (process.env.GRAPHQL_URL) {
      rewrites.push({
        source: "/graphql",
        destination: process.env.GRAPHQL_URL,
      });
    }

    return rewrites;
  },
  env: {
    GRAPHQL_URL: process.env.GRAPHQL_URL || "",
    FBPIXEL_TRACK_ID: process.env.FBPIXEL_TRACK_ID || "",
    ENABLE_FACEBOOK_TRACKING: process.env.ENABLE_FACEBOOK_TRACKING || "",
    PAYPAL_RETURN_URL: process.env.PAYPAL_RETURN_URL || "",
    PAYPAL_CANCEL_URL: process.env.PAYPAL_CANCEL_URL || "",
    STORE_VIEW_CODE: process.env.STORE_VIEW_CODE || "",
    NEXT_PUBLIC_STORE_VIEW_CODE: process.env.STORE_VIEW_CODE || "",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "arielbath.com",
      },
      {
        protocol: "https",
        hostname: "cdn.arielbath.com",
      },
      {
        protocol: "https",
        hostname: "cdn-stg.arielbath.com",
      }
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // Get possibleTypes from GraphQL schema at build time
    // Use cached result if available, otherwise use empty object (non-blocking)
    // The async fetch happens in the background and will be available on next build
    console.log('isServer', isServer);
    let possibleTypes = cachedPossibleTypes || {};

    // Start async fetch in background if not already started
    if (cachedPossibleTypes === null && !possibleTypesPromise) {
      possibleTypesPromise = (async () => {
        try {
          const result = await getPossibleTypes();
          cachedPossibleTypes = result;
          console.log('✓ Fetched possibleTypes from GraphQL schema');
          return result;
        } catch (error) {
          console.warn('⚠ Could not fetch possibleTypes:', error.message);
          cachedPossibleTypes = {};
          return {};
        }
      })();
    }

    // Add GraphQL loader
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: "graphql-tag/loader",
        },
      ],
    });

    // Add DefinePlugin to inject possibleTypes
    // Use JSON.stringify to ensure it's a proper JSON string
    const possibleTypesJson = JSON.stringify(possibleTypes);
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.POSSIBLE_TYPES': possibleTypesJson,
      })
    );

    return config;
  },
  // Note: Turbopack doesn't support custom loaders for GraphQL files yet
  // Use webpack for dev mode: npm run dev -- --webpack
  // Or use Turbopack with raw-loader as a workaround
  turbopack: {},
};

const withPWA = require("next-pwa")({
  dest: "public", // Destination directory for the PWA files
  disable: process.env.NODE_ENV === "development", // Disable PWA in development mode
  register: false, // We'll register manually via registerSW component
  skipWaiting: true, // Skip waiting for service worker activation
  sw: "sw.js", // Service worker filename
  runtimeCaching: [
    {
      // Exclude GraphQL requests from caching - always fetch from network
      // This route should be registered first to catch GraphQL requests before other routes
      urlPattern: ({ url }) => {
        // Match any request to /graphql endpoint (with or without query params)
        return url.pathname === '/graphql' || url.pathname.startsWith('/graphql');
      },
      handler: "NetworkOnly",
      options: {
        cacheName: "graphql-no-cache",
        networkTimeoutSeconds: 10,
      },
    },
    {
      // Cache product images from CDN and other image sources
      // Matches images with common extensions: png, gif, jpg, jpeg, svg, webp
      urlPattern: ({ url, request }) => {
        // Match images from CDN domains
        const isCDNImage =
          url.hostname.includes('cdn.arielbath.com') ||
          url.hostname.includes('cdn-stg.arielbath.com') ||
          url.hostname.includes('arielbath.com');

        // Match image files by extension
        const isImageFile = /\.(?:png|gif|jpg|jpeg|svg|webp)$/i.test(url.pathname);

        // Match by request destination (for images loaded via <img> tag)
        const isImageRequest = request.destination === 'image';

        return isCDNImage || isImageFile || isImageRequest;
      },
      handler: "CacheFirst",
      options: {
        cacheName: "images", // IMAGES_CACHE_NAME from pwa-arielbath
        expiration: {
          maxEntries: 120, // MAX_NUM_OF_IMAGES_TO_CACHE from pwa-arielbath
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days (THIRTY_DAYS from pwa-arielbath)
        },
        cacheableResponse: {
          statuses: [0, 200], // Cache opaque responses (CORS) and successful responses
        },
      },
    },
    {
      // Cache Next.js optimized images
      // Similar to pwa-arielbath image caching strategy - uses CacheFirst
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-image",
        expiration: {
          maxEntries: 120, // MAX_NUM_OF_IMAGES_TO_CACHE from pwa-arielbath
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days (THIRTY_DAYS from pwa-arielbath)
        },
        cacheableResponse: {
          statuses: [0, 200], // Cache opaque responses (CORS) and successful responses
        },
      },
    },
  ],
  buildExcludes: [/\/graphql/], // Exclude GraphQL from precache manifest
});

module.exports = withPWA(nextConfig);
