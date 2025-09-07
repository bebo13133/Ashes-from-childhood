/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import './OrdersManagement.css';
import { useAuthContext } from '../../contexts/userContext';

const OrdersManagement = () => {
  const { 
    fetchOrders, 
    updateOrderStatus, 
    deleteOrder, 
    sendEmailToCustomer,
    orders, 
    isLoading 
  } = useAuthContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock data - replace with real data
  const [ordersList, setOrdersList] = useState([
    {
      id: 'ORD-001',
      customerName: 'Мария Петрова',
      email: 'maria@example.com',
      phone: '+359 888 123 456',
      address: 'София, ул. Витоша 15',
      quantity: 2,
      totalPrice: 50,
      status: 'pending',
      createdAt: '2024-11-15T10:30:00Z',
      updatedAt: '2024-11-15T10:30:00Z'
    },
    {
      id: 'ORD-002',
      customerName: 'Иван Димитров',
      email: 'ivan@example.com',
      phone: '+359 887 654 321',
      address: 'Пловдив, бул. Руски 45',
      quantity: 1,
      totalPrice: 25,
      status: 'completed',
      createdAt: '2024-11-14T16:15:00Z',
      completedAt: '2024-11-16T14:20:00Z'
    },
    {
      id: 'ORD-003',
      customerName: 'Елена Георgiева',
      email: 'elena@example.com',
      phone: '+359 889 987 654',
      address: 'Варна, ул. Царевец 8',
      quantity: 3,
      totalPrice: 75,
      status: 'cancelled',
      createdAt: '2024-11-13T09:45:00Z'
    },
    {
      id: 'ORD-004',
      customerName: 'Петър Николов',
      email: 'petar@example.com',
      phone: '+359 876 543 210',
      address: 'Бургас, ул. Александровска 22',
      quantity: 1,
      totalPrice: 25,
      status: 'pending',
      createdAt: '2024-11-12T14:20:00Z'
    }
  ]);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, dateFilter]);

  const loadOrders = async () => {
    try {
      const filters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        dateFrom: getDateFilter(),
        search: searchTerm,
        page: currentPage,
        limit: ordersPerPage
      };
      
      // В реално приложение:
      // await fetchOrders(filters);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const getDateFilter = () => {
  const now = new Date();
  switch (dateFilter) {
    case 'today': {
      return now.toISOString().split('T')[0];
    }
    case 'week': {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return weekAgo.toISOString().split('T')[0];
    }
    case 'month': {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return monthAgo.toISOString().split('T')[0];
    }
    default: {
      return undefined;
    }
  }
};

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrdersList(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
            : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете тази поръчка?')) {
      try {
        await deleteOrder(orderId);
        setOrdersList(prev => prev.filter(order => order.id !== orderId));
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedOrders.length === 0) return;
    
    if (window.confirm(`Сигурни ли сте, че искате да ${action} ${selectedOrders.length} поръчки?`)) {
      try {
        for (const orderId of selectedOrders) {
          if (action === 'delete') {
            await deleteOrder(orderId);
          } else {
            await updateOrderStatus(orderId, action);
          }
        }
        
        if (action === 'delete') {
          setOrdersList(prev => prev.filter(order => !selectedOrders.includes(order.id)));
        } else {
          setOrdersList(prev => 
            prev.map(order => 
              selectedOrders.includes(order.id)
                ? { ...order, status: action, updatedAt: new Date().toISOString() }
                : order
            )
          );
        }
        
        setSelectedOrders([]);
      } catch (error) {
        console.error('Error with bulk action:', error);
      }
    }
  };

  const handleSendEmail = async (emailData) => {
    try {
      await sendEmailToCustomer({
        to: selectedOrder.email,
        subject: emailData.subject,
        message: emailData.message,
        type: 'order_update'
      });
      setShowEmailModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const filteredOrders = ordersList.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'В обработка';
      case 'completed': return 'Завършена';
      case 'cancelled': return 'Отказана';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('bg-BG');
  };

  return (
    <div className="OrdersManagement-orders-management">
      {/* Header */}
      <div className="OrdersManagement-orders-header">
        <div className="OrdersManagement-header-info">
          <h2 className="OrdersManagement-orders-title">Управление на поръчки</h2>
          <p className="OrdersManagement-orders-subtitle">
            Общо {sortedOrders.length} поръчки
          </p>
        </div>
        
        <div className="OrdersManagement-header-actions">
          <button 
            className="OrdersManagement-export-btn"
            onClick={() => window.print()}
          >
            📊 Експорт
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="OrdersManagement-orders-filters">
        <div className="OrdersManagement-search-box">
          <input
            type="text"
            placeholder="Търсене по име, имейл, телефон или номер..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="OrdersManagement-search-input"
          />
          <span className="OrdersManagement-search-icon">🔍</span>
        </div>

        <div className="OrdersManagement-filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="OrdersManagement-filter-select"
          >
            <option value="all">Всички статуси</option>
            <option value="pending">В обработка</option>
            <option value="completed">Завършени</option>
            <option value="cancelled">Отказани</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="OrdersManagement-filter-select"
          >
            <option value="all">Всички периоди</option>
            <option value="today">Днес</option>
            <option value="week">Последната седмица</option>
            <option value="month">Последният месец</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="OrdersManagement-filter-select"
          >
            <option value="createdAt-desc">Най-нови първо</option>
            <option value="createdAt-asc">Най-стари първо</option>
            <option value="customerName-asc">Име А-Я</option>
            <option value="customerName-desc">Име Я-А</option>
            <option value="totalPrice-desc">Най-висока цена</option>
            <option value="totalPrice-asc">Най-ниска цена</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="OrdersManagement-bulk-actions">
          <span className="OrdersManagement-selected-count">
            Избрани: {selectedOrders.length} поръчки
          </span>
          <div className="OrdersManagement-bulk-buttons">
            <button 
              className="OrdersManagement-bulk-btn OrdersManagement-completed"
              onClick={() => handleBulkAction('completed')}
            >
              Отбележи като завършени
            </button>
            <button 
              className="OrdersManagement-bulk-btn OrdersManagement-cancelled"
              onClick={() => handleBulkAction('cancelled')}
            >
              Отбележи като отказани
            </button>
            <button 
              className="OrdersManagement-bulk-btn OrdersManagement-delete"
              onClick={() => handleBulkAction('delete')}
            >
              Изтрий
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="OrdersManagement-orders-table-container">
        {isLoading ? (
          <div className="OrdersManagement-loading-state">
            <div className="OrdersManagement-loading-spinner"></div>
            <p>Зареждане на поръчки...</p>
          </div>
        ) : (
          <table className="OrdersManagement-orders-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(paginatedOrders.map(order => order.id));
                      } else {
                        setSelectedOrders([]);
                      }
                    }}
                  />
                </th>
                <th>Номер</th>
                <th>Клиент</th>
                <th>Контакти</th>
                <th>Количество</th>
                <th>Сума</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map(order => (
                <tr key={order.id} className="OrdersManagement-order-row">
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(prev => [...prev, order.id]);
                        } else {
                          setSelectedOrders(prev => prev.filter(id => id !== order.id));
                        }
                      }}
                    />
                  </td>
                  <td className="OrdersManagement-order-id">{order.id}</td>
                  <td>
                    <div className="OrdersManagement-customer-info">
                      <div className="OrdersManagement-customer-name">{order.customerName}</div>
                      <div className="OrdersManagement-customer-address">{order.address}</div>
                    </div>
                  </td>
                  <td>
                    <div className="OrdersManagement-contact-info">
                      <div className="OrdersManagement-email">{order.email}</div>
                      <div className="OrdersManagement-phone">{order.phone}</div>
                    </div>
                  </td>
                  <td className="OrdersManagement-quantity">{order.quantity}</td>
                  <td className="OrdersManagement-price">{order.totalPrice} лв</td>
                  <td>
                    <span 
                      className="OrdersManagement-status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="OrdersManagement-date">{formatDate(order.createdAt)}</td>
                  <td>
                    <div className="OrdersManagement-action-buttons">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="OrdersManagement-status-select"
                      >
                        <option value="pending">В обработка</option>
                        <option value="completed">Завършена</option>
                        <option value="cancelled">Отказана</option>
                      </select>
                      
                      <button
                        className="OrdersManagement-action-btn OrdersManagement-email-btn"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowEmailModal(true);
                        }}
                        title="Изпрати имейл"
                      >
                        📧
                      </button>
                      
                      <button
                        className="OrdersManagement-action-btn OrdersManagement-delete-btn"
                        onClick={() => handleDeleteOrder(order.id)}
                        title="Изтрий поръчка"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Cards Layout */}
      <div className="OrdersManagement-orders-cards">
        {paginatedOrders.map(order => (
          <div key={order.id} className="OrdersManagement-order-card">
            <div className="OrdersManagement-order-card-header">
              <div className="OrdersManagement-order-card-checkbox">
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOrders(prev => [...prev, order.id]);
                    } else {
                      setSelectedOrders(prev => prev.filter(id => id !== order.id));
                    }
                  }}
                />
              </div>
              <div className="OrdersManagement-order-card-id">{order.id}</div>
              <span 
                className="OrdersManagement-order-card-status"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {getStatusText(order.status)}
              </span>
            </div>
            
            <div className="OrdersManagement-order-card-customer">
              <div className="OrdersManagement-order-card-customer-name">{order.customerName}</div>
              <div className="OrdersManagement-order-card-contact">
                {order.email}<br />
                {order.phone}<br />
                {order.address}
              </div>
            </div>
            
            <div className="OrdersManagement-order-card-details">
              <div className="OrdersManagement-order-card-detail">
                <div className="OrdersManagement-order-card-detail-label">Количество:</div>
                <div className="OrdersManagement-order-card-detail-value">{order.quantity}</div>
              </div>
              <div className="OrdersManagement-order-card-detail">
                <div className="OrdersManagement-order-card-detail-label">Сума:</div>
                <div className="OrdersManagement-order-card-detail-value">{order.totalPrice} лв</div>
              </div>
              <div className="OrdersManagement-order-card-detail">
                <div className="OrdersManagement-order-card-detail-label">Дата:</div>
                <div className="OrdersManagement-order-card-detail-value">{formatDate(order.createdAt)}</div>
              </div>
            </div>
            
            <div className="OrdersManagement-order-card-actions">
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className="OrdersManagement-order-card-status-select"
              >
                <option value="pending">В обработка</option>
                <option value="completed">Завършена</option>
                <option value="cancelled">Отказана</option>
              </select>
              
              <button
                className="OrdersManagement-order-card-action-btn OrdersManagement-email-btn"
                onClick={() => {
                  setSelectedOrder(order);
                  setShowEmailModal(true);
                }}
                title="Изпрати имейл"
              >
                📧
              </button>
              
              <button
                className="OrdersManagement-order-card-action-btn OrdersManagement-delete-btn"
                onClick={() => handleDeleteOrder(order.id)}
                title="Изтрий поръчка"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="OrdersManagement-pagination">
          <button
            className="OrdersManagement-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ← Предишна
          </button>
          
          <div className="OrdersManagement-page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`OrdersManagement-page-number ${page === currentPage ? 'OrdersManagement-active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            className="OrdersManagement-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Следваща →
          </button>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedOrder && (
        <EmailModal
          order={selectedOrder}
          onSend={handleSendEmail}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

// Email Modal Component
const EmailModal = ({ order, onSend, onClose }) => {
  const [emailData, setEmailData] = useState({
    subject: `Относно вашата поръчка ${order.id}`,
    message: `Здравейте ${order.customerName},\n\nПишем ви относно вашата поръчка ${order.id} за книгата "Пепел от детството".\n\nПоздрави,\nЕкипът на...`
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(emailData);
  };

  return (
    <div className="OrdersManagement-modal-overlay">
      <div className="OrdersManagement-email-modal">
        <div className="OrdersManagement-modal-header">
          <h3>Изпрати имейл до {order.customerName}</h3>
          <button className="OrdersManagement-close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="OrdersManagement-email-form">
          <div className="OrdersManagement-form-group">
            <label>До:</label>
            <input type="email" value={order.email} readOnly />
          </div>
          
          <div className="OrdersManagement-form-group">
            <label>Тема:</label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              required
            />
          </div>
          
          <div className="OrdersManagement-form-group">
            <label>Съобщение:</label>
            <textarea
              rows={8}
              value={emailData.message}
              onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
              required
            />
          </div>
          
          <div className="OrdersManagement-modal-actions">
            <button type="button" className="OrdersManagement-cancel-btn" onClick={onClose}>
              Отказ
            </button>
            <button type="submit" className="OrdersManagement-send-btn">
              📧 Изпрати
            </button>
          </div>
        </form>
      </div>
      
    </div>
  );
};

export default OrdersManagement;