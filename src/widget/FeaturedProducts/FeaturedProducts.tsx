"use client";

import React, { memo, useMemo } from 'react';
import { useStoreConfig } from '@/hooks';
import { gql, useQuery } from '@apollo/client';
import RecommendationContainer from '@/components/RecommendationContainer/RecommendationContainer';
import { useBreakPoint } from '@/hooks';

type FeaturedProductsWidgetProps = {
    node: HTMLElement;
};

const FeaturedProductsWidget = memo((props: FeaturedProductsWidgetProps) => {
    const { node } = props;
    const sortBy = node.dataset.amsortingSortBy;
    const sortOrder = node.dataset.amsortingSortOrder;
    const productsCount = node.dataset.productsCount;
    const conditions = node.dataset.conditions;
    const enableSlidesOffset = !!node.closest('.slidesOffsetAfter');
    const { isDesktop } = useBreakPoint();
    const { storeConfig } = useStoreConfig();
    
    const swiperSettings = useMemo(() => {
        const slideItemWidth = 262;
        return enableSlidesOffset && isDesktop
            ? {
                  slidesOffsetAfter:
                      typeof window !== 'undefined' && window.innerWidth <= 1024
                          ? slideItemWidth * 3
                          : typeof window !== 'undefined' && window.innerWidth <= 1660
                          ? slideItemWidth * 2
                          : slideItemWidth,
                  breakpoints: {
                      1440: {
                          slidesPerView: 4
                      },
                      1024: {
                          slidesPerView: 4
                      },
                      990: {
                          slidesPerView: 3
                      }
                  }
              }
            : {};
    }, [enableSlidesOffset, isDesktop]);

    const { loading, data } = useQuery(GET_FEATURED_PRODUCTS, {
        variables: {
            sortBy,
            amsortingSortOrder: sortOrder,
            productsCount: Number(productsCount),
            conditions
        },
        skip: !sortBy || !sortOrder || !productsCount || !conditions
    });

    if (loading) {
        return <div>Loading...</div>; // You can replace with a shimmer component
    }

    if (!data?.featuredProduct?.items?.length) {
        return null;
    }

    const items = data?.featuredProduct?.items ?? [];

    return (
        <RecommendationContainer
            additionalSwiperSettings={swiperSettings}
            products={items}
            storeConfig={storeConfig}
        />
    );
});

FeaturedProductsWidget.displayName = 'FeaturedProductsWidget';

export default FeaturedProductsWidget;

const GET_FEATURED_PRODUCTS = gql`
    query getFeaturedProducts(
        $sortBy: String!
        $amsortingSortOrder: String!
        $productsCount: Int!
        $conditions: String!
    ) {
        featuredProduct(
            sortBy: $sortBy
            amsortingSortOrder: $amsortingSortOrder
            productsCount: $productsCount
            conditions: $conditions
        ) {
            items {
                id
                uid
                name
                sku
                url_key
                labelAttributes: label_attributes {
                    attributeCode: attribute_code
                    attributeValue: attribute_value
                }
                ... on SimpleProduct {
                    pseudo_stock_status
                    uid
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
                    small_image {
                        url
                    }
                    lifestyle {
                        url
                    }
                }
                ... on ConfigurableProduct {
                    configurable_options {
                        attribute_code
                        attribute_id
                        uid
                        label
                        values {
                            uid
                            label
                            value_index
                            swatch_data {
                                ... on ImageSwatchData {
                                    thumbnail
                                }
                                value
                            }
                        }
                    }
                    variants {
                        attributes {
                            code
                            value_index
                        }
                        product {
                            uid
                            sku
                            name
                            small_image {
                                url
                            }
                            lifestyle {
                                url
                            }
                            pseudo_stock_status
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
            }
        }
    }
`;

