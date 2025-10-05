const { sendZohoEmailRaw } = require('./zohoEmails');
const emailConfig = require('../config/emailConfig');

async function sendEmail(type, data) {
    let htmlBody;
    let subject;
    let to;

    switch (type) {
        case 'reset':
            subject = 'Заявка за смяна на парола';
            to = data.email;
            htmlBody = generateResetEmailHTML(data);
            break;
        case 'personalTemplate':
            subject = data.subject;
            to = data.to;
            htmlBody = generatePersonalTemplateHTML(data.content);
            break;
        default:
            throw new Error(`Unknown email type: ${type}`);
    }

    const emailData = {
        fromAddress: emailConfig.email.fromAddress,
        toAddress: to,
        subject,
        content: htmlBody,
    };

    return sendZohoEmailRaw(emailData);
}

function generatePersonalTemplateHTML(content) {
    const htmlContent = content.replace(/\n/g, '<br>');

    return `
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background: white; color: #1f2937;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <!-- Header -->
                    <div style="
                        background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
                        border-radius: 16px 16px 0 0;
                        padding: 24px;
                        text-align: center;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    ">
                        <div style="
                            background: rgba(255, 255, 255, 0.2);
                            border-radius: 50%;
                            width: 80px;
                            height: 80px;
                            margin: 0 auto 16px;
                            text-align: center;
                            line-height: 80px;
                            backdrop-filter: blur(10px);
                        ">
                            <span style="font-size: 2.5rem; vertical-align: middle;">📢</span>
                        </div>
                        <h1 style="
                            color: white;
                            font-size: 1.8rem;
                            font-weight: 700;
                            margin: 0 0 8px 0;
                            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        ">
                            Съобщение
                        </h1>
                    </div>

                    <!-- Content Card -->
                    <div style="
                        background: white;
                        border-radius: 0 0 16px 16px;
                        padding: 32px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                        border-top: 1px solid rgba(255, 255, 255, 0.2);
                    ">
                        <!-- Main Content -->
                        <div style="
                            color: #374151;
                            font-size: 1.1rem;
                            line-height: 1.6;
                            text-align: center;
                        ">
                            ${htmlContent}
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `;
}

function generateResetEmailHTML(data) {
    const resetLink = `${emailConfig.email.frontendUrl}/reset-password?token=${data.resetToken}`;
    return `
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); color: #1f2937;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <!-- Header with Admin Panel Styling -->
                    <div style="
                        background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
                        border-radius: 16px 16px 0 0;
                        padding: 24px;
                        text-align: center;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    ">
                        <div style="
                            background: rgba(255, 255, 255, 0.2);
                            border-radius: 50%;
                            width: 80px;
                            height: 80px;
                            margin: 0 auto 16px;
                            text-align: center;
                            line-height: 80px;
                            backdrop-filter: blur(10px);
                        ">
                            <span style="font-size: 2.5rem; vertical-align: middle;">🔐</span>
                        </div>
                        <h1 style="
                            color: white;
                            font-size: 1.8rem;
                            font-weight: 700;
                            margin: 0 0 8px 0;
                            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        ">
                            Смяна на парола
                        </h1>
                    </div>

                    <!-- Content Card -->
                    <div style="
                        background: white;
                        border-radius: 0 0 16px 16px;
                        padding: 32px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                        border-top: 1px solid rgba(255, 255, 255, 0.2);
                    ">
                        <!-- Main Message -->
                        <p style="
                            color: #374151;
                            font-size: 1.1rem;
                            line-height: 1.6;
                            margin-bottom: 24px;
                            text-align: center;
                        ">
                            Кликнете на бутона по-долу, за да създадете нова парола:
                        </p>

                        <!-- Security Notice -->
                        <div style="
                            background: linear-gradient(135deg, #fef2f2 0%, #fef7f7 100%);
                            border: 1px solid #fecaca;
                            border-radius: 12px;
                            padding: 16px;
                            margin: 24px 0;
                        ">
                            <table cellpadding="0" cellspacing="0" style="margin-bottom: 8px;">
                                <tr>
                                    <td width="28" style="
                                        background: #ef4444;
                                        color: white;
                                        width: 28px;
                                        height: 28px;
                                        border-radius: 50%;
                                        text-align: center;
                                        vertical-align: middle;
                                    ">
                                        <span style="font-size: 1rem; line-height: 0.8; display: block; margin-top: -3px;">⚠️</span>
                                    </td>
                                    <td style="
                                        padding-left: 6px;
                                        vertical-align: middle;
                                    ">
                                        <h3 style="
                                            color: #dc2626;
                                            font-size: 0.95rem;
                                            font-weight: 600;
                                            margin: 0;
                                        ">
                                            Важно
                                        </h3>
                                    </td>
                                </tr>
                            </table>
                            <ul style="
                                color: #374151;
                                font-size: 0.9rem;
                                line-height: 1.5;
                                margin: 0;
                                padding-left: 20px;
                            ">
                                <li>Този линк е валиден само <strong>15 минути</strong></li>
                                <li>Вашата текуща парола остава активна до успешното създаване на нова</li>
                            </ul>
                        </div>

                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${resetLink}" style="
                                background: linear-gradient(135deg, #667eea, #764ba2);
                                color: white;
                                padding: 16px 32px;
                                text-decoration: none;
                                border-radius: 12px;
                                font-weight: 600;
                                font-size: 1rem;
                                display: inline-block;
                                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                                transition: all 0.2s ease;
                            ">
                                🔐   Смяна на парола
                            </a>
                        </div>

                        <!-- Alternative Link -->
                        <div style="
                            background: #f9fafb;
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                            padding: 16px;
                            margin-top: 24px;
                        ">
                            <p style="
                                color: #6b7280;
                                font-size: 0.85rem;
                                margin: 0 0 8px 0;
                                font-weight: 500;
                            ">
                                Ако имате проблеми с бутона, копирайте и поставете следния адрес:
                            </p>
                            <p style="
                                color: #374151;
                                font-size: 0.8rem;
                                margin: 0;
                                word-break: break-all;
                                background: white;
                                padding: 8px 12px;
                                border-radius: 6px;
                                border: 1px solid #e5e7eb;
                                font-family: 'Courier New', monospace;
                            ">
                                ${resetLink}
                            </p>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `;
}

module.exports = {
    sendEmail,
};
