import React, { useState } from "react";
import "./landingPage.css";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>StackIt</h2>
          </div>

          <div className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
            <a href="#home" className="nav-link">
              Home
            </a>
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#about" className="nav-link">
              About
            </a>
            <a href="#contact" className="nav-link">
              Contact
            </a>
          </div>

          <div className="nav-actions">
            {isLoggedIn ? (
              <>
                <div className="notification-icon">
                  <i className="fas fa-bell"></i>
                  {notificationCount > 0 && (
                    <span className="notification-badge">
                      {notificationCount}
                    </span>
                  )}
                </div>
                <button className="btn btn-secondary" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary">Sign In</button>
                <button className="btn btn-primary" onClick={handleLogin}>
                  Sign Up
                </button>
              </>
            )}
          </div>

          <div className="hamburger" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Ask Questions. Get Answers.
              <span className="highlight">Learn Together.</span>
            </h1>
            <p className="hero-description">
              StackIt is a minimal question-and-answer platform that supports
              collaborative learning and structured knowledge sharing. Join our
              community of learners and experts.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-large">
                Start Asking Questions
              </button>
              <button className="btn btn-outline btn-large">
                Browse Questions
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-visual">
              <div className="question-card">
                <h3>How to implement JWT authentication?</h3>
                <p>I'm building a React app and need help with JWT...</p>
                <div className="tags">
                  <span className="tag">React</span>
                  <span className="tag">JWT</span>
                  <span className="tag">Authentication</span>
                </div>
                <div className="stats">
                  <span>5 answers</span>
                  <span>12 votes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Core Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-question-circle"></i>
              </div>
              <h3>Ask Questions</h3>
              <p>
                Submit questions with titles, descriptions, and tags. Use our
                rich text editor for detailed explanations.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-edit"></i>
              </div>
              <h3>Rich Text Editor</h3>
              <p>
                Format your content with bold, italic, lists, emojis, links,
                images, and text alignment options.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-comments"></i>
              </div>
              <h3>Answer Questions</h3>
              <p>
                Help others by providing detailed answers using the same rich
                formatting tools.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-thumbs-up"></i>
              </div>
              <h3>Vote & Accept</h3>
              <p>
                Upvote helpful answers and accept the best solution for your
                questions.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-tags"></i>
              </div>
              <h3>Smart Tagging</h3>
              <p>
                Organize questions with relevant tags like React, JWT, Python,
                etc. for easy discovery.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-bell"></i>
              </div>
              <h3>Notifications</h3>
              <p>
                Stay updated with real-time notifications for answers, comments,
                and mentions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Ask a Question</h3>
              <p>
                Create a clear title and detailed description using our rich
                text editor. Add relevant tags to help others find your
                question.
              </p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Get Answers</h3>
              <p>
                Community members will provide helpful answers. You'll receive
                notifications when someone responds.
              </p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Vote & Accept</h3>
              <p>
                Upvote the most helpful answers and mark the best one as
                accepted to help others find solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>10K+</h3>
              <p>Questions Asked</p>
            </div>
            <div className="stat-item">
              <h3>50K+</h3>
              <p>Answers Provided</p>
            </div>
            <div className="stat-item">
              <h3>5K+</h3>
              <p>Active Users</p>
            </div>
            <div className="stat-item">
              <h3>100+</h3>
              <p>Topics Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Start Learning?</h2>
          <p>Join thousands of developers and learners on StackIt</p>
          <button className="btn btn-primary btn-large">Get Started Now</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>StackIt</h3>
              <p>
                A minimal Q&A platform for collaborative learning and knowledge
                sharing.
              </p>
            </div>
            <div className="footer-section">
              <h4>Platform</h4>
              <ul>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Community</h4>
              <ul>
                <li>
                  <a href="#guidelines">Guidelines</a>
                </li>
                <li>
                  <a href="#privacy">Privacy</a>
                </li>
                <li>
                  <a href="#terms">Terms</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Connect</h4>
              <div className="social-links">
                <a href="#">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#">
                  <i className="fab fa-github"></i>
                </a>
                <a href="#">
                  <i className="fab fa-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 StackIt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
