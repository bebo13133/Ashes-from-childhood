const getDateRange = (period) => {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date(now);

    switch (period) {
        case '1d':
            startDate.setDate(now.getDate() - 1);
            break;
        case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
        case '30d':
            startDate.setTime(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '1y':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            startDate.setTime(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    startDate.setHours(0, 0, 0, 0);

    const formatDateForGA = (date) => {
        return date.toISOString().split('T')[0];
    };

    return {
        startDate: startDate,
        endDate: endDate,
        startDateGA: formatDateForGA(startDate),
        endDateGA: formatDateForGA(endDate),
    };
};

module.exports = getDateRange;
