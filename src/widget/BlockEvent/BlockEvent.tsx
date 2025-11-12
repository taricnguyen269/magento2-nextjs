"use client";

import React, { memo, useMemo } from 'react';
import CountdownTimer from '@/components/CountdownTimer';
import { useQuery, gql } from '@apollo/client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import SwiperButton from '@/components/SwiperButton/SwiperButton';
import Link from 'next/link';
import clsx from '@/utils/clsx';
import styles from './blockEvent.module.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import BlockEventWithHtml from './BlockEventWithHtml';

const EVENT_STATUS = {
    open: 0,
    upcomming: 1,
    closed: 2
};

interface BlockEventProps {
    node: HTMLElement;
}

const BlockEvent = memo((props: BlockEventProps) => {
    const { node } = props;

    const eventStatus = node.dataset.eventStatus;
    const displayState = Number(node.dataset.displayState);

    const filter = {
        status: EVENT_STATUS[eventStatus as keyof typeof EVENT_STATUS],
        display_state: displayState
    };

    const { loading, error, data } = useQuery(GET_CATALOG_EVENTS, {
        variables: { filter },
        skip: !eventStatus
    });

    const events = data?.catalogEvents?.items ?? [];

    const content = useMemo(() => {
        if (!eventStatus) {
            return <BlockEventWithHtml node={node} />;
        }

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
                            return (
                                <SwiperSlide
                                    key={event.id}
                                    virtualIndex={event.id}
                                >
                                    <div
                                        className={clsx(
                                            styles.event,
                                            'cms-track-impression'
                                        )}
                                        data-promotion-name={event.heading}
                                    >
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
                                            eventDate={event.date_end}
                                        />
                                        <Link
                                            className={styles.shopNowButton}
                                            href={new URL(event.link).pathname}
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
                        return (
                            <div
                                key={event.id}
                                className={clsx(
                                    styles.event,
                                    'cms-track-impression'
                                )}
                                data-promotion-name={event.heading}
                            >
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
                                <CountdownTimer eventDate={event.date_end} />
                                <Link
                                    className={styles.shopNowButton}
                                    href={new URL(event.link).pathname}
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
    }, [events, eventStatus, node]);

    if (loading || error || data?.catalogEvents?.items.length === 0) {
        return null;
    }

    return content;
});

BlockEvent.displayName = 'BlockEvent';

export default BlockEvent;

const GET_CATALOG_EVENTS = gql`
    query getCatalogEvents($filter: CatalogEventFilterInput!) {
        catalogEvents(filter: $filter) {
            items {
                id
                category_uid
                date_start
                date_end
                heading: title
                description
                link: category_url
            }
        }
    }
`;

