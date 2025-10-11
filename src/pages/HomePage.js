import React, { useEffect, useState } from 'react';
import { DirectionsCar, Build, Security, Login, PersonAdd, ShoppingCart, Menu as MenuIcon, Close, Star, Verified, Speed, Shield, Bolt, ArrowForward, PlayArrow } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [particles, setParticles] = useState([]);
  const [hoveredBadge, setHoveredBadge] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  // Images pour le carousel
  const carouselImages = [
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop'
  ];

  // Badges 3D avec animations
  const badges3D = [
    { 
      icon: <Verified />, 
      title: 'Certifié Premium', 
      subtitle: '5 étoiles',
      color: '#00ff88',
      glow: 'rgba(0, 255, 136, 0.5)',
      rotation: '12deg'
    },
    { 
      icon: <Speed />, 
      title: 'Service Rapide', 
      subtitle: '24h/7j',
      color: '#00ff88',
      glow: 'rgba(0, 255, 136, 0.5)',
      rotation: '-8deg'
    },
    { 
      icon: <Shield />, 
      title: 'Garantie Totale', 
      subtitle: '2 ans',
      color: '#00ff88',
      glow: 'rgba(0, 255, 136, 0.5)',
      rotation: '15deg'
    }
  ];

  // Features avec effets 3D
  const features = [
    { 
      icon: <DirectionsCar />, 
      title: 'Gestion Intelligente', 
      description: 'IA avancée pour optimiser vos véhicules',
      gradient: 'linear-gradient(135deg, #00ff88, #00cc6a)'
    },
    { 
      icon: <Build />, 
      title: 'Réparations Express', 
      description: 'Diagnostic en temps réel et solutions rapides',
      gradient: 'linear-gradient(135deg, #00ff88, #00aa55)'
    },
    { 
      icon: <Security />, 
      title: 'Sécurité Maximale', 
      description: 'Cryptage militaire et protection totale',
      gradient: 'linear-gradient(135deg, #00ff88, #008844)'
    }
  ];

  // Initialisation des particules
  useEffect(() => {
    const initialParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.5 + 0.2,
      color: ['#00ff88', '#00cc6a', '#00aa55'][Math.floor(Math.random() * 3)]
    }));
    setParticles(initialParticles);

    const animateParticles = () => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: (p.x + p.speedX) > window.innerWidth ? 0 : (p.x + p.speedX) < 0 ? window.innerWidth : p.x + p.speedX,
        y: (p.y + p.speedY) > window.innerHeight ? 0 : (p.y + p.speedY) < 0 ? window.innerHeight : p.y + p.speedY
      })));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  // Carousel automatique
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="homepage-container">
      {/* Particules flottantes */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 4}px ${particle.color}`
          }}
        />
      ))}

      {/* Effet de cursor glow */}
      <div 
        className="cursor-glow"
        style={{
          left: mousePosition.x - 150,
          top: mousePosition.y - 150,
        }}
      />

      {/* Header avec animation */}
      <header className={`header ${scrollY > 50 ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-content">
            <div className="logo-section" onClick={() => navigate('/')}>
              <div className="logo-icon">
                <div className="logo-inner">
                  <DirectionsCar className="logo-car" />
                </div>
              </div>
              <div className="logo-text">
                <h1>AutoSoft</h1>
                <span>Dark Edition</span>
              </div>
            </div>
            
            <nav className="desktop-nav">
              {['Accueil', 'Services', 'À propos', 'Contact'].map(item => (
                <button key={item} className="nav-link" onClick={() => console.log(`Navigate to ${item}`)}>{item}</button>
              ))}
            </nav>
            
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <Close /> : <MenuIcon />}
            </button>
          </div>
        </div>
        
        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="mobile-menu">
            {['Accueil', 'Services', 'À propos', 'Contact'].map(item => (
              <button key={item} className="mobile-nav-link" onClick={() => console.log(`Navigate to ${item}`)}>{item}</button>
            ))}
          </div>
        )}
      </header>

      {/* Section principale */}
      <main className="main-section">
        <div className="container">
          <div className="hero-grid">
            {/* Contenu principal */}
            <div className="hero-content">
              {/* Badges 3D flottants */}
              <div className="badges-container">
                {badges3D.map((badge, index) => (
                  <div 
                    key={index}
                    className={`badge-3d ${hoveredBadge === index ? 'hovered' : ''}`}
                    style={{
                      transform: `rotate(${badge.rotation}) translateY(${Math.sin(Date.now() / 1000 + index) * 10}px)`,
                      boxShadow: `0 20px 40px ${badge.glow}, inset 0 0 20px rgba(255,255,255,0.1)`
                    }}
                    onMouseEnter={() => setHoveredBadge(index)}
                    onMouseLeave={() => setHoveredBadge(null)}
                  >
                    <div className="badge-icon" style={{ color: badge.color }}>
                      {badge.icon}
                    </div>
                    <div className="badge-text">
                      <div className="badge-title">{badge.title}</div>
                      <div className="badge-subtitle">{badge.subtitle}</div>
                    </div>
                    <div className="badge-glow" style={{ background: badge.glow }} />
                  </div>
                ))}
              </div>

              <div className="hero-text">
                <div className="welcome-badge">
                  <Star className="star-icon" />
                  <span>Bienvenue dans l'Ère Digitale</span>
                </div>
                
                <h1 className="hero-title">
                  <span className="title-line">Votre véhicule,</span>
                  <span className="title-line neon">notre génie</span>
                </h1>
                
                <p className="hero-description">
                  Révolutionnez la gestion automobile avec notre 
                  <span className="highlight"> technologie IA </span> 
                  et des services 
                  <span className="highlight"> premium ultra-modernes</span>.
                </p>
                
                <div className="cta-buttons">
                  <button className="btn-primary" onClick={() => navigate('/signup')}>
                    <PersonAdd />
                    <span>Créer un compte</span>
                    <ArrowForward className="arrow-icon" />
                  </button>
                  
                  <button className="btn-secondary" onClick={() => navigate('/login')}>
                    <Login />
                    <span>Se connecter</span>
                  </button>
                </div>
                
                <button className="btn-shop" onClick={() => navigate('/boutique-client')}>
                  <ShoppingCart />
                  <span>Boutique Premium</span>
                  <Bolt className="bolt-icon" />
                </button>
              </div>
            </div>

            {/* Carousel d'images */}
            <div className="carousel-section">
              <div className="carousel-container">
                <div className="carousel-wrapper">
                  {carouselImages.map((image, index) => (
                    <div 
                      key={index}
                      className={`carousel-slide ${index === currentImageIndex ? 'active' : ''}`}
                      style={{ backgroundImage: `url(${image})` }}
                    />
                  ))}
                </div>
                
                <div className="carousel-dots">
                  {carouselImages.map((_, index) => (
                    <button 
                      key={index}
                      className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
                
                <div className="carousel-overlay">
                  <PlayArrow className="play-icon" />
                  <span>Découvrir nos services</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Section des fonctionnalités */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon" style={{ background: feature.gradient }}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-glow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <DirectionsCar />
              </div>
              <span>AutoSoft</span>
            </div>
            <p>© 2024 AutoSoft - L'avenir du garage management 🚗</p>
          </div>
        </div>
      </footer>

      <style>{`
        .homepage-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
          color: white;
          overflow-x: hidden;
          position: relative;
        }

        /* Particules */
        .particle {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
          animation: float 6s ease-in-out infinite;
        }

        .cursor-glow {
          position: fixed;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(0, 255, 136, 0.15), transparent);
          border-radius: 50%;
          pointer-events: none;
          z-index: 2;
          filter: blur(30px);
          transition: all 0.1s ease;
        }

        /* Header */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 255, 136, 0.2);
          transition: all 0.3s ease;
        }

        .header.scrolled {
          background: rgba(10, 10, 10, 0.95);
          border-bottom: 1px solid rgba(0, 255, 136, 0.4);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 0;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 15px;
          cursor: pointer;
        }

        .logo-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #00ff88, #00aa55);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(12deg);
          box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
          animation: logoFloat 4s ease-in-out infinite;
        }

        .logo-inner {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          padding: 8px;
        }

        .logo-car {
          color: #00aa55;
        }

        .logo-text h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 900;
          background: linear-gradient(90deg, #fff, #00ff88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-text span {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .desktop-nav {
          display: flex;
          gap: 30px;
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
        }

        .nav-link:hover {
          color: #00ff88;
          transform: translateY(-2px);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 2px;
          background: #00ff88;
          transition: width 0.3s ease;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
        }

        .mobile-menu {
          background: rgba(10, 10, 10, 0.95);
          border-top: 1px solid rgba(0, 255, 136, 0.2);
          padding: 20px;
        }

        .mobile-nav-link {
          display: block;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        /* Section principale */
        .main-section {
          padding-top: 120px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        /* Badges 3D */
        .badges-container {
          position: absolute;
          top: -50px;
          right: -50px;
          z-index: 5;
        }

        .badge-3d {
          position: absolute;
          width: 120px;
          height: 80px;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.9));
          border-radius: 15px;
          border: 1px solid rgba(0, 255, 136, 0.4);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          animation: badgeFloat 6s ease-in-out infinite;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
        }

        .badge-3d:nth-child(1) { top: 0; right: 0; animation-delay: 0s; }
        .badge-3d:nth-child(2) { top: 100px; right: 80px; animation-delay: 2s; }
        .badge-3d:nth-child(3) { top: 200px; right: 20px; animation-delay: 4s; }

        .badge-3d.hovered {
          transform: scale(1.1) translateY(-10px) !important;
          box-shadow: 0 30px 60px rgba(0, 255, 136, 0.2) !important;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(30, 30, 30, 0.95)) !important;
        }

        .badge-icon {
          font-size: 24px;
        }

        .badge-text {
          flex: 1;
        }

        .badge-title {
          font-size: 11px;
          font-weight: 800;
          color: #00ff88;
          text-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
          line-height: 1.2;
        }

        .badge-subtitle {
          font-size: 9px;
          color: #ffffff;
          font-weight: 600;
          text-shadow: 0 0 4px rgba(255, 255, 255, 0.3);
          line-height: 1.1;
        }

        .badge-glow {
          position: absolute;
          inset: -5px;
          border-radius: 20px;
          filter: blur(15px);
          opacity: 0.3;
          z-index: -1;
        }

        /* Hero content */
        .hero-content {
          position: relative;
          z-index: 20;
        }

        .welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(90deg, rgba(0, 255, 136, 0.2), rgba(0, 170, 85, 0.2));
          border: 1px solid rgba(0, 255, 136, 0.4);
          border-radius: 50px;
          padding: 10px 20px;
          margin-bottom: 30px;
          animation: glow 2s ease-in-out infinite alternate;
        }

        .star-icon {
          color: #ffff00;
          animation: twinkle 1.5s ease-in-out infinite;
        }

        .hero-title {
          font-size: 64px;
          font-weight: 900;
          line-height: 1.1;
          margin: 0 0 30px 0;
          position: relative;
          z-index: 15;
        }

        .title-line {
          display: block;
          background: linear-gradient(90deg, #fff, rgba(255, 255, 255, 0.7));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .title-line.neon {
          color: #ffffff;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4);
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.5);
          z-index: 10;
          position: relative;
        }

        .hero-description {
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 40px;
          max-width: 500px;
        }

        .highlight {
          color: #00ff88;
          font-weight: 600;
          text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
        }

        .cta-buttons {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .btn-primary, .btn-secondary, .btn-shop {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px 30px;
          border-radius: 50px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          font-size: 16px;
          position: relative;
          overflow: hidden;
        }

        .btn-primary {
          background: linear-gradient(135deg, #00ff88, #00aa55);
          color: #000;
          box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 20px 40px rgba(0, 255, 136, 0.4);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(0, 255, 136, 0.3);
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          background: rgba(0, 255, 136, 0.1);
          border-color: #00ff88;
          transform: translateY(-3px);
        }

        .btn-shop {
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          color: white;
          box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
        }

        .btn-shop:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 20px 40px rgba(255, 107, 107, 0.4);
        }

        .arrow-icon, .bolt-icon {
          transition: transform 0.3s ease;
        }

        .btn-primary:hover .arrow-icon {
          transform: translateX(5px);
        }

        .btn-shop:hover .bolt-icon {
          animation: bolt 0.5s ease-in-out;
        }

        /* Carousel */
        .carousel-section {
          position: relative;
        }

        .carousel-container {
          position: relative;
          width: 100%;
          height: 500px;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
        }

        .carousel-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .carousel-slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transition: all 1s ease-in-out;
          transform: scale(1.1);
        }

        .carousel-slide.active {
          opacity: 1;
          transform: scale(1);
        }

        .carousel-dots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 10;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dot.active {
          background: #00ff88;
          transform: scale(1.2);
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.6);
        }

        .carousel-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 15px 25px;
          border-radius: 50px;
          backdrop-filter: blur(10px);
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .carousel-overlay:hover {
          background: rgba(0, 255, 136, 0.2);
          transform: translate(-50%, -50%) scale(1.05);
        }

        .play-icon {
          font-size: 24px;
        }

        /* Features section */
        .features-section {
          padding: 100px 0;
          position: relative;
          z-index: 10;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 20px;
          padding: 30px;
          text-align: center;
          position: relative;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .feature-card:hover {
          transform: translateY(-10px) scale(1.02);
          border-color: #00ff88;
          box-shadow: 0 20px 40px rgba(0, 255, 136, 0.2);
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 32px;
          color: white;
          box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
        }

        .feature-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 15px 0;
          color: #00ff88;
        }

        .feature-description {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin: 0;
        }

        .feature-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), transparent);
          border-radius: 22px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .feature-card:hover .feature-glow {
          opacity: 1;
        }

        /* Footer */
        .footer {
          border-top: 1px solid rgba(0, 255, 136, 0.2);
          background: rgba(0, 0, 0, 0.3);
          padding: 30px 0;
          position: relative;
          z-index: 10;
        }

        .footer-content {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 15px;
          text-align: center;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 700;
          color: #00ff88;
        }

        .footer-logo-icon {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #00ff88, #00aa55);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        /* Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes logoFloat {
          0%, 100% { transform: rotate(12deg) translateY(0px); }
          50% { transform: rotate(12deg) translateY(-10px); }
        }

        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0px) rotate(var(--rotation, 0deg)); }
          50% { transform: translateY(-15px) rotate(var(--rotation, 0deg)); }
        }

        @keyframes glow {
          0% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.3); }
          100% { box-shadow: 0 0 30px rgba(0, 255, 136, 0.6); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        @keyframes neonGlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes bolt {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .hero-title {
            font-size: 48px;
          }

          .badges-container {
            position: relative;
            top: 0;
            right: 0;
            margin-bottom: 30px;
            display: flex;
            justify-content: center;
            gap: 20px;
          }

          .badge-3d {
            position: relative;
            top: auto !important;
            right: auto !important;
            width: 100px;
            height: 60px;
          }

          .desktop-nav {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .carousel-container {
            height: 300px;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
