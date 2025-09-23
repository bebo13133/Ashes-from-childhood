/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './sySAdminLogin.css';
import { useAuthContext } from '../contexts/userContext';

const SySAdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onLoginSubmit, isAuthenticated, isLoading, errorMessage, clearError } = useAuthContext();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/sys-panel';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    clearError();
    setValidationErrors({});
  }, [formData, clearError]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Имейлът е задължителен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Невалиден имейл формат';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Паролата е задължителна';
    } else if (formData.password.length < 6) {
      errors.password = 'Паролата трябва да е поне 6 символа';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await onLoginSubmit(formData);
    } catch (error) {
      console.error('Login submission failed:', error);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      alert('Моля, въведете валиден имейл адрес');
      return;
    }
    
    try {
      alert('Инструкции за възстановяване на паролата са изпратени на вашия имейл');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (error) {
      alert('Грешка при изпращането. Моля, опитайте отново.');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      <div className="admin-login-content">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-avatar">
              <span className="avatar-icon">👑</span>
            </div>
            <h1 className="admin-title">Административен панел</h1>
            <p className="admin-subtitle">Добре дошли в контролния център</p>
          </div>

          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="admin-login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <span className="label-icon">✉️</span>
                  Имейл адрес
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${validationErrors.email ? 'error' : ''}`}
                  placeholder="admin@example.com"
                  disabled={isLoading}
                />
                {validationErrors.email && (
                  <span className="error-message">{validationErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <span className="label-icon">🔒</span>
                  Парола
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`form-input ${validationErrors.password ? 'error' : ''}`}
                    placeholder="Въведете вашата парола"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {validationErrors.password && (
                  <span className="error-message">{validationErrors.password}</span>
                )}
              </div>

              {errorMessage && (
                <div className="global-error-message">
                  <span className="error-icon">⚠️</span>
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="admin-login-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Влизане...
                  </>
                ) : (
                  <>
                    {/* <span className="btn-icon">🚀</span> */}
                    Влизане в системата
                  </>
                )}
              </button>

              <div className="auth-links">
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => setShowForgotPassword(true)}
                  disabled={isLoading}
                >
                  Забравена парола?
                </button>
                
                {/* <Link to="/register-admin-sys" className="register-link">
                  Създай нов акаунт
                </Link> */}
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="admin-login-form">
              <div className="forgot-password-header">
                <h2>Възстановяване на парола</h2>
                <p>Въведете вашия имейл адрес за да получите инструкции</p>
              </div>

              <div className="form-group">
                <label htmlFor="forgotEmail" className="form-label">
                  <span className="label-icon">📧</span>
                  Имейл адрес
                </label>
                <input
                  type="email"
                  id="forgotEmail"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="form-input"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div className="forgot-password-buttons">
                <button type="submit" className="admin-login-btn">
                  <span className="btn-icon">📨</span>
                  Изпрати инструкции
                </button>
                <button
                  type="button"
                  className="back-to-login-btn"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmail('');
                  }}
                >
                  ← Назад към входа
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="admin-login-footer">
          <p>© 2024 Административна система • Защитено и сигурно</p>
        </div>
      </div>
    </div>
  );
};

export default SySAdminLogin;