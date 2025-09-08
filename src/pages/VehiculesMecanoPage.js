import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { DirectionsCar, Person, Phone, Email, ElectricBolt, LocalGasStation, Nature } from '@mui/icons-material';
import ModernPageTemplate from '../components/ModernPageTemplate';
import AuthGuard from '../components/AuthGuard';
import MecanicienAuthError from '../components/MecanicienAuthError';
import MecanicienDebugInfo from '../components/MecanicienDebugInfo';

const VehiculesMecanoContent = () => {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVehicules = async () => {
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
      const response = await fetch(`${API_BASE}/mecanicien/vehicules`, {
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
      setVehicules(data || []);
    } catch (e) {
      console.error('❌ Erreur API:', e);
      console.error('❌ Status:', e.response?.status);
      console.error('❌ Data:', e.response?.data);
      
      if (e.message.includes('404') || e.message.includes('401')) {
        setError('auth_required');
      } else {
        setError("Impossible de charger les véhicules assignés.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicules();
  }, []);

  const getCarburantProps = (carburant) => {
    const value = (carburant || '').toString().toLowerCase();
    switch (value) {
      case 'electrique':
        return { color: 'info', label: 'Électrique', icon: <ElectricBolt sx={{ fontSize: 16 }} /> };
      case 'hybride':
        return { color: 'success', label: 'Hybride', icon: <Nature sx={{ fontSize: 16 }} /> };
      case 'diesel':
        return { color: 'secondary', label: 'Diesel', icon: <LocalGasStation sx={{ fontSize: 16 }} /> };
      case 'essence':
        return { color: 'primary', label: 'Essence', icon: <LocalGasStation sx={{ fontSize: 16 }} /> };
      default:
        return { color: 'default', label: carburant || '—', icon: null };
    }
  };

  const getCarburantChipSx = (colorKey) => {
    // Styles inspirés des badges de la page admin
    const base = {
      borderRadius: 2,
      fontWeight: 700,
      letterSpacing: 0.2,
      px: 1.2,
      boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
    };
    switch (colorKey) {
      case 'primary':
        return { ...base, bgcolor: 'rgba(59,130,246,0.12)', color: '#1e3a8a', border: '1px solid rgba(59,130,246,0.35)' };
      case 'secondary':
        return { ...base, bgcolor: 'rgba(156,163,175,0.15)', color: '#374151', border: '1px solid rgba(156,163,175,0.35)' };
      case 'success':
        return { ...base, bgcolor: 'rgba(16,185,129,0.12)', color: '#065f46', border: '1px solid rgba(16,185,129,0.35)' };
      case 'info':
        return { ...base, bgcolor: 'rgba(14,165,233,0.12)', color: '#0c4a6e', border: '1px solid rgba(14,165,233,0.35)' };
      default:
        return { ...base, bgcolor: 'rgba(107,114,128,0.12)', color: '#374151', border: '1px solid rgba(107,114,128,0.25)' };
    }
  };

  if (loading) {
    return (
      <ModernPageTemplate 
        title="Mes Véhicules Assignés"
        icon={DirectionsCar}
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
      return <MecanicienDebugInfo onRetry={() => fetchVehicules()} />;
    } else {
      // L'utilisateur n'est pas connecté - afficher le message d'erreur standard
      return <MecanicienAuthError message="Vous devez être connecté en tant que mécanicien pour voir vos véhicules assignés." />;
    }
  }

  if (error) {
    return (
      <ModernPageTemplate 
        title="Mes Véhicules Assignés"
        icon={DirectionsCar}
        colorScheme={(() => { try { const u = JSON.parse(localStorage.getItem('user')||'{}'); return u.role==='mecanicien'?'green':'blue'; } catch { return 'blue'; } })()}
      >
        <Alert severity="error">{error}</Alert>
      </ModernPageTemplate>
    );
  }

  return (
    <ModernPageTemplate 
      title="Mes Véhicules Assignés"
      subtitle="Véhicules liés à vos interventions"
      icon={DirectionsCar}
      statCards={[
        { title: 'Total', value: vehicules.length, icon: <DirectionsCar />, gradient: 'linear-gradient(135deg, #10b981, #6ee7b7)' },
        { title: 'Essence', value: vehicules.filter(v => (v.carburant||'').toLowerCase()==='essence').length, icon: <LocalGasStation />, gradient: 'linear-gradient(135deg, #1e3a8a, #60a5fa)' },
        { title: 'Diesel', value: vehicules.filter(v => (v.carburant||'').toLowerCase()==='diesel').length, icon: <LocalGasStation />, gradient: 'linear-gradient(135deg, #0b3a2b, #10b981)' },
        { title: 'Hybride', value: vehicules.filter(v => (v.carburant||'').toLowerCase()==='hybride').length, icon: <Nature />, gradient: 'linear-gradient(135deg, #065f46, #10b981)' },
        { title: 'Électrique', value: vehicules.filter(v => (v.carburant||'').toLowerCase()==='electrique').length, icon: <ElectricBolt />, gradient: 'linear-gradient(135deg, #059669, #34d399)' }
      ]}
      colorScheme={(() => { try { const u = JSON.parse(localStorage.getItem('user')||'{}'); return u.role==='mecanicien'?'green':'blue'; } catch { return 'blue'; } })()}
      onRefresh={fetchVehicules}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Véhicules assignés à mes réparations
        </Typography>
      </Box>

      {vehicules.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <DirectionsCar sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Aucun véhicule assigné
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vous n'avez pas encore de véhicules assignés à vos réparations.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {vehicules.map((vehicule) => (
            <Grid item xs={12} md={6} lg={4} key={vehicule.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <DirectionsCar sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="div">
                      {vehicule.marque} {vehicule.modele}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Immatriculation:</strong> {vehicule.immatriculation}
                  </Typography>
                  
                  {vehicule.annee && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Année:</strong> {vehicule.annee}
                    </Typography>
                  )}
                  
                  {vehicule.kilometrage && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Kilométrage:</strong> {vehicule.kilometrage.toLocaleString()} km
                    </Typography>
                  )}
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    {(() => { const p = getCarburantProps(vehicule.carburant); return (
                      <Chip label={p.label} color={p.color} size="small" icon={p.icon} sx={getCarburantChipSx(p.color)} />
                    ); })()}
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <Person sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {vehicule.client_nom}
                    </Typography>
                  </Box>
                  
                  {vehicule.client_telephone && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <Phone sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {vehicule.client_telephone}
                      </Typography>
                    </Box>
                  )}
                  
                  {vehicule.client_email && (
                    <Box display="flex" alignItems="center">
                      <Email sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {vehicule.client_email}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </ModernPageTemplate>
  );
};

const VehiculesMecanoPage = () => {
  return (
    <AuthGuard requiredRole="mecanicien">
      <VehiculesMecanoContent />
    </AuthGuard>
  );
};

export default VehiculesMecanoPage;
