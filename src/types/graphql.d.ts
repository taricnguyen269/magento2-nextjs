declare module "*.graphql" {
  import { DocumentNode } from "graphql";

  const value: DocumentNode;
  export = value;
}

// Extend NodeJS.ProcessEnv to include POSSIBLE_TYPES
declare namespace NodeJS {
  interface ProcessEnv {
    POSSIBLE_TYPES?: string;
  }
}
