import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc";

export const { getClient } = registerApolloClient(() => {
  const uri: string = typeof window !== "undefined"
    ? new URL("/graphql", location.href).href
    : process.env.GRAPHQL_URL
      ? new URL("/graphql", process.env.GRAPHQL_URL).href
      : "/graphql";

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: uri as string,
      // Use GET method for GraphQL queries
      useGETForQueries: true,
    }),
  });
});
