/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './ResetPassword.css';
import { useAuthContext } from '../contexts/userContext';


const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword, isLoading, errorMessage, clearError } = useAuthContext();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      navigate('/login-admin-sys', { replace: true });
      return;
    }
    setToken(resetToken);
  }, [searchParams, navigate]);

  useEffect(() => {
    clearError();
    setValidationErrors({});
  }, [formData, clearError]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.password.trim()) {
      errors.password = 'Паролата е задължителна';
    } else if (formData.password.length < 6) {
      errors.password = 'Паролата трябва да е поне 6 символа';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Паролата трябва да съдържа поне една главна буква, една малка буква и една цифра';
    }
    
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Потвърждението на паролата е задължително';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Паролите не съвпадат';
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
      await resetPassword({
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login-admin-sys', { replace: true });
      }, 3000);
      
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  };

  if (isSuccess) {
    return (
      <div className="ResetPassword-reset-container">
        <div className="ResetPassword-reset-background">
          <div className="ResetPassword-floating-shapes">
            <div className="ResetPassword-shape ResetPassword-shape-1"></div>
            <div className="ResetPassword-shape ResetPassword-shape-2"></div>
            <div className="ResetPassword-shape ResetPassword-shape-3"></div>
            <div className="ResetPassword-shape ResetPassword-shape-4"></div>
            <div className="ResetPassword-shape ResetPassword-shape-5"></div>
          </div>
        </div>

        <div className="ResetPassword-reset-content">
          <div className="ResetPassword-reset-card">
            <div className="ResetPassword-success-header">
              <div className="ResetPassword-success-avatar">
                <span className="ResetPassword-success-icon">✅</span>
              </div>
              <h1 className="ResetPassword-success-title">Паролата е сменена успешно!</h1>
              <p className="ResetPassword-success-subtitle">
                Сега можете да влезете с новата си парола.
              </p>
            </div>

            <div className="ResetPassword-success-actions">
              <Link to="/login-admin-sys" className="ResetPassword-login-btn">
                <span className="ResetPassword-btn-icon">🔑</span>
                Влизане в системата
              </Link>
              <p className="ResetPassword-redirect-text">
                Ще бъдете пренасочени автоматично след 3 секунди...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ResetPassword-reset-container">
      <div className="ResetPassword-reset-background">
        <div className="ResetPassword-floating-shapes">
          <div className="ResetPassword-shape ResetPassword-shape-1"></div>
          <div className="ResetPassword-shape ResetPassword-shape-2"></div>
          <div className="ResetPassword-shape ResetPassword-shape-3"></div>
          <div className="ResetPassword-shape ResetPassword-shape-4"></div>
          <div className="ResetPassword-shape ResetPassword-shape-5"></div>
        </div>
      </div>

      <div className="ResetPassword-reset-content">
        <div className="ResetPassword-reset-card">
          <div className="ResetPassword-reset-header">
            <div className="ResetPassword-reset-avatar">
              <span className="ResetPassword-avatar-icon">🔑</span>
            </div>
            <h1 className="ResetPassword-reset-title">Смяна на парола</h1>
            <p className="ResetPassword-reset-subtitle">
              Моля, въведете новата си парола
            </p>
          </div>

          <form onSubmit={handleSubmit} className="ResetPassword-reset-form">
            <div className="ResetPassword-form-group">
              <label htmlFor="password" className="ResetPassword-form-label">
                <span className="ResetPassword-label-icon">🔒</span>
                Нова парола
              </label>
              <div className="ResetPassword-password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`ResetPassword-form-input ${validationErrors.password ? 'ResetPassword-error' : ''}`}
                  placeholder="Въведете нова парола"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="ResetPassword-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {validationErrors.password && (
                <span className="ResetPassword-error-message">{validationErrors.password}</span>
              )}
            </div>

            <div className="ResetPassword-form-group">
              <label htmlFor="confirmPassword" className="ResetPassword-form-label">
                <span className="ResetPassword-label-icon">🔐</span>
                Потвърди паролата
              </label>
              <div className="ResetPassword-password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`ResetPassword-form-input ${validationErrors.confirmPassword ? 'ResetPassword-error' : ''}`}
                  placeholder="Потвърдете новата парола"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="ResetPassword-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <span className="ResetPassword-error-message">{validationErrors.confirmPassword}</span>
              )}
            </div>

            {errorMessage && (
              <div className="ResetPassword-global-error-message">
                <span className="ResetPassword-error-icon">⚠️</span>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="ResetPassword-reset-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="ResetPassword-loading-spinner"></span>
                  Сменяне...
                </>
              ) : (
                <>
                  <span className="ResetPassword-btn-icon">🔄</span>
                  Смени паролата
                </>
              )}
            </button>

            <div className="ResetPassword-auth-links">
              <Link to="/login-admin-sys" className="ResetPassword-login-link">
                ← Назад към входа
              </Link>
            </div>
          </form>
        </div>

        <div className="ResetPassword-reset-footer">
          <p>© 2024 Административна система • Защитено и сигурно</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;