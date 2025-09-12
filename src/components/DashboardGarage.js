import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { Build, Pending, CheckCircle, Warning, DirectionsCar, Receipt, Visibility } from '@mui/icons-material';
import { demandesPrestationsAPI } from '../services/api';

const DashboardGarage = ({ stats }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentDemandes, setRecentDemandes] = useState([]);

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        setLoading(true);
        setError('');
        let user = {};
        try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}
        const garageId = user?.garage_id;
        if (!garageId) {
          setRecentDemandes([]);
          setLoading(false);
          return;
        }
        const res = await demandesPrestationsAPI.getByGarage(garageId);
        const list = Array.isArray(res) ? res : (res?.value || []);
        // Trier par date décroissante et limiter
        const sorted = list
          .slice()
          .sort((a, b) => new Date(b.date_demande) - new Date(a.date_demande))
          .slice(0, 8);
        setRecentDemandes(sorted);
      } catch (e) {
        console.error('Erreur chargement demandes garage:', e);
        setError("Impossible de charger les demandes du garage");
      } finally {
        setLoading(false);
      }
    };
    fetchDemandes();
  }, []);

  const statCards = [
    {
      title: 'Demandes',
      value: (recentDemandes?.length ?? 0).toString(),
      icon: <Build />,
      color: '#2563eb'
    },
    {
      title: 'En attente',
      value: (recentDemandes?.filter(d => d.statut === 'en_attente').length ?? 0).toString(),
      icon: <Pending />,
      color: '#f59e0b'
    },
    {
      title: 'Acceptées',
      value: (recentDemandes?.filter(d => d.statut === 'acceptee').length ?? 0).toString(),
      icon: <DirectionsCar />,
      color: '#10b981'
    },
    {
      title: 'Terminées',
      value: (recentDemandes?.filter(d => d.statut === 'terminee').length ?? 0).toString(),
      icon: <CheckCircle />,
      color: '#22c55e'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="warning">{error}</Alert>
        </Box>
      )}

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary">{card.title}</Typography>
                    <Typography variant="h4" sx={{ color: card.color, fontWeight: 'bold' }}>{card.value}</Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent demandes */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Dernières demandes</Typography>
            <List>
              {recentDemandes.map((d) => (
                <ListItem key={d.id} divider>
                  <ListItemIcon><Build /></ListItemIcon>
                  <ListItemText
                    primary={`${d.client_nom || ''} ${d.client_prenom || ''} — ${d.service_nom || 'Service'}`}
                    secondary={`Demandé le ${new Date(d.date_demande).toLocaleString('fr-FR')} • Statut: ${d.statut}`}
                  />
                  <Chip size="small" label={d.statut} color={d.statut === 'terminee' ? 'success' : d.statut === 'acceptee' ? 'primary' : d.statut === 'en_attente' ? 'warning' : 'default'} />
                </ListItem>
              ))}
              {recentDemandes.length === 0 && (
                <Typography variant="body2" color="text.secondary">Aucune demande récente.</Typography>
              )}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Raccourcis</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="contained" startIcon={<Build />} href="/garage-demandes">Gérer mes demandes</Button>
              <Button variant="outlined" startIcon={<Receipt />} href="/factures-garage">Voir mes factures</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardGarage;

