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