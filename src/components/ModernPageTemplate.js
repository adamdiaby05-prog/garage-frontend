import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  AutoAwesome,
  Bolt,
  Star,
  TrendingUp,
  CheckCircle,
  Warning,
  Error,
  Refresh,
  Download,
  FilterList,
  Add,
  Visibility,
  Edit,
  Delete
} from '@mui/icons-material';

// Template réutilisable pour toutes les pages
const ModernPageTemplate = ({
  title,
  subtitle,
  icon: PageIcon,
  statCards = [],
  children,
  loading = false,
  error = null,
  onRefresh,
  onAdd,
  onExport,
  onFilter,
  colorScheme = 'blue'
}) => {
  const [particles, setParticles] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  const palette = colorScheme === 'green'
    ? {
        bgGradient: 'linear-gradient(135deg, #052e1a 0%, #065f46 25%, #10b981 50%, #34d399 75%, #6ee7b7 100%)',
        headerBlock: 'linear-gradient(135deg, #065f46, #10b981, #34d399)',
        headerRing: 'linear-gradient(45deg, #065f46, #10b981, #34d399, #6ee7b7)',
        iconColor: '#10b981',
        particleColors: ['#065f46', '#10b981', '#34d399', '#6ee7b7']
      }
    : colorScheme === 'orange'
    ? {
        bgGradient: 'linear-gradient(135deg, #431407 0%, #7c2d12 25%, #ea580c 50%, #f59e0b 75%, #fbbf24 100%)',
        headerBlock: 'linear-gradient(135deg, #ea580c, #f59e0b)',
        headerRing: 'linear-gradient(45deg, #7c2d12, #ea580c, #f59e0b, #fbbf24)',
        iconColor: '#ea580c',
        particleColors: ['#7c2d12', '#ea580c', '#f59e0b', '#fbbf24']
      }
    : {
        bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 25%, #2563eb 50%, #3b82f6 75%, #60a5fa 100%)',
        headerBlock: 'linear-gradient(135deg, #1e40af, #2563eb, #3b82f6)',
        headerRing: 'linear-gradient(45deg, #1e40af, #3b82f6, #60a5fa, #93c5fd)',
        iconColor: '#1976d2',
        particleColors: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe']
      };

  // Génération de particules pour l'effet de fond
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 25; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 3 + 0.5,
        color: palette.particleColors[Math.floor(Math.random() * palette.particleColors.length)],
        opacity: Math.random() * 0.6 + 0.2
      });
    }
    setParticles(newParticles);
  }, [colorScheme]);

  // Animation des particules
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: (particle.y - particle.speed * 0.1) % 105,
        x: (particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 0.1) % 105,
        opacity: particle.opacity + Math.sin(Date.now() * 0.002 + particle.id) * 0.1
      })));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 25%, #2563eb 50%, #3b82f6 75%, #60a5fa 100%)'
      }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: '100vh',
      background: palette.bgGradient,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Particules de fond */}
      {particles.map(particle => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: '50%',
            opacity: particle.opacity,
            filter: 'blur(1px)',
            animation: `float ${particle.speed * 2}s ease-in-out infinite alternate, glow 3s ease-in-out infinite alternate`
          }}
        />
      ))}

      {/* Overlay avec effet glassmorphism */}
      <Box sx={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
        backdropFilter: 'blur(8px)',
        zIndex: 1
      }} />

      <Box sx={{ position: 'relative', zIndex: 10, p: 4 }}>
        {/* Header avec animation */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, mb: 3 }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              background: palette.headerBlock, 
              borderRadius: 4, 
              transform: 'rotate(12deg) perspective(1000px) rotateY(15deg)', 
              boxShadow: colorScheme === 'green' ? '0 20px 40px rgba(16,185,129,0.35), 0 0 0 1px rgba(255,255,255,0.1)' : '0 20px 40px rgba(59,130,246,0.4), 0 0 0 1px rgba(255,255,255,0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              animation: 'spin 8s linear infinite, float 3s ease-in-out infinite alternate',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: -2,
                background: palette.headerRing,
                borderRadius: 6,
                zIndex: -1,
                animation: 'spin 4s linear infinite reverse'
              }
            }}>
              <Box sx={{ 
                position: 'absolute', 
                inset: 8, 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                {PageIcon && <PageIcon sx={{ color: palette.iconColor, fontSize: 32 }} />}
              </Box>
            </Box>
            <Box>
              <Typography variant="h2" sx={{ 
                fontWeight: 900, 
                background: 'linear-gradient(135deg, #fff, #93c5fd, #dbeafe)', 
                WebkitBackgroundClip: 'text', 
                color: 'transparent',
                animation: 'pulse 3s infinite, glow 2s ease-in-out infinite alternate',
                textShadow: '0 0 30px rgba(147, 197, 253, 0.5)',
                letterSpacing: '0.1em'
              }}>
                {title}
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 300,
                letterSpacing: '0.2em',
                textTransform: 'uppercase'
              }}>
                {subtitle}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Cartes de statistiques */}
        {statCards.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((card, index) => (
              <Grid item xs={12} md={4} key={card.title}>
                <Card
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  sx={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: hoveredCard === index 
                      ? '0 25px 50px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.3)' 
                      : '0 15px 35px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)',
                    transform: hoveredCard === index ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: 3, 
                        background: card.gradient,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        animation: hoveredCard === index ? 'pulse 1s ease-in-out infinite' : 'none'
                      }}>
                        <Box sx={{ color: 'white', fontSize: 28 }}>
                          {card.icon}
                        </Box>
                      </Box>
                      <Chip
                        icon={<TrendingUp />}
                        label={card.trend}
                        size="small"
                        sx={{
                          background: card.trendUp ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: card.trendUp ? '#22c55e' : '#ef4444',
                          border: `1px solid ${card.trendUp ? '#22c55e' : '#ef4444'}`,
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>

                    <Typography variant="h3" sx={{ 
                      fontWeight: 'bold', 
                      color: 'white',
                      mb: 1,
                      textShadow: '0 0 20px rgba(255,255,255,0.3)'
                    }}>
                      {card.value.toLocaleString()}
                    </Typography>

                    <Typography variant="h6" sx={{ 
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 600
                    }}>
                      {card.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Barre d'actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {onAdd && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onAdd}
                sx={{
                  background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                  borderRadius: 3,
                  py: 1.5,
                  px: 3,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 15px 35px rgba(37, 99, 235, 0.4)'
                  }
                }}
              >
                Ajouter
              </Button>
            )}

            {onRefresh && (
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={onRefresh}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderRadius: 3,
                  py: 1.5,
                  px: 3,
                  fontWeight: 'bold',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    borderColor: 'rgba(255,255,255,0.5)'
                  }
                }}
              >
                Actualiser
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {onExport && (
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={onExport}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderRadius: 3,
                  py: 1.5,
                  px: 3,
                  fontWeight: 'bold',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    borderColor: 'rgba(255,255,255,0.5)'
                  }
                }}
              >
                Exporter
              </Button>
            )}

            {onFilter && (
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={onFilter}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderRadius: 3,
                  py: 1.5,
                  px: 3,
                  fontWeight: 'bold',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    borderColor: 'rgba(255,255,255,0.5)'
                  }
                }}
              >
                Filtres
              </Button>
            )}
          </Box>
        </Box>

        {/* Contenu principal */}
        {children}
      </Box>

      {/* Styles CSS pour les animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0% { box-shadow: 0 0 5px currentColor; filter: brightness(1); }
          100% { box-shadow: 0 0 20px currentColor; filter: brightness(1.3); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </Box>
  );
};

export default ModernPageTemplate;
