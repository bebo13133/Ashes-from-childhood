/* eslint-disable no-unused-vars */
import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import './BookPresentation3D.css';
import { useAuthContext } from '../../contexts/userContext';

// 3D Book компонент
function Book3D({ bookImages, ...props }) {
    const groupRef = useRef();
    const [hovered, setHovered] = useState(false);

    // Анимация на въртене
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;

            if (hovered) {
                groupRef.current.rotation.y += 0.01;
            }
        }
    });

    // Зареждане на текстурите
    const frontTexture = useLoader(THREE.TextureLoader, '/images/book/cover-front.jpg');
    const backTexture = useLoader(THREE.TextureLoader, '/images/book/cover-back.jpg');
    const pageTexture = useLoader(THREE.TextureLoader, '/images/book/Paper-Texture.jpg');
    return (
        <group
            ref={groupRef}
            {...props}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            {/* Основна книга */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.8, 4, 0.4]} />
                <meshStandardMaterial
                    map={frontTexture}
                    roughness={0.1}
                    metalness={0.1}
                    emissive={new THREE.Color(0x333333)}
                    emissiveIntensity={0.2}
                    side={THREE.FrontSide}
                />
            </mesh>
            {/* Предна корица */}
            <mesh position={[0, 0, 0.201]} castShadow>
                <planeGeometry args={[2.8, 4]} />
                <meshStandardMaterial
                    map={frontTexture}
                    roughness={0.2}
                    metalness={0.05}
                    emissive={new THREE.Color(0x444444)}
                    emissiveIntensity={0.3}
                    transparent={true}
                    opacity={0.95}
                />
            </mesh>

            {/* Задна корица */}
            <mesh position={[0, 0, -0.201]} rotation={[0, Math.PI, 0]} castShadow>
                <planeGeometry args={[2.8, 4]} />
                <meshStandardMaterial
                    map={backTexture}
                    roughness={0.2}
                    metalness={0.05}
                    emissive={new THREE.Color(0x444444)}
                    emissiveIntensity={0.3}
                />
            </mesh>

            {/* Гръб на книгата */}
            <mesh position={[1.41, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[0.4, 4]} />
                <meshStandardMaterial
                    color="#f5f5f0"
                    map={pageTexture}
                    roughness={0.9}
                    metalness={0.0}
                    emissive={new THREE.Color(0x222222)}
                    emissiveIntensity={0.05}
                />
            </mesh>
            <mesh position={[0, 2.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2.8, 0.4]} />
                <meshStandardMaterial
                    color="#f5f5f0"
                    roughness={0.9}
                    metalness={0.0}
                />
            </mesh>

            {/* Ляв страничен край */}
            <mesh position={[-1.41, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[0.4, 4]} />
                <meshStandardMaterial
                    color="#1a1a2e"
                    // map={pageTexture}
                    roughness={0.9}
                    metalness={0.0}
                    emissive={new THREE.Color(0x444444)}
                    emissiveIntensity={0.05}
                />
            </mesh>
            {/* Текст на лявата страна */}
            <Text
                position={[-1.411, 0, 0]}
                rotation={[0, -Math.PI / 2, Math.PI / 2]}
                fontSize={0.25}
                color="#d6d6d6ff"
                anchorX="center"
                anchorY="middle"
                font="/fonts/d_CCEnemyLines_Infiltrated.woff"
            >
                ПЕПЕЛ от ДЕТСТВОТО - СИБЕЛ ИБРЯМОВА
            </Text>

            {/* Горен капак (страници) */}
            <mesh position={[0, 2.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2.8, 0.4]} />
                <meshStandardMaterial
                    color="#f5f5f0"
                    roughness={0.9}
                    metalness={0.0}
                    // emissive={new THREE.Color(0x222222)}
                    emissiveIntensity={0.05}
                />
            </mesh>

            {/* Долен капак (страници) */}
            <mesh position={[0, -2.017, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2.8, 0.4]} />
                <meshStandardMaterial
                    color="#f5f5f0"
                    roughness={0.9}
                    metalness={0.0}
                />
            </mesh>

            {/* Блясък ефект */}
            {hovered && (
                <mesh position={[0, 0, 0.22]}>
                    <planeGeometry args={[2.8, 4]} />
                    <meshBasicMaterial
                        color="#ffffff"
                        transparent={true}
                        opacity={0.15}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            )}
        </group>
    );
}

// Частички около книгата
function Particles() {
    const points = useRef();
    const particleCount = 100;

    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

        const golden = new THREE.Color('#d4af37');
        colors[i * 3] = golden.r;
        colors[i * 3 + 1] = golden.g;
        colors[i * 3 + 2] = golden.b;
    }

    useFrame((state) => {
        if (points.current) {
            points.current.rotation.y = state.clock.elapsedTime * 0.05;
            points.current.rotation.x = state.clock.elapsedTime * 0.02;
        }
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={particleCount}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                vertexColors={true}
                transparent={true}
                opacity={0.6}
                sizeAttenuation={true}
            />
        </points>
    );
}

// Светлинни ефекти
function LightingSetup() {
    return (
        <>
            <ambientLight intensity={0.8} color="#6a7280" />
            <directionalLight
                position={[5, 8, 3]}
                intensity={1.8}
                color="#ffffff"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />
            <spotLight
                position={[-3, 4, 2]}
                intensity={1.2}
                color="#d4af37"
                angle={0.6}
                penumbra={0.5}
                castShadow
            />
            <pointLight
                position={[0, -2, 4]}
                intensity={0.8}
                color="#8b9dc3"
            />
            <pointLight
                position={[0, 0, 6]}
                intensity={0.6}
                color="#ffffff"
            />
        </>
    );
}

// 3D Сцена
function BookScene() {
    return (
        <div className="book-presentation-3d-scene">
            <Canvas
                shadows
                camera={{ position: [0, 0, 8], fov: 50 }}
                style={{ background: 'transparent' }}
            >
                <Suspense fallback={null}>
                    <LightingSetup />
                    <Float
                        speed={1.5}
                        rotationIntensity={0.2}
                        floatIntensity={0.5}
                    >
                        <Book3D position={[0, 0, 0]} />
                    </Float>
                    <Particles />
                    <ContactShadows
                        position={[0, -3, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={2.5}
                        far={4}
                    />
                    <Environment preset="sunset" />
                    <OrbitControls
                        enablePan={false}
                        enableZoom={false}
                        minPolarAngle={Math.PI / 3}
                        maxPolarAngle={Math.PI / 1.5}
                        autoRotate
                        autoRotateSpeed={0.5}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}

// Book Rating компонент с динамичен рейтинг
function BookRating({ rating = 4.8, viewers, isLoading = false, totalReviews = 0 }) {
    const renderStars = () => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i} className="book-presentation-3d-star book-presentation-3d-full">★</span>);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<span key={i} className="book-presentation-3d-star book-presentation-3d-half">★</span>);
            } else {
                stars.push(<span key={i} className="book-presentation-3d-star book-presentation-3d-empty">☆</span>);
            }
        }
        return stars;
    };

    return (
        <div className="book-presentation-3d-rating-container">
            <div className="book-presentation-3d-rating-section">
                <div className="book-presentation-3d-stars-container">
                    {isLoading ? (
                        <div className="book-presentation-3d-loading-stars">
                            {/* Можете да добавите loading анимация тук */}
                            <span style={{ color: '#999', fontSize: '14px' }}>Зареждане...</span>
                        </div>
                    ) : (
                        renderStars()
                    )}
                </div>
                <span className="book-presentation-3d-rating-number">
                    {isLoading ? '...' : `${rating}/5`}
                </span>
            </div>
            {/* {totalReviews > 0 && !isLoading && (
                <div className="book-presentation-3d-reviews-count" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Базирано на {totalReviews} {totalReviews === 1 ? 'отзив' : 'отзива'}
                </div>
            )} */}
            <div className="book-presentation-3d-viewers-section">
                <div className="book-presentation-3d-live-indicator"></div>
                <span className="book-presentation-3d-viewers-count">{viewers} души наблюдават</span>
            </div>
        </div>
    );
}

// ImageView компонент
function ImageView({ imageSrc, imageAlt, onClose }) {
    return (
        <div className="book-presentation-3d-image-view-container">
            <div className="book-presentation-3d-large-image-wrapper">
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="book-presentation-3d-large-display-image"
                />
                <button className="book-presentation-3d-back-to-3d-btn" onClick={onClose}>
                </button>
            </div>
        </div>
    );
}

// Thumbnail Gallery компонент с минималистичен дизайн
function ThumbnailGallery({ currentView, onImageClick, onModelClick }) {
    const bookImages = [
        {
            src: '/images/book/cover-front.jpg',
            alt: 'Предна корица',
            title: 'Корица'
        },
        {
            src: '/images/book/cover-back.jpg',
            alt: 'Задна корица',
            title: 'Задна част'
        },
        {
            src: '/images/book/two-books3.png',
            alt: '3D изглед',
            title: '3D изглед'
        },
        {
            src: '/images/book/book-mockup.jpg',
            alt: 'Mockup',
            title: 'В реална среда'
        }
    ];

    const scrollToOrder = () => {
        const orderSection = document.getElementById('order-section');
        if (orderSection) {
            orderSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <div className="book-presentation-3d-thumbnail-gallery">
            {/* Минималистичен urgent message */}
            <div className="book-presentation-3d-urgent-label">
                <span>📖 Важно! Бройките са строго ограничени. Не отлагай. Тази история не чака.</span>
            </div>

            <h4 className="book-presentation-3d-gallery-title">Разгледайте книгата:</h4>
            <div className="book-presentation-3d-thumbnails-container">
                <div
                    className={`book-presentation-3d-thumbnail book-presentation-3d-model-thumb ${currentView === '3d' ? 'book-presentation-3d-active' : ''}`}
                    onClick={onModelClick}
                >
                    <div className="book-presentation-3d-model-thumb-content">
                        <span className="book-presentation-3d-model-thumb-icon">📱</span>
                        <div className="book-presentation-3d-model-thumb-text">3D</div>
                    </div>
                </div>

                {bookImages.map((image, index) => (
                    <div
                        key={index}
                        className={`book-presentation-3d-thumbnail ${currentView === image.src ? 'book-presentation-3d-active' : ''}`}
                        onClick={() => onImageClick(image.src, image.alt)}
                    >
                        <img src={image.src} alt={image.alt} />
                        <div className="book-presentation-3d-thumbnail-title">{image.title}</div>
                    </div>
                ))}
            </div>

            {/* Простия order бутон */}
            <button className="book-presentation-3d-order-btn-gallery" onClick={scrollToOrder}>
                Вземи я сега
            </button>
        </div>
    );
}

// Главен компонент
const BookPresentation3D = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentView, setCurrentView] = useState('3d');
    const [currentImageSrc, setCurrentImageSrc] = useState('');
    const [currentImageAlt, setCurrentImageAlt] = useState('');
    const [liveViewers, setLiveViewers] = useState(Math.floor(Math.random() * 40) + 25);
    
    // Нови state-ове за динамичен рейтинг
    const [bookRating, setBookRating] = useState(4.8);
    const [ratingLoading, setRatingLoading] = useState(true);
    const [totalReviews, setTotalReviews] = useState(0);

    const { fetchPublicReviews } = useAuthContext();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        const element = document.querySelector('.book-presentation-3d-main');
        if (element) observer.observe(element);
        return () => observer.disconnect();
    }, []);

    // Зареждане на рейтинга от API
    useEffect(() => {
        const loadBookRating = async () => {
            setRatingLoading(true);
            try {
                const response = await fetchPublicReviews({ limit: 1000 });
                
                if (response && response.reviews && response.reviews.length > 0) {
                    const reviews = response.reviews;
                    
                    // Изчисляваме средния рейтинг
                    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                    const averageRating = totalRating / reviews.length;
                    
                    setBookRating(Number(averageRating.toFixed(1)));
                    setTotalReviews(reviews.length);
                } else {
                    // Fallback към default стойностите
                    setBookRating(4.8);
                    setTotalReviews(0);
                }
            } catch (error) {
                console.error('Error loading book rating:', error);
                // При грешка използваме fallback стойности
                setBookRating(4.8);
                setTotalReviews(0);
            } finally {
                setRatingLoading(false);
            }
        };

        loadBookRating();
    }, [fetchPublicReviews]);

    // Live viewers animation
    useEffect(() => {
        const interval = setInterval(() => {
            const change = Math.random() > 0.5 ? 1 : -1;
            setLiveViewers(prev => {
                const newCount = prev + change;
                return Math.max(15, Math.min(65, newCount));
            });
        }, 3000 + Math.random() * 2000);

        return () => clearInterval(interval);
    }, []);

    const handleImageClick = (imageSrc, imageAlt) => {
        setCurrentImageSrc(imageSrc);
        setCurrentImageAlt(imageAlt);
        setCurrentView(imageSrc);
    };

    const handleModelClick = () => {
        setCurrentView('3d');
    };

    return (
        <section id='book-presentation' className="book-presentation-3d-main">
            <div className="book-presentation-3d-fallback-background"></div>

            <div className="book-presentation-3d-presentation-background">
                <div className="book-presentation-3d-cosmic-particles">
                    {[...Array(50)].map((_, i) => (
                        <div key={i} className={`book-presentation-3d-cosmic-particle book-presentation-3d-cosmic-${i % 5}`}></div>
                    ))}
                </div>
            </div>

            <div className="book-presentation-3d-container">
                <div className={`book-presentation-3d-presentation-content ${isVisible ? 'book-presentation-3d-fade-in-up' : ''}`}>

                    <div className="book-presentation-3d-section-header">
                        <h2 className="book-presentation-3d-section-title">
                            Чуйте мислите на детето
                        </h2>
                        <p className="book-presentation-3d-section-subtitle">
                            "Пепел от детството" – една история, която може да промени начина, по който гледаш на родителството, на болката и на любовта.
                        </p>
                    </div>

                    <div className="book-presentation-3d-presentation-grid">
                        <div className="book-presentation-3d-book-showcase">
                            <BookRating 
                                rating={bookRating} 
                                viewers={liveViewers} 
                                isLoading={ratingLoading}
                                totalReviews={totalReviews}
                            />

                            {currentView === '3d' ? (
                                <>
                                    <BookScene />
                                    <div className="book-presentation-3d-interaction-hint">
                                        <span>Влачете за въртене • Автоматично въртене</span>
                                    </div>
                                </>
                            ) : (
                                <ImageView
                                    imageSrc={currentImageSrc}
                                    imageAlt={currentImageAlt}
                                    onClose={handleModelClick}
                                />
                            )}

                            <ThumbnailGallery
                                currentView={currentView}
                                onImageClick={handleImageClick}
                                onModelClick={handleModelClick}
                            />

                            {currentView !== '3d' && (
                                <div className="book-presentation-3d-mini-3d-model" onClick={handleModelClick}>
                                    <div className="book-presentation-3d-mini-3d-content">
                                        <BookScene />
                                        <div className="book-presentation-3d-mini-3d-overlay">
                                            <span>← Назад към 3D</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="book-presentation-3d-book-info">
                            <h3 className="book-presentation-3d-info-title">
                                Защо да изберете тази книга?
                            </h3>

                            <div className="book-presentation-3d-features-list">
                                <div className={`book-presentation-3d-feature-item ${isVisible ? 'book-presentation-3d-animate-in' : ''}`} style={{ animationDelay: '0.2s' }}>
                                    <div className="book-presentation-3d-feature-icon">💭</div>
                                    <div className="book-presentation-3d-feature-content">
                                        <h4>Откровена История</h4>
                                        <p>Написана е през очите на дете.
                                            Но говори на всички нас – възрастните.
                                            На онези, които понякога забравяме как думите, мълчанието и изборите ни оставят следи – не върху стените, а в сърцата.</p>
                                    </div>
                                </div>

                                <div className={`book-presentation-3d-feature-item ${isVisible ? 'book-presentation-3d-animate-in' : ''}`} style={{ animationDelay: '0.4s' }}>
                                    <div className="book-presentation-3d-feature-icon">❤️</div>
                                    <div className="book-presentation-3d-feature-content">
                                        <h4>Емоционално Пътешествие</h4>
                                        <p>Прочети я. </p>
                                        <p>Почувствай я.</p>
                                        <p>И най-важното – помни:  детето вижда. </p>
                                        <p>Детето усеща. </p>
                                        Детето никога не забравя.
                                    </div>
                                </div>

                                <div className={`book-presentation-3d-feature-item ${isVisible ? 'book-presentation-3d-animate-in' : ''}`} style={{ animationDelay: '0.8s' }}>
                                    <div className="book-presentation-3d-feature-icon">✨</div>
                                    <div className="book-presentation-3d-feature-content">
                                        <h4>Дълбок Смисъл</h4>
                                        <p>Тази книга не е дълга. Не е трудна. Не е от онези, които те товарят или изтощават.
                                            Но е от онези, които те хващат за гърлото… и не те пускат, докато не стигнеш края.
                                            Дори и да не обичаш да четеш – ще я прочетеш.
                                            С едно поемане на дъх.
                                            И ще се замислиш – какво виждат децата ни? Какво попиват от нас? Какви спомени им оставяме?</p>
                                    </div>
                                </div>
                            </div>

                            <div className="book-presentation-3d-cta-section">
                                <blockquote className="book-presentation-3d-book-quote">
                                    " Тишината в една стая може да е по-страшна от крясъците..."
                                </blockquote>
                                <p className="book-presentation-3d-quote-caption">
                                    История за развиване, приемане и надежда
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BookPresentation3D;