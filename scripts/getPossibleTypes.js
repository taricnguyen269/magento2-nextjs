// Use built-in fetch (Node.js 18+) or node-fetch if available
let fetch;
let httpsAgent = null;

try {
  // Try to use node-fetch if available
  fetch = require('node-fetch');
  const https = require('https');
  httpsAgent = new https.Agent({ rejectUnauthorized: false });
} catch (e) {
  // Fall back to global fetch (Node.js 18+)
  fetch = globalThis.fetch || require('node-fetch');
}

/**
 * GraphQL query to get schema types
 */
const GET_SCHEMA_TYPES_QUERY = `
  query IntrospectionQuery {
    __schema {
      types {
        kind
        name
        possibleTypes {
          name
        }
      }
    }
  }
`;

/**
 * Fetch GraphQL schema types from the endpoint
 */
async function fetchSchemaTypes() {
  const graphqlUrl = process.env.GRAPHQL_URL || 'http://localhost/graphql';
  const targetURL = new URL(graphqlUrl);
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip',
    Accept: 'application/json',
    'User-Agent': 'nextjs-build',
    Host: targetURL.host
  };

  if (process.env.STORE_VIEW_CODE) {
    headers['store'] = process.env.STORE_VIEW_CODE;
  }

  try {
    const fetchOptions = {
      body: JSON.stringify({ query: GET_SCHEMA_TYPES_QUERY }),
      headers: headers,
      method: 'POST'
    };

    // Add agent only if using node-fetch
    if (httpsAgent) {
      fetchOptions.agent = targetURL.protocol === 'https:' ? httpsAgent : null;
    }

    const response = await fetch(targetURL.toString(), fetchOptions);

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      throw new Error(`GraphQL errors: ${result.errors[0].message}`);
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching schema types:', error);
    throw error;
  }
}

/**
 * Generate possible types from schema
 * Maps interface/union types to their possible implementations
 * 
 * @returns {Object} Object mapping supertype names to arrays of subtype names
 */
async function getPossibleTypes() {
  try {
    const data = await fetchSchemaTypes();

    const possibleTypes = {};

    data.__schema.types.forEach(supertype => {
      if (supertype.possibleTypes && supertype.possibleTypes.length > 0) {
        possibleTypes[supertype.name] = supertype.possibleTypes.map(
          subtype => subtype.name
        );
      }
    });

    return possibleTypes;
  } catch (error) {
    console.warn('Failed to fetch possibleTypes from GraphQL schema:', error.message);
    console.warn('Using empty possibleTypes object. Apollo Client will work but may have cache issues with unions/interfaces.');
    // Return empty object as fallback
    return {};
  }
}

module.exports = { getPossibleTypes };

