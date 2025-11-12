import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import GalleryItem from '../../../../adapters/GalleryItem';
import { useCarousel } from './useCarousel';

const Carousel = props => {
    const { settings, items } = props;

    const { storeConfig } = useCarousel();

    // Convert react-slick settings to Swiper settings
    const modules = [Navigation, Pagination];
    if (settings?.autoplay) modules.push(Autoplay);

    // Handle responsive breakpoints from react-slick
    const breakpoints = {};
    if (settings?.responsive) {
        settings.responsive.forEach((bp) => {
            const breakpoint = bp.breakpoint || 0;
            const bpSettings = bp.settings || {};
            breakpoints[breakpoint] = {
                slidesPerView: bpSettings.slidesToShow || settings?.slidesToShow || 1,
                spaceBetween: 20,
                ...(bpSettings.centerMode && {
                    centeredSlides: true,
                    slidesPerView: 'auto',
                }),
            };
        });
    }

    const swiperSettings = {
        modules,
        slidesPerView: settings?.slidesToShow || 1,
        spaceBetween: 20,
        loop: settings?.infinite || false,
        autoplay: settings?.autoplay ? {
            delay: settings?.autoplaySpeed || 3000,
            disableOnInteraction: false,
        } : false,
        navigation: settings?.arrows !== false ? true : false,
        pagination: settings?.dots ? {
            clickable: true,
        } : false,
        ...(settings?.centerMode && {
            centeredSlides: true,
            slidesPerView: 'auto',
        }),
        ...(Object.keys(breakpoints).length > 0 && { breakpoints }),
    };

    const galleryItems = items.map((item, index) => {
        return (
            <SwiperSlide key={index}>
                <GalleryItem item={item} storeConfig={storeConfig} />
            </SwiperSlide>
        );
    });

    return <Swiper {...swiperSettings}>{galleryItems}</Swiper>;
};

export default Carousel;
