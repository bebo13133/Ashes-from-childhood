/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import './Reports.css';
import { useAuthContext } from '../../contexts/userContext';

const Reports = () => {
  const { 
    generateReport, 
    exportData, 
    isLoading 
  } = useAuthContext();

  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for reports
  const [reportData, setReportData] = useState({
    overview: {
      totalOrders: 247,
      totalRevenue: 6175,
      totalVisitors: 15847,
      totalReviews: 89,
      averageRating: 4.6,
      conversionRate: 1.56
    },
    salesData: [
      { month: 'Яну', orders: 18, revenue: 450, target: 500 },
      { month: 'Фев', orders: 25, revenue: 625, target: 600 },
      { month: 'Мар', orders: 22, revenue: 550, target: 550 },
      { month: 'Апр', orders: 31, revenue: 775, target: 700 },
      { month: 'Май', orders: 28, revenue: 700, target: 750 },
      { month: 'Юни', orders: 35, revenue: 875, target: 800 },
      { month: 'Юли', orders: 42, revenue: 1050, target: 900 },
      { month: 'Авг', orders: 38, revenue: 950, target: 950 },
      { month: 'Сеп', orders: 33, revenue: 825, target: 800 },
      { month: 'Окт', orders: 29, revenue: 725, target: 700 },
      { month: 'Ное', orders: 21, revenue: 525, target: 600 },
      { month: 'Дек', orders: 25, revenue: 625, target: 650 }
    ],
    trafficData: [
      { date: '01.11', visitors: 234, pageviews: 567, sessions: 198 },
      { date: '02.11', visitors: 267, pageviews: 634, sessions: 223 },
      { date: '03.11', visitors: 298, pageviews: 721, sessions: 245 },
      { date: '04.11', visitors: 223, pageviews: 534, sessions: 189 },
      { date: '05.11', visitors: 345, pageviews: 823, sessions: 298 },
      { date: '06.11', visitors: 412, pageviews: 967, sessions: 356 },
      { date: '07.11', visitors: 387, pageviews: 892, sessions: 334 }
    ],
    reviewsData: [
      { rating: 5, count: 48, percentage: 53.9 },
      { rating: 4, count: 26, percentage: 29.2 },
      { rating: 3, count: 11, percentage: 12.4 },
      { rating: 2, count: 3, percentage: 3.4 },
      { rating: 1, count: 1, percentage: 1.1 }
    ],
    topPages: [
      { page: '/', views: 5432, percentage: 31.2 },
      { page: '/order', views: 3456, percentage: 19.8 },
      { page: '/reviews', views: 2567, percentage: 14.7 },
      { page: '/about', views: 1789, percentage: 10.3 },
      { page: '/contact', views: 1234, percentage: 7.1 }
    ]
  });

  const reportTypes = [
    {
      id: 'overview',
      name: 'Общ преглед',
      description: 'Основни показатели и тенденции',
      icon: '📊'
    },
    {
      id: 'sales',
      name: 'Продажби',
      description: 'Детайлен анализ на продажбите',
      icon: '💰'
    },
    {
      id: 'traffic',
      name: 'Трафик',
      description: 'Посещаемост и поведение на потребителите',
      icon: '👥'
    },
    {
      id: 'reviews',
      name: 'Отзиви',
      description: 'Анализ на отзиви и рейтинги',
      icon: '⭐'
    }
  ];

  const periods = [
    { value: '7d', label: 'Последните 7 дни' },
    { value: '30d', label: 'Последните 30 дни' },
    { value: '3m', label: 'Последните 3 месеца' },
    { value: '1y', label: 'Тази година' }
  ];

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod, selectedReport]);

  const loadReportData = async () => {
    try {
      // В реалното приложение:
      // const data = await generateReport(selectedReport, selectedPeriod);
      // setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
    }
  };

  const handleExport = async (format) => {
    setIsGenerating(true);
    try {
      const result = await exportData(selectedReport, format);
      
      // Създаване на линк за сваляне
      const url = window.URL.createObjectURL(new Blob([result]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${selectedReport}-${selectedPeriod}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Грешка при експортиране на отчета');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()} лв`;
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const renderOverviewReport = () => (
    <div className="reports-overview">
      <div className="reports-kpi-grid">
        <div className="reports-kpi-card">
          <div className="reports-kpi-icon">📦</div>
          <div className="reports-kpi-content">
            <h3>Общо поръчки</h3>
            <p className="reports-kpi-value">{reportData.overview.totalOrders}</p>
            <span className="reports-kpi-change reports-kpi-change--positive">+15% от предишния период</span>
          </div>
        </div>

        <div className="reports-kpi-card">
          <div className="reports-kpi-icon">💰</div>
          <div className="reports-kpi-content">
            <h3>Общи приходи</h3>
            <p className="reports-kpi-value">{formatCurrency(reportData.overview.totalRevenue)}</p>
            <span className="reports-kpi-change reports-kpi-change--positive">+12% от предишния период</span>
          </div>
        </div>

        <div className="reports-kpi-card">
          <div className="reports-kpi-icon">👥</div>
          <div className="reports-kpi-content">
            <h3>Посетители</h3>
            <p className="reports-kpi-value">{reportData.overview.totalVisitors.toLocaleString()}</p>
            <span className="reports-kpi-change reports-kpi-change--positive">+8% от предишния период</span>
          </div>
        </div>

        <div className="reports-kpi-card">
          <div className="reports-kpi-icon">⭐</div>
          <div className="reports-kpi-content">
            <h3>Среден рейтинг</h3>
            <p className="reports-kpi-value">{reportData.overview.averageRating}/5</p>
            <span className="reports-kpi-change reports-kpi-change--neutral">{reportData.overview.totalReviews} отзива</span>
          </div>
        </div>

        <div className="reports-kpi-card">
          <div className="reports-kpi-icon">📈</div>
          <div className="reports-kpi-content">
            <h3>Конверсия</h3>
            <p className="reports-kpi-value">{formatPercentage(reportData.overview.conversionRate)}</p>
            <span className="reports-kpi-change reports-kpi-change--positive">+0.3% от предишния период</span>
          </div>
        </div>

        <div className="reports-kpi-card">
          <div className="reports-kpi-icon">📚</div>
          <div className="reports-kpi-content">
            <h3>Средна цена</h3>
            <p className="reports-kpi-value">25.00 лв</p>
            <span className="reports-kpi-change reports-kpi-change--neutral">Фиксирана цена</span>
          </div>
        </div>
      </div>

      <div className="reports-charts-grid">
        <div className="reports-chart-card">
          <h3>Продажби по месеци</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={reportData.salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip formatter={(value, name) => [
                name === 'orders' ? value : formatCurrency(value),
                name === 'orders' ? 'Поръчки' : 'Приходи'
              ]} />
              <Area type="monotone" dataKey="orders" stackId="1" stroke="#667eea" fill="#667eea" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="reports-chart-card">
          <h3>Разпределение на рейтингите</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.reviewsData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                label={({rating, percentage}) => `${rating}★ (${percentage.toFixed(1)}%)`}
              >
                {reportData.reviewsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${(entry.rating - 1) * 60}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderSalesReport = () => (
    <div className="reports-sales">
      <div className="reports-sales-summary">
        <div className="reports-summary-card">
          <h4>Продажби срещу цели</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData.salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="#667eea" name="Приходи" />
              <Bar dataKey="target" fill="#e5e7eb" name="Цел" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="reports-sales-stats">
          <h4>Ключови показатели</h4>
          <div className="reports-stats-list">
            <div className="reports-stat-item">
              <span className="reports-stat-label">Най-добър месец:</span>
              <span className="reports-stat-value">Юли (42 поръчки)</span>
            </div>
            <div className="reports-stat-item">
              <span className="reports-stat-label">Средно поръчки/месец:</span>
              <span className="reports-stat-value">29 поръчки</span>
            </div>
            <div className="reports-stat-item">
              <span className="reports-stat-label">Растеж спрямо миналата година:</span>
              <span className="reports-stat-value reports-stat-value--positive">+23%</span>
            </div>
            <div className="reports-stat-item">
              <span className="reports-stat-label">Постигнати цели:</span>
              <span className="reports-stat-value">8 от 12 месеца</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrafficReport = () => (
    <div className="reports-traffic">
      <div className="reports-traffic-chart">
        <h4>Трафик по дни</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reportData.trafficData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Line type="monotone" dataKey="visitors" stroke="#667eea" strokeWidth={2} name="Посетители" />
            <Line type="monotone" dataKey="pageviews" stroke="#10b981" strokeWidth={2} name="Прегледи" />
            <Line type="monotone" dataKey="sessions" stroke="#f59e0b" strokeWidth={2} name="Сесии" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="reports-top-pages">
        <h4>Най-посещавани страници</h4>
        <div className="reports-pages-list">
          {reportData.topPages.map((page, index) => (
            <div key={index} className="reports-page-item">
              <div className="reports-page-rank">{index + 1}</div>
              <div className="reports-page-info">
                <span className="reports-page-url">{page.page}</span>
                <div className="reports-page-bar">
                  <div 
                    className="reports-page-fill"
                    style={{ width: `${page.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="reports-page-stats">
                <span className="reports-page-views">{page.views.toLocaleString()}</span>
                <span className="reports-page-percentage">{page.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReviewsReport = () => (
    <div className="reports-reviews">
      <div className="reports-reviews-overview">
        <div className="reports-review-card">
          <h4>Общ рейтинг</h4>
          <div className="reports-rating-display">
            <span className="reports-rating-number">{reportData.overview.averageRating}</span>
            <span className="reports-rating-stars">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`reports-star ${i < Math.round(reportData.overview.averageRating) ? 'reports-star--filled' : ''}`}>★</span>
              ))}
            </span>
          </div>
          <p className="reports-rating-total">Базирано на {reportData.overview.totalReviews} отзива</p>
        </div>

        <div className="reports-review-card">
          <h4>Разпределение</h4>
          <div className="reports-rating-breakdown">
            {reportData.reviewsData.map((rating, index) => (
              <div key={index} className="reports-rating-row">
                <span className="reports-rating-label">{rating.rating}★</span>
                <div className="reports-rating-bar">
                  <div 
                    className="reports-rating-fill"
                    style={{ width: `${rating.percentage}%` }}
                  ></div>
                </div>
                <span className="reports-rating-count">{rating.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="reports-review-insights">
        <h4>Анализ на отзивите</h4>
        <div className="reports-insights-grid">
          <div className="reports-insight-item">
            <div className="reports-insight-icon">😍</div>
            <div className="reports-insight-content">
              <h5>Положителни отзиви</h5>
              <p>83% от отзивите са с 4 или 5 звезди</p>
            </div>
          </div>
          <div className="reports-insight-item">
            <div className="reports-insight-icon">💬</div>
            <div className="reports-insight-content">
              <h5>Активност</h5>
              <p>Средно 12 нови отзива месечно</p>
            </div>
          </div>
          <div className="reports-insight-item">
            <div className="reports-insight-icon">📈</div>
            <div className="reports-insight-content">
              <h5>Тенденция</h5>
              <p>Рейтингът се подобрява с времето</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSelectedReport = () => {
    switch (selectedReport) {
      case 'overview':
        return renderOverviewReport();
      case 'sales':
        return renderSalesReport();
      case 'traffic':
        return renderTrafficReport();
      case 'reviews':
        return renderReviewsReport();
      default:
        return renderOverviewReport();
    }
  };

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div className="reports-header-info">
          <h2 className="reports-title">Отчети и анализи</h2>
          <p className="reports-subtitle">
            Детайлни отчети за продажби, трафик и представяне
          </p>
        </div>

        <div className="reports-header-controls">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="reports-period-select"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>

          <div className="reports-export-buttons">
            <button 
              className="reports-export-btn"
              onClick={() => handleExport('pdf')}
              disabled={isGenerating}
            >
              📄 PDF
            </button>
            <button 
              className="reports-export-btn"
              onClick={() => handleExport('xlsx')}
              disabled={isGenerating}
            >
              📊 Excel
            </button>
            <button 
              className="reports-export-btn"
              onClick={() => handleExport('csv')}
              disabled={isGenerating}
            >
              📋 CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="reports-nav">
        <div className="reports-nav-list">
          {reportTypes.map(type => (
            <button
              key={type.id}
              className={`reports-nav-btn ${selectedReport === type.id ? 'reports-nav-btn--active' : ''}`}
              onClick={() => setSelectedReport(type.id)}
            >
              <span className="reports-nav-icon">{type.icon}</span>
              <div className="reports-nav-content">
                <span className="reports-nav-name">{type.name}</span>
                <span className="reports-nav-desc">{type.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      <div className="reports-content">
        {isLoading ? (
          <div className="reports-loading">
            <div className="reports-loading-spinner"></div>
            <p>Зареждане на отчета...</p>
          </div>
        ) : (
          renderSelectedReport()
        )}
      </div>

      {/* Loading Overlay for Export */}
      {isGenerating && (
        <div className="reports-export-overlay">
          <div className="reports-export-modal">
            <div className="reports-export-spinner"></div>
            <p>Генериране на отчета...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;