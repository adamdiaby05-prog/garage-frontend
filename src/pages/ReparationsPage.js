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
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Visibility,
  Build,
  CheckCircle,
  Pending,
  Receipt,
  DoneAll,
  Delete
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { reparationsAPI, facturesAPI } from '../services/api';
import ReparationForm from '../components/forms/ReparationForm';
import ModernPageTemplate from '../components/ModernPageTemplate';

const ReparationsPage = () => {
  const [showReparationForm, setShowReparationForm] = useState(false);
  const [selectedReparation, setSelectedReparation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reparations, setReparations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fonction pour charger les réparations depuis l'API
  const fetchReparations = async () => {
    try {
      setLoading(true);
      const response = await reparationsAPI.getAll();
      setReparations(response.data);
      setError(null);
      
      // Debug: Afficher les statuts des réparations
      console.log('🔍 Debug - Réparations chargées:', response.data.length);
      console.log('🔍 Debug - Statuts des réparations:', response.data.map(r => ({ 
        id: r.id_reparation || r.id, 
        numero: r.numero, 
        statut: r.statut 
      })));
      
      // Compter les réparations par statut
      const statuts = response.data.reduce((acc, r) => {
        acc[r.statut] = (acc[r.statut] || 0) + 1;
        return acc;
      }, {});
      console.log('🔍 Debug - Comptage par statut:', statuts);
      
    } catch (err) {
      console.error('Erreur lors du chargement des réparations:', err);
      setError('Erreur lors du chargement des réparations');
    } finally {
      setLoading(false);
    }
  };

  // Charger les réparations depuis l'API
  useEffect(() => {
    fetchReparations();
  }, []);

  // Gérer l'ajout d'une nouvelle réparation
  const handleAddReparation = () => {
    setSelectedReparation(null);
    setShowReparationForm(true);
  };

  // Gérer la modification d'une réparation
  const handleEditReparation = (reparation) => {
    setSelectedReparation(reparation);
    setShowReparationForm(true);
  };

  // Gérer la fermeture du snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fonction d'exportation Excel pour les réparations
  const handleExport = () => {
    try {
      // Préparer les données pour l'export
      const exportData = reparations.map(reparation => ({
        'ID': reparation.id_reparation || reparation.id,
        'Client': reparation.nom_client || 'N/A',
        'Véhicule': reparation.marque_modele || 'N/A',
        'Immatriculation': reparation.immatriculation || 'N/A',
        'Type de réparation': reparation.type_reparation || 'N/A',
        'Date de début': reparation.date_debut ? new Date(reparation.date_debut).toLocaleDateString('fr-FR') : 'N/A',
        'Date de fin': reparation.date_fin ? new Date(reparation.date_fin).toLocaleDateString('fr-FR') : 'N/A',
        'Statut': reparation.statut || 'N/A',
        'Coût total': reparation.cout_total || 'N/A',
        'Employé': reparation.nom_employe || 'N/A'
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
        { wch: 20 },  // Type de réparation
        { wch: 15 },  // Date de début
        { wch: 15 },  // Date de fin
        { wch: 12 },  // Statut
        { wch: 12 },  // Coût total
        { wch: 15 }   // Employé
      ];
      ws['!cols'] = colWidths;
      
      // Ajouter la feuille au classeur
      XLSX.utils.book_append_sheet(wb, ws, 'Réparations');
      
      // Générer le fichier Excel
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Créer et télécharger le fichier
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reparations_${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: `Export Excel réussi ! ${reparations.length} réparations exportées.`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'export des réparations.',
        severity: 'error'
      });
    }
  };

  // Gérer le succès du formulaire
  const handleFormSuccess = () => {
    fetchReparations();
    setSnackbar({ open: true, message: 'Réparation enregistrée avec succès', severity: 'success' });
  };

  // Gérer la suppression d'une réparation
  const handleDeleteReparation = async (reparation) => {
    const reparationId = reparation.id_reparation || reparation.id;
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la réparation ${reparation.numero} ?\n\n⚠️ Cette action est irréversible et supprimera définitivement la réparation de la base de données.`
    );

    if (confirmDelete) {
      try {
        await reparationsAPI.delete(reparationId);
        setSnackbar({ 
          open: true, 
          message: `Réparation ${reparation.numero} supprimée avec succès`, 
          severity: 'success' 
        });
        fetchReparations(); // Recharger la liste
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        setSnackbar({ 
          open: true, 
          message: `Erreur lors de la suppression: ${err.response?.data?.error || err.message}`, 
          severity: 'error' 
        });
      }
    }
  };

  // Créer automatiquement une facture quand une réparation est terminée
  const handleCreateFacture = async (reparation) => {
    try {
      const totalHT = reparation.total_ht || 0;
      const totalTTC = reparation.total_ttc || (totalHT * 1.2); // TVA 20%

      const reparationId = reparation.id_reparation || reparation.id;

      const factureData = {
        numero: `FAC-${Date.now()}`,
        reparation_id: reparationId,
        client_id: reparation.client_id,
        total_ht: totalHT,
        total_ttc: totalTTC,
        statut: 'envoyee'
      };

      await facturesAPI.create(factureData);
      await reparationsAPI.update(reparationId, { ...reparation, statut: 'facture' });
      fetchReparations();
      setSnackbar({ open: true, message: 'Facture créée automatiquement avec succès !', severity: 'success' });
    } catch (err) {
      console.error('Erreur lors de la création de la facture:', err);
      setSnackbar({ open: true, message: 'Erreur lors de la création de la facture', severity: 'error' });
    }
  };

  // Terminer la réparation et créer automatiquement une facture
  const handleTerminerEtFacturer = async (reparation) => {
    try {
      const reparationId = reparation.id_reparation || reparation.id;
      await reparationsAPI.update(reparationId, { statut: 'termine' });

      const totalHT = reparation.total_ht || 0;
      const totalTTC = reparation.total_ttc || (totalHT * 1.2);

      const factureData = {
        numero: `FAC-${Date.now()}`,
        reparation_id: reparationId,
        client_id: reparation.client_id,
        total_ht: totalHT,
        total_ttc: totalTTC,
        statut: 'envoyee'
      };

      await facturesAPI.create(factureData);
      await reparationsAPI.update(reparationId, { statut: 'facture' });
      fetchReparations();
      setSnackbar({ open: true, message: 'Réparation terminée et facture créée automatiquement !', severity: 'success' });
    } catch (err) {
      console.error('Erreur détaillée lors de la finalisation:', err);
      setSnackbar({ open: true, message: `Erreur lors de la finalisation: ${err.message}`, severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ouvert': return 'default';
      case 'en_cours': return 'primary';
      case 'termine': return 'success';
      case 'facture': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ouvert': return 'Ouvert';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'facture': return 'Facturé';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ouvert': return <Build />;
      case 'en_cours': return <Pending />;
      case 'termine': return <CheckCircle />;
      case 'facture': return <Receipt />;
      default: return <Build />;
    }
  };

  const filteredReparations = useMemo(() => reparations.filter(reparation => {
    const matchesSearch = 
      (reparation.numero?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (reparation.client_nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (reparation.vehicule_info?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || reparation.statut === statusFilter;

    return matchesSearch && matchesStatus;
  }), [reparations, searchTerm, statusFilter]);

  // Fonction pour compter les réparations terminées (plus robuste)
  const getTermineesCount = () => {
    return reparations.filter(r => {
      const statut = (r.statut || '').toLowerCase();
      return statut === 'termine' || 
             statut === 'terminé' || 
             statut === 'terminee' || 
             statut === 'terminée' ||
             statut === 'completed' ||
             statut === 'finished';
    }).length;
  };

  const statCards = [
    {
      title: 'Total Réparations',
      value: reparations.length,
      icon: <Build />,
      color: '#1e40af',
      gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)',
      trend: '+7%',
      trendUp: true
    },
    {
      title: 'En cours',
      value: reparations.filter(r => {
        const statut = (r.statut || '').toLowerCase();
        return statut === 'en_cours' || statut === 'en cours' || statut === 'in_progress';
      }).length,
      icon: <Pending />,
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      trend: '+3%',
      trendUp: true
    },
    {
      title: 'Terminées',
      value: getTermineesCount(),
      icon: <CheckCircle />,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #93c5fd)',
      trend: '+1%',
      trendUp: true
    }
  ];

  return (
    <ModernPageTemplate
      title="Gestion des Réparations"
      subtitle="Suivi et facturation"
      icon={Build}
      statCards={statCards}
      loading={loading}
      error={error}
      onAdd={handleAddReparation}
      onRefresh={fetchReparations}
      onExport={handleExport}
      onFilter={() => {}}
    >
      {/* Barre d'outils */}
      <Paper sx={{ p: 2, mb: 3, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            sx={{ flexGrow: 1 }}
            variant="outlined"
            placeholder="Rechercher une réparation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={statusFilter}
              label="Statut"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Tous les statuts</MenuItem>
              <MenuItem value="ouvert">Ouvert</MenuItem>
              <MenuItem value="en_cours">En cours</MenuItem>
              <MenuItem value="termine">Terminé</MenuItem>
              <MenuItem value="facture">Facturé</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'rgba(255,255,255,0.1)' }}>
              <TableCell><strong>Client</strong></TableCell>
              <TableCell><strong>Véhicule</strong></TableCell>
              <TableCell><strong>Mécanicien</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReparations.map((reparation, index) => (
              <TableRow key={reparation.id_reparation || reparation.id || `reparation-${index}`} hover>
                <TableCell>{reparation.client_nom}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {reparation.vehicule_info}
                  </Typography>
                </TableCell>
                <TableCell>{reparation.employe_nom || 'Non assigné'}</TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(reparation.statut)}
                    label={getStatusLabel(reparation.statut)}
                    color={getStatusColor(reparation.statut)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" color="primary">
                      <Visibility />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="secondary"
                      onClick={() => handleEditReparation(reparation)}
                    >
                      <Edit />
                    </IconButton>
                    {reparation.statut === 'ouvert' && (
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={async () => {
                          try {
                            const reparationId = reparation.id_reparation || reparation.id;
                            await reparationsAPI.update(reparationId, { statut: 'en_cours' });
                            fetchReparations();
                            setSnackbar({ open: true, message: 'Réparation mise en cours', severity: 'success' });
                          } catch (err) {
                            setSnackbar({ open: true, message: 'Erreur lors de la mise à jour', severity: 'error' });
                          }
                        }}
                        title="Mettre en cours"
                      >
                        <Pending />
                      </IconButton>
                    )}
                    {(reparation.statut === 'en_cours' || reparation.statut === 'ouvert') && (
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={async () => {
                          try {
                            const reparationId = reparation.id_reparation || reparation.id;
                            await reparationsAPI.update(reparationId, { statut: 'termine' });
                            fetchReparations();
                            setSnackbar({ 
                              open: true, 
                              message: '✅ Réparation marquée comme terminée - Facture créée automatiquement !', 
                              severity: 'success' 
                            });
                          } catch (err) {
                            setSnackbar({ open: true, message: 'Erreur lors de la mise à jour', severity: 'error' });
                          }
                        }}
                        title="Marquer comme terminée (créera automatiquement une facture)"
                      >
                        <CheckCircle />
                      </IconButton>
                    )}
                    {reparation.statut !== 'termine' && reparation.statut !== 'facture' && (
                      <IconButton 
                        size="small" 
                        color="warning"
                        onClick={() => handleTerminerEtFacturer(reparation)}
                        title="Terminer et créer facture"
                      >
                        <DoneAll />
                      </IconButton>
                    )}
                    {reparation.statut === 'termine' && (
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => handleCreateFacture(reparation)}
                        title="Créer une facture"
                      >
                        <Receipt />
                      </IconButton>
                    )}
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteReparation(reparation)}
                      title="Supprimer la réparation"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(244, 67, 54, 0.1)',
                          transform: 'scale(1.1)',
                          boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          {filteredReparations.length} réparation(s) trouvée(s)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={`En cours: ${reparations.filter(r => {
              const statut = (r.statut || '').toLowerCase();
              return statut === 'en_cours' || statut === 'en cours' || statut === 'in_progress';
            }).length}`}
            color="primary"
            size="small"
          />
          <Chip 
            label={`Terminées: ${getTermineesCount()}`}
            color="success"
            size="small"
          />
          <Chip 
            label={`Total: ${reparations.length}`}
            color="default"
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

      {/* Formulaire Réparation */}
      <ReparationForm
        open={showReparationForm}
        onClose={() => setShowReparationForm(false)}
        onSuccess={handleFormSuccess}
        reparation={selectedReparation}
      />
    </ModernPageTemplate>
  );
};

export default ReparationsPage;
