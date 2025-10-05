export const emailTemplates = {
    orderConfirmation: {
        id: 'order-confirmation',
        name: 'Потвърждение на поръчка',
        subject: 'Потвърждение на вашата поръчка',
        content: `Здравейте [Име на клиент],

Благодарим ви за поръчката!

Детайли за поръчката:
- Номер на поръчка: [Номер на поръчка]
- Количество: [Количество] бр.
- Обща сума: [Обща цена] лв
- Дата на поръчка: [Дата на поръчка]
- Адрес за доставка: [Адрес], [Град]
- Телефон: [Телефон]
- Начин на плащане: Наложен платеж (Econt/Speedy)

Вашата поръчка ще бъде обработена през следващите 24 часа и ще получите книгата в рамките на 2-3 работни дни.

Благодарим за доверието!

С уважение,
Авторът`,
    },
};

export const populateOrderTemplate = (order) => {
    const template = emailTemplates.orderConfirmation;

    let populatedContent = template.content;
    let populatedSubject = template.subject;

    populatedContent = populatedContent
        .replace(/\[Име на клиент\]/g, order.customerName || 'Няма данни')
        .replace(/\[Номер на поръчка\]/g, order.id?.toString() || 'Няма данни')
        .replace(/\[Количество\]/g, order.quantity?.toString() || 'Няма данни')
        .replace(/\[Обща цена\]/g, order.totalPrice?.toString() || 'Няма данни')
        .replace(/\[Дата на поръчка\]/g, order.createdAt ? new Date(order.createdAt).toLocaleDateString('bg-BG') : 'Няма данни')
        .replace(/\[Адрес\]/g, order.address?.split(',')[0] || 'Няма данни')
        .replace(/\[Град\]/g, order.address?.split(',')[1]?.trim() || 'Няма данни')
        .replace(/\[Телефон\]/g, order.phone || 'Няма данни')
        .replace(/\[Имейл\]/g, order.email || 'Няма данни');

    return {
        to: order.email,
        subject: populatedSubject,
        message: populatedContent,
        templateId: template.id,
        templateName: template.name,
    };
};

export const getTemplateById = (templateId) => {
    switch (templateId) {
        case 'order-confirmation':
            return emailTemplates.orderConfirmation;
        default:
            return null;
    }
};

export const getAvailableTemplateIds = () => {
    return Object.keys(emailTemplates).map((key) => emailTemplates[key].id);
};

export const getAllTemplates = () => {
    return Object.values(emailTemplates);
};
