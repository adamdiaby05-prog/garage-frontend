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
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Build, Edit, Pending, CheckCircle } from '@mui/icons-material';
import { reparationsAPI } from '../services/api';
import ModernPageTemplate from '../components/ModernPageTemplate';
import AuthGuard from '../components/AuthGuard';
import MecanicienAuthError from '../components/MecanicienAuthError';
import MecanicienDebugInfo from '../components/MecanicienDebugInfo';

const MesReparationsContent = () => {
  const [reparations, setReparations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRep, setSelectedRep] = useState(null);
  const [rapport, setRapport] = useState('');
  const [duree, setDuree] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchReps = async () => {
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
      const response = await fetch(`${API_BASE}/mecanicien/reparations`, {
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
      setReparations(data || []);
    } catch (e) {
      console.error('❌ Erreur API:', e);
      console.error('❌ Status:', e.response?.status);
      console.error('❌ Data:', e.response?.data);
      
      if (e.message.includes('404') || e.message.includes('401')) {
        setError('auth_required');
      } else {
        setError("Impossible de charger vos réparations.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReps();
  }, []);

  const openEdit = (rep) => {
    setSelectedRep(rep);
    setRapport(rep.description_travaux || '');
    setDuree(rep.duree_heures ? rep.duree_heures.toString() : '');
    setEditOpen(true);
  };

  const saveRapport = async () => {
    if (!selectedRep) return;
    try {
      setSaving(true);
      const repId = selectedRep.id_reparation || selectedRep.id;
      const dureeHeures = parseFloat(duree) || 0;
      
      // Envoyer seulement les données nécessaires pour la mise à jour du rapport
      const payload = {
        description_travaux: rapport || '',
        duree_heures: dureeHeures
      };
      
      console.log('💾 Sauvegarde du rapport avec durée:', dureeHeures, 'heures');
      
      await reparationsAPI.update(repId, payload);
      
      // Mise à jour immédiate de l'état local pour un feedback instantané
      setReparations(prevReparations => 
        prevReparations.map(rep => 
          (rep.id_reparation || rep.id) === repId 
            ? { 
                ...rep, 
                description_travaux: rapport || '',
                duree_heures: dureeHeures
              }
            : rep
        )
      );
      
      setEditOpen(false);
      setSelectedRep(null);
      
      // Recharger depuis le serveur pour s'assurer de la cohérence
      await fetchReps();
      
      alert(`✅ Rapport enregistré avec succès !\n\n⏱️ Durée: ${dureeHeures}h\n📝 Travaux: ${rapport ? 'Décrits' : 'Non renseignés'}`);
      
    } catch (e) {
      console.error('❌ Erreur lors de l\'enregistrement du rapport:', e);
      alert(`❌ Erreur lors de l'enregistrement du rapport: ${e.response?.data?.error || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Valider une réparation (bouton Réparation Validée)
  const handleValidateReparation = async (reparation) => {
    const reparationId = reparation.id_reparation || reparation.id;
    
    if (!reparationId) {
      alert('Erreur: ID de la réparation non trouvé');
      return;
    }

    const confirmValidate = window.confirm(
      `Êtes-vous sûr de vouloir valider la réparation ${reparation.numero || reparationId} ?\n\n✅ Cette action confirme que la réparation est complètement terminée.\n\n📧 Le client et l'administrateur seront notifiés.\n\n💬 La réparation passera au statut "terminé".`
    );

    if (confirmValidate) {
      try {
        console.log('Validation de la réparation par le mécanicien avec ID:', reparationId);
        
        // Mettre à jour la réparation avec la validation
        const response = await reparationsAPI.update(reparationId, { 
          validee_par_mecanicien: true,
          date_validation_mecanicien: new Date().toISOString(),
          statut: 'termine',
          confirme_par_client: false, // Réinitialiser la confirmation client
          date_confirmation_client: null, // Réinitialiser la date de confirmation client
          validee_par_client: false // Réinitialiser la validation client
        });
        
        console.log('Réponse de validation:', response);
        
        // Mise à jour de l'état local
        setReparations(prevReparations => 
          prevReparations.map(rep => 
            (rep.id_reparation || rep.id) === reparationId 
              ? { 
                  ...rep, 
                  validee_par_mecanicien: true,
                  date_validation_mecanicien: new Date().toISOString(),
                  statut: 'termine'
                }
              : rep
          )
        );
        
        alert(`✅ Réparation ${reparation.numero || reparationId} validée avec succès !\n\n📧 Le client et l'administrateur ont été notifiés.\n\n🌟 La réparation est maintenant marquée comme terminée.`);
        
        // Recharger les réparations pour mettre à jour les statistiques
        fetchReps();
      } catch (err) {
        console.error('Erreur lors de la validation:', err);
        alert(`Erreur lors de la validation: ${err.response?.data?.error || err.message}`);
      }
    }
  };

  const getStatusColor = (statut) => {
    switch ((statut || '').toLowerCase()) {
      case 'en_cours': return 'warning';
      case 'termine': return 'success';
      case 'validee': return 'info';
      case 'facture': return 'info';
      default: return 'default';
    }
  };

  if (error === 'auth_required') {
    // Vérifier si l'utilisateur est connecté mais avec un problème d'authentification
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      // L'utilisateur est connecté mais la vérification échoue - afficher les infos de debug
      return <MecanicienDebugInfo onRetry={() => fetchReps()} />;
    } else {
      // L'utilisateur n'est pas connecté - afficher le message d'erreur standard
      return <MecanicienAuthError message="Vous devez être connecté en tant que mécanicien pour voir vos réparations assignées." />;
    }
  }

  return (
    <ModernPageTemplate
      title="Mes réparations"
      subtitle="Interventions assignées"
      icon={Build}
      statCards={[
        { title: 'En cours', value: reparations.filter(r => (r.statut||'').toLowerCase()==='en_cours').length, icon: <Pending />, gradient: 'linear-gradient(135deg, #065f46, #10b981)' },
        { title: 'Terminées', value: (() => {
            const isFinished = (rep) => {
              const raw = ((rep.statut || '').toString().trim());
              const lc = raw.toLowerCase();
              const noAcc = lc.normalize('NFD').replace(/\p{Diacritic}+/gu, '');
              return noAcc.startsWith('termin') || noAcc.startsWith('valide') || lc === 'facture' || lc === 'completed' || lc === 'finished';
            };
            return reparations.filter(isFinished).length;
          })(), icon: <CheckCircle />, gradient: 'linear-gradient(135deg, #059669, #34d399)' },
        { title: 'Total', value: reparations.length, icon: <Build />, gradient: 'linear-gradient(135deg, #10b981, #6ee7b7)' }
      ]}
      colorScheme={(() => { try { const u = JSON.parse(localStorage.getItem('user')||'{}'); return u.role==='mecanicien'?'green':'blue'; } catch { return 'blue'; } })()}
      onRefresh={fetchReps}
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
                <TableCell><strong>Véhicule</strong></TableCell>
                <TableCell><strong>Problème</strong></TableCell>
                <TableCell><strong>Travaux</strong></TableCell>
                <TableCell><strong>Durée (h)</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell><strong>Date entrée</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reparations.map((r, idx) => (
                <TableRow key={r.id_reparation || r.id || `rep-${idx}`} hover>
                  <TableCell>{r.vehicule_info || ''}</TableCell>
                  <TableCell>{r.description_probleme || ''}</TableCell>
                  <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{r.description_travaux || '—'}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: r.duree_heures ? '#1976d2' : '#666',
                        fontSize: '0.9rem'
                      }}
                    >
                      {r.duree_heures ? `${r.duree_heures}h` : 'Non renseignée'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={r.statut || 'ouvert'} color={getStatusColor(r.statut)} size="small" />
                  </TableCell>
                  <TableCell>{r.date_entree ? new Date(r.date_entree).toLocaleDateString('fr-FR') : ''}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" color="primary" onClick={() => openEdit(r)}>
                        <Edit />
                      </IconButton>
                      {/* Bouton Réparation Validée - visible pour toutes les réparations */}
                      <IconButton 
                        size="small" 
                        color="info"
                        onClick={() => handleValidateReparation(r)}
                        title="Valider la réparation"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            transform: 'scale(1.1)',
                            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <CheckCircle />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {reparations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">Aucune réparation assignée.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Rapport de réparation</DialogTitle>
        <DialogContent>
          <TextField
            label="Durée de travail (heures)"
            type="number"
            value={duree}
            onChange={(e) => setDuree(e.target.value)}
            fullWidth
            margin="normal"
            inputProps={{ min: 0, step: 0.5 }}
          />
          <TextField
            label="Description des travaux"
            value={rapport}
            onChange={(e) => setRapport(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={6}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={saving}>Annuler</Button>
          <Button variant="contained" onClick={saveRapport} disabled={saving}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </ModernPageTemplate>
  );
};

const MesReparationsPage = () => {
  return (
    <AuthGuard requiredRole="mecanicien">
      <MesReparationsContent />
    </AuthGuard>
  );
};

export default MesReparationsPage;













