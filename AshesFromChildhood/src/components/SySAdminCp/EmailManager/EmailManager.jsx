import { useState, useEffect } from 'react';
import './EmailManager.css';
import { useAuthContext } from '../../contexts/userContext';

const EmailManager = () => {
    const { sendEmailToCustomer, isLoading, getEmailTemplates, updateEmailTemplate } = useAuthContext();

    const [activeTab, setActiveTab] = useState('send');
    const [emailData, setEmailData] = useState({
        to: '',
        subject: '',
        message: '',
    });

    // Template management state
    const [templates, setTemplates] = useState([]);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateForm, setTemplateForm] = useState({
        name: '',
        subject: '',
        content: '',
    });

    // Placeholder buttons for easy template editing
    const placeholders = [
        { label: 'Име на клиент', value: '[Име на клиент]' },
        { label: 'Номер на поръчка', value: '[Номер на поръчка]' },
        { label: 'Количество', value: '[Количество]' },
        { label: 'Брой поръчки', value: '[Брой поръчки]' },
        { label: 'Обща цена', value: '[Обща цена]' },
        { label: 'Дата на поръчка', value: '[Дата на поръчка]' },
        { label: 'Адрес', value: '[Адрес]' },
        { label: 'Град', value: '[Град]' },
        { label: 'Телефон', value: '[Телефон]' },
        { label: 'Имейл', value: '[Имейл]' },
        { label: 'Рейтинг', value: '[Рейтинг]' },
        { label: 'Отзив', value: '[Отзив]' },
    ];

    // Load templates from backend (we'll implement this)
    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const templates = await getEmailTemplates();
            setTemplates(templates);
        } catch (error) {
            console.error('Error loading templates:', error);
            alert('Грешка при зареждане на шаблоните!');
        }
    };

    const handleSingleEmailSubmit = async (e) => {
        e.preventDefault();
        try {
            await sendEmailToCustomer(emailData);
            setEmailData({ to: '', subject: '', message: '' });
            alert('Имейлът е изпратен успешно!');
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Грешка при изпращане на имейла!');
        }
    };

    // Template management functions
    const startEditingTemplate = (template) => {
        setEditingTemplate(template);
        setTemplateForm({
            name: template.name,
            subject: template.subject,
            content: template.content,
        });
    };

    const cancelEditingTemplate = () => {
        setEditingTemplate(null);
        setTemplateForm({ name: '', subject: '', content: '' });
    };

    const saveTemplate = async () => {
        try {
            const updatedTemplate = await updateEmailTemplate(editingTemplate.id, {
                name: templateForm.name,
                subject: templateForm.subject,
                content: templateForm.content,
            });

            setTemplates((prev) => prev.map((t) => (t.id === editingTemplate.id ? updatedTemplate : t)));
            cancelEditingTemplate();
        } catch (error) {
            console.error('Error saving template:', error);
        }
    };

    const insertPlaceholder = (placeholder, field) => {
        const textarea = document.querySelector(`textarea[name="${field}"]`);
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const currentValue = templateForm[field];
            const newValue = currentValue.substring(0, start) + placeholder + currentValue.substring(end);

            setTemplateForm((prev) => ({
                ...prev,
                [field]: newValue,
            }));

            // Set cursor position after the inserted placeholder
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
            }, 0);
        }
    };

    const handleTemplateSelect = (templateId) => {
        const template = templates.find((t) => t.id === templateId);
        if (template) {
            setEmailData((prev) => ({
                ...prev,
                subject: template.subject,
                message: template.content,
            }));
        }
    };

    return (
        <div className='email-manager-container'>
            {/* Header */}
            <div className='email-manager-header'>
                <div className='email-manager-header-info'>
                    <h2 className='email-manager-title'>Управление на имейли</h2>
                    <p className='email-manager-subtitle'>Изпращане на имейли до клиенти и управление на шаблони</p>
                </div>
            </div>

            {/* Main Content Tabs */}
            <div className='email-manager-tabs'>
                <div className='email-manager-tab-nav'>
                    <button
                        className={`email-manager-tab-btn ${activeTab === 'send' ? 'email-manager-tab-btn--active' : ''}`}
                        onClick={() => setActiveTab('send')}
                    >
                        📧 Единичен имейл
                    </button>
                    <button
                        className={`email-manager-tab-btn ${activeTab === 'templates' ? 'email-manager-tab-btn--active' : ''}`}
                        onClick={() => setActiveTab('templates')}
                    >
                        📝 Шаблони
                    </button>
                </div>

                <div className='email-manager-tab-content'>
                    {/* Single Email Tab */}
                    {activeTab === 'send' && (
                        <div className='email-manager-single-email'>
                            <div className='email-manager-form-section'>
                                <h3>Изпрати имейл до клиент</h3>
                                <p className='email-manager-form-desc'>
                                    Изпратете персонализиран имейл до конкретен клиент (например потвърждение на поръчка, благодарност за отзив и др.)
                                </p>

                                <form onSubmit={handleSingleEmailSubmit} className='email-manager-email-form'>
                                    <div className='email-manager-form-group'>
                                        <label>До (имейл адрес):</label>
                                        <input
                                            type='email'
                                            value={emailData.to}
                                            onChange={(e) => setEmailData((prev) => ({ ...prev, to: e.target.value }))}
                                            placeholder='customer@example.com'
                                            required
                                        />
                                    </div>

                                    <div className='email-manager-form-group'>
                                        <label>Тема:</label>
                                        <input
                                            type='text'
                                            value={emailData.subject}
                                            onChange={(e) => setEmailData((prev) => ({ ...prev, subject: e.target.value }))}
                                            placeholder='Тема на имейла...'
                                            required
                                        />
                                    </div>

                                    <div className='email-manager-form-group'>
                                        <label>Съобщение:</label>
                                        <textarea
                                            rows={12}
                                            value={emailData.message}
                                            onChange={(e) => setEmailData((prev) => ({ ...prev, message: e.target.value }))}
                                            placeholder='Въведете съобщението...'
                                            required
                                        />
                                    </div>

                                    <button
                                        type='submit'
                                        className={`email-manager-submit-btn ${isLoading ? 'email-manager-submit-btn--loading' : ''}`}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Изпращане...' : '📧 Изпрати имейл'}
                                    </button>
                                </form>
                            </div>

                            <div className='email-manager-templates-sidebar'>
                                <h4>Готови шаблони</h4>
                                <p className='email-manager-sidebar-desc'>Кликнете върху шаблон, за да го заредите във формата</p>
                                <div className='email-manager-template-list'>
                                    {templates.map((template) => (
                                        <div key={template.id} className='email-manager-template-item' onClick={() => handleTemplateSelect(template.id)}>
                                            <h5>{template.name}</h5>
                                            <p>{template.subject}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Templates Tab */}
                    {activeTab === 'templates' && (
                        <div className='email-manager-templates'>
                            <div className='email-manager-templates-header'>
                                <h3>Управление на шаблони</h3>
                                <p className='email-manager-templates-desc'>
                                    Редактирайте и управлявайте шаблоните за имейли. Използвайте бутоните отдолу за лесно вмъкване на данни от поръчки и отзиви.
                                </p>
                            </div>

                            {editingTemplate ? (
                                // Template Editor
                                <div className='email-manager-template-editor'>
                                    <div className='email-manager-editor-header'>
                                        <h4>Редактиране на шаблон: {editingTemplate.name}</h4>
                                        <div className='email-manager-editor-actions'>
                                            <button className='email-manager-save-btn' onClick={saveTemplate}>
                                                💾 Запази
                                            </button>
                                            <button className='email-manager-cancel-btn' onClick={cancelEditingTemplate}>
                                                ❌ Отказ
                                            </button>
                                        </div>
                                    </div>

                                    <div className='email-manager-editor-content'>
                                        <div className='email-manager-form-group'>
                                            <label>Име на шаблона:</label>
                                            <input
                                                type='text'
                                                value={templateForm.name}
                                                onChange={(e) => setTemplateForm((prev) => ({ ...prev, name: e.target.value }))}
                                                placeholder='Име на шаблона...'
                                            />
                                        </div>

                                        <div className='email-manager-form-group'>
                                            <label>Тема на имейла:</label>
                                            <input
                                                type='text'
                                                value={templateForm.subject}
                                                onChange={(e) => setTemplateForm((prev) => ({ ...prev, subject: e.target.value }))}
                                                placeholder='Тема на имейла...'
                                            />
                                        </div>

                                        <div className='email-manager-form-group'>
                                            <label>Съдържание на имейла:</label>
                                            <div className='email-manager-field-with-placeholders'>
                                                <textarea
                                                    name='content'
                                                    rows={15}
                                                    value={templateForm.content}
                                                    onChange={(e) => setTemplateForm((prev) => ({ ...prev, content: e.target.value }))}
                                                    placeholder='Съдържание на имейла...'
                                                />
                                                <div className='email-manager-placeholder-buttons'>
                                                    <small>Кликнете за вмъкване:</small>
                                                    <div className='email-manager-placeholder-grid'>
                                                        {placeholders.map((placeholder, index) => (
                                                            <button
                                                                key={index}
                                                                type='button'
                                                                className='email-manager-placeholder-btn'
                                                                onClick={() => insertPlaceholder(placeholder.value, 'content')}
                                                                title={placeholder.label}
                                                            >
                                                                {placeholder.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info note about dynamic fields */}
                                            <div className='email-manager-info-note'>
                                                <div className='email-manager-info-icon'>⚠️</div>
                                                <div className='email-manager-info-content'>
                                                    <strong>Динамични полета:</strong> Използвайте бутоните горе за вмъкване на placeholder-и, които автоматично
                                                    ще се попълнят с данни от базата данни (име на клиент, номер на поръчка, цена и др.) при изпращане на
                                                    имейла.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Template List
                                <div className='email-manager-templates-grid'>
                                    {templates.map((template) => (
                                        <div key={template.id} className='email-manager-template-card'>
                                            <div className='email-manager-template-header'>
                                                <h4>{template.name}</h4>
                                            </div>
                                            <div className='email-manager-template-content'>
                                                <p className='email-manager-template-subject'>
                                                    <strong>Тема:</strong> {template.subject}
                                                </p>
                                                <div className='email-manager-template-preview'>
                                                    <strong>Съдържание:</strong>
                                                    <pre>{template.content.substring(0, 200)}...</pre>
                                                </div>
                                            </div>
                                            <div className='email-manager-template-footer'>
                                                <button
                                                    className='email-manager-use-template-btn'
                                                    onClick={() => {
                                                        setActiveTab('send');
                                                        handleTemplateSelect(template.id);
                                                    }}
                                                >
                                                    📧 Използвай
                                                </button>
                                                <button className='email-manager-edit-template-btn' onClick={() => startEditingTemplate(template)}>
                                                    ✏️ Редактирай
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailManager;
