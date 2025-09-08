import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid,
  Button
} from '@mui/material';
import { Event, Person, Phone, Email, DirectionsCar, Build, CheckCircle, Schedule as ScheduleIcon } from '@mui/icons-material';
import { rendezVousAPI } from '../services/api';
import ModernPageTemplate from '../components/ModernPageTemplate';
import AuthGuard from '../components/AuthGuard';
import MecanicienAuthError from '../components/MecanicienAuthError';
import MecanicienDebugInfo from '../components/MecanicienDebugInfo';

const RendezVousMecanoContent = () => {
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRendezVous = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Vérifier l'authentification avant l'appel API
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        console.log('🔒 Utilisateur non authentifié');
        setError('auth_required');
        setLoading(false);
        return;
      }
      
      const userData = JSON.parse(user);
      if (userData.role !== 'mecanicien') {
        console.log('🚫 Accès refusé - rôle non autorisé:', userData.role);
        setError('auth_required');
        setLoading(false);
        return;
      }
      
      console.log('✅ Utilisateur authentifié, appel API...');
      console.log('🔑 Token:', token.substring(0, 20) + '...');
      console.log('👤 User:', userData);
      
      // Appel API direct avec headers explicites
      const API_BASE = process.env.REACT_APP_API_BASE_URL || '/api';
      const response = await fetch(`${API_BASE}/mecanicien/rendez-vous`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Réponse API:', data);
      setRendezVous(data || []);
    } catch (e) {
      console.error('❌ Erreur API:', e);
      console.error('❌ Status:', e.response?.status);
      console.error('❌ Data:', e.response?.data);
      
      if (e.message.includes('404') || e.message.includes('401')) {
        setError('auth_required');
      } else {
        setError("Impossible de charger vos rendez-vous.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRendezVous();
  }, []);

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'planifie': return 'primary';
      case 'en_cours': return 'warning';
      case 'termine': return 'success';
      case 'annule': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ModernPageTemplate 
        title="Mes Rendez-vous"
        icon={Event}
        colorScheme={(() => { try { const u = JSON.parse(localStorage.getItem('user')||'{}'); return u.role==='mecanicien'?'green':'blue'; } catch { return 'blue'; } })()}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </ModernPageTemplate>
    );
  }

  if (error === 'auth_required') {
    // Vérifier si l'utilisateur est connecté mais avec un problème d'authentification
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      // L'utilisateur est connecté mais la vérification échoue - afficher les infos de debug
      return <MecanicienDebugInfo onRetry={() => fetchRendezVous()} />;
    } else {
      // L'utilisateur n'est pas connecté - afficher le message d'erreur standard
      return <MecanicienAuthError message="Vous devez être connecté en tant que mécanicien pour voir vos rendez-vous assignés." />;
    }
  }

  if (error) {
    return (
      <ModernPageTemplate 
        title="Mes Rendez-vous"
        icon={Event}
        colorScheme={(() => { try { const u = JSON.parse(localStorage.getItem('user')||'{}'); return u.role==='mecanicien'?'green':'blue'; } catch { return 'blue'; } })()}
      >
        <Alert severity="error">{error}</Alert>
      </ModernPageTemplate>
    );
  }

  return (
    <ModernPageTemplate 
      title="Mes Rendez-vous"
      subtitle="Rendez-vous assignés à mes services"
      icon={Event}
      statCards={[
        { title: 'Total', value: rendezVous.length, icon: <Event />, gradient: 'linear-gradient(135deg, #10b981, #6ee7b7)' },
        { title: 'Planifiés', value: rendezVous.filter(r => (r.statut||'').toLowerCase()==='planifie').length, icon: <ScheduleIcon />, gradient: 'linear-gradient(135deg, #065f46, #10b981)' },
        { title: 'En cours', value: rendezVous.filter(r => (r.statut||'').toLowerCase()==='en_cours').length, icon: <Build />, gradient: 'linear-gradient(135deg, #059669, #34d399)' }
      ]}
      colorScheme={(() => { try { const u = JSON.parse(localStorage.getItem('user')||'{}'); return u.role==='mecanicien'?'green':'blue'; } catch { return 'blue'; } })()}
      onRefresh={fetchRendezVous}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Rendez-vous assignés à mes services
        </Typography>
      </Box>

      {rendezVous.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Event sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Aucun rendez-vous assigné
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vous n'avez pas encore de rendez-vous assignés.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {rendezVous.map((rdv) => (
            <Grid item xs={12} md={6} lg={4} key={rdv.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Event sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="div">
                      {formatDate(rdv.date_rdv)}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <Chip 
                      label={rdv.statut} 
                      color={getStatutColor(rdv.statut)}
                      size="small"
                    />
                  </Box>
                  
                  {rdv.service_nom && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Service:</strong> {rdv.service_nom}
                    </Typography>
                  )}
                  
                  {rdv.vehicule_info && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <DirectionsCar sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {rdv.vehicule_info}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <Person sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {rdv.client_nom}
                    </Typography>
                  </Box>
                  
                  {rdv.client_telephone && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <Phone sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {rdv.client_telephone}
                      </Typography>
                    </Box>
                  )}
                  
                  {rdv.client_email && (
                    <Box display="flex" alignItems="center" mb={2}>
                      <Email sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {rdv.client_email}
                      </Typography>
                    </Box>
                  )}
                  
                  {rdv.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      "{rdv.notes}"
                    </Typography>
                  )}
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={async () => {
                        try {
                          await rendezVousAPI.toReparation(rdv.id, { employe_id: rdv.employe_id || null });
                          // Optionnel: toast/snackbar global si dispo
                          await fetchRendezVous();
                        } catch (e) {
                          // Ignorer, un message est suffisant côté réseau
                        }
                      }}
                    >
                      Accepter
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </ModernPageTemplate>
  );
};

const RendezVousMecanoPage = () => {
  return (
    <AuthGuard requiredRole="mecanicien">
      <RendezVousMecanoContent />
    </AuthGuard>
  );
};

export default RendezVousMecanoPage;
