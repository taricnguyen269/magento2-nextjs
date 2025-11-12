/**
 * Hook for formatting dates using moment
 * Adapted from pwa-arielbath
 */

import { useCallback } from 'react';
import { useStoreConfig } from './useStoreConfig';
import moment from 'moment';
import 'moment-timezone';

type SUPPORTED_DATE_TYPE =
    | 'MMM DD, YYYY'
    | 'MMM-DD-YYYY'
    | 'MMM Do, YYYY'
    | 'MMM Do, YYYY HH:mm:ss'
    | 'YYYY-MM-DD HH:mm:ss';

export const useFormatDate = (
    globalFormat: SUPPORTED_DATE_TYPE = 'MMM DD, YYYY'
) => {
    const { storeConfig } = useStoreConfig();
    const timeZone = storeConfig?.timezone;

    const formatDate = useCallback(
        (
            date: string | Date,
            format: SUPPORTED_DATE_TYPE = globalFormat,
            withTimeZone = true
        ) => {
            if (!date) {
                return 'Invalid Date';
            }

            if (withTimeZone && timeZone) {
                try {
                    // Check if timezone data is available
                    const zone = moment.tz.zone(timeZone);
                    if (zone) {
                        return moment.utc(date).tz(timeZone).format(format);
                    }
                    
                    // Try to find a valid timezone or fallback to UTC
                    // Some timezones might be stored with different names
                    const validZones = moment.tz.names();
                    const foundZone = validZones.find(z => 
                        z.toLowerCase() === timeZone.toLowerCase() ||
                        z.includes(timeZone.split('/').pop() || '')
                    );
                    
                    if (foundZone) {
                        return moment.utc(date).tz(foundZone).format(format);
                    }
                    
                    // Fallback to UTC if timezone data is not available
                    // Suppress the moment-timezone warning by using UTC directly
                    return moment.utc(date).format(format);
                } catch (error) {
                    // Fallback to UTC on error (suppress error logging to avoid console noise)
                    return moment.utc(date).format(format);
                }
            } else {
                return moment(date).format(format);
            }
        },
        [globalFormat, timeZone]
    );

    const formatDateDayMonth = useCallback(
        (date: string | Date, withTimeZone = true) => {
            if (!date) {
                return 'Invalid Date';
            }

            if (withTimeZone && timeZone) {
                try {
                    // Check if timezone data is available
                    const zone = moment.tz.zone(timeZone);
                    if (zone) {
                        return moment.utc(date).tz(timeZone).format('ddd, MMM  D');
                    }
                    
                    // Try to find a valid timezone or fallback to UTC
                    const validZones = moment.tz.names();
                    const foundZone = validZones.find(z => 
                        z.toLowerCase() === timeZone.toLowerCase() ||
                        z.includes(timeZone.split('/').pop() || '')
                    );
                    
                    if (foundZone) {
                        return moment.utc(date).tz(foundZone).format('ddd, MMM  D');
                    }
                    
                    // Fallback to UTC if timezone data is not available
                    // Suppress the moment-timezone warning by using UTC directly
                    return moment.utc(date).format('ddd, MMM  D');
                } catch (error) {
                    // Fallback to UTC on error (suppress error logging to avoid console noise)
                    return moment.utc(date).format('ddd, MMM  D');
                }
            } else {
                return moment.utc(date).format('ddd, MMM  D');
            }
        },
        [timeZone]
    );

    return { formatDate, formatDateDayMonth };
};

