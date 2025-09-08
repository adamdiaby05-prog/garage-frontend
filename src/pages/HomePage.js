import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Container, Typography, Stack, Card, CardContent, IconButton, Divider } from '@mui/material';
import { DirectionsCar, Build, Security, Login, PersonAdd, ShoppingCart, Settings, Menu as MenuIcon, Close, AutoAwesome, Bolt, ArrowRightAlt } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [carPosition, setCarPosition] = useState(0);
  const [carSpeed, setCarSpeed] = useState(2);
  const [smokeParticles, setSmokeParticles] = useState([]);
  const [hoverKey, setHoverKey] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const carRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarPosition((prev) => {
        const next = prev >= window.innerWidth + 100 ? -200 : prev + carSpeed;
        if (prev > -150 && prev < window.innerWidth + 150) {
          setSmokeParticles((smoke) => [
            ...smoke.slice(-40),
            {
              id: Date.now() + Math.random(),
              x: prev - 12 + Math.random() * 6,
              y: window.innerHeight - 110 + Math.random() * 14,
              size: Math.random() * 8 + 6,
              opacity: 0.6,
              life: 0
            }
          ]);
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [carSpeed]);

  useEffect(() => {
    const smokeInterval = setInterval(() => {
      setSmokeParticles((smoke) =>
        smoke
          .map((p) => ({
            ...p,
            y: p.y - 2,
            x: p.x + (Math.random() - 0.5) * 2,
            life: p.life + 1,
            opacity: Math.max(0, p.opacity - 0.02),
            size: p.size + 0.25
          }))
          .filter((p) => p.life < 60 && p.opacity > 0)
      );
    }, 50);
    return () => clearInterval(smokeInterval);
  }, []);

  useEffect(() => {
    const initial = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: Math.random() * 1000,
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 3,
      speedY: (Math.random() - 0.5) * 3,
      speedZ: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      color: ['#60A5FA', '#3B82F6', '#1D4ED8', '#93C5FD'][Math.floor(Math.random() * 4)],
    }));
    setParticles(initial);
    const interval = setInterval(() => {
      setParticles((prev) => prev.map((p) => ({
        ...p,
        x: p.x + p.speedX,
        y: p.y + p.speedY,
        z: p.z + p.speedZ,
        x: p.x > window.innerWidth ? -50 : p.x < -50 ? window.innerWidth : p.x,
        y: p.y > window.innerHeight ? -50 : p.y < -50 ? window.innerHeight : p.y,
        z: p.z > 1000 ? 0 : p.z,
      })));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const features = useMemo(() => ([
    { icon: <DirectionsCar />, title: 'Gestion de véhicules', description: 'Ajoutez, suivez et mettez à jour vos véhicules en temps réel.' },
    { icon: <Build />, title: 'Suivi des réparations', description: "Consultez l'historique complet et l'état de vos réparations." },
    { icon: <Security />, title: 'Espace sécurisé', description: 'Vos données sont protégées et sauvegardées en temps réel.' },
  ]), []);

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0c1445 0%, #1e3a8a 25%, #1d4ed8 50%, #2563eb 75%, #0c1445 100%)' }}>
      {/* Header */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(12,20,69,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(59,130,246,0.3)' }}>
        <Container maxWidth="lg" sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => navigate('/') }>
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ width: 48, height: 48, background: 'linear-gradient(90deg, #1e3a8a, #6d28d9)', borderRadius: 2, transform: 'rotate(12deg)', boxShadow: '0 10px 25px rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ position: 'absolute', inset: 6, backgroundColor: 'white', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Settings sx={{ color: '#1976d2', animation: 'spin 6s linear infinite' }} />
                  </Box>
                </Box>
              </Box>
              <Box sx={{ color: 'white' }}>
                <Typography variant="h5" sx={{ fontWeight: 900, background: 'linear-gradient(90deg, #fff, #93c5fd)', WebkitBackgroundClip: 'text', color: 'transparent' }}>AutoGenius</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Garage Management</Typography>
              </Box>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
              {['Accueil', 'Services', 'À propos', 'Contact'].map((item) => (
                <Typography key={item} sx={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', '&:hover': { color: '#fff' } }}>{item}</Typography>
              ))}
            </Box>
            <IconButton sx={{ display: { xs: 'inline-flex', md: 'none' }, color: 'white' }} onClick={() => setIsMenuOpen((v) => !v)}>
              {isMenuOpen ? <Close /> : <MenuIcon />}
            </IconButton>
          </Box>
        </Container>
        {isMenuOpen && (
          <Box sx={{ display: { xs: 'block', md: 'none' }, background: 'rgba(12,20,69,0.95)', borderTop: '1px solid rgba(59,130,246,0.3)' }}>
            <Container maxWidth="lg" sx={{ py: 2 }}>
              <Stack spacing={1.5}>
                {['Accueil', 'Services', 'À propos', 'Contact'].map((item) => (
                  <Typography key={item} sx={{ color: 'rgba(255,255,255,0.8)' }}>{item}</Typography>
                ))}
              </Stack>
            </Container>
          </Box>
        )}
      </Box>

      {/* Gradient + parallax */}
      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(59,130,246,0.2), rgba(96,165,250,0.15))', transform: `translateY(${scrollY * 0.5}px)` }} />

      {/* Particles */}
      {particles.map((p) => (
        <Box key={p.id} sx={{ position: 'absolute', left: p.x, top: p.y, width: ((p.size * (1000 - p.z)) / 1000), height: ((p.size * (1000 - p.z)) / 1000), backgroundColor: p.color, borderRadius: '50%', pointerEvents: 'none', opacity: (p.opacity * (1000 - p.z)) / 1000, transform: 'translate(-50%, -50%)' }} />
      ))}

      {/* Car with interactive boost */}
      <Box ref={carRef} onClick={() => {
        setCarSpeed((s) => Math.min(8, s + 2));
        setTimeout(() => setCarSpeed(2), 1200);
      }} sx={{ position: 'fixed', bottom: 80, zIndex: 30, left: carPosition, cursor: 'pointer', filter: 'drop-shadow(0 10px 20px rgba(59,130,246,0.5))', transform: carSpeed > 2 ? 'scale(1.08)' : 'scale(1)', transition: 'transform .2s ease' }}>
        <Box sx={{ position: 'relative' }}>
          <DirectionsCar sx={{ width: 64, height: 64, color: '#60A5FA', animation: 'bounce 2s infinite' }} />
          <Box sx={{ position: 'absolute', bottom: -6, left: 8, width: 10, height: 10, backgroundColor: '#0f172a', borderRadius: '50%', animation: 'spin 2s linear infinite' }} />
          <Box sx={{ position: 'absolute', bottom: -6, right: 8, width: 10, height: 10, backgroundColor: '#0f172a', borderRadius: '50%', animation: 'spin 2s linear infinite' }} />
          <Box sx={{ position: 'absolute', inset: -16, backgroundColor: 'rgba(59,130,246,0.25)', filter: 'blur(20px)', borderRadius: '999px' }} />
        </Box>
      </Box>

      {/* Exhaust smoke particles */}
      {smokeParticles.map((smoke) => (
        <Box key={smoke.id} sx={{ position: 'fixed', left: smoke.x, top: smoke.y, width: smoke.size, height: smoke.size, backgroundColor: 'rgba(148,163,184,0.8)', borderRadius: '50%', opacity: smoke.opacity, pointerEvents: 'none', transform: 'translate(-50%, -50%)', filter: 'blur(2px)' }} />
      ))}

      {/* Cursor glow */}
      <Box sx={{ position: 'fixed', width: 384, height: 384, borderRadius: '999px', background: 'radial-gradient(circle, rgba(96,165,250,0.2), rgba(59,130,246,0.12), transparent)', pointerEvents: 'none', filter: 'blur(40px)', left: mousePosition.x - 192, top: mousePosition.y - 192, zIndex: 10 }} />

      {/* Main content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 20, py: 10, pt: 16, minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%' }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={8} alignItems="center" justifyContent="space-between">
            <Box sx={{ flex: 1, maxWidth: 720, textAlign: { xs: 'center', lg: 'left' } }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, px: 3, py: 1.5, borderRadius: 999, mb: 4, background: 'linear-gradient(90deg, rgba(59,130,246,0.2), rgba(29,78,216,0.2))', border: '1px solid rgba(96,165,250,0.4)', color: 'white' }}>
                <AutoAwesome sx={{ color: '#facc15' }} />
                <Typography variant="body1">✨ Bienvenue dans le Futur Automobile</Typography>
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, lineHeight: 1.1, background: 'linear-gradient(90deg, #fff, #bfdbfe)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                Votre véhicule,
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, lineHeight: 1.1, background: 'linear-gradient(90deg, #60a5fa, #3b82f6, #93c5fd)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                notre expertise
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 5, fontWeight: 300 }}>
                Révolutionnez la gestion de vos véhicules avec une technologie
                <Box component="span" sx={{ color: '#60a5fa', fontWeight: 600 }}> ultra-moderne</Box> et des
                <Box component="span" sx={{ color: '#60a5fa', fontWeight: 600 }}> services premium</Box>.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <Button
                  size="large"
                  variant="contained"
                  onMouseEnter={() => setHoverKey('signup')}
                  onMouseLeave={() => setHoverKey(null)}
                  onClick={() => navigate('/signup')}
                  startIcon={<PersonAdd />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 6,
                    fontWeight: 'bold',
                    background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
                    '&:hover': { transform: 'translateY(-6px) scale(1.05)', transition: 'all .3s ease' }
                  }}
                >
                  Créer un compte
                  <ArrowRightAlt sx={{ ml: 1, transform: hoverKey === 'signup' ? 'translateX(8px)' : 'none', transition: 'transform .2s' }} />
                </Button>
                <Button
                  size="large"
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate('/login')}
                  startIcon={<Login />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 6,
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Se connecter
                </Button>
              </Stack>
              <Button
                size="large"
                variant="contained"
                onClick={() => navigate('/boutique-client')}
                startIcon={<ShoppingCart />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 6,
                  fontWeight: 'bold',
                  background: 'linear-gradient(90deg, #059669, #0d9488)',
                  '&:hover': { transform: 'translateY(-6px) scale(1.05)', transition: 'all .3s ease' }
                }}
              >
                Boutique Premium
                <Bolt sx={{ ml: 1, color: '#fde047' }} />
              </Button>
            </Box>

            <Box sx={{ flex: 1, maxWidth: 520, width: '100%' }}>
              <Stack spacing={3}>
                {features.map((f, idx) => (
                  <Card key={idx} sx={{ position: 'relative', p: 2, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 4, backdropFilter: 'blur(16px)', transition: 'all .3s', '&:hover': { transform: 'translateY(-8px) scale(1.04)', background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.4)' } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: 3, background: 'linear-gradient(90deg, rgba(59,130,246,0.4), rgba(59,130,246,0.25))' }}>
                          {f.icon}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>{f.title}</Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>{f.description}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ position: 'relative', zIndex: 20, borderTop: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)' }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{ width: 32, height: 32, background: 'linear-gradient(90deg, #1e3a8a, #2563eb)', borderRadius: 1, transform: 'rotate(12deg)', animation: 'spin 6s linear infinite' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>AutoGenius</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              © {new Date().getFullYear()} AutoGenius - L'avenir du garage management 🚗
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* keyframes */}
      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
      `}</style>
    </Box>
  );
};

export default HomePage;


