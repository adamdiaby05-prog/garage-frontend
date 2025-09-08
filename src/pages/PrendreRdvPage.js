import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Button, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Snackbar
} from '@mui/material';
import { Add, Schedule, Edit, Delete, CheckCircle, Cancel } from '@mui/icons-material';
import { rendezVousAPI } from '../services/api';
import ModernPageTemplate from '../components/ModernPageTemplate';
import RendezVousForm from '../components/forms/RendezVousForm';

// L'id client vient de l'authentification (localStorage.user.client_id)
const PrendreRdvPage = () => {
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedRendezVous, setSelectedRendezVous] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [clientId, setClientId] = useState(null);

  const fetchRdvs = async () => {
    try {
      setLoading(true);
      setError('');
      if (!clientId) throw new Error("Aucun client_id. Connectez-vous en tant que client.");
      const response = await rendezVousAPI.getByClient(clientId);
      setRdvs(response.data || []);
    } catch (err) {
      console.error('Erreur chargement RDV client:', err);
      setError("Impossible de charger vos rendez-vous. "+(err.message||''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u && u.role === 'client' && u.client_id) setClientId(u.client_id);
        else setError("Connectez-vous avec un compte client.");
      } else setError("Vous n'êtes pas connecté.");
    } catch {}
  }, []);

  useEffect(() => { if (clientId) fetchRdvs(); }, [clientId]);

  const handleEdit = (rdv) => {
    setSelectedRendezVous(rdv);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await rendezVousAPI.delete(id);
      setSnackbar({ open: true, message: 'Rendez-vous supprimé', severity: 'success' });
      fetchRdvs();
    } catch (e) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirme': return 'success';
      case 'en_attente': return 'warning';
      case 'annule': return 'error';
      case 'termine': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirme': return 'Confirmé';
      case 'en_attente': return 'En attente';
      case 'annule': return 'Annulé';
      case 'termine': return 'Terminé';
      default: return status || 'N/A';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirme':
      case 'termine':
        return <CheckCircle fontSize="small" />;
      case 'annule':
        return <Cancel fontSize="small" />;
      default:
        return <Schedule fontSize="small" />;
    }
  };

  return (
    <ModernPageTemplate
      title="Prendre un rendez-vous"
      subtitle="Vos demandes et suivis"
      icon={Schedule}
      colorScheme={(() => { try { const u = JSON.parse(localStorage.getItem('user')||'{}'); return u.role==='client'?'orange':'blue'; } catch { return 'orange'; } })()}
      onAdd={() => setShowForm(true)}
      onRefresh={fetchRdvs}
      statCards={[
        { title: 'Confirmés', value: rdvs.filter(r=>r.statut==='confirme').length, icon: <CheckCircle />, gradient: 'linear-gradient(135deg, #7c2d12, #ea580c)' },
        { title: 'En attente', value: rdvs.filter(r=>r.statut==='en_attente').length, icon: <Schedule />, gradient: 'linear-gradient(135deg, #c2410c, #f59e0b)' },
        { title: 'Total', value: rdvs.length, icon: <Schedule />, gradient: 'linear-gradient(135deg, #d97706, #fbbf24)' }
      ]}
    >

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Date & Heure</strong></TableCell>
                <TableCell><strong>Véhicule</strong></TableCell>
                <TableCell><strong>Motif</strong></TableCell>
                <TableCell><strong>Mécanicien</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rdvs.map((rdv, index) => (
                <TableRow key={rdv.id || `rdv-client-${index}`} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {new Date(rdv.date_rdv).toLocaleDateString('fr-FR')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(rdv.date_rdv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{rdv.vehicule_info || '—'}</TableCell>
                  <TableCell>{rdv.motif || '—'}</TableCell>
                  <TableCell>{rdv.employe_nom || 'Non assigné'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(rdv.statut)}
                      color={getStatusColor(rdv.statut)}
                      size="small"
                      icon={getStatusIcon(rdv.statut)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" color="primary" onClick={() => handleEdit(rdv)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(rdv.id)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {rdvs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Vous n'avez pas encore de rendez-vous. Cliquez sur "Nouveau rendez-vous" pour en créer un.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <RendezVousForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => { fetchRdvs(); setSnackbar({ open: true, message: selectedRendezVous ? 'Rendez-vous modifié' : 'Rendez-vous créé', severity: 'success' }); setSelectedRendezVous(null); }}
        fixedClientId={clientId}
        simpleClientMode
        rendezVous={selectedRendezVous}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ModernPageTemplate>
  );
};

export default PrendreRdvPage;


