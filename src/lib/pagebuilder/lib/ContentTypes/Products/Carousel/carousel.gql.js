import gql from 'graphql-tag';

// Stub GraphQL operations for Products Carousel
// In a real implementation, these would fetch actual product data
const GET_STORE_CONFIG = gql`
    query GetStoreConfig {
        storeConfig {
            store_code
            store_name
            base_currency_code
        }
    }
`;

const GET_PRODUCTS = gql`
    query GetProducts($skus: [String!]!) {
        products(filter: { sku: { in: $skus } }) {
            items {
                sku
                name
                url_key
                small_image {
                    url
                }
            }
        }
    }
`;

export default {
    getStoreConfigQuery: GET_STORE_CONFIG,
    getProductsQuery: GET_PRODUCTS
};
