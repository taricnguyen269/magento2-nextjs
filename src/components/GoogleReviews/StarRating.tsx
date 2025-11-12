"use client";

import React from 'react';
import styles from './starRating.module.css';

export const FilledStar = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 16 15">
        <path d="M8 0L9.79611 5.52786H15.6085L10.9062 8.94427L12.7023 14.4721L8 11.0557L3.29772 14.4721L5.09383 8.94427L0.391548 5.52786H6.20389L8 0Z" />
    </svg>
);

const StarRating = ({
    percentFill,
    maxStars = 5
}: {
    percentFill: number;
    maxStars?: number;
}) => {
    // Convert percentFill into an array of percentages for each star
    const fillArray = Array.from({ length: maxStars }, (_, i) =>
        Math.min(100, Math.max(0, percentFill - i * (100 / maxStars)))
    );

    return (
        <div className={styles.starRatingContainer}>
            <div className={styles.starRating}>
                <div className={styles.emptyStarContainer}>
                    {fillArray.map((_, i) => (
                        <div className={styles.starContainer} key={i}>
                            <FilledStar className={styles.starEmpty} />
                        </div>
                    ))}
                </div>
                <div
                    className={styles.filledStarContainer}
                    style={{ width: `${percentFill}%` }}
                >
                    {fillArray.map((_, i) => (
                        <div className={styles.starContainer} key={i}>
                            <FilledStar className={styles.starFilled} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StarRating;

