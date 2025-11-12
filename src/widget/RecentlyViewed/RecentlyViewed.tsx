"use client";

import React, { memo, useMemo } from 'react';
import { useStoreConfig } from '@/hooks';
import { gql, useQuery } from '@apollo/client';
import RecommendationContainer from '@/components/RecommendationContainer/RecommendationContainer';

interface RecentlyViewedWidgetProps {
    node: HTMLElement;
}

const RecentlyViewedWidget = memo((props: RecentlyViewedWidgetProps) => {
    const { node } = props;
    const scriptElement = useMemo(() => {
        return node.querySelector('script[type="text/x-magento-init"]');
    }, [node]);

    const { storeConfig } = useStoreConfig();

    const pageSize = useMemo(() => {
        if (scriptElement) {
            try {
                const scriptContent = JSON.parse(scriptElement.textContent || '{}');
                if (
                    scriptContent['*'] &&
                    scriptContent['*']['Magento_Ui/js/core/app']
                ) {
                    return parseInt(
                        scriptContent['*']['Magento_Ui/js/core/app']['components']
                            .widget_recently_viewed.children
                            .recently_viewed_datasource.config.page_size
                    );
                }
            } catch (e) {
                console.warn('Failed to parse script content:', e);
            }
        }

        return 20;
    }, [scriptElement]);

    const visitorCode = useMemo(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
            return token || localStorage.getItem('visitor_code') || '';
        }
        return '';
    }, []);

    const { error, loading, data } = useQuery(GET_RECENTLY_VIEWED_PRODUCTS, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        variables: {
            visitorCode,
            pageSize,
            filters: {}
        },
        skip: !scriptElement || !visitorCode
    });

    if (loading) {
        return <div>Loading...</div>; // You can replace with a shimmer component
    }

    if (error || !data?.recentlyViewProducts?.items?.length) {
        return null;
    }

    return (
        <RecommendationContainer
            products={data.recentlyViewProducts.items}
            storeConfig={storeConfig}
        />
    );
});

RecentlyViewedWidget.displayName = 'RecentlyViewedWidget';

export default RecentlyViewedWidget;

const GET_RECENTLY_VIEWED_PRODUCTS = gql`
    query getRecentlyProducts(
        $filters: ProductFilterInput
        $visitorCode: String!
        $pageSize: Int
    ) {
        recentlyViewProducts(
            filter: $filters
            visitorCode: $visitorCode
            pageSize: $pageSize
        ) {
            items {
                id
                uid
                sku
                small_image {
                    url
                }
                lifestyle {
                    url
                }
                pseudo_stock_status
                url_key
                parent_url_key
                name
                price_range: indexed_price {
                    final_price {
                        currency
                        value
                    }
                    regular_price {
                        currency
                        value
                    }
                    discount {
                        amount_off
                    }
                }
                labelAttributes: label_attributes {
                    attributeCode: attribute_code
                    attributeValue: attribute_value
                }
            }
        }
    }
`;

