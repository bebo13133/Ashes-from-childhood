import { useState, useEffect } from 'react';
import './BookSynopsis.css';

const BookSynopsis = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        const element = document.querySelector('.book-synopsis');
        if (element) observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <section className='book-synopsis'>
            <div className='book-synopsis-background'>
                <div className='book-synopsis-pattern'></div>
            </div>

            <div className='container'>
                <div className={`book-synopsis-content ${isVisible ? 'book-synopsis-fade-in' : ''}`}>
                    <div className='book-synopsis-header'>
                        <h2 className='book-synopsis-title'>За книгата</h2>
                        <div className='book-synopsis-title-decoration'></div>
                    </div>

                    <div className='book-synopsis-body'>
                        <div className='book-synopsis-text-container'>
                            <h3 className='book-synopsis-book-title'>„Пепел от детството (Из мислите на едно дете)"</h3>

                            <div className='book-synopsis-description'>
                                <p>е дълбоко емоционално и откровено пътешествие през невинността и болката на детското сърце.</p>

                                <p>
                                    През погледа на новородено, което се сблъсква с любовта, разочарованието и загубата, тази книга разкрива най-съкровените
                                    мисли и чувства, които малките души не винаги могат да изразят.
                                </p>

                                <p>
                                    От топлината на семейния дом до студената пустота след раздялата, от радостта на първите стъпки и думи и стъпки до сянката
                                    на липсата, историята проследява една невидима борба за разбиране, приемане и надежда.
                                </p>
                            </div>
                        </div>

                        {/* Optional: Back cover image can be added here */}
                        {/* <div className="book-synopsis-image-container">
                            <img
                                src="/images/book/cover-back.jpg"
                                alt="Задна корица на Пепел от детството"
                                className="book-synopsis-image"
                            />
                        </div> */}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BookSynopsis;
