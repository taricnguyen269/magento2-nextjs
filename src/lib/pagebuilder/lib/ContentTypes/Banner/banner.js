import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo
} from 'react';
import defaultClasses from './banner.module.css';
import { useStyle } from '../../../adapters/classify';
import { arrayOf, bool, oneOf, shape, string, func, object } from 'prop-types';
import Button from '../../../adapters/Button';
import resolveLinkProps from '../../../adapters/resolveLinkProps';
import { Link, useHistory } from '../../../adapters/react-router-dom';
import resourceUrl from '../../../adapters/makeUrl';
import { useIntersectionObserver, useMediaQuery } from '../../../adapters/peregrine-hooks';
import handleHtmlContentClick from '../../../adapters/handleHtmlContentClick';
import { useBreakPoint } from '@/hooks';

const { matchMedia } = globalThis;
const toHTML = str => ({ __html: str });
const handleDragStart = event => event.preventDefault();

const LinkComponent = props => {
    const { link, classes, openInNewTab, linkTitle, children } = props;
    const linkProps = resolveLinkProps(link);
    const Component = linkProps.to ? Link : 'a';
    
    // Next.js Link uses 'href' instead of 'to'
    const nextLinkProps = linkProps.to 
        ? { href: linkProps.to }
        : linkProps;
    
    return (
        <Component
            className={classes.link}
            {...nextLinkProps}
            {...(openInNewTab ? { target: '_blank' } : '')}
            title={linkTitle}
            onDragStart={handleDragStart}
        >
            {children}
        </Component>
    );
};

/**
 * Page Builder Banner component.
 *
 * This component is part of the Page Builder / PWA integration. It can be consumed without Page Builder.
 *
 * @typedef Banner
 * @kind functional component
 *
 * @param {props} props React component props
 *
 * @returns {React.Element} A React component that displays a Banner.
 */
const Banner = props => {
    const history = useHistory();
    const backgroundElement = useRef(null);
    const viewportElement = useRef(null);
    const timer = useRef(null);
    const jarallaxVideoRef = useRef({
        imgInstance: null,
        videoInstance: null
    });
    const lcpImageRef = useRef(null);
    const classes = useStyle(defaultClasses, props.classes);
    const [hovered, setHovered] = useState(false);
    const [bgImageStyle, setBgImageStyle] = useState(null);
    const toggleHover = () => setHovered(!hovered);
    const intersectionObserver = useIntersectionObserver();
    const { isMobile } = useBreakPoint();

    const {
        isLCP,
        appearance = 'poster',
        backgroundColor,
        desktopImage,
        mobileImage,
        backgroundSize,
        backgroundPosition,
        backgroundAttachment,
        backgroundRepeat = 'repeat',
        textAlign,
        border,
        borderColor,
        borderWidth,
        borderRadius,
        content,
        showButton,
        buttonType,
        buttonText,
        link,
        linkTitle,
        openInNewTab = false,
        showOverlay,
        overlayColor,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        mediaQueries,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        cssClasses = [],
        backgroundType,
        videoSrc,
        videoFallbackSrc,
        videoMobileSrc,
        videoMobileFallbackSrc,
        videoLoop,
        videoPlayOnlyVisible,
        videoLazyLoading,
        videoOverlayColor,
        getParallax,
        imgAlt
    } = props;

    const { styles: mediaQueryStyles } = useMediaQuery({ mediaQueries });
    const isVideo = backgroundType === 'video';
    const _videoFallbackSrc = isMobile
        ? videoMobileFallbackSrc || videoFallbackSrc
        : videoFallbackSrc || videoMobileFallbackSrc;

    let image = desktopImage;
    if (isVideo) {
        image = _videoFallbackSrc;
    } else if (
        mobileImage &&
        matchMedia &&
        matchMedia('(max-width: 768px)').matches
    ) {
        image = mobileImage;
    }

    const rootStyles = {
        marginTop,
        marginRight,
        marginBottom,
        marginLeft
    };

    let wrapperStyles = {
        backgroundColor,
        border,
        borderColor,
        borderWidth,
        borderRadius,
        textAlign
    };

    const linkProps = {
        link,
        linkTitle,
        classes,
        openInNewTab
    };

    let overlayStyles = {
        backgroundColor: showOverlay !== 'never' ? overlayColor : null
    };
    const contentStyles = {};

    const videoOverlayStyles = {
        backgroundColor: videoOverlayColor
    };

    // Initiate jarallax for background video
    useEffect(() => {
        let parallaxElement;
        let jarallax;

        try {
            if (isVideo) {
                let jarallaxVideo;
                const config = {
                    videoLoop,
                    videoPlayOnlyVisible,
                    videoLazyLoading,
                    speed: 1,
                    disableVideo: false,
                    disableParallax: true,
                    keepImg: true,
                    elementInViewport: viewportElement.current,
                    imgSrc:
                        !isLCP && _videoFallbackSrc
                            ? resourceUrl(_videoFallbackSrc, {
                                  type: 'image-wysiwyg',
                                  quality: 85
                              })
                            : null,
                    videoSrc: isMobile ? videoMobileSrc : videoSrc
                };
                parallaxElement = backgroundElement.current;
                ({ jarallax, jarallaxVideo } = require('jarallax'));
                jarallaxVideo();
                jarallax(parallaxElement, config);
                if (parallaxElement.jarallax.video) {
                    parallaxElement.jarallax.video.on('started', () => {
                        // show video
                        const self = parallaxElement.jarallax;
                        if (self.$video) {
                            const imgInstance = self.image.$default_item;

                            jarallaxVideoRef.current = {
                                imgInstance,
                                videoInstance: self.video
                            };
                            self.$video.style.visibility = 'visible';
                            if (lcpImageRef.current) {
                                lcpImageRef.current.style.visibility = 'hidden';
                            }

                            if (isMobile) {
                                // Keep image until video is played for 3.5 seconds. This is to avoid backdrop shadow of youtube in mobile browser.
                                imgInstance.style.display = 'block';
                                if (lcpImageRef.current) {
                                    lcpImageRef.current.style.visibility =
                                        'visible';
                                }
                                timer.current = setTimeout(() => {
                                    self.video.player.seekTo(0);
                                    setTimeout(() => {
                                        imgInstance.style.display = 'none';
                                        if (lcpImageRef.current) {
                                            lcpImageRef.current.style.visibility =
                                                'hidden';
                                        }
                                    }, 250);
                                }, 3500);
                            }
                        }
                    });
                }
                getParallax?.(parallaxElement, config);
            }
        } catch (error) {
            console.error(error);
        }

        return () => {
            if (parallaxElement) {
                jarallax(parallaxElement, 'destroy');
            }
        };
        /* eslint-disable react-hooks/exhaustive-deps */
    }, [
        isMobile,
        isVideo,
        videoFallbackSrc,
        videoLazyLoading,
        videoLoop,
        videoMobileFallbackSrc,
        videoMobileSrc,
        videoPlayOnlyVisible,
        videoSrc,
        isLCP,
        _videoFallbackSrc
    ]);

    useEffect(() => {
        if (isVideo) {
            const handleVisibilityChange = () => {
                if (jarallaxVideoRef.current) {
                    const { imgInstance } = jarallaxVideoRef.current;
                    if (document.visibilityState === 'visible') {
                        jarallaxVideoRef.current.videoInstance?.play();
                        setTimeout(() => {
                            if (imgInstance) {
                                imgInstance.style.display = 'none';
                                if (lcpImageRef.current) {
                                    lcpImageRef.current.style.visibility = 'hidden';
                                }
                            }
                        }, 350);
                    } else {
                        if (imgInstance) {
                            imgInstance.style.display = 'block';
                            if (lcpImageRef.current) {
                                lcpImageRef.current.style.visibility = 'visible';
                            }
                        }
                    }
                }
            };

            document.addEventListener(
                'visibilitychange',
                handleVisibilityChange
            );

            return () => {
                clearTimeout(timer.current);
                if (jarallaxVideoRef.current?.videoInstance) {
                    jarallaxVideoRef.current.videoInstance?.off();
                    jarallaxVideoRef.current = null;
                }

                if (isMobile) {
                    document.removeEventListener(
                        'visibilitychange',
                        handleVisibilityChange
                    );
                }
            };
        }
    }, [isMobile, isVideo]); // Empty dependency array ensures this runs only once when the component mounts

    if (image && bgImageStyle) {
        wrapperStyles = {
            ...wrapperStyles,
            backgroundImage: `url(${bgImageStyle})`,
            backgroundSize,
            backgroundPosition,
            backgroundAttachment,
            backgroundRepeat
        };
    }

    if (appearance === 'poster') {
        overlayStyles = {
            ...overlayStyles,
            paddingTop,
            paddingRight,
            paddingBottom,
            paddingLeft
        };
        contentStyles.width = '100%';
    } else {
        wrapperStyles = {
            ...wrapperStyles,
            paddingTop,
            paddingRight,
            paddingBottom,
            paddingLeft
        };
    }

    const setBgImage = useCallback(() => {
        if (!isLCP) {
            const resourceImage = resourceUrl(image, {
                type: 'image-wysiwyg',
                quality: 85
            });

            const backgroundImage = document.createElement('img');
            backgroundImage.src = resourceImage;
            setBgImageStyle(resourceImage);
        }
    }, [image, isLCP]);

    let imgLCP = null;
    if (isLCP && image) {
        const resourceImage = resourceUrl(image, {
            type: 'image-wysiwyg',
            quality: 85
        });

        imgLCP = (
            <img
                src={resourceImage}
                alt={imgAlt}
                title={linkTitle}
                className={classes.lcpImage}
                loading="eager"
                ref={lcpImageRef}
                width={'100%'}
                height={'100%'}
            />
        );
    }

    // Load image only if in viewport
    useEffect(() => {
        if (!image || !backgroundElement.current) {
            return;
        }

        // Fallback if IntersectionObserver is not supported
        if (typeof intersectionObserver === 'undefined') {
            setBgImage();
            return;
        }

        const htmlElement = backgroundElement.current;

        const onIntersection = entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                observer.unobserve(htmlElement);

                setBgImage();
            }
        };
        const observer = new intersectionObserver(onIntersection);
        observer.observe(htmlElement);

        return () => {
            if (htmlElement) {
                observer.unobserve(htmlElement);
            }
        };
    }, [backgroundElement, image, intersectionObserver, setBgImage]);

    const appearanceOverlayClasses = {
        poster: classes.posterOverlay,
        'collage-left': classes.collageLeftOverlay,
        'collage-centered': classes.collageCenteredOverlay,
        'collage-right': classes.collageRightOverlay
    };
    const appearanceOverlayHoverClasses = {
        poster: classes.posterOverlayHover,
        'collage-left': classes.collageLeftOverlayHover,
        'collage-centered': classes.collageCenteredOverlayHover,
        'collage-right': classes.collageRightOverlayHover
    };

    const BannerButton = useMemo(() => {
        const typeToPriorityMapping = {
            primary: 'high',
            secondary: 'normal',
            link: 'low'
        };

        if (showButton !== 'never') {
            const buttonClass =
                showButton === 'hover' ? classes.buttonHover : classes.button;

            return (
                <div className={buttonClass}>
                    <Button
                        priority={typeToPriorityMapping[buttonType]}
                        type="button"
                    >
                        {buttonText}
                    </Button>
                </div>
            );
        }
        return null;
    }, [
        buttonText,
        buttonType,
        classes.button,
        classes.buttonHover,
        showButton
    ]);

    const videoOverlay = videoOverlayColor ? (
        <div className={classes.videoOverlay} style={videoOverlayStyles} />
    ) : null;

    const videoViewportElement = isVideo ? (
        <div ref={viewportElement} className={classes.viewportElement} />
    ) : null;

    const overlayClass =
        showOverlay === 'hover' && !hovered
            ? appearanceOverlayHoverClasses[appearance]
            : appearanceOverlayClasses[appearance];

    const clickHandler = event => {
        handleHtmlContentClick(history, event);
    };

    let BannerFragment = (
        <div
            className={classes.wrapper}
            style={{
                ...wrapperStyles,
                ...(!isLCP && appearance !== 'poster' && mediaQueryStyles)
            }}
            ref={backgroundElement}
        >
            {videoOverlay}
            <div
                className={overlayClass}
                style={{
                    ...overlayStyles,
                    ...(appearance === 'poster' && mediaQueryStyles)
                }}
            >
                <div
                    className={classes.content}
                    style={contentStyles}
                    dangerouslySetInnerHTML={toHTML(content)}
                    onClick={clickHandler}
                    onKeyDown={clickHandler}
                    role="presentation"
                />
                {BannerButton}
            </div>
            {videoViewportElement}
            {imgLCP}
        </div>
    );

    if (typeof link === 'string') {
        BannerFragment = (
            <LinkComponent {...linkProps}>{BannerFragment}</LinkComponent>
        );
    }

    return (
        <div
            aria-live="polite"
            aria-busy="false"
            className={[classes.root, ...cssClasses].join(' ')}
            data-cy="PageBuilder-Banner-root"
            style={rootStyles}
            onMouseEnter={toggleHover}
            onMouseLeave={toggleHover}
        >
            {BannerFragment}
        </div>
    );
};

/**
 * Props for {@link Banner}
 *
 * @typedef props
 *
 * @property {Object} classes An object containing the class names for the banner
 * @property {String} classes.root CSS class for the banner root element
 * @property {String} classes.link CSS class for the banner link element
 * @property {String} classes.wrapper CSS class for the banner wrapper element
 * @property {String} classes.overlay CSS class for the banner overlay element
 * @property {String} classes.content CSS class for the banner content element
 * @property {String} classes.button CSS class for the banner button wrapping element
 * @property {String} classes.buttonHover CSS class for the banner button wrapping element for hover
 * @property {String} classes.posterOverlay CSS class for the banner poster appearance overlay
 * @property {String} classes.collageLeftOverlay CSS class for the banner collage left appearance overlay
 * @property {String} classes.collageCenteredOverlay CSS class for the banner collage centered appearance overlay
 * @property {String} classes.collageRightOverlay CSS class for the banner collage right appearance overlay
 * @property {String} classes.posterOverlayHover CSS class for the banner poster appearance overlay hover
 * @property {String} classes.collageLeftOverlayHover CSS class for the banner collage left appearance overlay hover
 * @property {String} classes.collageCenteredOverlayHover CSS class for the banner collage centered appearance overlay hover
 * @property {String} classes.collageRightOverlayHover CSS class for the banner collage right appearance overlay hover
 * @property {String} classes.poster CSS class for the banner poster appearance
 * @property {String} classes.videoOverlay CSS class for the video overlay
 * @property {String} classes.viewportElement CSS class for viewport element
 * @property {String} minHeight CSS minimum height property
 * @property {String} backgroundColor CSS background-color property
 * @property {String} desktopImage Background image URL to be displayed on desktop devices
 * @property {String} mobileImage Background image URL to be displayed on mobile devices
 * @property {String} backgroundSize CSS background-size property
 * @property {String} backgroundPosition CSS background-position property
 * @property {String} backgroundAttachment CSS background-attachment property
 * @property {String} backgroundRepeat CSS background-repeat property
 * @property {String} content The HTML content to be rendered inside the banner content area
 * @property {String} link The link location for the banner
 * @property {String} linkType The type of link included with the banner. Values: default, product, category, page
 * @property {String} showButton Whether or not to show the button. Values: always, hover, never
 * @property {String} buttonText Text to display within the button
 * @property {String} buttonType The type of button to display. Values: primary, secondary, link
 * @property {String} showOverlay Whether or not to show the overlay. Values: always, hover, never
 * @property {String} overlayColor The color of the overlay
 * @property {String} textAlign Alignment of the banner within the parent container
 * @property {String} border CSS border property
 * @property {String} borderColor CSS border color property
 * @property {String} borderWidth CSS border width property
 * @property {String} borderRadius CSS border radius property
 * @property {String} marginTop CSS margin top property
 * @property {String} marginRight CSS margin right property
 * @property {String} marginBottom CSS margin bottom property
 * @property {String} marginLeft CSS margin left property
 * @property {Array} mediaQueries List of media query rules to be applied to the component
 * @property {String} paddingTop CSS padding top property
 * @property {String} paddingRight CSS padding right property
 * @property {String} paddingBottom CSS padding bottom property
 * @property {String} paddingLeft CSS padding left property
 * @property {Array} cssClasses List of CSS classes to be applied to the component
 * @property {String} backgroundType Background type
 * @property {String} videoSrc URL to the video
 * @property {String} videoFallbackSrc URL to the image which will be displayed before video
 * @property {Boolean} videoLoop Play video in loop
 * @property {Boolean} videoPlayOnlyVisible Play video when it is visible
 * @property {Boolean} videoLazyLoading Load video when it is visible
 * @property {String} videoOverlayColor Color for video overlay
 * @property {Function} getParallax Return parallax element and options
 */
Banner.propTypes = {
    classes: shape({
        root: string,
        link: string,
        wrapper: string,
        overlay: string,
        content: string,
        button: string,
        buttonHover: string,
        posterOverlay: string,
        posterOverlayHover: string,
        collageLeftOverlay: string,
        collageLeftOverlayHover: string,
        collageCenteredOverlay: string,
        collageCenteredOverlayHover: string,
        collageRightOverlay: string,
        collageRightOverlayHover: string,
        videoOverlay: string,
        viewportElement: string
    }),
    appearance: oneOf([
        'poster',
        'collage-left',
        'collage-centered',
        'collage-right'
    ]),
    minHeight: string,
    backgroundColor: string,
    desktopImage: string,
    mobileImage: string,
    backgroundSize: string,
    backgroundPosition: string,
    backgroundAttachment: string,
    backgroundRepeat: string,
    content: string,
    link: string,
    linkType: oneOf(['default', 'product', 'category', 'page']),
    openInNewTab: bool,
    showButton: oneOf(['always', 'hover', 'never']),
    buttonText: string,
    buttonType: oneOf(['primary', 'secondary', 'link']),
    showOverlay: oneOf(['always', 'hover', 'never']),
    overlayColor: string,
    textAlign: string,
    border: string,
    borderColor: string,
    borderWidth: string,
    borderRadius: string,
    marginTop: string,
    marginRight: string,
    marginBottom: string,
    marginLeft: string,
    mediaQueries: arrayOf(
        shape({
            media: string,
            style: object
        })
    ),
    paddingTop: string,
    paddingRight: string,
    paddingBottom: string,
    cssClasses: arrayOf(string),
    backgroundType: string,
    videoSrc: string,
    videoFallbackSrc: string,
    videoMobileSrc: string,
    videoMobileFallbackSrc: string,
    videoLoop: bool,
    videoPlayOnlyVisible: bool,
    videoLazyLoading: bool,
    videoOverlayColor: string,
    getParallax: func,
    isLCP: bool,
    linkTitle: string,
    imgAlt: string
};

export default Banner;
