import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc";

export const { getClient } = registerApolloClient(() => {
  const uri: string = typeof window !== "undefined"
    ? new URL("/graphql", location.href).href
    : process.env.GRAPHQL_URL
      ? new URL("/graphql", process.env.GRAPHQL_URL).href
      : "/graphql";

  const httpLink = new HttpLink({
    uri: uri as string,
    headers: {
      store: process.env.STORE_VIEW_CODE || "",
    },
    // Use GET method for GraphQL queries
    useGETForQueries: true,
  });

  // Get possibleTypes from build-time environment variable
  // Webpack DefinePlugin injects this as a JSON string
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

  // Create client configuration
  const clientConfig: any = {
    cache: new InMemoryCache({
      possibleTypes,
    }),
    link: httpLink,
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

  return new ApolloClient(clientConfig);
});
