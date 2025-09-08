import React, { useEffect, useState, useMemo } from 'react';
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
  Chip
} from '@mui/material';
import { Build, Visibility, Refresh, Schedule, CheckCircle, Pending, Done } from '@mui/icons-material';
import { reparationsAPI } from '../services/api';
import ModernPageTemplate from '../components/ModernPageTemplate';

// NOTE: en production, clientId vient de l'authentification
const MesReparationsClientPage = ({ clientId = 1 }) => {
  const [reparations, setReparations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReparations = async () => {
    try {
      setLoading(true);
      setError('');
      let data = [];
      if (typeof reparationsAPI.getByClient === 'function') {
        const resp = await reparationsAPI.getByClient(clientId);
        data = resp.data || [];
      } else {
        const resp = await reparationsAPI.getAll();
        const all = resp.data || [];
        data = all.filter(r => (r.client_id || r.id_client) === clientId);
      }
      
      console.log('Réparations reçues:', data);
      
      // Log détaillé de chaque réparation pour déboguer
      if (data && data.length > 0) {
        data.forEach((rep, index) => {
          console.log(`Réparation ${index + 1}:`, {
            id: rep.id_reparation || rep.id,
            statut: rep.statut,
            validee_par_mecanicien: rep.validee_par_mecanicien,
            date_validation_mecanicien: rep.date_validation_mecanicien,
            confirme_par_client: rep.confirme_par_client
          });
        });
      }
      
      setReparations(data);
    } catch (e) {
      console.error('Erreur chargement réparations client:', e);
      setError("Impossible de charger vos réparations. Vérifiez que le serveur est démarré.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReparations(); }, [clientId]);

  // Marquer une réparation comme terminée
  const handleMarkAsCompleted = async (reparation) => {
    const reparationId = reparation.id_reparation || reparation.id;
    
    if (!reparationId) {
      alert('Erreur: ID de la réparation non trouvé');
      return;
    }

    const confirmComplete = window.confirm(
      `Êtes-vous sûr de vouloir marquer la réparation ${reparation.numero || reparationId} comme terminée ?\n\n✅ Cette action confirme que la réparation est complètement terminée.\n\n📧 L'administrateur sera notifié de cette confirmation.`
    );

    if (confirmComplete) {
      try {
        console.log('Marquage de la réparation comme terminée avec ID:', reparationId);
        
        // Mettre à jour le statut de la réparation
        const response = await reparationsAPI.update(reparationId, { 
          statut: 'termine',
          date_fin: new Date().toISOString(),
          confirme_par_client: true,
          date_confirmation_client: new Date().toISOString()
        });
        
        console.log('Réponse de mise à jour:', response);
        
        // Mettre à jour l'état local
        setReparations(prevReparations => 
          prevReparations.map(rep => 
            (rep.id_reparation || rep.id) === reparationId 
              ? { 
                  ...rep, 
                  statut: 'termine',
                  confirme_par_client: true,
                  date_confirmation_client: new Date().toISOString()
                }
              : rep
          )
        );
        
        alert(`✅ Réparation ${reparation.numero || reparationId} marquée comme terminée !\n\n📧 L'administrateur a été notifié de votre confirmation.`);
        
        // Recharger les réparations pour mettre à jour les statistiques
        fetchReparations();
      } catch (err) {
        console.error('Erreur lors du marquage comme terminée:', err);
        alert(`Erreur lors du marquage: ${err.response?.data?.error || err.message}`);
      }
    }
  };



  const stats = useMemo(() => {
    const stripAccents = (s) => s.normalize('NFD').replace(/\p{Diacritic}+/gu, '');
    const isFinished = (rep) => {
      const raw = ((rep.statut || '').toString().trim());
      const lc = raw.toLowerCase();
      const noAcc = stripAccents(lc);
      // Terminé si: statut commence par "termin" (termine/terminée/terminer),
      // ou commence par "valide" (valide/validée/validee),
      // ou validation par mécanicien
      return rep.validee_par_mecanicien === true
        || noAcc.startsWith('termin')
        || noAcc.startsWith('valide');
    };
    const isEnCours = (rep) => {
      const lc = ((rep.statut || '').toString().trim().toLowerCase());
      return lc === 'en_cours' || lc === 'en cours';
    };
    return {
      enCours: reparations.filter(isEnCours).length,
      terminees: reparations.filter(isFinished).length,
      total: reparations.length,
    };
  }, [reparations]);

  const getStatusColor = (statut, valideeParMecanicien) => {
    if (valideeParMecanicien) return 'info'; // Bleu pour validée par mécanicien
    switch ((statut || '').toLowerCase()) {
      case 'en_cours': return 'warning';
      case 'termine': return 'success';
      case 'validee': return 'info';
      case 'facture': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (statut, valideeParMecanicien) => {
    if (valideeParMecanicien) return 'Validée par mécanicien';
    return statut || '—';
  };

  return (
    <ModernPageTemplate
      title="Mes Réparations"
      subtitle="Suivi des interventions"
      icon={Build}
      colorScheme={(() => { try { const u = JSON.parse(localStorage.getItem('user')||'{}'); return u.role==='client'?'orange':'blue'; } catch { return 'orange'; } })()}
      onRefresh={fetchReparations}
      statCards={[
        { title: 'En cours', value: stats.enCours, icon: <Pending />, gradient: 'linear-gradient(135deg, #7c2d12, #ea580c)' },
        { title: 'Terminées', value: stats.terminees, icon: <CheckCircle />, gradient: 'linear-gradient(135deg, #c2410c, #f59e0b)' },
        { title: 'Total', value: stats.total, icon: <Build />, gradient: 'linear-gradient(135deg, #d97706, #fbbf24)' }
      ]}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          {/* Ligne d'information sur les statuts */}
          <Box sx={{ 
            mb: 2, 
            p: 2, 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: 2, 
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Build sx={{ color: '#3b82f6' }} />
            <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 'bold' }}>
              💡 <strong>Statuts des réparations :</strong> 
              <span style={{ marginLeft: '8px' }}>🟡 En cours</span> • 
              <span style={{ marginLeft: '8px' }}>🟢 Terminée</span> • 
              <span style={{ marginLeft: '8px' }}>🔵 Validée par mécanicien</span> • 
              <span style={{ marginLeft: '8px' }}>✅ Confirmée par client</span>
            </Typography>
          </Box>
          
          <TableContainer component={Paper} sx={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'rgba(255,255,255,0.1)' }}>
                <TableCell><strong>Réparation</strong></TableCell>
                <TableCell><strong>Véhicule</strong></TableCell>
                <TableCell><strong>Problème</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell><strong>Date entrée</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reparations.map((r, idx) => (
                <TableRow key={r.id_reparation || r.id || `rep-client-${idx}`} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                      {r.numero || `R-${(r.id_reparation||r.id)||'—'}`}
                    </Typography>
                  </TableCell>
                  <TableCell>{r.vehicule_info || '—'}</TableCell>
                  <TableCell>{r.description_probleme || '—'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Chip 
                        label={getStatusLabel(r.statut, r.validee_par_mecanicien)} 
                        color={getStatusColor(r.statut, r.validee_par_mecanicien)} 
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }}
                      />
                      {r.validee_par_mecanicien && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#3b82f6', 
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                        >
                          ✅ Validée par le mécanicien
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{r.date_entree ? new Date(r.date_entree).toLocaleDateString('fr-FR') : '—'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" color="primary">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" color="primary" onClick={fetchReparations}>
                        <Refresh />
                      </IconButton>
                      {/* Bouton pour marquer comme terminée - visible seulement si la réparation est en cours */}
                      {(r.statut || '').toLowerCase() === 'en_cours' && (
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handleMarkAsCompleted(r)}
                          title="Marquer comme terminée"
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(76, 175, 80, 0.1)',
                              transform: 'scale(1.1)',
                              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Done />
                        </IconButton>
                      )}
                      {/* Indicateur visuel si la réparation a été confirmée par le client */}
                      {r.confirme_par_client && (
                        <IconButton 
                          size="small" 
                          color="success"
                          disabled
                          title="Confirmée par le client"
                          sx={{ opacity: 0.7 }}
                        >
                          <CheckCircle />
                        </IconButton>
                      )}
                      {/* Indicateur visuel si la réparation a été validée par le mécanicien */}
                      {r.validee_par_mecanicien && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5,
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                          border: '1px solid #3b82f6'
                        }}>
                          <Build sx={{ color: '#3b82f6', fontSize: 16 }} />
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#3b82f6', 
                              fontWeight: 'bold',
                              fontSize: '0.7rem'
                            }}
                          >
                            Validée
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {reparations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">Aucune réparation trouvée.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        </>
      )}
    </ModernPageTemplate>
    );
};

export default MesReparationsClientPage;
