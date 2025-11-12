"use client";

import React, { useMemo } from 'react';
import { ProductCard } from '@/components';
import useBreakPoint from '@/hooks/useBreakPoint';
import { Swiper, SwiperProps, SwiperSlide } from 'swiper/react';
import { Scrollbar, FreeMode, Navigation, Virtual } from 'swiper/modules';
import SwiperButton from '@/components/SwiperButton/SwiperButton';
import clsx from '@/utils/clsx';
import styles from './recommendationContainer.module.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

type Props = {
    products: any[];
    productsRank?: Map<string, number>;
    additionalSwiperSettings?: SwiperProps;
    displayGrid?: boolean;
    showNavigationButton?: boolean;
    storeConfig?: any;
    className?: string;
    renderItem?: (item: any) => React.ReactNode;
};

const RecommendationContainer: React.FC<Props> = ({
    products,
    productsRank,
    displayGrid,
    storeConfig,
    additionalSwiperSettings,
    className,
    showNavigationButton = true,
    renderItem
}) => {
    const { isMobile, innerWidth } = useBreakPoint();

    const componentId = useMemo(() => Math.random().toString(36).substring(7), []);
    
    const galleryItems = useMemo(() => {
        let items = [...products];
        if (items?.length) {
            if (productsRank) {
                items = items.map(item => ({
                    ...item,
                    rank: productsRank.get(item.sku) || 0
                }));
                items.sort((a, b) => a.rank - b.rank);
            }

            return items.map(item => {
                if (renderItem) {
                    return renderItem(item);
                }
                return (
                    <ProductCard
                        key={item.id ?? item.uid}
                        product={item}
                        isShowFavorites={true}
                    />
                );
            });
        }

        return null;
    }, [products, productsRank, renderItem]);

    if (
        !displayGrid &&
        !isMobile &&
        galleryItems &&
        galleryItems.length >
            (innerWidth < 1024 ? 3 : innerWidth < 1366 ? 4 : 5)
    ) {
        const swiperSettings = {
            modules: [Navigation, Virtual],
            slidesPerView: 2,
            speed: 500,
            navigation: {
                nextEl: `#swiper-next-${componentId}`,
                prevEl: `#swiper-prev-${componentId}`
            },
            virtual: {
                enabled: true,
                addSlidesBefore: 2,
                addSlidesAfter: 2
            },
            breakpoints: {
                1366: {
                    slidesPerView: 5
                },
                1024: {
                    slidesPerView: 4
                },
                990: {
                    slidesPerView: 3
                }
            },
            ...additionalSwiperSettings
        };

        // On desktop
        return (
            <div className={clsx(styles.itemsWithSwiper, className)}>
                {showNavigationButton && (
                    <SwiperButton
                        prevBtnId={`swiper-prev-${componentId}`}
                        nextBtnId={`swiper-next-${componentId}`}
                        classNames={styles.sliderArrows}
                    />
                )}

                <Swiper {...swiperSettings}>
                    {galleryItems.map((slideContent, index) => (
                        <SwiperSlide
                            key={index}
                            virtualIndex={index}
                        >
                            {slideContent}
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        );
    }

    // On mobile
    if (!displayGrid && isMobile && galleryItems && galleryItems.length > 2) {
        return (
            <div className={clsx(styles.itemsWithSwiper, className)}>
                <Swiper
                    freeMode
                    modules={[Scrollbar, FreeMode]}
                    slidesPerView={'auto'}
                    scrollbar={{ draggable: true }}
                >
                    {galleryItems.map((slideContent, index) => {
                        return (
                            <SwiperSlide
                                key={index}
                                virtualIndex={index}
                            >
                                {slideContent}
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
        );
    }

    return (
        <div
            className={clsx(
                styles.items,
                className,
                displayGrid && styles.grid
            )}
        >
            {galleryItems}
        </div>
    );
};

export default RecommendationContainer;

