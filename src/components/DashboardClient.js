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
  Alert
} from '@mui/material';
import {
  DirectionsCar,
  Build,
  Receipt,
  Star,
  Refresh,
  FilterList,
  Download,
  Add,
  CheckCircle
} from '@mui/icons-material';
import { reparationsAPI, vehiculesAPI, facturesAPI, rendezVousAPI } from '../services/api';

const DashboardClient = ({ stats }) => {
  const [particles, setParticles] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hasFinishedRepair, setHasFinishedRepair] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [finishedCount, setFinishedCount] = useState(0);
  const [clientVehicules, setClientVehicules] = useState([]);
  const [clientReparations, setClientReparations] = useState([]);
  const [clientFactures, setClientFactures] = useState([]);
  const [clientRendezVous, setClientRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);

  const animatedStats = useMemo(() => ({
    vehicules: Number(clientVehicules?.length || 0),
    reparations: Number(clientReparations?.length || 0),
    factures: Number(clientFactures?.length || 0),
    rendezVous: Number(clientRendezVous?.length || 0),
    reparationsValidees: Number(finishedCount || 0)
  }), [clientVehicules, clientReparations, clientFactures, clientRendezVous, finishedCount]);

  // Fonction pour récupérer les véhicules du client
  const fetchClientVehicules = async () => {
    try {
      const response = await vehiculesAPI.getClientVehicules();
      setClientVehicules(response.data);
    } catch (error) {
      console.error('Erreur récupération véhicules client:', error);
    }
  };

  // Fonction pour récupérer les réparations du client
  const fetchClientReparations = async () => {
    try {
      const response = await reparationsAPI.getClientReparations();
      setClientReparations(response.data);
      
      // Compter les réparations terminées
      const finished = response.data.filter(r => r.statut === 'terminée').length;
      setFinishedCount(finished);
    } catch (error) {
      console.error('Erreur récupération réparations client:', error);
    }
  };

  // Fonction pour récupérer les factures du client
  const fetchClientFactures = async () => {
    try {
      const response = await facturesAPI.getClientFactures();
      setClientFactures(response.data);
    } catch (error) {
      console.error('Erreur récupération factures client:', error);
    }
  };

  // Fonction pour récupérer les rendez-vous du client
  const fetchClientRendezVous = async () => {
    try {
      const response = await rendezVousAPI.getClientRendezVous();
      setClientRendezVous(response.data);
    } catch (error) {
      console.error('Erreur récupération rendez-vous client:', error);
    }
  };

  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 3 + 0.5,
        color: ['#7c2d12', '#ea580c', '#f59e0b', '#fbbf24'][Math.floor(Math.random() * 4)],
        opacity: Math.random() * 0.6 + 0.2
      });
    }
    setParticles(newParticles);
  }, []);

  // Charger les données du client au montage du composant
  useEffect(() => {
    const loadClientData = async () => {
      setLoading(true);
      await Promise.all([
        fetchClientVehicules(),
        fetchClientReparations(),
        fetchClientFactures(),
        fetchClientRendezVous()
      ]);
      setLoading(false);
    };
    
    loadClientData();
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

  // Charger les réparations du client pour afficher une bannière si l'une est terminée
  const fetchClientRepairs = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const clientId = stored?.id || stored?.id_client || stored?.userId;
      if (!clientId) return;
      const resp = await reparationsAPI.getByClient(clientId);
      const list = resp?.data || [];
      const norm = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}+/gu, '');
      const finished = list.filter(r => {
        const s = norm(r.statut);
        return r.validee_par_mecanicien === true || s.startsWith('termin') || s.startsWith('valide');
      });
      setFinishedCount(finished.length);
      if (finished.length > 0) {
        setHasFinishedRepair(true);
        // Extraire les noms/modèles de véhicules terminés
        const vehicleNames = finished
          .map(r => r.vehicule_info || r.vehicule_nom || r.vehicule || r.modele || r.marque || '')
          .map(v => v.toString().trim())
          .filter(Boolean);
        const uniqueNames = Array.from(new Set(vehicleNames));
        let vehiclesLabel = '';
        if (uniqueNames.length === 1) {
          vehiclesLabel = uniqueNames[0];
        } else if (uniqueNames.length === 2) {
          vehiclesLabel = `${uniqueNames[0]} et ${uniqueNames[1]}`;
        } else if (uniqueNames.length > 2) {
          vehiclesLabel = `${uniqueNames[0]}, ${uniqueNames[1]} et ${uniqueNames.length - 2} autre${uniqueNames.length-2>1?'s':''}`;
        }
        const baseMsg = `Bonne nouvelle ! ${finished.length} réparation${finished.length>1?'s':''} terminée${finished.length>1?'s':''}`;
        const withVehicle = vehiclesLabel ? `${baseMsg} (${vehiclesLabel}).` : `${baseMsg}.`;
        setBannerText(`${withVehicle} Vous pouvez récupérer votre véhicule ou consulter les détails.`);
      } else {
        setHasFinishedRepair(false);
        setBannerText('');
      }
    } catch (e) {
      // Ne pas bloquer l'UI si l'appel échoue
      setHasFinishedRepair(false);
      setBannerText('');
      setFinishedCount(0);
    }
  };

  useEffect(() => {
    fetchClientRepairs();
  }, []);

  const statCards = [
    {
      title: 'Mes véhicules',
      value: animatedStats.vehicules,
      icon: <DirectionsCar />,
      gradient: 'linear-gradient(135deg, #7c2d12, #ea580c)'
    },
    {
      title: 'Mes réparations',
      value: animatedStats.reparations,
      icon: <Build />,
      gradient: 'linear-gradient(135deg, #c2410c, #f59e0b)'
    },
    {
      title: 'Mes factures',
      value: animatedStats.factures,
      icon: <Receipt />,
      gradient: 'linear-gradient(135deg, #d97706, #fbbf24)'
    },
    {
      title: 'Réparations validées',
      value: animatedStats.reparationsValidees || 0,
      icon: <Build />,
      gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)'
    }
  ];

  return (
    <Box sx={{
      flexGrow: 1,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #431407 0%, #7c2d12 25%, #ea580c 50%, #f59e0b 75%, #fbbf24 100%)',
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
              background: 'linear-gradient(135deg, #ea580c, #f59e0b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(234,88,12,0.35)',
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
                <Star sx={{ color: '#ea580c', fontSize: 30 }} />
              </Box>
            </Box>
            <Box>
              <Typography variant="h3" sx={{
                fontWeight: 900,
                background: 'linear-gradient(135deg, #fff, #fde68a)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 0 24px rgba(253, 230, 138, 0.4)'
              }}>
                Espace Client
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.92)', letterSpacing: '0.15em' }}>
                Vos informations et services
              </Typography>
            </Box>
          </Box>

          {hasFinishedRepair && (
            <Alert
              severity="success"
              icon={<CheckCircle fontSize="inherit" />}
              sx={{
                borderRadius: 2,
                border: '1px solid rgba(34,197,94,0.6)',
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.25))',
                color: '#ecfdf5',
                mb: 2,
                animation: 'blink 1s step-start 0s infinite'
              }}
            >
              {bannerText || 'Votre réparation est terminée. Merci de consulter les détails ou de planifier la récupération du véhicule.'}
            </Alert>
          )}

          {/* Actions rapides */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<Add />} sx={{
              background: 'linear-gradient(135deg, #7c2d12, #ea580c)', borderRadius: 3, px: 3, py: 1.5,
              boxShadow: '0 10px 25px rgba(234,88,12,0.35)', '&:hover': { transform: 'translateY(-2px)' }
            }}>
              Ajouter un véhicule
            </Button>
            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchClientRepairs} sx={{
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
        <Grid container spacing={3}>
          {statCards.map((card, index) => (
            <Grid item xs={12} md={3} key={card.title}>
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
                      label={
                        index === 0 ? '+1 véhicule' : 
                        index === 1 ? '+1 ce mois' : 
                        index === 2 ? '+2 payées' :
                        '+1 validée'
                      }
                      size="small"
                      sx={{
                        background: index === 3 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: index === 3 ? '#3b82f6' : '#f59e0b',
                        border: `1px solid ${index === 3 ? '#3b82f6' : '#f59e0b'}`,
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
      </Box>

      <style>{`
        @keyframes float { 0% { transform: translateY(0px); } 100% { transform: translateY(-16px); } }
        @keyframes glow { 0% { box-shadow: 0 0 5px currentColor; filter: brightness(1); } 100% { box-shadow: 0 0 16px currentColor; filter: brightness(1.15); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes blink { 50% { opacity: 0.4; } }
      `}</style>
    </Box>
    );
};

export default DashboardClient;











