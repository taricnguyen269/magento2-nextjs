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
  disable: process.env.NODE_ENV === "development",
  register: false,
  skipWaiting: true,
  sw: "sw.js",
  runtimeCaching: [
    {
      // Cache robots.txt, favicon.ico, and manifest.json
      // Similar to pwa-arielbath registerRoutes.js - uses StaleWhileRevalidate
      urlPattern: /(robots\.txt|favicon\.ico|manifest\.json)/,
      handler: "StaleWhileRevalidate"
    },
    {
      urlPattern: ({ url, request }) => {
        const currentOrigin = typeof self !== "undefined" && self.location ? self.location.origin : url.origin;
        return url.origin === currentOrigin && request.destination === 'document';
      },
      handler: "NetworkFirst",
      options: {
        cacheName: "html-cache",
      },
    },
    {
      urlPattern: /\.js$/i,
      handler: "CacheFirst"
    },
    {
      urlPattern: /\.(?:png|gif|jpg|jpeg|svg)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 120, // MAX_NUM_OF_IMAGES_TO_CACHE
          maxAgeSeconds: 3 * 24 * 60 * 60, // 3 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /\.(?:woff2?|eot|ttf|otf)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "fonts-cache",
        expiration: {
          maxEntries: 10, // Limit to 10 font files in cache
          maxAgeSeconds: 60 * 60 * 24 * 365, // Cache for 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    }
  ]
});

module.exports = withPWA(nextConfig);
