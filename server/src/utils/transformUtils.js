const transformOrderData = (order) => {
    const orderData = order.toJSON();
    return {
        orderNumber: orderData.orderNumber,
        customerName: orderData.customerName,
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.address,
        city: orderData.city,
        quantity: orderData.quantity,
        bookTitle: orderData.bookTitle,
        paymentMethod: orderData.paymentMethod,
        orderDate: orderData.orderDate,
        status: orderData.status,
        completedAt: orderData.completedAt,
        createdAt: orderData.createdAt,
        updatedAt: orderData.updatedAt,
        totalPrice: order.totalPrice,
    };
};

const transformOrdersData = (orders) => {
    return orders.map(transformOrderData);
};

module.exports = {
    transformOrderData,
    transformOrdersData,
};
