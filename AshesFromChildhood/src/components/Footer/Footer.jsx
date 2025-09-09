import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <div className="copyright-info">
            <p className="copyright-text">
              © 2025 <span className="author-name">Sibel Ibryamova</span>
            </p>
            <p className="rights-text">All rights reserved.</p>
          </div>
          
          <div className="footer-center">
            <div className="footer-links">
              <a href="/terms" className="terms-link">Terms & Conditions</a>
            </div>
            
            <div className="contact-section">
              <h4 className="contact-heading">Contact</h4>
              <div className="contact-details">
                <div className="contact-item">
                  <span className="contact-label">Email:</span>
                  <a href="mailto:mejduredowete@gmail.com" className="contact-value">
                    mejduredowete@gmail.com
                  </a>
                </div>
                {/* <div className="contact-item">
                  <span className="contact-label">Phone:</span>
                  <a href="tel:+359888888888" className="contact-value">
                    +359 888 888 888
                  </a>
                </div> */}
              </div>
            </div>
          </div>
          
          <div className="book-info">
            <p className="book-title">"Ashes of Childhood"</p>
            <p className="book-subtitle">A story that touches hearts</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <p className="made-with">
            Made with <span className="heart">♥</span> for readers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;