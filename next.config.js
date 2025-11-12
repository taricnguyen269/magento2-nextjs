/** @type {import('next').NextConfig} */

const { getPossibleTypes } = require('./scripts/getPossibleTypes');
const { getStoreConfig } = require('./scripts/getStoreConfigData');

// Cache possibleTypes to avoid fetching multiple times during build
// Next.js calls webpack config for client, server, and edge runtimes
let cachedPossibleTypes = null;
let possibleTypesPromise = null;

// Cache store config to avoid fetching multiple times during build
let cachedStoreConfig = null;
let cachedAvailableStores = null;
let storeConfigPromise = null;

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development",
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
    NEXT_PUBLIC_INTERNAL_DOMAINS: process.env.INTERNAL_DOMAINS || "pwa-stg.arielbath.com,pwa.arielbath.com,arielbath.com,www.arielbath.com",
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
    // Get possibleTypes from GraphQL schema at build time (cached to avoid multiple fetches)
    let possibleTypes = cachedPossibleTypes || {};

    // Start async fetch in background if not already started
    if (cachedPossibleTypes === null && !possibleTypesPromise) {
      possibleTypesPromise = (async () => {
        try {
          const result = await getPossibleTypes();
          cachedPossibleTypes = result;
          return result;
        } catch (error) {
          console.warn('⚠ Could not fetch possibleTypes:', error.message);
          cachedPossibleTypes = {};
          return {};
        }
      })();
    }

    // Get store config data from GraphQL at build time
    let storeConfigData = cachedStoreConfig || null;

    // Start async fetch in background if not already started
    if (cachedStoreConfig === null && !storeConfigPromise) {
      storeConfigPromise = (async () => {
        try {
          const result = await getStoreConfig();
          cachedStoreConfig = result.storeConfig;
          cachedAvailableStores = result.availableStores || [];
          return result;
        } catch (error) {
          console.warn('⚠ Could not fetch store config:', error.message);
          cachedStoreConfig = null;
          return { storeConfig: null, availableStores: [] };
        }
      })();
    }

    // Add webpack aliases for PWA Studio dependencies (client-side only)
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@magento/peregrine/lib/util/resolveLinkProps': require.resolve('./src/lib/pagebuilder/adapters/resolveLinkProps.ts'),
        '@magento/peregrine/lib/util/makeUrl': require.resolve('./src/lib/pagebuilder/adapters/makeUrl.ts'),
        '@magento/peregrine/lib/hooks/useIntersectionObserver': require.resolve('./src/lib/pagebuilder/adapters/peregrine-hooks.ts'),
        '@magento/peregrine/lib/hooks/useMediaQuery': require.resolve('./src/lib/pagebuilder/adapters/peregrine-hooks.ts'),
        '@magento/peregrine/lib/hooks/useDetectScrollWidth': require.resolve('./src/lib/pagebuilder/adapters/peregrine-hooks.ts'),
        '@magento/venia-ui/lib/classify': require.resolve('./src/lib/pagebuilder/adapters/classify.ts'),
        '@magento/venia-ui/lib/components/Button/button': require.resolve('./src/lib/pagebuilder/adapters/Button.tsx'),
        '@magento/pagebuilder/lib/handleHtmlContentClick': require.resolve('./src/lib/pagebuilder/adapters/handleHtmlContentClick.ts'),
        'react-router-dom': require.resolve('./src/lib/pagebuilder/adapters/react-router-dom.tsx'),
      };
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

    // Configure CSS Modules to allow pure :global selectors and custom class name format
    const cssRules = config.module.rules.find(
      (rule) => rule.oneOf
    );
    if (cssRules && cssRules.oneOf) {
      cssRules.oneOf.forEach((rule) => {
        if (rule.use && Array.isArray(rule.use)) {
          rule.use.forEach((use) => {
            if (use.loader && use.loader.includes('css-loader') && use.options && use.options.modules) {
              use.options.modules.mode = 'local';
              use.options.modules.exportGlobals = true;
              
              // Custom class name format: [fileName]-[localName]-[hash]
              use.options.modules.getLocalIdent = (context, localIdentName, localName) => {
                const match = context.resourcePath.match(/([^/\\]+)\.module\.css$/);
                const fileName = match?.[1] || 'module';
                const hash = require('crypto')
                  .createHash('md5')
                  .update(context.resourcePath + localName)
                  .digest('base64')
                  .substring(0, 4)
                  .replace(/[+/=]/g, '')
                  .replace(/[^a-zA-Z0-9]/g, '');
                const finalHash = hash.length >= 3 ? hash.substring(0, 3) : hash.padEnd(3, '0');
                return `${fileName}-${localName}-${finalHash}`;
              };
            }
          });
        }
      });
    }

    // Inject possibleTypes and store config via DefinePlugin
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.POSSIBLE_TYPES': JSON.stringify(possibleTypes),
        'process.env.STORE_CONFIG_DATA': JSON.stringify(storeConfigData)
      })
    );

    return config;
  },
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
      // JS files: CacheFirst (file names change when content changes)
      urlPattern: /\.js$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-js-assets",
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // CSS files: CacheFirst (file names change when content changes)
      urlPattern: /\.(?:css|less)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-style-assets",
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // CDN images from arielbath.com domains (must come before generic image pattern)
      urlPattern: ({ url }) => {
        const cdnDomains = ['cdn-stg.arielbath.com', 'cdn.arielbath.com', 'arielbath.com'];
        const isImageExtension = /\.(?:png|gif|jpg|jpeg|svg|webp)$/i.test(url.pathname);
        return cdnDomains.some(domain => url.hostname === domain) && isImageExtension;
      },
      handler: "CacheFirst",
      options: {
        cacheName: "cdn-images",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // Next.js optimized images via /_next/image
      urlPattern: ({ url }) => {
        return url.pathname === '/_next/image' && url.search.includes('url=');
      },
      handler: "CacheFirst",
      options: {
        cacheName: "next-images",
        expiration: {
          maxEntries: 120,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // Direct image files (png, gif, jpg, jpeg, svg, webp) - matches pathname before query params
      urlPattern: ({ url }) => {
        return /\.(?:png|gif|jpg|jpeg|svg|webp)$/i.test(url.pathname);
      },
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 120,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
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
