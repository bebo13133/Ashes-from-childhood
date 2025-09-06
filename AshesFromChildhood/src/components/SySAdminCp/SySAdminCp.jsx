/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './sySAdminCp.css';
import { useAuthContext } from '../contexts/userContext';
import DashboardOverview from './DashboardOverview/DashboardOverview';
import OrdersManagement from './OrdersManagement/OrdersManagement';
import VisitorsStats from './VisitorsStats/VisitorsStats';
import RatingsReviews from './RatingsReviews/RatingsReviews';
import EmailManager from './EmailManager/EmailManager';
import Reports from './Reports/Reports';

// Import sub-components (ще ги създадем един по един)
// import DashboardOverview from './components/DashboardOverview';
// import OrdersManagement from './components/OrdersManagement';
// import VisitorsStats from './components/VisitorsStats';
// import RatingsReviews from './components/RatingsReviews';
// import EmailManager from './components/EmailManager';

const SySAdminCp = () => {
    const navigate = useNavigate();
    const {
        isAuthenticated,
        adminName,
        adminEmail,
        onLogout,
        // Admin specific functions - ще ги добавим в AuthContext
        // fetchDashboardData,
        // fetchOrders,
        // fetchStats,
        // sendEmail
    } = useAuthContext();

    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if not authenticated
    //   useEffect(() => {
    //     if (!isAuthenticated) {
    //       navigate('/login-admin-sys', { replace: true });
    //     }
    //   }, [isAuthenticated, navigate]);

    const handleLogout = async () => {
        try {
            await onLogout();
            navigate('/login-admin-sys', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
        }

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
                            <button className="action-btn notification-btn">
                                <span className="btn-icon">🔔</span>
                                <span className="notification-badge">3</span>
                            </button>

                            <div className="admin-profile">
                                <div className="profile-info">
                                    <span className="profile-name">{adminName || 'Admin'}</span>
                                    <span className="profile-email">{adminEmail}</span>
                                </div>
                                <div className="profile-avatar">
                                    <span className="avatar-text">{adminName?.charAt(0) || 'A'}</span>
                                </div>
                                <button className="profile-dropdown">▼</button>
                            </div>

                            <button
                                className="action-btn logout-btn"
                                onClick={handleLogout}
                                title="Изход"
                            >
                                <span className="btn-icon">🚪</span>
                            </button>
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
        </div>
    );
};

export default SySAdminCp;