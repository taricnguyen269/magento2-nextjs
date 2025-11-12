"use client";

import React, { useState, useEffect } from 'react';
import { useFormatDate } from '@/hooks';
import { diffTime } from '@/utils/date-time';
import clsx from '@/utils/clsx';
import styles from './countdownTimer.module.css';

interface CountdownTimerProps {
    eventName?: string;
    eventDate?: string;
    className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
    eventName = 'Sale Ends In',
    eventDate = '2033-01-28T10:00',
    className
}) => {
    const { formatDate } = useFormatDate();

    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        getTimeDifference(eventDate);
        const interval = setInterval(() => getTimeDifference(eventDate), 1000);
        return () => clearInterval(interval);
    }, [eventDate, formatDate]);

    const leadingZero = (num: number) => `${num < 0 ? 0 : num}`.padStart(2, '0');

    const getTimeDifference = (eventDate: string) => {
        const currentDate = formatDate(
            new Date().toISOString(),
            'YYYY-MM-DD HH:mm:ss'
        );
        const eventDateFormatted = formatDate(eventDate, 'YYYY-MM-DD HH:mm:ss');
        const { days, hours, minutes, seconds } = diffTime(
            eventDateFormatted,
            currentDate
        );
        setDays(days);
        setHours(hours);
        setMinutes(minutes);
        setSeconds(seconds);
    };

    return (
        <div className={clsx(styles.root, className)}>
            <div className={styles.eventName}>{eventName}</div>
            <div className={styles.clockContainer}>
                <div className={styles.clock}>
                    <span className={styles.value}>{leadingZero(days)}</span>
                    <span className={styles.label}>
                        {days === 1 ? 'day' : 'days'}
                    </span>
                </div>
                <div className={styles.clock}>
                    <span className={styles.value}>{leadingZero(hours)}</span>
                    <span className={styles.label}>
                        {hours === 1 ? 'hour' : 'hours'}
                    </span>
                </div>
                <div className={styles.clock}>
                    <span className={styles.value}>
                        {leadingZero(minutes)}
                    </span>
                    <span className={styles.label}>
                        {minutes === 1 ? 'minute' : 'minutes'}
                    </span>
                </div>
                <div className={styles.clock}>
                    <span className={styles.value}>
                        {leadingZero(seconds)}
                    </span>
                    <span className={styles.label}>
                        {seconds === 1 ? 'second' : 'seconds'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;

