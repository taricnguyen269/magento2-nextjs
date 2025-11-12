"use client";

import React, { memo, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Scrollbar } from 'swiper/modules';
import SwiperButton from '@/components/SwiperButton/SwiperButton';
import { StarRating } from '@/components/GoogleReviews';
import clsx from '@/utils/clsx';
import styles from './googleReviewsCarousel.module.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

function formatReviewDate(input: string): string {
    // Extract day, month, and year from the string
    const match = input.match(/(\d{1,2}) (\w{3}) (\d{4})/);

    if (!match) return 'Invalid Date Format';

    let [, day, month, year] = match; // Extracted parts

    // Convert day to ordinal format (e.g., 1st, 2nd, 3rd, 4th...)
    const ordinalSuffix = (d: number) => {
        if (d > 3 && d < 21) return 'th'; // Special case for 11-20
        switch (d % 10) {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
                return 'rd';
            default:
                return 'th';
        }
    };

    day = `${parseInt(day)}${ordinalSuffix(parseInt(day))}`; // Convert day to ordinal

    return `${month} ${day}, ${year}`;
}

interface GoogleReviewsCarouselProps {
    node: HTMLElement;
}

const GoogleReviewsCarousel = memo((props: GoogleReviewsCarouselProps) => {
    const { node } = props;

    const content = useMemo(() => {
        const reviews = Array.from(
            node.querySelectorAll('[data-element="review-item"]')
        ).map(review => {
            return {
                name: review
                    .querySelector('header > .name')
                    ?.textContent?.trim() || '',
                star: review
                    .querySelector('header > [data-element="box-stars"]')
                    ?.getAttribute('title') || '0',
                comment: review.querySelector('.comment')?.textContent?.trim() || '',
                date: review.querySelector('footer > span')?.textContent?.trim() || ''
            };
        });

        if (reviews.length) {
            const id = 'reviews';
            const swiperSettings: any = {
                modules: [Navigation, Scrollbar],
                slidesPerView: 2.2,
                spaceBetween: 8,
                freeMode: true,
                speed: 500,
                navigation: {
                    nextEl: `#swiper-next-${id}`,
                    prevEl: `#swiper-prev-${id}`
                },
                scrollbar: {
                    draggable: true
                },
                breakpoints: {
                    1440: {
                        slidesPerView: 'auto' as any,
                        spaceBetween: 24
                    },
                    1024: {
                        slidesPerView: 'auto' as any,
                        spaceBetween: 24
                    },
                    768: {
                        slidesPerView: 'auto' as any,
                        spaceBetween: 24
                    }
                }
            };

            return (
                <div className={styles.root}>
                    <div className={styles.heading}>
                        <h2>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                            </svg>
                            Verified review from happy customers
                        </h2>
                        {reviews.length > 6 && (
                            <SwiperButton
                                prevBtnId={`swiper-prev-${id}`}
                                nextBtnId={`swiper-next-${id}`}
                                classNames={styles.sliderArrows}
                            />
                        )}
                    </div>
                    <div className={styles.reviewItems}>
                        <Swiper {...swiperSettings}>
                            {reviews.map((review, index) => (
                                <SwiperSlide key={index} virtualIndex={index}>
                                    <ReviewCard
                                        review={review}
                                        classes={styles}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            );
        }

        return null;
    }, [node]);

    return content;
});

GoogleReviewsCarousel.displayName = 'GoogleReviewsCarousel';

const ReviewCard = ({ review, classes }: { review: any; classes: any }) => {
    return (
        <div className={classes.card}>
            <div className={classes.cardHeader}>{review.name}</div>
            <div className={classes.cardBody}>{review.comment}</div>
            <div className={classes.cardFooter}>
                <div className={classes.cardFooterLeft}>
                    {review.date && formatReviewDate(review.date)}
                </div>
                <div className={classes.cardFooterRight}>
                    <StarRating percentFill={parseFloat(review.star) * 20} />
                </div>
            </div>
        </div>
    );
};

export default GoogleReviewsCarousel;

