"use client";

import React, { FC } from 'react';
import clsx from '@/utils/clsx';
import styles from './swiperButton.module.css';

type Props = {
    nextBtnId?: string;
    prevBtnId?: string;
    classNames?: string;
    disabledNext?: boolean;
    disabledPrev?: boolean;
    onClick?: (event: React.MouseEvent) => void;
};

const SwiperButton: FC<Props> = ({
    nextBtnId,
    prevBtnId,
    classNames,
    disabledNext,
    disabledPrev,
    onClick
}) => {
    return (
        <div
            className={clsx(styles.sliderArrows, classNames)}
            onClick={onClick}
        >
            <button
                aria-label={'Previous slide'}
                id={prevBtnId}
                type="button"
                data-role="button"
                disabled={disabledPrev}
                className={clsx(
                    styles.arrow,
                    styles.arrow_prev
                )}
            />
            <button
                aria-label={'Next slide'}
                id={nextBtnId}
                type="button"
                data-role="button"
                disabled={disabledNext}
                className={clsx(
                    styles.arrow,
                    styles.arrow_next
                )}
            />
        </div>
    );
};

export default SwiperButton;

