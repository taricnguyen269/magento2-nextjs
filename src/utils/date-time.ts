/**
 * Utility functions for date and time calculations
 */

export const diffTime = (inputDate: string, currentDate: string) => {
    const time = Date.parse(inputDate) - Date.parse(currentDate);
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((time / 1000 / 60) % 60);
    const seconds = Math.floor((time / 1000) % 60);

    return {
        time,
        days,
        hours,
        minutes,
        seconds
    };
};

