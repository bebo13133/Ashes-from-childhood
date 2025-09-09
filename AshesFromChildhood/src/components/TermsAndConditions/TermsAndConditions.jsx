import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/userContext';
import './TermsAndConditions.css';

const TermsAndConditions = () => {
  const { bookPrice, fetchBookPrice } = useAuthContext();
  const [isVisible, setIsVisible] = useState(false);

  // Конвертиране на цената локално
  const exchangeRate = 1.95583;
  const priceBgn = bookPrice ? Number(bookPrice) : 25.00;
  const priceEur = priceBgn / exchangeRate;

  const currentPriceBgn = `${priceBgn.toFixed(2)} лв`;
  const currentPriceEur = `${priceEur.toFixed(2)} €`;

  useEffect(() => {
    fetchBookPrice();
  }, [fetchBookPrice]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.querySelector('.TermsAndConditions-container');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const currentDate = new Date().toLocaleDateString('bg-BG');

  return (
    <div className="TermsAndConditions-container">
      <div className="TermsAndConditions-background">
        <div className="TermsAndConditions-pattern"></div>
      </div>

      <div className="container">
        <div className={`TermsAndConditions-content ${isVisible ? 'TermsAndConditions-fade-in' : ''}`}>
          
          <div className="TermsAndConditions-header">
            <h1 className="TermsAndConditions-title">
              <span className="TermsAndConditions-title-accent">Terms &</span> Conditions
            </h1>
            <p className="TermsAndConditions-subtitle">
              Общи условия за продажба на книгата "ПЕПЕЛ от ДЕТСТВОТО"
            </p>
            <div className="TermsAndConditions-date">
              Последна актуализация: {currentDate}
            </div>
          </div>

          <div className="TermsAndConditions-sections">
            
            <section className="TermsAndConditions-section">
              <h2 className="TermsAndConditions-section-title">1. Информация за продавача</h2>
              <div className="TermsAndConditions-section-content">
                <p><strong>Име:</strong> Сибел Ибрямова</p>
                <p><strong>Електронна поща:</strong> mejduredowete@gmail.com</p>
                <p><strong>Статус:</strong> Физическо лице - автор</p>
                <p><strong>Предмет на дейност:</strong> Продажба на авторски произведения</p>
              </div>
            </section>

            <section className="TermsAndConditions-section">
              <h2 className="TermsAndConditions-section-title">2. Информация за продукта</h2>
              <div className="TermsAndConditions-section-content">
                <p><strong>Продукт:</strong> Книга "ПЕПЕЛ от ДЕТСТВОТО" от Сибел Ибрямова</p>
                <p><strong>Формат:</strong> Физическо издание</p>
                <div className="TermsAndConditions-price-info">
                  <p><strong>Цена:</strong></p>
                  <div className="TermsAndConditions-price-list">
                    <span className="TermsAndConditions-price-item">{currentPriceBgn} (включително всички данъци)</span>
                    <span className="TermsAndConditions-price-item">{currentPriceEur} (включително всички данъци)</span>
                  </div>
                </div>
                <p><strong>Валута:</strong> Български лев (BGN) / Евро (EUR)</p>
                <p><strong>Наличност:</strong> Налична при поръчка</p>
              </div>
            </section>

            <section className="TermsAndConditions-section">
              <h2 className="TermsAndConditions-section-title">3. Поръчване и плащане</h2>
              <div className="TermsAndConditions-section-content">
                <p><strong>Начин на поръчване:</strong> Чрез формуляр на уебсайта</p>
                <p><strong>Начин на плащане:</strong> Наложен платеж при доставка</p>
                <p><strong>Потвърждение:</strong> Ще получите потвърждение на посочения имейл в рамките на 24 часа</p>
                <p><strong>Обработка:</strong> Поръчките се обработват в работни дни от 9:00 до 17:00 часа</p>
              </div>
            </section>

            <section className="TermsAndConditions-section">
              <h2 className="TermsAndConditions-section-title">4. Доставка</h2>
              <div className="TermsAndConditions-section-content">
                <p><strong>Куриерски фирми:</strong> Еконт или Спийди</p>
                <p><strong>Срок за доставка:</strong> 2-3 работни дни след потвърждение на поръчката</p>
                <p><strong>Покритие:</strong> Доставки до цяла България</p>
                <p><strong>Разходи за доставка:</strong> Според тарифите на куриерската фирма</p>
                <p><strong>Получаване:</strong> Лично срещу документ за самоличност</p>
              </div>
            </section>

            <section className="TermsAndConditions-section">
              <h2 className="TermsAndConditions-section-title">5. Право на оттегляне (14 дни)</h2>
              <div className="TermsAndConditions-section-content">
                <p>Съгласно Закона за защита на потребителите имате право да се оттеглите от договора в срок от <strong>14 дни</strong> без посочване на причини.</p>
                <p><strong>Срокът започва:</strong> От деня на получаване на книгата</p>
                <p><strong>Как да се оттеглите:</strong> Изпратете ясно заявление на mejduredowete@gmail.com</p>
                <p><strong>Състояние на книгата:</strong> Трябва да бъде в оригинално състояние</p>
                <p><strong>Разходи за връщане:</strong> Разходите се поемат от купувача</p>
                <p><strong>Възстановяване:</strong> В срок до 14 дни след получаване на върнатата книга</p>
              </div>
            </section>

            <section className="TermsAndConditions-section">
              <h2 className="TermsAndConditions-section-title">6. Гаранции и отговорност</h2>
              <div className="TermsAndConditions-section-content">
                <p><strong>Качество:</strong> Гарантираме че книгата е в отлично състояние</p>
                <p><strong>Повреди при транспорт:</strong> Рекламирайте незабавно пред куриера</p>
                <p><strong>Авторски права:</strong> Всички права запазени за автора</p>
                <p><strong>Ограничение на отговорността:</strong> Максималната отговорност е ограничена до стойността на книгата</p>
              </div>
            </section>

            <section className="TermsAndConditions-section">
              <h2 className="TermsAndConditions-section-title">7. Лични данни (GDPR)</h2>
              <div className="TermsAndConditions-section-content">
                <p><strong>Събиране на данни:</strong> Име, адрес, телефон, имейл - само за изпълнение на поръчката</p>
                <p><strong>Използване:</strong> Единствено за доставка и комуникация относно поръчката</p>
                <p><strong>Споделяне:</strong> Само с куриерската фирма за доставка</p>
                <p><strong>Съхранение:</strong> До 3 години за счетоводни цели</p>
                <p><strong>Вашите права:</strong> Достъп, коригиране, изтриване, ограничаване на обработката</p>
                <p><strong>Контакт за данни:</strong> mejduredowete@gmail.com</p>
              </div>
            </section>

            <section className="TermsAndConditions-section">
              <h2 className="TermsAndConditions-section-title">8. Решаване на спорове</h2>
              <div className="TermsAndConditions-section-content">
                <p><strong>Приложимо право:</strong> Българско законодателство</p>
                <p><strong>Компетентни съдилища:</strong> Съдилищата в България</p>
                <p><strong>Онлайн решаване:</strong> Европейска платформа за онлайн решаване на спорове (ODR)</p>
                <p><strong>Досъдебно решаване:</strong> Предпочитаме мирно решаване чрез директна комуникация</p>
              </div>
            </section>

            <section className="TermsAndConditions-section">
              <h2 className="TermsAndConditions-section-title">9. Допълнителни условия</h2>
              <div className="TermsAndConditions-section-content">
                <p><strong>Промени в условията:</strong> Запазваме си правото да променяме условията с предварително уведомяване</p>
                <p><strong>Недействителност:</strong> При недействителност на отделни клаузи, останалите остават в сила</p>
                <p><strong>Език:</strong> При разлика между езиковите версии, българската версия е валидна</p>
                <p><strong>Контакт:</strong> За въпроси относно условията - mejduredowete@gmail.com</p>
              </div>
            </section>

          </div>

          <div className="TermsAndConditions-footer">
            <div className="TermsAndConditions-footer-note">
              Поръчвайки книгата, потвърждавате че сте прочели и приемате тези общи условия.
            </div>
            <div className="TermsAndConditions-contact">
              За въпроси: <a href="mailto:mejduredowete@gmail.com" className="TermsAndConditions-contact-link">mejduredowete@gmail.com</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;