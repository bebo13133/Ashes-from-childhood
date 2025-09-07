import { useNavigate } from 'react-router-dom';
import './Unauthorized.css';

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login-admin-sys');
  };

  return (
    <div className="Unauthorized-unauthorized-container">
      <div className="Unauthorized-unauthorized-background">
        <div className="Unauthorized-floating-shapes">
          <div className="Unauthorized-shape Unauthorized-shape-1"></div>
          <div className="Unauthorized-shape Unauthorized-shape-2"></div>
          <div className="Unauthorized-shape Unauthorized-shape-3"></div>
          <div className="Unauthorized-shape Unauthorized-shape-4"></div>
          <div className="Unauthorized-shape Unauthorized-shape-5"></div>
        </div>
        
        <div className="Unauthorized-grid-pattern"></div>
      </div>

      <div className="Unauthorized-unauthorized-content">
        <div className="Unauthorized-unauthorized-main">
          
          {/* Lock Animation */}
          <div className="Unauthorized-lock-container">
            <div className="Unauthorized-lock-body">
              <div className="Unauthorized-lock-top"></div>
              <div className="Unauthorized-lock-hole"></div>
              <div className="Unauthorized-lock-key">
                <div className="Unauthorized-key-head"></div>
                <div className="Unauthorized-key-shaft"></div>
              </div>
            </div>
            <div className="Unauthorized-access-denied-text">ACCESS DENIED</div>
          </div>

          {/* Main Content */}
          <div className="Unauthorized-unauthorized-text">
            <h1 className="Unauthorized-unauthorized-title">
              <span className="Unauthorized-title-number">401</span>
              <span className="Unauthorized-title-main">Неоторизиран достъп</span>
            </h1>
            
            <p className="Unauthorized-unauthorized-description">
              Нямате необходимите права за достъп до тази страница. 
              Моля, влезте в системата или се свържете с администратор.
            </p>

            <div className="Unauthorized-error-details">
              <div className="Unauthorized-detail-item">
                <div className="Unauthorized-detail-icon">🔒</div>
                <div className="Unauthorized-detail-text">
                  <span className="Unauthorized-detail-title">Защитена зона</span>
                  <span className="Unauthorized-detail-desc">Тази страница изисква специални права</span>
                </div>
              </div>
              
              <div className="Unauthorized-detail-item">
                <div className="Unauthorized-detail-icon">👤</div>
                <div className="Unauthorized-detail-text">
                  <span className="Unauthorized-detail-title">Нужна автентификация</span>
                  <span className="Unauthorized-detail-desc">Влезте в профила си за достъп</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="Unauthorized-unauthorized-actions">
            <button 
              onClick={handleLogin}
              className="Unauthorized-action-btn Unauthorized-primary-btn"
            >
              <span className="Unauthorized-btn-icon">🔑</span>
              <span className="Unauthorized-btn-text">Вход в системата</span>
              <div className="Unauthorized-btn-glow"></div>
            </button>

            <button 
              onClick={handleGoHome}
              className="Unauthorized-action-btn Unauthorized-secondary-btn"
            >
              <span className="Unauthorized-btn-icon">🏠</span>
              <span className="Unauthorized-btn-text">Начална страница</span>
            </button>

            <button 
              onClick={handleGoBack}
              className="Unauthorized-action-btn Unauthorized-tertiary-btn"
            >
              <span className="Unauthorized-btn-icon">←</span>
              <span className="Unauthorized-btn-text">Назад</span>
            </button>
          </div>
        </div>

        {/* Side Illustration */}
        <div className="Unauthorized-unauthorized-illustration">
          <div className="Unauthorized-illustration-container">
            <div className="Unauthorized-security-shield">
              <div className="Unauthorized-shield-outer">
                <div className="Unauthorized-shield-inner">
                  <div className="Unauthorized-shield-icon">🛡️</div>
                </div>
              </div>
              <div className="Unauthorized-security-waves">
                <div className="Unauthorized-wave Unauthorized-wave-1"></div>
                <div className="Unauthorized-wave Unauthorized-wave-2"></div>
                <div className="Unauthorized-wave Unauthorized-wave-3"></div>
              </div>
            </div>
            
            <div className="Unauthorized-warning-signs">
              <div className="Unauthorized-warning-sign Unauthorized-sign-1">⚠️</div>
              <div className="Unauthorized-warning-sign Unauthorized-sign-2">🚫</div>
              <div className="Unauthorized-warning-sign Unauthorized-sign-3">⛔</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="Unauthorized-unauthorized-footer">
        <p>© 2024 Админ Система - Всички права запазени</p>
      </div>
    </div>
  );
};

export default Unauthorized;