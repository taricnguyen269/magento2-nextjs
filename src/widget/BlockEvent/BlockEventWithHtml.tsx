"use client";

import React, { memo, useMemo } from 'react';
import CountdownTimer from '@/components/CountdownTimer';
import { useStoreConfig } from '@/hooks';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import SwiperButton from '@/components/SwiperButton/SwiperButton';
import Link from 'next/link';
import clsx from '@/utils/clsx';
import styles from './blockEvent.module.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface BlockEventWithHtmlProps {
    node: HTMLElement;
}

const BlockEventWithHtml = memo((props: BlockEventWithHtmlProps) => {
    const { node } = props;
    const { storeConfig } = useStoreConfig();
    
    const timezone = useMemo(() => {
        return storeConfig?.timezone;
    }, [storeConfig]);

    const events = Array.from(
        node.querySelectorAll('[data-slider-item="slider-item"]')
    ).map(event => {
        return {
            heading: event.querySelector('.box-heading')?.textContent?.trim(),
            description: event
                .querySelector('.box-description')
                ?.textContent?.trim(),
            id: event.querySelector('.ticker')?.getAttribute('id'),
            ticker: event
                .querySelector('.ticker')
                ?.getAttribute('data-mage-init')
                ? JSON.parse(
                      event
                          .querySelector('.ticker')
                          ?.getAttribute('data-mage-init') || '{}'
                  ).ticker
                : {},
            link: event.querySelector('.action.event')?.getAttribute('href')
        };
    });

    const content = useMemo(() => {
        if (events?.length > 1) {
            const id = 'event';
            const swiperSettings = {
                modules: [Navigation, Pagination],
                slidesPerView: 1,
                speed: 500,
                pagination: true,
                navigation: {
                    nextEl: `#swiper-next-${id}`,
                    prevEl: `#swiper-prev-${id}`
                }
            };

            return (
                <div className={clsx(styles.root, styles.rootWithSwiper)}>
                    <SwiperButton
                        prevBtnId={`swiper-prev-${id}`}
                        nextBtnId={`swiper-next-${id}`}
                        classNames={styles.sliderArrows}
                    />
                    <Swiper {...swiperSettings}>
                        {events.map((event: any) => {
                            const eventEndTime = new Intl.DateTimeFormat(
                                'en-US',
                                {
                                    timeZone: timezone,
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                }
                            ).format(
                                new Date((event.ticker?.eventEndTimeUTC || 0) * 1000)
                            );

                            const [datePart, timePart] = eventEndTime.split(
                                ', '
                            );
                            const [month, day, year] = datePart.split('/');
                            const eventEndTimeFormated = `${year}-${month.padStart(
                                2,
                                '0'
                            )}-${day.padStart(2, '0')}T${timePart}`;

                            return (
                                <SwiperSlide
                                    key={event.id}
                                    virtualIndex={event.id}
                                >
                                    <div className={styles.event}>
                                        <div className={styles.eventInfo}>
                                            {event.heading && (
                                                <div
                                                    className={
                                                        styles.eventName
                                                    }
                                                >
                                                    {event.heading}
                                                </div>
                                            )}
                                            {event.description && (
                                                <p>{event.description}</p>
                                            )}
                                        </div>
                                        <CountdownTimer
                                            eventDate={eventEndTimeFormated}
                                        />
                                        <Link
                                            className={styles.shopNowButton}
                                            href={new URL(event.link || '/').pathname}
                                        >
                                            Shop now
                                        </Link>
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
            );
        } else if (events?.length) {
            return (
                <div className={styles.root}>
                    {events.map((event: any) => {
                        const eventEndTime = new Intl.DateTimeFormat('en-US', {
                            timeZone: timezone,
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }).format(
                            new Date((event.ticker?.eventEndTimeUTC || 0) * 1000)
                        );

                        const [datePart, timePart] = eventEndTime.split(', ');
                        const [month, day, year] = datePart.split('/');
                        const eventEndTimeFormated = `${year}-${month.padStart(
                            2,
                            '0'
                        )}-${day.padStart(2, '0')}T${timePart}`;

                        return (
                            <div key={event.id} className={styles.event}>
                                <div className={styles.eventInfo}>
                                    {event.heading && (
                                        <div className={styles.eventName}>
                                            {event.heading}
                                        </div>
                                    )}
                                    {event.description && (
                                        <p>{event.description}</p>
                                    )}
                                </div>
                                <CountdownTimer
                                    eventDate={eventEndTimeFormated}
                                />
                                <Link
                                    className={styles.shopNowButton}
                                    href={new URL(event.link || '/').pathname}
                                >
                                    Shop now
                                </Link>
                            </div>
                        );
                    })}
                </div>
            );
        }

        return null;
    }, [timezone, events]);

    return content;
});

BlockEventWithHtml.displayName = 'BlockEventWithHtml';

export default BlockEventWithHtml;

