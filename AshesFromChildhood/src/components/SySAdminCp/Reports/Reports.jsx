/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './Reports.css';
import { useAuthContext } from '../../contexts/userContext';

const Reports = () => {
  const { 
    generateReport,
    fetchVisitorsStats,
    fetchRatingsData,
    isLoading ,
    fetchDashboardData
  } = useAuthContext();

  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');

  // Real API data state
  const [reportData, setReportData] = useState({
    overview: {
      totalOrders: 0,
      totalRevenue: 0,
      totalVisitors: 0,
      totalReviews: 0,
      averageRating: 0,
      conversionRate: 0
    },
    salesData: [],
    trafficData: {
      dailyData: [],
      hourlyData: [],
      topPages: []
    },
    reviewsData: []
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
    setLocalLoading(true);
    setError('');
    
    try {
      switch (selectedReport) {
       case 'overview': {
  const [dashboardStats, visitorsStats, salesData] = await Promise.all([
    fetchDashboardData(selectedPeriod),        // /dashboard/stats
    fetchVisitorsStats(selectedPeriod),        // /dashboard/visitors  
    generateReport('sales', selectedPeriod)    // /dashboard/reports/sales
  ]);
  
  setReportData(prev => ({
    ...prev,
    overview: {
      totalOrders: dashboardStats?.totalOrders || 0,
      totalRevenue: dashboardStats?.totalRevenue || 0,
      totalVisitors: visitorsStats?.totalVisitors || dashboardStats?.uniqueVisitors || 0,
      totalReviews: dashboardStats?.totalReviews || 0,
      averageRating: dashboardStats?.averageRating || 0,
      conversionRate: dashboardStats?.conversionRate || 0
    },
    salesData: salesData?.salesData || []
  }));
  break;
}
        
        case 'sales': {
          const salesData = await generateReport('sales', selectedPeriod);
          setReportData(prev => ({
            ...prev,
            salesData: salesData?.salesData || []
          }));
          break;
        }
        
        case 'traffic': {
          const trafficData = await fetchVisitorsStats(selectedPeriod);
          setReportData(prev => ({
            ...prev,
            trafficData: {
              dailyData: trafficData?.dailyData || [],
              hourlyData: trafficData?.hourlyData || [],
              topPages: trafficData?.topPages || []
            }
          }));
          break;
        }
        
        case 'reviews': {
          const reviewsData = await fetchRatingsData({ status: 'approved', limit: 1000 });
          
          if (reviewsData?.reviews) {
            // Изчисляваме разпределението на рейтингите
            const distribution = [5, 4, 3, 2, 1].map(rating => {
              const count = reviewsData.reviews.filter(r => r.rating === rating).length;
              const percentage = reviewsData.reviews.length > 0 ? (count / reviewsData.reviews.length) * 100 : 0;
              return { rating, count, percentage };
            });
            
            setReportData(prev => ({
              ...prev,
              reviewsData: distribution
            }));
          } else {
            setReportData(prev => ({
              ...prev,
              reviewsData: []
            }));
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error loading report data:', error);
      setError('Грешка при зареждане на отчета: ' + error.message);
      
      // Reset data при грешка
      setReportData({
        overview: {
          totalOrders: 0,
          totalRevenue: 0,
          totalVisitors: 0,
          totalReviews: 0,
          averageRating: 0,
          conversionRate: 0
        },
        salesData: [],
        trafficData: {
          dailyData: [],
          hourlyData: [],
          topPages: []
        },
        reviewsData: []
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const generatePDF = async () => {
    const element = document.querySelector('.reports-content');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    // Добавяне на заглавие
    pdf.setFontSize(16);
    pdf.text(`Отчет: ${reportTypes.find(r => r.id === selectedReport)?.name}`, 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Период: ${periods.find(p => p.value === selectedPeriod)?.label}`, 20, 30);
    pdf.text(`Генериран на: ${new Date().toLocaleDateString('bg-BG')}`, 20, 40);
    
    position = 50;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    return pdf.output('blob');
  };

  const generateExcel = () => {
    const wb = XLSX.utils.book_new();
    
    switch (selectedReport) {
      case 'overview': {
        const overviewData = [
          ['Показател', 'Стойност'],
          ['Общо поръчки', reportData.overview.totalOrders],
          ['Общи приходи (лв)', reportData.overview.totalRevenue],
          ['Посетители', reportData.overview.totalVisitors],
          ['Общо отзиви', reportData.overview.totalReviews],
          ['Среден рейтинг', reportData.overview.averageRating],
          ['Конверсия (%)', reportData.overview.conversionRate]
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Общ преглед');
        
        if (reportData.salesData.length > 0) {
          const ws2 = XLSX.utils.json_to_sheet(reportData.salesData);
          XLSX.utils.book_append_sheet(wb, ws2, 'Продажби по месеци');
        }
        break;
      }
        
      case 'sales': {
        if (reportData.salesData.length > 0) {
          const ws3 = XLSX.utils.json_to_sheet(reportData.salesData);
          XLSX.utils.book_append_sheet(wb, ws3, 'Продажби');
        }
        break;
      }
        
      case 'traffic': {
        if (reportData.trafficData.dailyData.length > 0) {
          const ws4 = XLSX.utils.json_to_sheet(reportData.trafficData.dailyData);
          XLSX.utils.book_append_sheet(wb, ws4, 'Дневен трафик');
        }
        
        if (reportData.trafficData.topPages.length > 0) {
          const ws5 = XLSX.utils.json_to_sheet(reportData.trafficData.topPages);
          XLSX.utils.book_append_sheet(wb, ws5, 'Топ страници');
        }
        break;
      }
        
      case 'reviews': {
        if (reportData.reviewsData.length > 0) {
          const ws6 = XLSX.utils.json_to_sheet(reportData.reviewsData);
          XLSX.utils.book_append_sheet(wb, ws6, 'Отзиви');
        }
        break;
      }
    }
    
    return new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  };

  const generateCSV = () => {
    let csvContent = '';
    
    switch (selectedReport) {
      case 'sales':
        if (reportData.salesData.length > 0) {
          csvContent = 'Месец,Поръчки,Приходи (лв)\n';
          reportData.salesData.forEach(row => {
            csvContent += `${row.month},${row.orders},${row.revenue}\n`;
          });
        }
        break;
        
      case 'traffic':
        if (reportData.trafficData.dailyData.length > 0) {
          csvContent = 'Дата,Посетители,Уникални,Прегледи\n';
          reportData.trafficData.dailyData.forEach(row => {
            csvContent += `${row.date},${row.visitors},${row.unique},${row.pageViews}\n`;
          });
        }
        break;
        
      case 'reviews':
        if (reportData.reviewsData.length > 0) {
          csvContent = 'Рейтинг,Брой,Процент\n';
          reportData.reviewsData.forEach(row => {
            csvContent += `${row.rating},${row.count},${row.percentage.toFixed(1)}%\n`;
          });
        }
        break;
        
      default: // overview
        csvContent = 'Показател,Стойност\n';
        csvContent += `Общо поръчки,${reportData.overview.totalOrders}\n`;
        csvContent += `Общи приходи (лв),${reportData.overview.totalRevenue}\n`;
        csvContent += `Посетители,${reportData.overview.totalVisitors}\n`;
        csvContent += `Общо отзиви,${reportData.overview.totalReviews}\n`;
        csvContent += `Среден рейтинг,${reportData.overview.averageRating}\n`;
        csvContent += `Конверсия (%),${reportData.overview.conversionRate}\n`;
    }
    
    const BOM = '\uFEFF';
    return new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  };

  const handleExport = async (format) => {
    setIsGenerating(true);
    try {
      let blob;
      const fileName = `отчет-${selectedReport}-${selectedPeriod}`;
      const currentDate = new Date().toISOString().split('T')[0];
      
      switch (format) {
        case 'pdf':
          blob = await generatePDF();
          saveAs(blob, `${fileName}-${currentDate}.pdf`);
          break;
          
        case 'xlsx':
          blob = generateExcel();
          saveAs(blob, `${fileName}-${currentDate}.xlsx`);
          break;
          
        case 'csv':
          blob = generateCSV();
          saveAs(blob, `${fileName}-${currentDate}.csv`);
          break;
          
        default:
          throw new Error('Неподдържан формат');
      }
      
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Грешка при експортиране на отчета: ' + error.message);
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
            <span className="reports-kpi-change reports-kpi-change--neutral">За избрания период</span>
          </div>
        </div>

        <div className="reports-kpi-card">
          <div className="reports-kpi-icon">💰</div>
          <div className="reports-kpi-content">
            <h3>Общи приходи</h3>
            <p className="reports-kpi-value">{formatCurrency(reportData.overview.totalRevenue)}</p>
            <span className="reports-kpi-change reports-kpi-change--neutral">За избрания период</span>
          </div>
        </div>

        <div className="reports-kpi-card">
          <div className="reports-kpi-icon">👥</div>
          <div className="reports-kpi-content">
            <h3>Посетители</h3>
            <p className="reports-kpi-value">{reportData.overview.totalVisitors.toLocaleString()}</p>
            <span className="reports-kpi-change reports-kpi-change--neutral">За избрания период</span>
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
            <span className="reports-kpi-change reports-kpi-change--neutral">За избрания период</span>
          </div>
        </div>

        <div className="reports-kpi-card">
          <div className="reports-kpi-icon">📚</div>
          <div className="reports-kpi-content">
            <h3>Средна цена</h3>
            <p className="reports-kpi-value">
              {reportData.overview.totalOrders > 0 
                ? formatCurrency(reportData.overview.totalRevenue / reportData.overview.totalOrders)
                : '0 лв'
              }
            </p>
            <span className="reports-kpi-change reports-kpi-change--neutral">На поръчка</span>
          </div>
        </div>
      </div>

      {reportData.salesData.length > 0 && (
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

          {reportData.reviewsData.length > 0 && (
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
          )}
        </div>
      )}
    </div>
  );

  const renderSalesReport = () => (
    <div className="reports-sales">
      {reportData.salesData.length > 0 ? (
        <div className="reports-sales-summary">
          <div className="reports-summary-card">
            <h4>Продажби по месеци</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reportData.salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#667eea" name="Приходи" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="reports-sales-stats">
            <h4>Ключови показатели</h4>
            <div className="reports-stats-list">
              <div className="reports-stat-item">
                <span className="reports-stat-label">Общо месеци с данни:</span>
                <span className="reports-stat-value">{reportData.salesData.length}</span>
              </div>
              <div className="reports-stat-item">
                <span className="reports-stat-label">Общи поръчки:</span>
                <span className="reports-stat-value">{reportData.salesData.reduce((sum, item) => sum + item.orders, 0)}</span>
              </div>
              <div className="reports-stat-item">
                <span className="reports-stat-label">Общи приходи:</span>
                <span className="reports-stat-value">{formatCurrency(reportData.salesData.reduce((sum, item) => sum + item.revenue, 0))}</span>
              </div>
              <div className="reports-stat-item">
                <span className="reports-stat-label">Средно поръчки/месец:</span>
                <span className="reports-stat-value">
                  {reportData.salesData.length > 0 
                    ? Math.round(reportData.salesData.reduce((sum, item) => sum + item.orders, 0) / reportData.salesData.length)
                    : 0
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', color: '#6b7280' }}>
          <p>Няма данни за продажби за избрания период</p>
        </div>
      )}
    </div>
  );

  const renderTrafficReport = () => (
    <div className="reports-traffic">
      {reportData.trafficData.dailyData.length > 0 && (
        <div className="reports-traffic-chart">
          <h4>Трафик по дни</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.trafficData.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="visitors" stroke="#667eea" strokeWidth={2} name="Посетители" />
              <Line type="monotone" dataKey="pageViews" stroke="#10b981" strokeWidth={2} name="Прегледи" />
              <Line type="monotone" dataKey="unique" stroke="#f59e0b" strokeWidth={2} name="Уникални" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {reportData.trafficData.topPages.length > 0 && (
        <div className="reports-top-pages">
          <h4>Най-посещавани страници</h4>
          <div className="reports-pages-list">
            {reportData.trafficData.topPages.map((page, index) => (
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
      )}

      {reportData.trafficData.dailyData.length === 0 && reportData.trafficData.topPages.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#6b7280' }}>
          <p>Няма данни за трафик за избрания период</p>
        </div>
      )}
    </div>
  );

  const renderReviewsReport = () => (
    <div className="reports-reviews">
      {reportData.reviewsData.length > 0 ? (
        <div className="reports-reviews-overview">
          <div className="reports-review-card">
            <h4>Общ рейтинг</h4>
            <div className="reports-rating-display">
              <span className="reports-rating-number">
                {reportData.reviewsData.length > 0 
                  ? (reportData.reviewsData.reduce((sum, item) => sum + (item.rating * item.count), 0) / 
                     reportData.reviewsData.reduce((sum, item) => sum + item.count, 0)).toFixed(1)
                  : 0
                }
              </span>
              <span className="reports-rating-stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`reports-star ${i < Math.round(reportData.reviewsData.reduce((sum, item) => sum + (item.rating * item.count), 0) / reportData.reviewsData.reduce((sum, item) => sum + item.count, 0)) ? 'reports-star--filled' : ''}`}>★</span>
                ))}
              </span>
            </div>
            <p className="reports-rating-total">
              Базирано на {reportData.reviewsData.reduce((sum, item) => sum + item.count, 0)} отзива
            </p>
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
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', color: '#6b7280' }}>
          <p>Няма данни за отзиви за избрания период</p>
        </div>
      )}
    </div>
  );

  const renderSelectedReport = () => {
    if (localLoading) {
      return (
        <div className="reports-loading">
          <div className="reports-loading-spinner"></div>
          <p>Зареждане на отчета...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
          <button 
            onClick={loadReportData}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Опитай отново
          </button>
        </div>
      );
    }

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
        {renderSelectedReport()}
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