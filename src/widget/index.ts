/**
 * Widget registry for PageBuilder widgets
 * Adapted from pwa-arielbath
 */

import { lazy } from 'react';

// Dynamic imports for widgets to reduce initial bundle size
const BlockEvent = lazy(() => import('./BlockEvent'));
const RecentlyViewed = lazy(() => import('./RecentlyViewed'));
const FeaturedProducts = lazy(() => import('./FeaturedProducts'));
const GoogleReviewsCarousel = lazy(() => import('./GoogleReviewsCarousel'));

const WidgetType = new Map()
    .set('block-event', BlockEvent)
    .set('admin__data-grid-outer-wrap', RecentlyViewed)
    .set('featured-products', FeaturedProducts)
    .set('google-carousel-widget-review_', GoogleReviewsCarousel);

export default WidgetType;

