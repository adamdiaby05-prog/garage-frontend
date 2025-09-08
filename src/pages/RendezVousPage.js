import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
  Button,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Schedule,
  CheckCircle,
  Cancel,
  Build
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { rendezVousAPI, employesAPI } from '../services/api';
import RendezVousForm from '../components/forms/RendezVousForm';
import ModernPageTemplate from '../components/ModernPageTemplate';

const RendezVousPage = ({ userRole = 'admin' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showRendezVousForm, setShowRendezVousForm] = useState(false);
  const [selectedRendezVous, setSelectedRendezVous] = useState(null);
  const [mechanics, setMechanics] = useState([]);
  const [assigningId, setAssigningId] = useState(null);

  // Charger les rendez-vous
  useEffect(() => {
    fetchRendezVous();
    // Charger les mécaniciens disponibles
    (async () => {
      try {
        // Privilégier la liste basée sur la table utilisateurs (rôle = mecanicien)
        const resp = await employesAPI.getMecaniciens();
        const list = resp.data || [];
        if (list.length > 0) {
          setMechanics(list);
          return;
        }
        // Fallback sur /employes si la route dédiée est vide
        const allResp = await employesAPI.getAll();
        const all = allResp.data || [];
        const filtered = all.filter(e => {
          const role = (e.role || '').toString().toLowerCase();
          const poste = (e.poste || '').toString().toLowerCase();
          return role === 'mecanicien' || poste.includes('mecanicien');
        });
        setMechanics(filtered.length > 0 ? filtered : all);
      } catch (e) {
        try {
          const allResp = await employesAPI.getAll();
          setMechanics(allResp.data || []);
        } catch {}
      }
    })();
  }, []);

  const fetchRendezVous = async () => {
    try {
      setLoading(true);
      const response = await rendezVousAPI.getAll();
      setRendezVous(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des rendez-vous:', err);
      setError('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const filteredRendezVous = useMemo(() => rendezVous.filter(rdv => {
    const matchesSearch = 
      rdv.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rdv.vehicule_info?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rdv.motif?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rdv.statut === statusFilter;
    return matchesSearch && matchesStatus;
  }), [rendezVous, searchTerm, statusFilter]);

  // Gérer l'ajout d'un nouveau rendez-vous
  const handleAddRendezVous = () => {
    setSelectedRendezVous(null);
    setShowRendezVousForm(true);
  };

  // Gérer la modification d'un rendez-vous
  const handleEditRendezVous = (rdv) => {
    setSelectedRendezVous(rdv);
    setShowRendezVousForm(true);
  };

  // Gérer la fermeture du formulaire
  const handleCloseRendezVousForm = () => {
    setShowRendezVousForm(false);
    setSelectedRendezVous(null);
  };

  // Gérer le succès du formulaire
  const handleRendezVousFormSuccess = () => {
    fetchRendezVous();
    setSnackbar({ open: true, message: 'Rendez-vous enregistré avec succès', severity: 'success' });
  };

  // Gérer la suppression d'un rendez-vous
  const handleDeleteRendezVous = async (id) => {
    try {
      await rendezVousAPI.delete(id);
      setRendezVous(rendezVous.filter(rdv => rdv.id !== id));
      setSnackbar({ open: true, message: 'Rendez-vous supprimé avec succès', severity: 'success' });
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
    }
  };

  // Gérer la fermeture du snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fonction d'exportation Excel pour les rendez-vous
  const handleExport = () => {
    try {
      // Préparer les données pour l'export
      const exportData = rendezVous.map(rdv => ({
        'ID': rdv.id_rendez_vous || rdv.id,
        'Client': rdv.client_nom || 'N/A',
        'Véhicule': rdv.vehicule_info || 'N/A',
        'Immatriculation': rdv.immatriculation || 'N/A',
        'Date': rdv.date_rendez_vous ? new Date(rdv.date_rendez_vous).toLocaleDateString('fr-FR') : 'N/A',
        'Heure': rdv.heure_rendez_vous || 'N/A',
        'Type de service': rdv.motif || 'N/A',
        'Statut': rdv.statut || 'N/A',
        'Employé': rdv.employe_nom || 'N/A',
        'Notes': rdv.notes || 'N/A'
      }));

      // Créer un nouveau classeur Excel
      const wb = XLSX.utils.book_new();
      
      // Créer une feuille de calcul avec les données
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Définir la largeur des colonnes
      const colWidths = [
        { wch: 8 },   // ID
        { wch: 20 },  // Client
        { wch: 20 },  // Véhicule
        { wch: 15 },  // Immatriculation
        { wch: 15 },  // Date
        { wch: 10 },  // Heure
        { wch: 20 },  // Type de service
        { wch: 12 },  // Statut
        { wch: 15 },  // Employé
        { wch: 30 }   // Notes
      ];
      ws['!cols'] = colWidths;
      
      // Ajouter la feuille au classeur
      XLSX.utils.book_append_sheet(wb, ws, 'Rendez-vous');
      
      // Générer le fichier Excel
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Créer et télécharger le fichier
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `rendez_vous_${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: `Export Excel réussi ! ${rendezVous.length} rendez-vous exportés.`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'export des rendez-vous.',
        severity: 'error'
      });
    }
  };

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
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirme': return <CheckCircle />;
      case 'en_attente': return <Schedule />;
      case 'annule': return <Cancel />;
      case 'termine': return <CheckCircle />;
      default: return <Schedule />;
    }
  };

  const statCards = [
    {
      title: 'Total RDV',
      value: rendezVous.length,
      icon: <Schedule />,
      color: '#1e40af',
      gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)',
      trend: '+4%',
      trendUp: true
    },
    {
      title: 'Confirmés',
      value: rendezVous.filter(r => r.statut === 'confirme').length,
      icon: <CheckCircle />,
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      trend: '+1%',
      trendUp: true
    },
    {
      title: 'En attente',
      value: rendezVous.filter(r => r.statut === 'en_attente').length,
      icon: <Schedule />,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #93c5fd)',
      trend: '+0%',
      trendUp: false
    }
  ];

  return (
    <ModernPageTemplate
      title="Gestion des Rendez-vous"
      subtitle="Planification et suivi"
      icon={Schedule}
      statCards={statCards}
      loading={loading}
      error={error}
      colorScheme={userRole === 'mecanicien' ? 'green' : 'blue'}
      onAdd={userRole !== 'mecanicien' ? handleAddRendezVous : undefined}
      onRefresh={fetchRendezVous}
      onExport={handleExport}
      onFilter={() => {}}
    >
      {/* Barre d'outils */}
      <Paper sx={{ p: 2, mb: 3, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher un rendez-vous..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'rgba(255,255,255,0.8)' }} />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Filtrer par statut</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Filtrer par statut"
            >
              <MenuItem value="all">Tous les statuts</MenuItem>
              <MenuItem value="confirme">Confirmé</MenuItem>
              <MenuItem value="en_attente">En attente</MenuItem>
              <MenuItem value="annule">Annulé</MenuItem>
              <MenuItem value="termine">Terminé</MenuItem>
            </Select>
          </FormControl>

          {userRole !== 'mecanicien' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}
              onClick={handleAddRendezVous}
            >
              Nouveau Rendez-vous
            </Button>
          )}
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'rgba(255,255,255,0.1)' }}>
              <TableCell><strong>Client</strong></TableCell>
              <TableCell><strong>Véhicule</strong></TableCell>
              <TableCell><strong>Date & Heure</strong></TableCell>
              <TableCell><strong>Motif</strong></TableCell>
              <TableCell><strong>Mécanicien</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRendezVous.map((rdv, index) => (
              <TableRow key={rdv.id || `rdv-${index}`} hover>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {rdv.client_nom}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {rdv.vehicule_info}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {new Date(rdv.date_rdv).toLocaleDateString('fr-FR')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(rdv.date_rdv).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {rdv.motif}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {rdv.employe_nom || 'Non assigné'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(rdv.statut)}
                    color={getStatusColor(rdv.statut)}
                    size="small"
                    icon={getStatusIcon(rdv.statut)}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {userRole !== 'mecanicien' ? (
                      <>
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                          <InputLabel>Assigner</InputLabel>
                          <Select
                            label="Assigner"
                            value={assigningId === rdv.id ? (rdv.employe_id || '') : (rdv.employe_id || '')}
                            onChange={async (e) => {
                              try {
                                setAssigningId(rdv.id);
                                await rendezVousAPI.assignMechanic(rdv.id, e.target.value || null);
                                await fetchRendezVous();
                                setSnackbar({ open: true, message: 'Mécanicien assigné', severity: 'success' });
                              } catch (err) {
                                setSnackbar({ open: true, message: 'Erreur lors de l\'assignation', severity: 'error' });
                              } finally {
                                setAssigningId(null);
                              }
                            }}
                          >
                            <MenuItem value="">Non assigné</MenuItem>
                            {mechanics.map(m => (
                              <MenuItem key={m.id_employe || m.id || Math.random()} value={m.id_employe || m.id}>
                                {m.nom} {m.prenom}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEditRendezVous(rdv)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={async () => {
                            try {
                              await rendezVousAPI.update(rdv.id, { statut: 'confirme' });
                              fetchRendezVous();
                              setSnackbar({ open: true, message: 'Rendez-vous confirmé', severity: 'success' });
                            } catch (e) {
                              setSnackbar({ open: true, message: 'Erreur lors de la confirmation', severity: 'error' });
                            }
                          }}
                        >
                          <CheckCircle />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={async () => {
                            try {
                              await rendezVousAPI.update(rdv.id, { statut: 'annule' });
                              fetchRendezVous();
                              setSnackbar({ open: true, message: 'Rendez-vous annulé', severity: 'success' });
                            } catch (e) {
                              setSnackbar({ open: true, message: 'Erreur lors de l\'annulation', severity: 'error' });
                            }
                          }}
                        >
                          <Cancel />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteRendezVous(rdv.id)}
                        >
                          <Delete />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={async () => {
                            try {
                              await rendezVousAPI.toReparation(rdv.id, { employe_id: rdv.employe_id, description_probleme: rdv.motif });
                              setSnackbar({ open: true, message: 'Réparation créée depuis le RDV', severity: 'success' });
                            } catch (e) {
                              setSnackbar({ open: true, message: 'Erreur lors de la création de la réparation', severity: 'error' });
                            }
                          }}
                        >
                          <Build />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={async () => {
                            try {
                              await rendezVousAPI.toReparation(rdv.id, { employe_id: rdv.employe_id, description_probleme: rdv.motif });
                              setSnackbar({ open: true, message: 'Réparation créée depuis le RDV', severity: 'success' });
                            } catch (e) {
                              setSnackbar({ open: true, message: 'Erreur lors de la création de la réparation', severity: 'error' });
                            }
                          }}
                        >
                          <Build />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          {filteredRendezVous.length} rendez-vous trouvé(s)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={`Confirmés: ${rendezVous.filter(r => r.statut === 'confirme').length}`}
            color="success"
            size="small"
          />
          <Chip 
            label={`En attente: ${rendezVous.filter(r => r.statut === 'en_attente').length}`}
            color="warning"
            size="small"
          />
          <Chip 
            label={`Annulés: ${rendezVous.filter(r => r.statut === 'annule').length}`}
            color="error"
            size="small"
          />
        </Box>
      </Box>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Formulaire Rendez-vous */}
      <RendezVousForm
        open={showRendezVousForm}
        onClose={handleCloseRendezVousForm}
        onSuccess={handleRendezVousFormSuccess}
        rendezVous={selectedRendezVous}
      />
    </ModernPageTemplate>
  );
};

export default RendezVousPage; 