import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SySAdminRegister.css';
import { useAuthContext } from '../contexts/userContext';

const SySAdminRegister = () => {
  const navigate = useNavigate();
  const { onRegisterSubmit, isAuthenticated, isLoading, errorMessage, clearError } = useAuthContext();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/users-statistic', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
    setValidationErrors({});
  }, [formData, clearError]);

  useEffect(() => {
    checkPasswordStrength(formData.password);
  }, [formData.password]);

  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength('');
      return;
    }
    
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    
    const strength = [hasLower, hasUpper, hasNumber, hasSpecial, isLongEnough].filter(Boolean).length;
    
    if (strength < 2) setPasswordStrength('weak');
    else if (strength < 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Името е задължително';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Името трябва да е поне 2 символа';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Имейлът е задължителен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Невалиден имейл формат';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Паролата е задължителна';
    } else if (formData.password.length < 8) {
      errors.password = 'Паролата трябва да е поне 8 символа';
    }
    
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Потвърдете паролата';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Паролите не съвпадат';
    }
    
    // if (!formData.adminCode.trim()) {
    //   errors.adminCode = 'Админ кодът е задължителен';
    // } else if (formData.adminCode.length < 6) {
    //   errors.adminCode = 'Невалиден админ код';
    // }
    
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
      await onRegisterSubmit(formData);
    } catch (error) {
      console.error('Registration submission failed:', error);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'strong': return '#10b981';
      default: return '#e5e7eb';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Слаба парола';
      case 'medium': return 'Средна парола';
      case 'strong': return 'Силна парола';
      default: return '';
    }
  };

  return (
    <div className="admin-register-container">
      <div className="admin-register-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
          <div className="shape shape-6"></div>
        </div>
      </div>

      <div className="admin-register-content">
        <div className="admin-register-card">
          <div className="admin-register-header">
            <div className="admin-avatar">
              <span className="avatar-icon">✨</span>
            </div>
            <h1 className="admin-title">Създай админ акаунт</h1>
            <p className="admin-subtitle">Присъединете се към администраторския екип</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-register-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <span className="label-icon">👤</span>
                Пълно име
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.name ? 'error' : ''}`}
                placeholder="Въведете вашето име"
                disabled={isLoading}
              />
              {validationErrors.name && (
                <span className="error-message">{validationErrors.name}</span>
              )}
            </div>

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
                  placeholder="Създайте сигурна парола"
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
              {formData.password && (
                <div className="password-strength">
                  <div 
                    className="password-strength-bar"
                    style={{ 
                      backgroundColor: getPasswordStrengthColor(),
                      width: passwordStrength === 'weak' ? '33%' : 
                             passwordStrength === 'medium' ? '66%' : '100%'
                    }}
                  ></div>
                  <span 
                    className="password-strength-text"
                    style={{ color: getPasswordStrengthColor() }}
                  >
                    {getPasswordStrengthText()}
                  </span>
                </div>
              )}
              {validationErrors.password && (
                <span className="error-message">{validationErrors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <span className="label-icon">🔐</span>
                Потвърди парола
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
                  placeholder="Потвърдете паролата"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <span className="error-message">{validationErrors.confirmPassword}</span>
              )}
            </div>

            {/* <div className="form-group">
              <label htmlFor="adminCode" className="form-label">
                <span className="label-icon">🎫</span>
                Админ код
              </label>
              <input
                type="text"
                id="adminCode"
                name="adminCode"
                value={formData.adminCode}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.adminCode ? 'error' : ''}`}
                placeholder="Въведете специалния админ код"
                disabled={isLoading}
              />
              <small className="admin-code-hint">
                Получете админ кода от съществуващ администратор
              </small>
              {validationErrors.adminCode && (
                <span className="error-message">{validationErrors.adminCode}</span>
              )}
            </div> */}

            {errorMessage && (
              <div className="global-error-message">
                <span className="error-icon">⚠️</span>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="admin-register-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Създаване...
                </>
              ) : (
                <>
                  {/* <span className="btn-icon">🎉</span> */}
                  Създай акаунт
                </>
              )}
            </button>

            <div className="auth-links">
              <Link to="/login-admin-sys" className="login-link">
                <span className="login-icon">🔑</span>
                Вече имам акаунт
              </Link>
            </div>
          </form>
        </div>

        <div className="admin-register-footer">
          <p>© 2024 Административна система • Защитено и сигурно</p>
        </div>
      </div>
    </div>
  );
};

export default SySAdminRegister;