
import { useEffect, useState, useRef } from 'react';
import './scrollToTop.css';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {

    targetRef.current = document.createElement('div');
    targetRef.current.style.position = 'absolute';
    targetRef.current.style.top = `${window.innerHeight * 0.5}px`; 
    targetRef.current.style.left = '0';
    targetRef.current.style.width = '1px';
    targetRef.current.style.height = '1px';
    targetRef.current.style.pointerEvents = 'none';
    document.body.appendChild(targetRef.current);

    observerRef.current = new IntersectionObserver(
      ([entry]) => {

        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    // Започваме да наблюдаваме
    if (targetRef.current) {
      observerRef.current.observe(targetRef.current);
    }

    // Почистваме при unmount
    return () => {
      if (observerRef.current && targetRef.current) {
        observerRef.current.disconnect();
        document.body.removeChild(targetRef.current);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button 
      className={`scroll-to-top-btn ${isVisible ? 'visible' : ''}`} 
      onClick={scrollToTop}
      aria-label="Върнете се в началото на страницата"
    >
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <polyline style={{fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeMiterlimit: 10}} points="3.5,20.5 16,8 28.5,20.5" />
      </svg>
    </button>
  );
};

export default ScrollToTop;