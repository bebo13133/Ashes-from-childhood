import { useState, useEffect } from 'react'

import './AshesLanding.css'
import BookPresentation from './BookPresentation/BookPresentation';
import HeroSection from './HeroSection/HeroSection';
import MysterySection from './MysterySection/MysterySection';
import OrderSection from './OrderSection/OrderSection';
import GallerySection from './GallerySection/GallerySection';
import SocialIcons from './SocialIcons/SocialIcons';
import BookPresentation3D from './BookPresentation3D/BookPresentation3D';
import AuthorSection from './AuthorSection/AuthorSection';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import ReviewsSection from './ReviewsSection/ReviewsSection';
import VideoTrailerSection from './VideoTrailerSection/VideoTrailerSection';

const AshesLanding = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        // Създаване на видео background
        const video = document.createElement('video');
        video.src = '/images/book/burning-paper-ai5.mp4';
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.className = 'global-video-background';
        video.playbackRate = 0.3;

        // Добавяне на видеото в body
        document.body.appendChild(video);

        // Cleanup при unmount
        return () => {
            if (document.body.contains(video)) {
                document.body.removeChild(video);
            }
        };
    }, []);

    return (
        <div className="ashes-landing">
            <div className="global-video-overlay"></div>

            {/* Hero Section - основен въздействащ текст */}
            <HeroSection />

            {/* Book Presentation - 3D модел и описание */}
            <BookPresentation3D />

            {/* Mystery Section - интерактивна мистериозна част */}
            <MysterySection />
            <VideoTrailerSection />
            <AuthorSection />
            {/* Gallery Section - slide с още снимки */}
            <GallerySection
                currentIndex={currentImageIndex}
                setCurrentIndex={setCurrentImageIndex}
            />

            {/* Order Section - форма за поръчка */}
            <OrderSection />
            <ReviewsSection />
            <SocialIcons />
            <ScrollToTop />
        </div>
    )
}

export default AshesLanding