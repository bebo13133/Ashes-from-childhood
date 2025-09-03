/* eslint-disable no-unused-vars */
import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import './BookPresentation3D.css';

// 3D Book компонент (без промени)
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
                    emissive={new THREE.Color(0x333333)} // Добавя базова яркост
                    emissiveIntensity={0.2} // Интензитет на яркостта
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
                    emissive={new THREE.Color(0x444444)} // Още яркост
                    emissiveIntensity={0.3} // По-високо за предната корица
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
                    emissive={new THREE.Color(0x444444)} // Яркост и за задната
                    emissiveIntensity={0.3}
                />
            </mesh>

            {/* Гръб на книгата */}
            <mesh position={[1.4, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[0.4, 4]} />
                <meshStandardMaterial
                    color="#1a1a2e"
                    roughness={0.8}
                    metalness={0.1}
                    emissive={new THREE.Color(0x444444)}
                    emissiveIntensity={0.1}
                />
            </mesh>

            {/* Текст на гърба */}
            <Text
                position={[1.401, 0, 0]}
                rotation={[0, Math.PI / 2, Math.PI / 2]}
                fontSize={0.15}
                color="#d4af37"
                anchorX="center"
                anchorY="middle"
                // font="/fonts/roboto-regular.woff"
            >
                ПЕПЕЛ ОТ ДЕТСТВОТО - СИБЕЛ ИБРЯМОВА
            </Text>

            {/* Блясък ефект */}
            {hovered && (
                <mesh position={[0, 0, 0.202]}>
                    <planeGeometry args={[2.8, 4]} />
                    <meshBasicMaterial
                        color="#ffffff"
                        transparent={true}
                        opacity={0.15} // Увеличено от 0.1
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            )}
        </group>
    );
}

// Частички около книгата (без промени)
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

// Светлинни ефекти (без промени)
function LightingSetup() {
    return (
        <>
            {/* Основно осветление - увеличено */}
            <ambientLight intensity={0.8} color="#6a7280" />

            {/* Ключова светлина - увеличена */}
            <directionalLight
                position={[5, 8, 3]}
                intensity={1.8} // Увеличено от 1.2
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

            {/* Акцентна светлина - увеличена */}
            <spotLight
                position={[-3, 4, 2]}
                intensity={1.2} // Увеличено от 0.8
                color="#d4af37"
                angle={0.6}
                penumbra={0.5}
                castShadow
            />

            {/* Попълваща светлина - увеличена */}
            <pointLight
                position={[0, -2, 4]}
                intensity={0.8} // Увеличено от 0.5
                color="#8b9dc3"
            />

            {/* Допълнителна предна светлина */}
            <pointLight
                position={[0, 0, 6]}
                intensity={0.6}
                color="#ffffff"
            />
        </>
    );
}

// 3D Сцена (без промени)
function BookScene() {
    return (
        <div className="book-3d-scene">
            <Canvas
                shadows
                camera={{ position: [0, 0, 8], fov: 50 }}
                style={{ background: 'transparent' }}
            >
                <Suspense fallback={null}>
                    <LightingSetup />

                    {/* Книга с Float анимация */}
                    <Float
                        speed={1.5}
                        rotationIntensity={0.2}
                        floatIntensity={0.5}
                    >
                        <Book3D position={[0, 0, 0]} />
                    </Float>

                    {/* Частички */}
                    <Particles />

                    {/* Сенки */}
                    <ContactShadows
                        position={[0, -3, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={2.5}
                        far={4}
                    />

                    {/* Околна среда */}
                    <Environment preset="night" />

                    {/* Контроли за мишката */}
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

// НОВ Rating компонент
function BookRating({ rating = 4.8, viewers }) {
    const renderStars = () => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i} className="star full">★</span>);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<span key={i} className="star half">★</span>);
            } else {
                stars.push(<span key={i} className="star empty">☆</span>);
            }
        }
        return stars;
    };

    return (
        <div className="book-rating-container">
            <div className="rating-section">
                <div className="stars-container">
                    {renderStars()}
                </div>
                <span className="rating-number">{rating}/5</span>
            </div>
            <div className="viewers-section">
                <div className="live-indicator"></div>
                <span className="viewers-count">{viewers} души наблюдават</span>
            </div>
        </div>
    );
}

// НОВ ImageView компонент
function ImageView({ imageSrc, imageAlt, onClose }) {
    return (
        <div className="image-view-container">
            <div className="large-image-wrapper">
                <img 
                    src={imageSrc} 
                    alt={imageAlt}
                    className="large-display-image"
                />
                <button className="back-to-3d-btn" onClick={onClose}>
                    <span>← Назад към 3D модела</span>
                </button>
            </div>
        </div>
    );
}

// НОВ Thumbnail Gallery компонент
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
            src: '/images/book/book-3d-1.jpg',
            alt: '3D изглед',
            title: '3D изглед'
        },
        {
            src: '/images/book/book-mockup.jpg',
            alt: 'Mockup',
            title: 'В реална среда'
        }
    ];

    return (
        <div className="thumbnail-gallery-3d">
            <h4 className="gallery-title">Разгледайте книгата:</h4>
            <div className="thumbnails-container">
                <div 
                    className={`thumbnail-3d model-thumb ${currentView === '3d' ? 'active' : ''}`}
                    onClick={onModelClick}
                >
                    <div className="model-thumb-content">
                        <span className="model-thumb-icon">📱</span>
                        <div className="model-thumb-text">3D</div>
                    </div>
                </div>
                
                {bookImages.map((image, index) => (
                    <div
                        key={index}
                        className={`thumbnail-3d ${currentView === image.src ? 'active' : ''}`}
                        onClick={() => onImageClick(image.src, image.alt)}
                    >
                        <img src={image.src} alt={image.alt} />
                        <div className="thumbnail-title">{image.title}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Главен компонент (обновен)
const BookPresentation3D = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentView, setCurrentView] = useState('3d'); // '3d' или image src
    const [currentImageSrc, setCurrentImageSrc] = useState('');
    const [currentImageAlt, setCurrentImageAlt] = useState('');
    const [liveViewers, setLiveViewers] = useState(Math.floor(Math.random() * 40) + 25); // 25-64

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        const element = document.querySelector('.book-presentation-3d');
        if (element) observer.observe(element);
        return () => observer.disconnect();
    }, []);

    // Live viewers animation
    useEffect(() => {
        const interval = setInterval(() => {
            const change = Math.random() > 0.5 ? 1 : -1;
            setLiveViewers(prev => {
                const newCount = prev + change;
                return Math.max(15, Math.min(65, newCount)); // Между 15 и 65
            });
        }, 3000 + Math.random() * 2000); // Every 3-5 seconds

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
        <section id='book-presentation' className="book-presentation-3d">
            {/* <video
            className="video-background"
            autoPlay
            muted
            loop
            playsInline
             ref={(video) => {
                if (video) {
                    video.playbackRate = 0.5; // 0.5 = половин скорост, 0.25 = четвърт скорост
                }
            }}
            onLoadedData={(e) => {
                e.target.playbackRate = 0.5; // Забавяне на 50%
            }}
            onError={(e) => {
                console.log('Video failed to load:', e);
                e.target.style.display = 'none';
            }}
        >
            <source src="/images/book/burning-paper-ai3.mp4" type="video/mp4" />
            <source src="/images/book/burning-paper-ai3.webm" type="video/webm" />
        </video>
        <div className="video-overlay"></div> */}
        
        {/* Fallback background ако видеото не работи */}
        <div className="fallback-background"></div>
            <div className="presentation-background-3d">
                <div className="cosmic-particles">
                    {[...Array(50)].map((_, i) => (
                        <div key={i} className={`cosmic-particle cosmic-${i % 5}`}></div>
                    ))}
                </div>
            </div>

            <div className="container-3d">
                <div className={`presentation-content-3d ${isVisible ? 'fade-in-up' : ''}`}>

                    <div className="section-header-3d">
                        <h2 className="section-title-3d">
                            Открийте Мистерията
                        </h2>
                        <p className="section-subtitle-3d">
                            "Пепел от детството" - История, която ще докосне сърцето ви
                        </p>
                    </div>

                    <div className="presentation-grid-3d">

                        {/* Enhanced 3D Scene or Image View */}
                        <div className="book-showcase-3d">
                            
                            {/* Rating and Live Viewers */}
                            <BookRating rating={4.8} viewers={liveViewers} />
                            
                            {/* Main Display Area */}
                            {currentView === '3d' ? (
                                <>
                                    <BookScene />
                                    <div className="interaction-hint">
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

                            {/* Thumbnail Gallery */}
                            <ThumbnailGallery 
                                currentView={currentView}
                                onImageClick={handleImageClick}
                                onModelClick={handleModelClick}
                            />

                            {/* Mini 3D Model when image is active */}
                            {currentView !== '3d' && (
                                <div className="mini-3d-model" onClick={handleModelClick}>
                                    <div className="mini-3d-content">
                                        <BookScene />
                                        <div className="mini-3d-overlay">
                                            <span>← Назад към 3D</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Enhanced Information Panel */}
                        <div className="book-info-3d">
                            <h3 className="info-title-3d">
                                Защо да изберете тази книга?
                            </h3>

                            <div className="features-list">
                                <div className={`feature-item ${isVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.2s' }}>
                                    <div className="feature-icon">💭</div>
                                    <div className="feature-content">
                                        <h4>Откровена История</h4>
                                        <p>Разкрива най-дълбоките мисли и чувства на детската душа</p>
                                    </div>
                                </div>

                                <div className={`feature-item ${isVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.4s' }}>
                                    <div className="feature-icon">❤️</div>
                                    <div className="feature-content">
                                        <h4>Емоционално Пътешествие</h4>
                                        <p>Преживейте невинността, болката и надеждата през детски очи</p>
                                    </div>
                                </div>

                                <div className={`feature-item ${isVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.6s' }}>
                                    <div className="feature-icon">👁️</div>
                                    <div className="feature-content">
                                        <h4>Уникална Перспектива</h4>
                                        <p>Взгляд към света от гледна точка на новородено дете</p>
                                    </div>
                                </div>

                                <div className={`feature-item ${isVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.8s' }}>
                                    <div className="feature-icon">✨</div>
                                    <div className="feature-content">
                                        <h4>Дълбок Смисъл</h4>
                                        <p>Книга, която ще ви кара да преосмислите детството и семейството</p>
                                    </div>
                                </div>
                            </div>

                            <div className="cta-section">
                                <blockquote className="book-quote">
                                    "От топлината на семейния дом до студената пустота след разялата..."
                                </blockquote>
                                <p className="quote-caption">
                                    История за развиране, приемане и надежда
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