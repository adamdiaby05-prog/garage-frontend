import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Build,
  Pending,
  CheckCircle,
  Schedule,
  Refresh,
  Download,
  FilterList,
  Add,
  Engineering,
  Inventory
} from '@mui/icons-material';

const DashboardMechanic = ({ stats }) => {
  const [particles, setParticles] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const animatedStats = useMemo(() => ({
    enCours: Number(stats?.reparationsEnCours || 0),
    terminees: Number(stats?.reparationsTerminees || 0),
    rdv: Number(stats?.rendezVous || 0)
  }), [stats]);

  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 22; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 3 + 0.5,
        color: ['#065f46', '#10b981', '#34d399', '#6ee7b7'][Math.floor(Math.random() * 4)],
        opacity: Math.random() * 0.6 + 0.2
      });
    }
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        y: (p.y - p.speed * 0.1) % 105,
        x: (p.x + Math.sin(Date.now() * 0.001 + p.id) * 0.1) % 105,
        opacity: p.opacity + Math.sin(Date.now() * 0.002 + p.id) * 0.08
      })));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Réparations en cours',
      value: animatedStats.enCours,
      icon: <Pending />,
      gradient: 'linear-gradient(135deg, #065f46, #10b981)'
    },
    {
      title: 'Réparations terminées',
      value: animatedStats.terminees,
      icon: <CheckCircle />,
      gradient: 'linear-gradient(135deg, #059669, #34d399)'
    },
    {
      title: 'Rendez-vous du jour',
      value: animatedStats.rdv,
      icon: <Schedule />,
      gradient: 'linear-gradient(135deg, #10b981, #6ee7b7)'
    }
  ];

  return (
    <Box sx={{
      flexGrow: 1,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #052e1a 0%, #065f46 25%, #10b981 50%, #34d399 75%, #6ee7b7 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
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

      <Box sx={{ position: 'relative', zIndex: 10, p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{
              width: 72,
              height: 72,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(16,185,129,0.35)',
              animation: 'spin 8s linear infinite, float 3s ease-in-out infinite alternate',
              position: 'relative'
            }}>
              <Box sx={{
                position: 'absolute', inset: 8,
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <Engineering sx={{ color: '#10b981', fontSize: 30 }} />
              </Box>
            </Box>
            <Box>
              <Typography variant="h3" sx={{
                fontWeight: 900,
                background: 'linear-gradient(135deg, #fff, #a7f3d0)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 0 24px rgba(167, 243, 208, 0.4)'
              }}>
                Atelier Mécanicien
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)', letterSpacing: '0.15em' }}>
                Outils, planning et suivis
              </Typography>
            </Box>
          </Box>

          {/* Actions rapides */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<Add />} sx={{
              background: 'linear-gradient(135deg, #065f46, #10b981)', borderRadius: 3, px: 3, py: 1.5,
              boxShadow: '0 10px 25px rgba(16,185,129,0.35)', '&:hover': { transform: 'translateY(-2px)' }
            }}>
              Nouvelle réparation
            </Button>
            <Button variant="outlined" startIcon={<Refresh />} sx={{
              color: 'white', borderColor: 'rgba(255,255,255,0.35)', borderRadius: 3, px: 3, py: 1.5,
              background: 'rgba(255,255,255,0.12)', '&:hover': { background: 'rgba(255,255,255,0.2)' }
            }}>
              Actualiser
            </Button>
            <Button variant="outlined" startIcon={<FilterList />} sx={{
              color: 'white', borderColor: 'rgba(255,255,255,0.35)', borderRadius: 3, px: 3, py: 1.5,
              background: 'rgba(255,255,255,0.12)', '&:hover': { background: 'rgba(255,255,255,0.2)' }
            }}>
              Filtres
            </Button>
            <Button variant="outlined" startIcon={<Download />} sx={{
              color: 'white', borderColor: 'rgba(255,255,255,0.35)', borderRadius: 3, px: 3, py: 1.5,
              background: 'rgba(255,255,255,0.12)', '&:hover': { background: 'rgba(255,255,255,0.2)' }
            }}>
              Exporter
            </Button>
          </Box>
        </Box>

        {/* Cartes Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} md={4} key={card.title}>
              <Card
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                sx={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: 3,
                  transition: 'all 0.35s ease',
                  transform: hoveredCard === index ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredCard === index
                    ? '0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.25)'
                    : '0 15px 35px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.12)'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{
                      width: 56, height: 56, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: card.gradient, color: 'white', boxShadow: '0 12px 28px rgba(0,0,0,0.2)'
                    }}>
                      {card.icon}
                    </Box>
                    <Chip
                      label={index === 0 ? '+3 en 24h' : index === 1 ? '+1 aujourd\'hui' : 'du jour'}
                      size="small"
                      sx={{
                        background: 'rgba(16,185,129,0.2)',
                        color: '#10b981',
                        border: '1px solid #10b981',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>

                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', mb: 0.5 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>

        {/* Dernières tâches (placeholder) */}
        <Paper sx={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(16px)',
          borderRadius: 3
        }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>Dernières interventions</Typography>
            <Tooltip title="Actualiser">
              <IconButton sx={{ color: 'white' }}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'rgba(255,255,255,0.08)' }}>
                  <TableCell sx={{ color: 'white' }}>N°</TableCell>
                  <TableCell sx={{ color: 'white' }}>Client</TableCell>
                  <TableCell sx={{ color: 'white' }}>Véhicule</TableCell>
                  <TableCell sx={{ color: 'white' }}>Statut</TableCell>
                  <TableCell sx={{ color: 'white' }}>Pièces</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>R-{100 + i}</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>Client {i}</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>Peugeot 208</TableCell>
                    <TableCell>
                      <Chip
                        icon={i % 2 ? <Pending /> : <Build />}
                        label={i % 2 ? 'En attente' : 'En cours'}
                        color={i % 2 ? 'warning' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip icon={<Inventory />} label={`${2 + i} utilisées`} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <style>{`
        @keyframes float { 0% { transform: translateY(0px); } 100% { transform: translateY(-16px); } }
        @keyframes glow { 0% { box-shadow: 0 0 5px currentColor; filter: brightness(1); } 100% { box-shadow: 0 0 16px currentColor; filter: brightness(1.15); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </Box>
  );
};

export default DashboardMechanic;











