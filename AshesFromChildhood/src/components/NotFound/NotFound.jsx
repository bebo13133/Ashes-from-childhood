import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleSearch = () => {
    // Можете да добавите search функционалност тук
    navigate('/');
  };

  return (
    <div className="NotFound-container">
      <div className="NotFound-background">
        <div className="NotFound-floating-elements">
          <div className="NotFound-element NotFound-element-1">📄</div>
          <div className="NotFound-element NotFound-element-2">🔍</div>
          <div className="NotFound-element NotFound-element-3">❓</div>
          <div className="NotFound-element NotFound-element-4">📁</div>
          <div className="NotFound-element NotFound-element-5">💻</div>
          <div className="NotFound-element NotFound-element-6">🌐</div>
        </div>
        
        <div className="NotFound-grid-pattern"></div>
        <div className="NotFound-noise-overlay"></div>
      </div>

      <div className="NotFound-content">
        <div className="NotFound-main">
          
          {/* 404 Animation */}
          <div className="NotFound-error-container">
            <div className="NotFound-glitch-wrapper">
              <div className="NotFound-error-number" data-text="404">404</div>
              <div className="NotFound-error-overlay">404</div>
            </div>
            <div className="NotFound-broken-link">
              <div className="NotFound-chain-link NotFound-link-1">🔗</div>
              <div className="NotFound-break-effect">💥</div>
              <div className="NotFound-chain-link NotFound-link-2">⛓️‍💥</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="NotFound-text-content">
            <h1 className="NotFound-title">
              <span className="NotFound-title-main">Страницата не е намерена</span>
              <span className="NotFound-title-sub">Ops! Това не трябваше да се случи</span>
            </h1>
            
            <p className="NotFound-description">
              Страницата, която търсите, не съществува или е преместена. 
              Може би е време да се върнете на сигурна територия?
            </p>

            <div className="NotFound-suggestions">
              <div className="NotFound-suggestion-item">
                <div className="NotFound-suggestion-icon">🧭</div>
                <div className="NotFound-suggestion-text">
                  <span className="NotFound-suggestion-title">Изгубени в киберпространството?</span>
                  <span className="NotFound-suggestion-desc">Използвайте навигацията за да се върнете</span>
                </div>
              </div>
              
              <div className="NotFound-suggestion-item">
                <div className="NotFound-suggestion-icon">🔗</div>
                <div className="NotFound-suggestion-text">
                  <span className="NotFound-suggestion-title">Счупена връзка</span>
                  <span className="NotFound-suggestion-desc">Линкът може да е остарял или неправилен</span>
                </div>
              </div>

              <div className="NotFound-suggestion-item">
                <div className="NotFound-suggestion-icon">🚧</div>
                <div className="NotFound-suggestion-text">
                  <span className="NotFound-suggestion-title">В процес на разработка</span>
                  <span className="NotFound-suggestion-desc">Тази страница може още да не е готова</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="NotFound-actions">
            <button 
              onClick={handleGoHome}
              className="NotFound-action-btn NotFound-primary-btn"
            >
              <span className="NotFound-btn-icon">🏠</span>
              <span className="NotFound-btn-text">Начална страница</span>
              <div className="NotFound-btn-pulse"></div>
            </button>

            <button 
              onClick={handleSearch}
              className="NotFound-action-btn NotFound-secondary-btn"
            >
              <span className="NotFound-btn-icon">🔍</span>
              <span className="NotFound-btn-text">Търсене</span>
            </button>

            <button 
              onClick={handleGoBack}
              className="NotFound-action-btn NotFound-tertiary-btn"
            >
              <span className="NotFound-btn-icon">↶</span>
              <span className="NotFound-btn-text">Назад</span>
            </button>
          </div>

          {/* Quick Links
          <div className="NotFound-quick-links">
            <div className="NotFound-links-title">Популярни страници:</div>
            <div className="NotFound-links-list">
              <a href="/" className="NotFound-quick-link">Начало</a>
              <a href="/login-admin-sys" className="NotFound-quick-link">Админ вход</a>
              <a href="/contact" className="NotFound-quick-link">Контакти</a>
            </div>
          </div> */}
        </div>

        {/* Side Illustration */}
        <div className="NotFound-illustration">
          <div className="NotFound-illustration-container">
            <div className="NotFound-computer-screen">
              <div className="NotFound-screen-outer">
                <div className="NotFound-screen-inner">
                  <div className="NotFound-screen-content">
                    <div className="NotFound-error-face">😵‍💫</div>
                    <div className="NotFound-error-text">ERROR</div>
                  </div>
                </div>
                <div className="NotFound-screen-base"></div>
              </div>
            </div>
            
            <div className="NotFound-floating-papers">
              <div className="NotFound-paper NotFound-paper-1">📄</div>
              <div className="NotFound-paper NotFound-paper-2">📋</div>
              <div className="NotFound-paper NotFound-paper-3">🗂️</div>
            </div>

            <div className="NotFound-search-magnifier">
              <div className="NotFound-magnifier-lens">🔍</div>
              <div className="NotFound-magnifier-handle"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="NotFound-footer">
        <p>Ако проблемът продължава, моля свържете се с поддръжката</p>
      </div>
    </div>
  );
};

export default NotFound;