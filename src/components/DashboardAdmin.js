import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  IconButton,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button,
  Tooltip,
  Badge
} from '@mui/material';
import {
  People,
  DirectionsCar,
  Build,
  Receipt,
  TrendingUp,
  TrendingDown,
  Speed,
  CheckCircle,
  Warning,
  Error,
  AutoAwesome,
  Bolt,
  Star,
  Timeline,
  BarChart,
  PieChart,
  MoreVert,
  Visibility,
  Edit,
  Delete
} from '@mui/icons-material';

const DashboardAdmin = ({ stats }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    clients: 0,
    vehicules: 0,
    reparations: 0,
    factures: 0
  });

  // Animation des statistiques
  useEffect(() => {
    const animateStats = () => {
      const targetStats = {
        clients: stats?.clients || 0,
        vehicules: stats?.vehicules || 0,
        reparations: stats?.reparations || 0,
        factures: stats?.factures || 0
      };

      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        setAnimatedStats({
          clients: Math.floor(targetStats.clients * easeOutQuart),
          vehicules: Math.floor(targetStats.vehicules * easeOutQuart),
          reparations: Math.floor(targetStats.reparations * easeOutQuart),
          factures: Math.floor(targetStats.factures * easeOutQuart)
        });

        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    };

    animateStats();
  }, [stats]);

  const statCards = [
    {
      title: 'Clients',
      value: animatedStats.clients,
      icon: <People />,
      color: '#1e40af',
      gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)',
      trend: '+12%',
      trendUp: true,
      description: 'Clients actifs'
    },
    {
      title: 'Véhicules',
      value: animatedStats.vehicules,
      icon: <DirectionsCar />,
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      trend: '+8%',
      trendUp: true,
      description: 'Véhicules enregistrés'
    },
    {
      title: 'Réparations',
      value: animatedStats.reparations,
      icon: <Build />,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #93c5fd)',
      trend: '+15%',
      trendUp: true,
      description: 'Réparations en cours'
    },
    {
      title: 'Factures',
      value: animatedStats.factures,
      icon: <Receipt />,
      color: '#60a5fa',
      gradient: 'linear-gradient(135deg, #60a5fa, #dbeafe)',
      trend: '+22%',
      trendUp: true,
      description: 'Factures générées'
    }
  ];

  const recentActivities = [
    { id: 1, action: 'Nouveau client inscrit', time: 'Il y a 5 min', type: 'client', icon: <People /> },
    { id: 2, action: 'Réparation terminée', time: 'Il y a 15 min', type: 'success', icon: <CheckCircle /> },
    { id: 3, action: 'Facture générée', time: 'Il y a 30 min', type: 'info', icon: <Receipt /> },
    { id: 4, action: 'Véhicule ajouté', time: 'Il y a 1h', type: 'vehicle', icon: <DirectionsCar /> },
    { id: 5, action: 'Rendez-vous confirmé', time: 'Il y a 2h', type: 'warning', icon: <Warning /> }
  ];

  const quickActions = [
    { title: 'Ajouter Client', icon: <People />, color: '#1e40af' },
    { title: 'Nouvelle Réparation', icon: <Build />, color: '#2563eb' },
    { title: 'Générer Facture', icon: <Receipt />, color: '#3b82f6' },
    { title: 'Planifier RDV', icon: <Timeline />, color: '#60a5fa' }
  ];

  return (
    <Box sx={{ 
      p: 4, 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 25%, #2563eb 50%, #3b82f6 75%, #60a5fa 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Particules de fond */}
      {[...Array(20)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            backgroundColor: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'][Math.floor(Math.random() * 4)],
            borderRadius: '50%',
            opacity: Math.random() * 0.6 + 0.2,
            animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite alternate, glow 2s ease-in-out infinite alternate`,
            zIndex: 1
          }}
        />
      ))}

      {/* Overlay avec effet glassmorphism */}
      <Box sx={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
        backdropFilter: 'blur(8px)',
        zIndex: 2
      }} />

      <Box sx={{ position: 'relative', zIndex: 10 }}>
        {/* Header avec animation */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, mb: 3 }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              background: 'linear-gradient(135deg, #1e40af, #2563eb, #3b82f6)', 
              borderRadius: 4, 
              transform: 'rotate(12deg) perspective(1000px) rotateY(15deg)', 
              boxShadow: '0 20px 40px rgba(59,130,246,0.4), 0 0 0 1px rgba(255,255,255,0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              animation: 'spin 8s linear infinite, float 3s ease-in-out infinite alternate',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: -2,
                background: 'linear-gradient(45deg, #1e40af, #3b82f6, #60a5fa, #93c5fd)',
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
                <AutoAwesome sx={{ color: '#1976d2', fontSize: 32 }} />
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
                Dashboard Admin
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 300,
                letterSpacing: '0.2em',
                textTransform: 'uppercase'
              }}>
                Vue d'ensemble du garage
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Cartes de statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
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
                {/* Bordure animée */}
                <Box sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 4,
                  padding: '2px',
                  background: card.gradient,
                  backgroundSize: '200% 200%',
                  animation: hoveredCard === index ? 'gradientShift 2s ease infinite' : 'none',
                  zIndex: -1
                }} />

                <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
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
                      icon={card.trendUp ? <TrendingUp /> : <TrendingDown />}
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
                    fontWeight: 600,
                    mb: 1
                  }}>
                    {card.title}
                  </Typography>

                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    mb: 2
                  }}>
                    {card.description}
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min((card.value / 100) * 100, 100)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      background: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        background: card.gradient,
                        borderRadius: 3
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Section des actions rapides et activités récentes */}
        <Grid container spacing={3}>
          {/* Actions rapides */}
          <Grid item xs={12} md={4}>
            <Card sx={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Bolt sx={{ color: '#fbbf24' }} />
                  Actions Rapides
                </Typography>

      <Grid container spacing={2}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={6} key={action.title}>
                      <Button
                        variant="outlined"
                        startIcon={action.icon}
                        fullWidth
                        sx={{
                          color: 'white',
                          borderColor: action.color,
                          borderRadius: 3,
                          py: 1.5,
                          fontWeight: 'bold',
                          background: 'rgba(255,255,255,0.05)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            background: `${action.color}20`,
                            borderColor: action.color,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 10px 25px ${action.color}40`
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

          {/* Activités récentes */}
          <Grid item xs={12} md={8}>
            <Card sx={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Timeline sx={{ color: '#fbbf24' }} />
                  Activités Récentes
                </Typography>

                <List sx={{ p: 0 }}>
                  {recentActivities.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem sx={{ 
                        px: 0, 
                        py: 1.5,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: 2,
                          transform: 'translateX(8px)'
                        }
                      }}>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            background: activity.type === 'success' ? '#22c55e' : 
                                       activity.type === 'warning' ? '#f59e0b' : 
                                       activity.type === 'error' ? '#ef4444' : '#3b82f6',
                            animation: 'pulse 2s ease-in-out infinite'
                          }}>
                            {activity.icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography sx={{ 
                              color: 'white', 
                              fontWeight: 500,
                              fontSize: '1rem'
                            }}>
                              {activity.action}
                            </Typography>
                          }
                          secondary={
                            <Typography sx={{ 
                              color: 'rgba(255,255,255,0.7)',
                              fontSize: '0.875rem'
                            }}>
                              {activity.time}
                            </Typography>
                          }
                        />
                        <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          <MoreVert />
                        </IconButton>
                      </ListItem>
                      {index < recentActivities.length - 1 && (
                        <Divider sx={{ 
                          borderColor: 'rgba(255,255,255,0.1)',
                          my: 1
                        }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
      </Grid>
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
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </Box>
  );
};

export default DashboardAdmin;









