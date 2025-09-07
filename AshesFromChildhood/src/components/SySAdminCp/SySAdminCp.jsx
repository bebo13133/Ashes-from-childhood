/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './sySAdminCp.css';
import { useAuthContext } from '../contexts/userContext';
import DashboardOverview from './DashboardOverview/DashboardOverview';
import OrdersManagement from './OrdersManagement/OrdersManagement';
import VisitorsStats from './VisitorsStats/VisitorsStats';
import RatingsReviews from './RatingsReviews/RatingsReviews';
import EmailManager from './EmailManager/EmailManager';
import Reports from './Reports/Reports';
import NotificationDropdown from './NotificationDropdown/NotificationDropdown';

const SySAdminCp = () => {
    const navigate = useNavigate();
    const {
        isAuthenticated,
        adminName,
        adminEmail,
        onLogout,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        changePassword
    } = useAuthContext();

    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    
    const profileDropdownRef = useRef(null);

    // Redirect if not authenticated
    //   useEffect(() => {
    //     if (!isAuthenticated) {
    //       navigate('/login-admin-sys', { replace: true });
    //     }
    //   }, [isAuthenticated, navigate]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await onLogout();
            navigate('/login-admin-sys', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        // Navigate to relevant section based on notification type
        switch (notification.type) {
            case 'order':
                setActiveSection('orders');
                break;
            case 'review':
                setActiveSection('ratings');
                break;
            default:
                setActiveSection('dashboard');
                break;
        }
    };

    const handlePasswordChange = () => {
        setShowProfileDropdown(false);
        setShowPasswordModal(true);
    };

    const menuItems = [
        {
            id: 'dashboard',
            title: 'Табло',
            icon: '📊',
            description: 'Общ преглед на статистиките'
        },
        {
            id: 'orders',
            title: 'Поръчки',
            icon: '📦',
            description: 'Управление на поръчки'
        },
        {
            id: 'visitors',
            title: 'Посетители',
            icon: '👥',
            description: 'Статистика за посетители'
        },
        {
            id: 'ratings',
            title: 'Рейтинги',
            icon: '⭐',
            description: 'Отзиви и рейтинги'
        },
        {
            id: 'email',
            title: 'Имейли',
            icon: '📧',
            description: 'Изпращане на имейли'
        },
        {
            id: 'reports',
            title: 'Отчети',
            icon: '📈',
            description: 'Детайлни отчети'
        }
    ];

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'dashboard':
                return <DashboardOverview />;
            case 'orders':
                return <OrdersManagement />;
            case 'visitors':
                return <VisitorsStats />;
            case 'ratings':
                return <RatingsReviews />;
            case 'email':
                return <EmailManager />;
            case 'reports':
                return <Reports />;
            default:
                return <div className="section-placeholder">Секцията не е намерена</div>;
        }
    };

    return (
        <div className="admin-panel">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="admin-logo">
                        {/* <div className="logo-icon">👑</div> */}
                        {!sidebarCollapsed && <span className="logo-text">Admin Panel</span>}
                    </div>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        {sidebarCollapsed ? '→' : '←'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {menuItems.map((item) => (
                            <li key={item.id} className="nav-item">
                                <button
                                    className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                                    onClick={() => setActiveSection(item.id)}
                                    title={sidebarCollapsed ? item.title : ''}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    {!sidebarCollapsed && (
                                        <div className="nav-content">
                                            <span className="nav-title">{item.title}</span>
                                            <span className="nav-description">{item.description}</span>
                                        </div>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    {!sidebarCollapsed && (
                        <div className="admin-info">
                            <div className="admin-avatar-small">
                                <span className="avatar-text">{adminName?.charAt(0) || 'A'}</span>
                            </div>
                            <div className="admin-details">
                                <span className="admin-name">{adminName || 'Admin'}</span>
                                <span className="admin-role">Администратор</span>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Header */}
                <header className="admin-header">
                    <div className="header-left">
                        <h1 className="page-title">
                            {menuItems.find(item => item.id === activeSection)?.title || 'Админ панел'}
                        </h1>
                        <p className="page-subtitle">
                            {menuItems.find(item => item.id === activeSection)?.description || ''}
                        </p>
                    </div>

                    <div className="header-right">
                        <div className="header-actions">
                            <NotificationDropdown 
                                notifications={notifications}
                                onMarkAsRead={markNotificationAsRead}
                                onMarkAllAsRead={markAllNotificationsAsRead}
                                onNotificationClick={handleNotificationClick}
                            />

                            <div className="admin-profile-wrapper" ref={profileDropdownRef}>
                                <div 
                                    className="admin-profile"
                                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                >
                                    <div className="profile-info">
                                        <span className="profile-name">{adminName || 'Admin'}</span>
                                        <span className="profile-email">{adminEmail}</span>
                                    </div>
                                    <div className="profile-avatar">
                                        <span className="avatar-text">{adminName?.charAt(0) || 'A'}</span>
                                    </div>
                                    <button className="profile-dropdown">▼</button>
                                </div>

                                {/* Profile Dropdown Menu */}
                                {showProfileDropdown && (
                                    <div className="profile-dropdown-menu">
                                        <div className="profile-dropdown-header">
                                            <div className="dropdown-avatar">
                                                <span className="avatar-text">{adminName?.charAt(0) || 'A'}</span>
                                            </div>
                                            <div className="dropdown-info">
                                                <span className="dropdown-name">{adminName || 'Admin'}</span>
                                                <span className="dropdown-email">{adminEmail}</span>
                                            </div>
                                        </div>

                                        <div className="profile-dropdown-divider"></div>

                                        <div className="profile-dropdown-items">
                                            <button 
                                                className="profile-dropdown-item"
                                                onClick={handlePasswordChange}
                                            >
                                                <span className="dropdown-item-icon">🔑</span>
                                                <span className="dropdown-item-text">Смяна на парола</span>
                                            </button>
                                            
                                            <button 
                                                className="profile-dropdown-item logout-item"
                                                onClick={handleLogout}
                                            >
                                                <span className="dropdown-item-icon">🚪</span>
                                                <span className="dropdown-item-text">Изход</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="admin-content">
                    <div className="content-wrapper">
                        {isLoading ? (
                            <div className="loading-screen">
                                <div className="loading-spinner"></div>
                                <p>Зареждане...</p>
                            </div>
                        ) : (
                            renderActiveSection()
                        )}
                    </div>
                </div>
            </main>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <PasswordChangeModal 
                    onClose={() => setShowPasswordModal(false)}
                    changePassword={changePassword}
                />
            )}
        </div>
    );
};

// Password Change Modal Component
const PasswordChangeModal = ({ onClose, changePassword }) => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setError('Всички полета са задължителни');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Новите пароли не съвпадат');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Новата парола трябва да е поне 6 символа');
            return;
        }

        if (passwordData.currentPassword === passwordData.newPassword) {
            setError('Новата парола трябва да се различава от текущата');
            return;
        }

        setIsLoading(true);

        try {
            await changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            
            alert('Паролата е сменена успешно!');
            onClose();
        } catch (error) {
            setError(error.message || 'Грешка при смяна на паролата');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    return (
        <div className="password-modal-overlay">
            <div className="password-modal">
                <div className="password-modal-header">
                    <h3>Смяна на парола</h3>
                    <button 
                        className="password-modal-close"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="password-form">
                    {error && (
                        <div className="password-error">
                            <span className="error-icon">⚠️</span>
                            <span className="error-text">{error}</span>
                        </div>
                    )}

                    <div className="password-form-group">
                        <label>Текуща парола:</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ 
                                    ...prev, 
                                    currentPassword: e.target.value 
                                }))}
                                placeholder="Въведете текущата парола"
                                disabled={isLoading}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => togglePasswordVisibility('current')}
                                disabled={isLoading}
                            >
                                {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <div className="password-form-group">
                        <label>Нова парола:</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ 
                                    ...prev, 
                                    newPassword: e.target.value 
                                }))}
                                placeholder="Въведете новата парола"
                                disabled={isLoading}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => togglePasswordVisibility('new')}
                                disabled={isLoading}
                            >
                                {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        <div className="password-requirements">
                            Минимум 6 символа
                        </div>
                    </div>

                    <div className="password-form-group">
                        <label>Потвърди новата парола:</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ 
                                    ...prev, 
                                    confirmPassword: e.target.value 
                                }))}
                                placeholder="Повторете новата парола"
                                disabled={isLoading}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => togglePasswordVisibility('confirm')}
                                disabled={isLoading}
                            >
                                {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <div className="password-modal-actions">
                        <button 
                            type="button" 
                            className="password-cancel-btn"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Отказ
                        </button>
                        <button 
                            type="submit" 
                            className="password-save-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Променяне...' : '🔑 Смени парола'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SySAdminCp;