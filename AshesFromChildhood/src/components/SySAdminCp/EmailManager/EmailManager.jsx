import { useState } from 'react';
import './EmailManager.css';
import { useAuthContext } from '../../contexts/userContext';

const EmailManager = () => {
  const { 
    sendEmailToCustomer, 
    sendBulkEmail, 
    isLoading 
  } = useAuthContext();

  const [activeTab, setActiveTab] = useState('send');
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [bulkEmailData, setBulkEmailData] = useState({
    recipients: 'all',
    customEmails: '',
    subject: '',
    message: ''
  });

  // Готови шаблони за книгата
  const templates = [
    {
      id: 'order-confirmation',
      name: 'Потвърждение на поръчка',
      subject: 'Потвърждение на вашата поръчка за "Пепел от детството"',
      content: `Здравейте,

Благодарим ви за поръчката на книгата "Пепел от детството"!

Вашата поръчка е получена и ще бъде обработена в рамките на 24 часа. Ще получите книгата в рамките на 2-3 работни дни.

Сума за доставка: 25.00 лв (наложено плащане)

Благодарим за доверието!

С уважение,
Екипът на...`
    },
    {
      id: 'thank-you',
      name: 'Благодарност за отзив',
      subject: 'Благодарим за вашия отзив!',
      content: `Здравейте,

Благодарим ви за отзива за "Пепел от детството"!

Вашето мнение е изключително важно за нас и помага на други читатели да вземат решение за книгата.

Ако имате приятели, които биха се заинтересували от книгата, ще се радваме да я споделите с тях.

С признателност,
Авторът`
    },
    {
      id: 'promotion',
      name: 'Промоционален имейл',
      subject: '"Пепел от детството" - една книга, която трябва да прочетете',
      content: `Здравейте,

Бихте ли се заинтересували от една силна и емоционална история?

"Пепел от детството" е книга, която засяга дълбоко и оставя следа в сърцето на всеки читател.

🌟 Над 4.7 звезди средна оценка
📖 Вече повече от 200 доволни читатели
💝 Доставка до врата ви

Цена: само 25.00 лв с безплатна доставка

Поръчайте сега и се потопете в една незабравима история.

Поздрави,
Авторът`
    }
  ];

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

  const handleBulkEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      let recipients = [];
      if (bulkEmailData.recipients === 'all') {
        recipients = ['all_customers'];
      } else if (bulkEmailData.recipients === 'custom') {
        recipients = bulkEmailData.customEmails.split(',').map(email => email.trim());
      }

      await sendBulkEmail({
        recipients,
        subject: bulkEmailData.subject,
        message: bulkEmailData.message
      });

      setBulkEmailData({
        recipients: 'all',
        customEmails: '',
        subject: '',
        message: ''
      });
      alert('Кампанията е изпратена успешно!');
    } catch (error) {
      console.error('Error sending bulk email:', error);
      alert('Грешка при изпращане на кампанията!');
    }
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      if (activeTab === 'send') {
        setEmailData(prev => ({
          ...prev,
          subject: template.subject,
          message: template.content
        }));
      } else if (activeTab === 'bulk') {
        setBulkEmailData(prev => ({
          ...prev,
          subject: template.subject,
          message: template.content
        }));
      }
    }
  };

  return (
    <div className="email-manager-container">
      {/* Header */}
      <div className="email-manager-header">
        <div className="email-manager-header-info">
          <h2 className="email-manager-title">Управление на имейли</h2>
          <p className="email-manager-subtitle">
            Изпращане на имейли до клиенти и промоционални кампании
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="email-manager-tabs">
        <div className="email-manager-tab-nav">
          <button 
            className={`email-manager-tab-btn ${activeTab === 'send' ? 'email-manager-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('send')}
          >
            📧 Единичен имейл
          </button>
          <button 
            className={`email-manager-tab-btn ${activeTab === 'bulk' ? 'email-manager-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('bulk')}
          >
            📬 Масов имейл
          </button>
          <button 
            className={`email-manager-tab-btn ${activeTab === 'templates' ? 'email-manager-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            📝 Шаблони
          </button>
        </div>

        <div className="email-manager-tab-content">
          {/* Single Email Tab */}
          {activeTab === 'send' && (
            <div className="email-manager-single-email">
              <div className="email-manager-form-section">
                <h3>Изпрати имейл до клиент</h3>
                <p className="email-manager-form-desc">
                  Изпратете персонализиран имейл до конкретен клиент (например потвърждение на поръчка, благодарност за отзив и др.)
                </p>
                
                <form onSubmit={handleSingleEmailSubmit} className="email-manager-email-form">
                  <div className="email-manager-form-group">
                    <label>До (имейл адрес):</label>
                    <input
                      type="email"
                      value={emailData.to}
                      onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="customer@example.com"
                      required
                    />
                  </div>

                  <div className="email-manager-form-group">
                    <label>Тема:</label>
                    <input
                      type="text"
                      value={emailData.subject}
                      onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Тема на имейла..."
                      required
                    />
                  </div>

                  <div className="email-manager-form-group">
                    <label>Съобщение:</label>
                    <textarea
                      rows={12}
                      value={emailData.message}
                      onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Въведете съобщението..."
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className={`email-manager-submit-btn ${isLoading ? 'email-manager-submit-btn--loading' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Изпращане...' : '📧 Изпрати имейл'}
                  </button>
                </form>
              </div>

              <div className="email-manager-templates-sidebar">
                <h4>Готови шаблони</h4>
                <p className="email-manager-sidebar-desc">
                  Кликнете върху шаблон, за да го заредите във формата
                </p>
                <div className="email-manager-template-list">
                  {templates.map(template => (
                    <div 
                      key={template.id} 
                      className="email-manager-template-item"
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <h5>{template.name}</h5>
                      <p>{template.subject}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bulk Email Tab */}
          {activeTab === 'bulk' && (
            <div className="email-manager-bulk-email">
              <div className="email-manager-form-section">
                <h3>Масово изпращане на имейли</h3>
                <p className="email-manager-form-desc">
                  Изпратете промоционален имейл или съобщение до група от хора (например маркетингова кампания)
                </p>
                
                <form onSubmit={handleBulkEmailSubmit} className="email-manager-email-form">
                  <div className="email-manager-form-group">
                    <label>Получатели:</label>
                    <select
                      value={bulkEmailData.recipients}
                      onChange={(e) => setBulkEmailData(prev => ({ ...prev, recipients: e.target.value }))}
                    >
                      <option value="all">Всички клиенти</option>
                      <option value="customers">Само клиенти с поръчки</option>
                      <option value="custom">Персонализиран списък</option>
                    </select>
                  </div>

                  {bulkEmailData.recipients === 'custom' && (
                    <div className="email-manager-form-group">
                      <label>Имейл адреси (разделени със запетая):</label>
                      <textarea
                        rows={3}
                        value={bulkEmailData.customEmails}
                        onChange={(e) => setBulkEmailData(prev => ({ ...prev, customEmails: e.target.value }))}
                        placeholder="email1@example.com, email2@example.com, email3@example.com"
                      />
                    </div>
                  )}

                  <div className="email-manager-form-group">
                    <label>Тема:</label>
                    <input
                      type="text"
                      value={bulkEmailData.subject}
                      onChange={(e) => setBulkEmailData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Тема на кампанията..."
                      required
                    />
                  </div>

                  <div className="email-manager-form-group">
                    <label>Съобщение:</label>
                    <textarea
                      rows={12}
                      value={bulkEmailData.message}
                      onChange={(e) => setBulkEmailData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Въведете съобщението за кампанията..."
                      required
                    />
                  </div>

                  <div className="email-manager-warning">
                    <div className="email-manager-warning-icon">⚠️</div>
                    <div className="email-manager-warning-text">
                      <strong>Внимание:</strong> Масовите имейли трябва да спазват GDPR и да включват възможност за отписване.
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className={`email-manager-submit-btn email-manager-submit-btn--bulk ${isLoading ? 'email-manager-submit-btn--loading' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Изпращане...' : '📬 Изпрати кампания'}
                  </button>
                </form>
              </div>

              <div className="email-manager-templates-sidebar">
                <h4>Шаблони за кампании</h4>
                <p className="email-manager-sidebar-desc">
                  Шаблони, подходящи за промоционални кампании
                </p>
                <div className="email-manager-template-list">
                  {templates.filter(t => t.id === 'promotion').map(template => (
                    <div 
                      key={template.id} 
                      className="email-manager-template-item"
                      onClick={() => handleTemplateSelect(template.id)}
                    >
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
            <div className="email-manager-templates">
              <div className="email-manager-templates-header">
                <h3>Шаблони за имейли</h3>
                <p className="email-manager-templates-desc">
                  Готови шаблони за различни видове комуникация с клиентите
                </p>
              </div>

              <div className="email-manager-templates-grid">
                {templates.map(template => (
                  <div key={template.id} className="email-manager-template-card">
                    <div className="email-manager-template-header">
                      <h4>{template.name}</h4>
                    </div>
                    <div className="email-manager-template-content">
                      <p className="email-manager-template-subject">
                        <strong>Тема:</strong> {template.subject}
                      </p>
                      <div className="email-manager-template-preview">
                        <strong>Съдържание:</strong>
                        <pre>{template.content.substring(0, 200)}...</pre>
                      </div>
                    </div>
                    <div className="email-manager-template-footer">
                      <button 
                        className="email-manager-use-template-btn"
                        onClick={() => {
                          setActiveTab('send');
                          handleTemplateSelect(template.id);
                        }}
                      >
                        📧 Използвай за единичен имейл
                      </button>
                      {template.id === 'promotion' && (
                        <button 
                          className="email-manager-use-template-btn email-manager-use-template-btn--bulk"
                          onClick={() => {
                            setActiveTab('bulk');
                            handleTemplateSelect(template.id);
                          }}
                        >
                          📬 Използвай за кампания
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailManager;