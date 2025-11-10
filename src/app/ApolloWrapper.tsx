"use client";
import { BrowserPersistence, localStorageKeys } from "@/utils";
// ^ this file needs the "use client" pragma

import { ApolloLink, HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  NextSSRInMemoryCache,
  NextSSRApolloClient,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support/ssr";
import { CachePersistor } from "apollo-cache-persist";
import React from "react";
import { cacheStorage, CACHE_PERSIST_PREFIX } from "@/utils/cacheStorage";

// Suppress Apollo Client devtools deprecation warning
// This is a known issue with Apollo Client 3.14+ and Next.js
// The warning comes from Apollo Client's internal code, so we suppress it at the console level
if (typeof window !== "undefined" && typeof console !== "undefined") {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    // Filter out Apollo Client connectToDevTools deprecation warnings
    // Check if the error message contains the Apollo devtools warning
    const errorString = JSON.stringify(args);
    if (errorString.includes('connectToDevTools') ||
        errorString.includes('devtools.enabled') ||
        errorString.includes('go.apollo.dev/c/err') ||
        (args[0] && typeof args[0] === 'string' && args[0].includes('connectToDevTools'))) {
      return; // Suppress this specific warning
    }
    originalError.apply(console, args);
  };
}

// Shared cache instance for client-side persistence
// NextSSRInMemoryCache is a class, so we need to use InstanceType to get the instance type
type NextSSRInMemoryCacheInstance = InstanceType<typeof NextSSRInMemoryCache>;
let sharedCache: NextSSRInMemoryCacheInstance | null = null;
let cachePersistor: CachePersistor<unknown> | null = null;
let persistorInitialized = false;

// Get possibleTypes from build-time environment variable
function getPossibleTypes() {
  let possibleTypes = {};
  try {
    if (typeof process !== 'undefined' && process.env.POSSIBLE_TYPES) {
      const possibleTypesStr = process.env.POSSIBLE_TYPES;
      // Handle both string and already-parsed object cases
      if (typeof possibleTypesStr === 'string') {
        possibleTypes = JSON.parse(possibleTypesStr);
      } else if (typeof possibleTypesStr === 'object') {
        possibleTypes = possibleTypesStr;
      }
    }
  } catch (error) {
    console.warn('Failed to parse POSSIBLE_TYPES:', error);
    possibleTypes = {};
  }
  return possibleTypes;
}

// Initialize cache persistor (client-side only)
async function initializeCachePersistor(cache: NextSSRInMemoryCacheInstance, storeViewCode: string) {
  if (typeof window === "undefined" || persistorInitialized) {
    return;
  }

  try {
    const cacheKey = `${CACHE_PERSIST_PREFIX}-${storeViewCode || 'default'}`;
    // CachePersistor expects a normalized cache, NextSSRInMemoryCache extends InMemoryCache
    // which is compatible with CachePersistor
    cachePersistor = new CachePersistor({
      cache: cache as any, // Type assertion needed - NextSSRInMemoryCache is compatible but types don't match exactly
      storage: cacheStorage as any, // cacheStorage matches the expected interface but types need assertion
      key: cacheKey,
      debug: process.env.NODE_ENV === "development",
      trigger: "write", // Persist on every write
    });

    // Restore cache on initialization
    if (cachePersistor) {
      await cachePersistor.restore();
    }
    persistorInitialized = true;

    if (process.env.NODE_ENV === "development") {
      console.log('✓ Apollo cache restored from persistence');
    }
  } catch (error) {
    console.warn('Failed to initialize Apollo cache persistor:', error);
  }
}

// have a function to create a client for you
function makeClient() {
  const storage = new BrowserPersistence();
  const token = storage.getItem(localStorageKeys.AUTH_TOKEN);

  const uri = typeof window !== "undefined"
    ? new URL("/graphql", location.href).href
    : process.env.GRAPHQL_URL
      ? new URL("/graphql", process.env.GRAPHQL_URL).href
      : "/graphql";

  const storeViewCode = typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_STORE_VIEW_CODE || "")
    : (process.env.STORE_VIEW_CODE || "");

  const httpLink = new HttpLink({
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      store: storeViewCode,
    },

    uri: uri as string,
    // Use GET method for GraphQL queries
    useGETForQueries: true,
    // you can disable result caching here if you want to
    // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
    fetchOptions: typeof window === "undefined"
      ? { cache: "force-cache", next: { revalidate: 3600 } }
      : { cache: "no-store" },
    // you can override the default `fetchOptions` on a per query basis
    // via the `context` property on the options passed as a second argument
    // to an Apollo Client data fetching hook, e.g.:
    // const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { cache: "force-cache" }}});
  });

  const possibleTypes = getPossibleTypes();

  // Use shared cache instance on client-side for persistence
  const cache = typeof window !== "undefined" && sharedCache
    ? sharedCache
    : new NextSSRInMemoryCache({
        possibleTypes,
      });

  // Store cache instance for client-side persistence
  if (typeof window !== "undefined" && !sharedCache) {
    sharedCache = cache;
    // Initialize persistor asynchronously
    initializeCachePersistor(cache, storeViewCode).catch((error) => {
      console.warn('Failed to initialize cache persistor:', error);
    });
  }

  // Create client configuration
  const clientConfig: any = {
    cache,
    link:
      typeof window === "undefined"
        ? ApolloLink.from([
            // in a SSR environment, if you use multipart features like
            // @defer, you need to decide how to handle these.
            // This strips all interfaces with a `@defer` directive from your queries.
            new SSRMultipartLink({
              stripDefer: true,
            }),
            httpLink,
          ])
        : httpLink,
  };

  // Only add devtools config on client-side
  if (typeof window !== "undefined") {
    // Use new devtools.enabled API for Apollo Client 3.14+
    clientConfig.devtools = {
      enabled: process.env.NODE_ENV === "development",
    };
    // Explicitly disable deprecated connectToDevTools to prevent warnings
    clientConfig.connectToDevTools = false;
  }

  const client = new NextSSRApolloClient(clientConfig);

  // Attach persistor to client for potential future use
  if (cachePersistor && typeof window !== "undefined") {
    (client as any).persistor = cachePersistor;
  }

  return client;
}

// you need to create a component to wrap your app in
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
