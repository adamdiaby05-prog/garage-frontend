import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Button,
  Fade,
  Avatar,
  Badge,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  People,
  DirectionsCar,
  Build,
  Receipt,
  TrendingUp,
  TrendingDown,
  AutoAwesome,
  Timeline,
  Engineering,
  LocalOffer,
  FlashOn,
  WorkspacePremium,
  AttachMoney,
  Schedule,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { adminStatsAPI } from '../services/api';

// Tableau de bord Admin amélioré (sans Drawer/AppBar pour éviter les doublons avec le layout existant)
const DashboardAdmin = () => {
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);
  const [pulseMap, setPulseMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    clients: 0,
    vehicules: 0,
    reparations: 0,
    factures: 0,
    employes: 0,
    demandes: 0,
    rendezVous: 0,
    revenuTotal: 0,
    activitesRecentes: []
  });
  const [animatedStats, setAnimatedStats] = useState({
    clients: 0,
    vehicules: 0,
    reparations: 0,
    factures: 0
  });

  // Charger les statistiques depuis l'API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await adminStatsAPI.getStats();
        setStats(data);
        console.log('📊 Statistiques admin chargées:', data);
      } catch (err) {
        console.error('Erreur chargement stats admin:', err);
        setError('Impossible de charger les statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const resolvedStats = {
    clients: Number(stats?.clients ?? 0),
    vehicules: Number(stats?.vehicules ?? 0),
    reparations: Number(stats?.reparations ?? 0),
    factures: Number(stats?.factures ?? 0)
  };

  // Animation des statistiques (élasticité fluide)
  useEffect(() => {
    const duration = 2200;
    const steps = 80;
    const stepDuration = duration / steps;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const t = currentStep / steps;
      const easeOutElastic = 1 - Math.pow(2, -10 * t) * Math.cos((t * 10 - 0.75) * ((2 * Math.PI) / 3));
      setAnimatedStats({
        clients: Math.floor(resolvedStats.clients * Math.min(easeOutElastic, 1)),
        vehicules: Math.floor(resolvedStats.vehicules * Math.min(easeOutElastic, 1)),
        reparations: Math.floor(resolvedStats.reparations * Math.min(easeOutElastic, 1)),
        factures: Math.floor(resolvedStats.factures * Math.min(easeOutElastic, 1))
      });
      if (currentStep >= steps) clearInterval(interval);
    }, stepDuration);
    return () => clearInterval(interval);
  }, [resolvedStats.clients, resolvedStats.vehicules, resolvedStats.reparations, resolvedStats.factures]);

  // Badges qui pulsent périodiquement
  useEffect(() => {
    const keys = ['notifications', 'updates', 'alerts', 'achievements'];
    const pulseOnce = () => {
      keys.forEach((k, idx) => {
        setTimeout(() => {
          setPulseMap(prev => ({ ...prev, [k]: true }));
          setTimeout(() => setPulseMap(prev => ({ ...prev, [k]: false })), 900);
        }, idx * 450);
      });
    };
    const interval = setInterval(pulseOnce, 4500);
    pulseOnce();
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Clients Actifs',
      value: animatedStats.clients,
      icon: <People />,
      gradient: 'linear-gradient(135deg, #065f46, #059669, #10b981, #34d399)',
      trend: '+12.5%',
      trendUp: true,
      description: 'Clients enregistrés',
      progress: 85,
      badge: 'Premium'
    },
    {
      title: 'Véhicules',
      value: animatedStats.vehicules,
      icon: <DirectionsCar />,
      gradient: 'linear-gradient(135deg, #064e3b, #047857, #059669, #10b981)',
      trend: '+8.3%',
      trendUp: true,
      description: 'Flotte gérée',
      progress: 72,
      badge: 'Fleet'
    },
    {
      title: 'Réparations',
      value: animatedStats.reparations,
      icon: <Build />,
      gradient: 'linear-gradient(135deg, #14532d, #166534, #15803d, #16a34a)',
      trend: '+15.7%',
      trendUp: true,
      description: 'En cours',
      progress: 45,
      badge: 'Active'
    },
    {
      title: 'Revenus',
      value: animatedStats.factures,
      icon: <AttachMoney />,
      gradient: 'linear-gradient(135deg, #365314, #4d7c0f, #65a30d, #84cc16)',
      trend: '+22.1%',
      trendUp: true,
      description: 'K€ ce mois',
      progress: 92,
      badge: 'Pro'
    }
  ];

  const quickActions = [
    { title: 'Client VIP', icon: <WorkspacePremium />, gradient: 'linear-gradient(135deg, #f59e0b, #f97316)' },
    { title: 'Diagnostic', icon: <Engineering />, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
    { title: 'Facturation', icon: <LocalOffer />, gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' },
    { title: 'Planning', icon: <Timeline />, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' }
  ];

  // Fonction pour formater le temps relatif
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
  };

  // Fonction pour obtenir l'icône selon le type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'client': return <WorkspacePremium />;
      case 'reparation': return <Build />;
      case 'facture': return <AttachMoney />;
      default: return <CheckCircle />;
    }
  };

  // Fonction pour obtenir la couleur selon le type
  const getActivityColor = (type) => {
    switch (type) {
      case 'client': return '#f59e0b';
      case 'reparation': return '#22c55e';
      case 'facture': return '#84cc16';
      default: return '#10b981';
    }
  };

  // Transformer les activités récentes de l'API
  const recentActivities = Array.isArray(stats.activitesRecentes) ? stats.activitesRecentes.map((activity, index) => ({
    id: index + 1,
    action: activity.description,
    time: formatTimeAgo(activity.date_creation),
    icon: getActivityIcon(activity.type),
    color: getActivityColor(activity.type)
  })) : [];

  // Affichage de chargement
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f172a 50%, #1e293b 75%, #0a0a0a 100%)'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#10b981', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#e5e7eb' }}>
            Chargement des statistiques...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Affichage d'erreur
  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f172a 50%, #1e293b 75%, #0a0a0a 100%)'
      }}>
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f172a 50%, #1e293b 75%, #0a0a0a 100%)', overflow: 'hidden' }}>
      {/* Particules de fond */}
      {[...Array(24)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            background: `radial-gradient(circle, ${['#10b981', '#34d399', '#6ee7b7'][Math.floor(Math.random() * 3)]} 0%, transparent 70%)`,
            borderRadius: '50%',
            opacity: Math.random() * 0.7 + 0.1,
            animation: `float ${Math.random() * 4 + 3}s ease-in-out infinite alternate, glow ${Math.random() * 2 + 1}s ease-in-out infinite alternate`,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />
      ))}

      <Box sx={{ p: { xs: 2, md: 4 }, position: 'relative', zIndex: 2 }}>
        {/* En-tête simple */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome sx={{ color: '#10b981' }} />
          <Typography variant="h5" sx={{ color: '#e5e7eb', fontWeight: 800 }}>Dashboard Admin</Typography>
          <Chip label="Actif" size="small" sx={{ ml: 1, color: '#10b981', borderColor: '#10b981' }} variant="outlined" />
        </Box>

        {/* Cartes de statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} lg={3} key={card.title}>
              <Card
                onMouseEnter={() => setHoveredCardIndex(index)}
                onMouseLeave={() => setHoveredCardIndex(null)}
                sx={{
                  background: 'rgba(0, 0, 0, 0.55)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: 4,
                  border: hoveredCardIndex === index ? '2px solid rgba(16, 185, 129, 0.6)' : '1px solid rgba(16, 185, 129, 0.2)',
                  boxShadow: hoveredCardIndex === index ? '0 25px 50px rgba(16, 185, 129, 0.25), 0 0 30px rgba(16, 185, 129, 0.15)' : '0 10px 30px rgba(0, 0, 0, 0.3)',
                  transform: hoveredCardIndex === index ? 'translateY(-8px) scale(1.015)' : 'translateY(0) scale(1)',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'default'
                }}
              >
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent)',
                  transform: hoveredCardIndex === index ? 'translateX(200%)' : 'translateX(-100%)',
                  transition: 'transform 0.8s ease-in-out',
                  zIndex: 1
                }} />

                <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{
                      width: 70,
                      height: 70,
                      borderRadius: 4,
                      background: card.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      boxShadow: '0 15px 35px rgba(16, 185, 129, 0.25)',
                      animation: hoveredCardIndex === index ? 'pulse 1.1s ease-in-out infinite' : 'none',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -2,
                        background: card.gradient,
                        borderRadius: 5,
                        zIndex: -1,
                        filter: 'blur(5px)',
                        opacity: hoveredCardIndex === index ? 0.78 : 0.28,
                        transition: 'opacity 0.25s ease'
                      }
                    }}>
                      <Box sx={{ color: 'white', fontSize: 32, zIndex: 2 }}>{card.icon}</Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                      <Chip label={card.badge} size="small" sx={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981', fontWeight: 'bold' }} />
                      <Chip icon={card.trendUp ? <TrendingUp /> : <TrendingDown />} label={card.trend} size="small" sx={{ background: card.trendUp ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: card.trendUp ? '#22c55e' : '#ef4444', border: `1px solid ${card.trendUp ? '#22c55e' : '#ef4444'}`, fontWeight: 'bold' }} />
                    </Box>
                  </Box>

                  <Typography variant="h3" sx={{ fontWeight: 'bold', background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1, textShadow: '0 0 20px rgba(16, 185, 129, 0.25)' }}>
                    {Number(card.value).toLocaleString()}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 700, mb: 1 }}>{card.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mb: 2 }}>{card.description}</Typography>

                  <Box sx={{ position: 'relative' }}>
                    <LinearProgress
                      variant="determinate"
                      value={card.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.08)',
                        '& .MuiLinearProgress-bar': {
                          background: card.gradient,
                          borderRadius: 4,
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                            animation: hoveredCardIndex === index ? 'shimmer 1.5s ease-in-out infinite' : 'none'
                          }
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ position: 'absolute', right: 0, top: 10, color: '#34d399', fontWeight: 'bold' }}>{card.progress}%</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Actions rapides + Activités récentes */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(16px)', borderRadius: 4, border: '1px solid rgba(16, 185, 129, 0.2)', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FlashOn sx={{ color: '#f59e0b' }} />
                  Actions Rapides
                </Typography>
                <Grid container spacing={2}>
                  {quickActions.map((action) => (
                    <Grid item xs={6} key={action.title}>
                      <Button
                        variant="outlined"
                        startIcon={action.icon}
                        fullWidth
                        sx={{
                          color: 'white',
                          borderColor: 'rgba(16, 185, 129, 0.3)',
                          borderRadius: 3,
                          py: 2,
                          fontWeight: 'bold',
                          background: 'rgba(16, 185, 129, 0.1)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            background: action.gradient,
                            borderColor: 'transparent',
                            transform: 'translateY(-3px) scale(1.02)',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.35)'
                          }
                        }}
                      >
                        {action.title}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ background: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(16px)', borderRadius: 4, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 800, mb: 3 }}>Activités récentes</Typography>
                <Grid container spacing={2}>
                  {recentActivities.map((item) => (
                    <Grid item xs={12} sm={6} key={item.id}>
                      <Fade in timeout={500}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          borderRadius: 3,
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          transition: 'all 0.25s ease',
                          '&:hover': { transform: 'translateY(-3px)', borderColor: 'rgba(16, 185, 129, 0.25)' }
                        }}>
                          <Avatar sx={{ bgcolor: item.color, color: '#0b0f0f' }}>{item.icon}</Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ color: '#e5e7eb', fontWeight: 600 }}>{item.action}</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{item.time}</Typography>
                          </Box>
                          <Badge
                            variant="dot"
                            color="success"
                            sx={{ '& .MuiBadge-badge': { bgcolor: pulseMap.alerts ? '#22c55e' : 'rgba(34,197,94,0.6)' } }}
                          />
                        </Box>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-10px); }
        }
        @keyframes glow {
          0% { filter: brightness(1); }
          100% { filter: brightness(1.15); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Box>
  );
};

export default DashboardAdmin;

