import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  People,
  DirectionsCar,
  Build,
  Receipt,
  Schedule,
  Warning,
  CheckCircle,
  Pending
} from '@mui/icons-material';
import { dashboardAPI } from '../services/api';
import DashboardAdmin from './DashboardAdmin';
import DashboardMechanic from './DashboardMechanic';
import DashboardClient from './DashboardClient';

const Dashboard = ({ userRole = 'admin' }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Charger les statistiques depuis l'API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Timeout pour éviter les attentes infinies
        const timeoutId = setTimeout(() => {
          setError('Délai d\'attente dépassé. Vérifiez que le serveur backend est démarré.');
          setLoading(false);
        }, 10000); // 10 secondes de timeout
        
        const response = await dashboardAPI.getStats();
        clearTimeout(timeoutId);
        
        if (response && response.data) {
          setStats(response.data);
        } else {
          throw new Error('Réponse invalide du serveur');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        
        // Messages d'erreur plus spécifiques
        if (err.code === 'ECONNREFUSED') {
          setError('Impossible de se connecter au serveur. Vérifiez que le serveur backend est démarré sur le port 5000.');
        } else if (err.response?.status === 500) {
          setError('Erreur serveur. Vérifiez la connexion à la base de données.');
        } else if (err.message.includes('timeout')) {
          setError('Délai d\'attente dépassé. Le serveur met trop de temps à répondre.');
        } else {
          setError('Erreur lors du chargement des statistiques. Vérifiez la console pour plus de détails.');
        }
        
        // Utiliser des données par défaut en cas d'erreur
        setStats({
          clients: 0,
          vehicules: 0,
          reparations: 0,
          factures: 0,
          reparationsEnCours: 0,
          reparationsTerminees: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getDashboardData = () => {
    if (!stats) return { stats: [], recentActivity: [] };

    switch (userRole) {
      case 'admin':
        return {
          stats: [
            { title: 'Clients', value: stats.clients?.toString() || '0', icon: <People />, color: '#1976d2' },
            { title: 'Véhicules', value: stats.vehicules?.toString() || '0', icon: <DirectionsCar />, color: '#2e7d32' },
            { title: 'Réparations', value: stats.reparations?.toString() || '0', icon: <Build />, color: '#ed6c02' },
            { title: 'Factures', value: stats.factures?.toString() || '0', icon: <Receipt />, color: '#9c27b0' }
          ],
          recentActivity: [
            { text: 'Nouvelle réparation #REP-2024-001', status: 'en_cours', time: '2h' },
            { text: 'Facture #FAC-2024-089 payée', status: 'termine', time: '4h' },
            { text: 'Rendez-vous annulé - Client Dupont', status: 'annule', time: '6h' },
            { text: 'Stock critique - Filtres à huile', status: 'warning', time: '8h' }
          ]
        };
      
      case 'mecanicien':
        return {
          stats: [
            { title: 'Mes Réparations', value: ((Number(stats.reparationsEnCours || 0) + Number(stats.reparationsTerminees || 0)).toString()), icon: <Build />, color: '#ed6c02' },
            { title: 'En Cours', value: stats.reparationsEnCours?.toString() || '0', icon: <Pending />, color: '#1976d2' },
            { title: 'Terminées', value: stats.reparationsTerminees?.toString() || '0', icon: <CheckCircle />, color: '#2e7d32' },
            { title: 'Rendez-vous', value: stats.rendezVous?.toString() || '0', icon: <Schedule />, color: '#9c27b0' }
          ],
          recentActivity: [
            { text: 'Réparation #REP-2024-001 - Diagnostic terminé', status: 'en_cours', time: '1h' },
            { text: 'Réparation #REP-2024-002 - En attente de pièces', status: 'pending', time: '3h' },
            { text: 'RDV 14h00 - Client Martin', status: 'termine', time: '5h' },
            { text: 'Réparation #REP-2024-003 - Terminée', status: 'termine', time: '7h' }
          ]
        };
      
      case 'client':
        return {
          stats: [
            { title: 'Mes Véhicules', value: stats.vehicules?.toString() || '0', icon: <DirectionsCar />, color: '#2e7d32' },
            { title: 'Réparations', value: stats.reparations?.toString() || '0', icon: <Build />, color: '#ed6c02' },
            { title: 'Factures', value: stats.factures?.toString() || '0', icon: <Receipt />, color: '#9c27b0' },
            { title: 'Rendez-vous', value: stats.rendezVous?.toString() || '0', icon: <Schedule />, color: '#1976d2' }
          ],
          recentActivity: [
            { text: 'Facture #FAC-2024-089 - Payée', status: 'termine', time: '2h' },
            { text: 'Réparation #REP-2024-001 - En cours', status: 'en_cours', time: '1j' },
            { text: 'RDV confirmé - 15/08/2024 10h00', status: 'termine', time: '2j' },
            { text: 'Nouveau véhicule ajouté - Peugeot 308', status: 'termine', time: '3j' }
          ]
        };
      
      default:
        return { stats: [], recentActivity: [] };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'termine':
      case 'payee':
        return 'success';
      case 'en_cours':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'annule':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'termine':
      case 'payee':
        return <CheckCircle fontSize="small" />;
      case 'en_cours':
        return <Pending fontSize="small" />;
      case 'pending':
        return <Pending fontSize="small" />;
      case 'annule':
        return <Warning fontSize="small" />;
      case 'warning':
        return <Warning fontSize="small" />;
      default:
        return <Pending fontSize="small" />;
    }
  };

  const data = getDashboardData();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
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

  // Afficher un composant de dashboard distinct selon le rôle
  if (userRole === 'admin') {
    return <DashboardAdmin stats={stats} />;
  }
  if (userRole === 'mecanicien') {
    return <DashboardMechanic stats={stats} />;
  }
  if (userRole === 'client') {
    return <DashboardClient stats={stats} />;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Tableau de bord - {userRole === 'admin' ? 'Administration' : userRole === 'mecanicien' ? 'Mécanicien' : 'Espace Client'}
      </Typography>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {data.stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ color: stat.color, fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Activité récente */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Activité récente
            </Typography>
            <List>
              {data.recentActivity.map((activity, index) => (
                <ListItem key={index} divider={index < data.recentActivity.length - 1}>
                  <ListItemIcon>
                    {getStatusIcon(activity.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.text}
                    secondary={`Il y a ${activity.time}`}
                  />
                  <Chip
                    label={activity.status.replace('_', ' ')}
                    color={getStatusColor(activity.status)}
                    size="small"
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Actions rapides
            </Typography>
            <List>
              {userRole === 'admin' && (
                <>
                  <ListItem button>
                    <ListItemText primary="Ajouter un client" />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="Nouvelle réparation" />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="Gérer le stock" />
                  </ListItem>
                </>
              )}
              {userRole === 'mecanicien' && (
                <>
                  <ListItem button>
                    <ListItemText primary="Voir mes réparations" />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="Consulter le planning" />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="Demander des pièces" />
                  </ListItem>
                </>
              )}
              {userRole === 'client' && (
                <>
                  <ListItem button>
                    <ListItemText primary="Prendre un RDV" />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="Voir mes factures" />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="Ajouter un véhicule" />
                  </ListItem>
                </>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
