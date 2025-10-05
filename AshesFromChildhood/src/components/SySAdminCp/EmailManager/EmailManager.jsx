import { useState, useEffect } from 'react';
import './EmailManager.css';
import { useAuthContext } from '../../contexts/userContext';
import { populateOrderTemplate } from '../../../utils/emailTemplates';

const EmailManager = () => {
    const { sendEmailToCustomer, isLoading, selectedOrder, getEmailTemplates, updateEmailTemplate, createEmailTemplate, deleteEmailTemplate } =
        useAuthContext();

    const [activeTab, setActiveTab] = useState('send');
    const [emailData, setEmailData] = useState({
        to: '',
        subject: '',
        message: '',
    });

    // Template management state - for backend templates
    const [templates, setTemplates] = useState([]);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateForm, setTemplateForm] = useState({
        name: '',
        subject: '',
        content: '',
    });

    // Load backend templates for the templates menu
    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const backendTemplates = await getEmailTemplates();
                setTemplates(backendTemplates);
            } catch (error) {
                console.error('Error loading backend templates:', error);
                setTemplates([]);
            }
        };

        loadTemplates();
    }, [getEmailTemplates]);

    // Auto-populate when selectedOrder changes (using frontend template)
    useEffect(() => {
        if (selectedOrder) {
            const populated = populateOrderTemplate(selectedOrder);
            setEmailData(populated);
        }
    }, [selectedOrder]);

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

    // Template management functions (for backend templates)
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
            let savedTemplate;

            if (editingTemplate.isNew) {
                // Create new template
                savedTemplate = await createEmailTemplate({
                    name: templateForm.name,
                    subject: templateForm.subject,
                    content: templateForm.content,
                });

                // Add the new template to the list
                setTemplates((prev) => [...prev, savedTemplate]);
            } else {
                // Update existing template
                savedTemplate = await updateEmailTemplate(editingTemplate.id, {
                    name: templateForm.name,
                    subject: templateForm.subject,
                    content: templateForm.content,
                });

                // Update the template in the list
                setTemplates((prev) => prev.map((t) => (t.id === editingTemplate.id ? savedTemplate : t)));
            }

            cancelEditingTemplate();
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Грешка при запазване на шаблона!');
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

    const handleAddNewTemplate = () => {
        const newTemplate = {
            name: 'Нов шаблон',
            subject: 'Нова тема',
            content: 'Въведете съдържание на шаблона тук...',
            isNew: true,
        };

        setEditingTemplate(newTemplate);
        setTemplateForm({
            name: newTemplate.name,
            subject: newTemplate.subject,
            content: newTemplate.content,
        });
    };

    const deleteTemplate = async (templateId) => {
        if (window.confirm('Сигурни ли сте, че искате да изтриете този шаблон?')) {
            try {
                await deleteEmailTemplate(templateId);
                setTemplates((prev) => prev.filter((t) => t.id !== templateId));
                // Removed the success alert
            } catch (error) {
                console.error('Error deleting template:', error);
                alert('Грешка при изтриване на шаблона!');
            }
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
                                    Управлявайте шаблоните за имейли. Промоционалният шаблон се попълва автоматично с данни, а останалите можете да създадете
                                    според нуждите си.
                                </p>
                            </div>

                            {editingTemplate ? (
                                // Template Editor
                                <div className='email-manager-template-editor'>
                                    <div className='email-manager-editor-header'>
                                        <h4>{editingTemplate.isNew ? 'Създаване на нов шаблон' : `Редактиране на шаблон: ${editingTemplate.name}`}</h4>
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
                                            <textarea
                                                name='content'
                                                rows={15}
                                                value={templateForm.content}
                                                onChange={(e) => setTemplateForm((prev) => ({ ...prev, content: e.target.value }))}
                                                placeholder='Съдържание на имейла...'
                                            />
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

                                                {/* Info note for promo template only */}
                                                {template.name === 'Промоционален имейл' && (
                                                    <div className='email-manager-template-warning'>
                                                        <div className='email-manager-warning-icon'>ℹ️</div>
                                                        <div className='email-manager-warning-text'>
                                                            <strong>Актуални данни:</strong> Информацията в този шаблон се зарежда автоматично от сървъра с
                                                            най-актуалните данни (рейтинг, брой поръчки, цена).
                                                        </div>
                                                    </div>
                                                )}
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
                                                <button
                                                    className='email-manager-delete-template-btn'
                                                    onClick={() => deleteTemplate(template.id)}
                                                    title='Изтрий шаблон'
                                                >
                                                    🗑️ Изтриване
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {Array.from({ length: 3 - templates.length }, (_, index) => (
                                        <div
                                            key={`add-${index}`}
                                            className='email-manager-template-card email-manager-template-card--add'
                                            onClick={handleAddNewTemplate}
                                        >
                                            <div className='email-manager-template-content'>
                                                <div className='email-manager-add-template-info'>
                                                    <h4>Добави нов шаблон</h4>
                                                    <p>Създайте нов шаблон за имейли според нуждите си</p>
                                                </div>
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
