/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import './OrdersManagement.css';
import { useAuthContext } from '../../contexts/userContext';

const OrdersManagement = () => {
    const { fetchOrders, updateOrderStatus, deleteOrder, sendEmailToCustomer, isLoading, setSelectedOrder } = useAuthContext();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(10);
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState('');

    // Real API data state
    const [ordersList, setOrdersList] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        loadOrders();
    }, [statusFilter, dateFilter, currentPage, searchTerm]);

    const loadOrders = async () => {
        setLocalLoading(true);
        setError('');

        try {
            const filters = {
                search: searchTerm || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                dateFrom: getDateFilter(),
                page: currentPage,
                limit: ordersPerPage,
            };

            const response = await fetchOrders(filters);

            if (response && response.orders) {
                const normalizedOrders = response.orders.map((order) => ({
                    id: order.id,
                    customerName: order.customerName,
                    email: order.email,
                    phone: order.phone,
                    address: `${order.address}, ${order.city}`,
                    quantity: order.quantity,
                    totalPrice: order.totalPrice,
                    status: order.status,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt,
                    completedAt: order.completedAt,
                }));

                setOrdersList(normalizedOrders);
                setTotalOrders(response.pagination?.total || response.totalOrders || normalizedOrders.length);
                setTotalPages(response.pagination?.totalPages || Math.ceil((response.pagination?.total || normalizedOrders.length) / ordersPerPage));
            } else {
                setOrdersList([]);
                setTotalOrders(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            setError('Грешка при зареждане на поръчките');
            setOrdersList([]);
            setTotalOrders(0);
            setTotalPages(0);
        } finally {
            setLocalLoading(false);
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

            setOrdersList((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order)));
        } catch (error) {
            console.error('Error updating order status:', error);
            setError('Грешка при обновяване на статуса');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('Сигурни ли сте, че искате да изтриете тази поръчка?')) {
            try {
                await deleteOrder(orderId);

                // Премахваме от локалното състояние
                setOrdersList((prev) => prev.filter((order) => order.id !== orderId));
                setTotalOrders((prev) => prev - 1);

                // Презареждаме данните ако страницата остане празна
                if (ordersList.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } catch (error) {
                console.error('Error deleting order:', error);
                setError('Грешка при изтриване на поръчката');
            }
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedOrders.length === 0) return;

        const actionText = action === 'delete' ? 'изтриете' : action === 'completed' ? 'отбележите като завършени' : 'отбележите като отказани';

        if (window.confirm(`Сигурни ли сте, че искате да ${actionText} ${selectedOrders.length} поръчки?`)) {
            try {
                setLocalLoading(true);

                for (const orderId of selectedOrders) {
                    if (action === 'delete') {
                        await deleteOrder(orderId);
                    } else {
                        await updateOrderStatus(orderId, action);
                    }
                }

                if (action === 'delete') {
                    setOrdersList((prev) => prev.filter((order) => !selectedOrders.includes(order.id)));
                    setTotalOrders((prev) => prev - selectedOrders.length);
                } else {
                    setOrdersList((prev) =>
                        prev.map((order) => (selectedOrders.includes(order.id) ? { ...order, status: action, updatedAt: new Date().toISOString() } : order))
                    );
                }

                setSelectedOrders([]);
            } catch (error) {
                console.error('Error with bulk action:', error);
                setError('Грешка при масовото действие');
            } finally {
                setLocalLoading(false);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#f59e0b';
            case 'completed':
                return '#10b981';
            case 'cancelled':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'В обработка';
            case 'completed':
                return 'Завършена';
            case 'cancelled':
                return 'Отказана';
            default:
                return status;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Неизвестна дата';
        try {
            return new Date(dateString).toLocaleString('bg-BG');
        } catch (error) {
            return dateString;
        }
    };

    return (
        <div className='OrdersManagement-orders-management'>
            {/* Header */}
            <div className='OrdersManagement-orders-header'>
                <div className='OrdersManagement-header-info'>
                    <h2 className='OrdersManagement-orders-title'>Управление на поръчки</h2>
                    <p className='OrdersManagement-orders-subtitle'>{localLoading ? 'Зареждане...' : `Общо ${totalOrders} поръчки`}</p>
                </div>

                <div className='OrdersManagement-header-actions'>
                    <button className='OrdersManagement-refresh-btn' onClick={loadOrders} disabled={localLoading}>
                        🔄 Обнови
                    </button>
                    <button className='OrdersManagement-export-btn' onClick={() => window.print()}>
                        📊 Експорт
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div
                    className='OrdersManagement-error-message'
                    style={{
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        padding: '10px',
                        borderRadius: '6px',
                        margin: '10px 0',
                    }}
                >
                    {error}
                    <button
                        onClick={() => setError('')}
                        style={{
                            marginLeft: '10px',
                            background: 'transparent',
                            color: '#dc2626',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '18px',
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className='OrdersManagement-orders-filters'>
                <div className='OrdersManagement-search-box'>
                    <input
                        type='text'
                        placeholder='Търсене по име, имейл, телефон или номер...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='OrdersManagement-search-input'
                    />
                    <span className='OrdersManagement-search-icon'>🔍</span>
                </div>

                <div className='OrdersManagement-filter-group'>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className='OrdersManagement-filter-select'>
                        <option value='all'>Всички статуси</option>
                        <option value='pending'>В обработка</option>
                        <option value='completed'>Завършени</option>
                        <option value='cancelled'>Отказани</option>
                    </select>

                    <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className='OrdersManagement-filter-select'>
                        <option value='all'>Всички периоди</option>
                        <option value='today'>Днес</option>
                        <option value='week'>Последната седмица</option>
                        <option value='month'>Последният месец</option>
                    </select>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedOrders.length > 0 && (
                <div className='OrdersManagement-bulk-actions'>
                    <span className='OrdersManagement-selected-count'>Избрани: {selectedOrders.length} поръчки</span>
                    <div className='OrdersManagement-bulk-buttons'>
                        <button
                            className='OrdersManagement-bulk-btn OrdersManagement-completed'
                            onClick={() => handleBulkAction('completed')}
                            disabled={localLoading}
                        >
                            Отбележи като завършени
                        </button>
                        <button
                            className='OrdersManagement-bulk-btn OrdersManagement-cancelled'
                            onClick={() => handleBulkAction('cancelled')}
                            disabled={localLoading}
                        >
                            Отбележи като отказани
                        </button>
                        <button
                            className='OrdersManagement-bulk-btn OrdersManagement-delete'
                            onClick={() => handleBulkAction('delete')}
                            disabled={localLoading}
                        >
                            Изтрий
                        </button>
                    </div>
                </div>
            )}

            {/* Orders Table */}
            <div className='OrdersManagement-orders-table-container'>
                {isLoading || localLoading ? (
                    <div className='OrdersManagement-loading-state'>
                        <div className='OrdersManagement-loading-spinner'></div>
                        <p>Зареждане на поръчки...</p>
                    </div>
                ) : ordersList.length === 0 ? (
                    <div
                        className='OrdersManagement-empty-state'
                        style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#6b7280',
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                        <h3>Няма намерени поръчки</h3>
                        <p>
                            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                                ? 'Опитайте с други филтри или критерии за търсене'
                                : 'Все още няма поръчки в системата'}
                        </p>
                    </div>
                ) : (
                    <table className='OrdersManagement-orders-table'>
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type='checkbox'
                                        checked={selectedOrders.length === ordersList.length && ordersList.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedOrders(ordersList.map((order) => order.id));
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
                            {ordersList.map((order) => (
                                <tr key={order.id} className='OrdersManagement-order-row'>
                                    <td>
                                        <input
                                            type='checkbox'
                                            checked={selectedOrders.includes(order.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedOrders((prev) => [...prev, order.id]);
                                                } else {
                                                    setSelectedOrders((prev) => prev.filter((id) => id !== order.id));
                                                }
                                            }}
                                        />
                                    </td>
                                    <td className='OrdersManagement-order-id'>{order.id}</td>
                                    <td>
                                        <div className='OrdersManagement-customer-info'>
                                            <div className='OrdersManagement-customer-name'>{order.customerName}</div>
                                            <div className='OrdersManagement-customer-address'>{order.address}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='OrdersManagement-contact-info'>
                                            <div className='OrdersManagement-email'>{order.email}</div>
                                            <div className='OrdersManagement-phone'>{order.phone}</div>
                                        </div>
                                    </td>
                                    <td className='OrdersManagement-quantity'>{order.quantity}</td>
                                    <td className='OrdersManagement-price'>{order.totalPrice} лв</td>
                                    <td>
                                        <span
                                            className='OrdersManagement-status-badge'
                                            style={{
                                                backgroundColor: getStatusColor(order.status),
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                            }}
                                        >
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td className='OrdersManagement-date'>{formatDate(order.createdAt)}</td>
                                    <td>
                                        <div className='OrdersManagement-action-buttons'>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className='OrdersManagement-status-select'
                                                disabled={localLoading}
                                            >
                                                <option value='pending'>В обработка</option>
                                                <option value='completed'>Завършена</option>
                                                <option value='cancelled'>Отказана</option>
                                            </select>

                                            <button
                                                className='OrdersManagement-action-btn OrdersManagement-email-btn'
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    window.dispatchEvent(new CustomEvent('navigateToEmail'));
                                                }}
                                                title='Изпрати имейл'
                                                disabled={localLoading}
                                            >
                                                📧
                                            </button>

                                            <button
                                                className='OrdersManagement-action-btn OrdersManagement-delete-btn'
                                                onClick={() => handleDeleteOrder(order.id)}
                                                title='Изтрий поръчка'
                                                disabled={localLoading}
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
            <div className='OrdersManagement-orders-cards'>
                {ordersList.map((order) => (
                    <div key={order.id} className='OrdersManagement-order-card'>
                        <div className='OrdersManagement-order-card-header'>
                            <div className='OrdersManagement-order-card-checkbox'>
                                <input
                                    type='checkbox'
                                    checked={selectedOrders.includes(order.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedOrders((prev) => [...prev, order.id]);
                                        } else {
                                            setSelectedOrders((prev) => prev.filter((id) => id !== order.id));
                                        }
                                    }}
                                />
                            </div>
                            <div className='OrdersManagement-order-card-id'>{order.id}</div>
                            <span
                                className='OrdersManagement-order-card-status'
                                style={{
                                    backgroundColor: getStatusColor(order.status),
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                }}
                            >
                                {getStatusText(order.status)}
                            </span>
                        </div>

                        <div className='OrdersManagement-order-card-customer'>
                            <div className='OrdersManagement-order-card-customer-name'>{order.customerName}</div>
                            <div className='OrdersManagement-order-card-contact'>
                                {order.email}
                                <br />
                                {order.phone}
                                <br />
                                {order.address}
                            </div>
                        </div>

                        <div className='OrdersManagement-order-card-details'>
                            <div className='OrdersManagement-order-card-detail'>
                                <div className='OrdersManagement-order-card-detail-label'>Количество:</div>
                                <div className='OrdersManagement-order-card-detail-value'>{order.quantity}</div>
                            </div>
                            <div className='OrdersManagement-order-card-detail'>
                                <div className='OrdersManagement-order-card-detail-label'>Сума:</div>
                                <div className='OrdersManagement-order-card-detail-value'>{order.totalPrice} лв</div>
                            </div>
                            <div className='OrdersManagement-order-card-detail'>
                                <div className='OrdersManagement-order-card-detail-label'>Дата:</div>
                                <div className='OrdersManagement-order-card-detail-value'>{formatDate(order.createdAt)}</div>
                            </div>
                        </div>

                        <div className='OrdersManagement-order-card-actions'>
                            <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className='OrdersManagement-order-card-status-select'
                                disabled={localLoading}
                            >
                                <option value='pending'>В обработка</option>
                                <option value='completed'>Завършена</option>
                                <option value='cancelled'>Отказана</option>
                            </select>

                            <button
                                className='OrdersManagement-order-card-action-btn OrdersManagement-email-btn'
                                onClick={() => {
                                    setSelectedOrder(order);
                                    window.dispatchEvent(new CustomEvent('navigateToEmail'));
                                }}
                                title='Изпрати имейл'
                                disabled={localLoading}
                            >
                                📧
                            </button>

                            <button
                                className='OrdersManagement-order-card-action-btn OrdersManagement-delete-btn'
                                onClick={() => handleDeleteOrder(order.id)}
                                title='Изтрий поръчка'
                                disabled={localLoading}
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className='OrdersManagement-pagination'>
                    <button className='OrdersManagement-page-btn' disabled={currentPage === 1 || localLoading} onClick={() => setCurrentPage(currentPage - 1)}>
                        ← Предишна
                    </button>

                    <div className='OrdersManagement-page-numbers'>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let page;
                            if (totalPages <= 5) {
                                page = i + 1;
                            } else if (currentPage <= 3) {
                                page = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                page = totalPages - 4 + i;
                            } else {
                                page = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={page}
                                    className={`OrdersManagement-page-number ${page === currentPage ? 'OrdersManagement-active' : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                    disabled={localLoading}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        className='OrdersManagement-page-btn'
                        disabled={currentPage === totalPages || localLoading}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Следваща →
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrdersManagement;
