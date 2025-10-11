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
  IconButton,
  Chip,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit,
  Delete,
  Search,
  DirectionsCar,
  Person,
  LocalGasStation,
  ElectricBolt,
  Nature
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { vehiculesAPI } from '../services/api';
import VehiculeForm from '../components/forms/VehiculeForm';
import ModernPageTemplate from '../components/ModernPageTemplate';

const VehiculesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [carburantFilter, setCarburantFilter] = useState('all');
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showVehiculeForm, setShowVehiculeForm] = useState(false);
  const [selectedVehicule, setSelectedVehicule] = useState(null);

  // Fonctions utilitaires pour les carburants
  const getCarburantLabel = (carburant) => {
    const labels = {
      essence: 'Essence',
      diesel: 'Diesel',
      hybride: 'Hybride',
      electrique: 'Électrique'
    };
    return labels[carburant] || carburant;
  };

  const getCarburantColor = (carburant) => {
    const colors = {
      essence: 'error',
      diesel: 'warning',
      hybride: 'success',
      electrique: 'info'
    };
    return colors[carburant] || 'default';
  };

  const getCarburantIcon = (carburant) => {
    const icons = {
      essence: <LocalGasStation />,
      diesel: <LocalGasStation />,
      hybride: <Nature />,
      electrique: <ElectricBolt />
    };
    return icons[carburant] || <LocalGasStation />;
  };

  // Charger les véhicules
  useEffect(() => {
    fetchVehicules();
  }, []);

  const fetchVehicules = async () => {
    try {
      setLoading(true);
      const response = await vehiculesAPI.getAll();
      setVehicules(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des véhicules:', err);
      setError('Erreur lors du chargement des véhicules');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les véhicules
  const filteredVehicules = useMemo(() => vehicules.filter(vehicule => {
    const matchesSearch = 
      vehicule.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicule.modele?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicule.numero_immatriculation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicule.client_nom?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCarburant = carburantFilter === 'all' || vehicule.carburant === carburantFilter;
    
    return matchesSearch && matchesCarburant;
  }), [vehicules, searchTerm, carburantFilter]);

  // Gérer l'ajout d'un nouveau véhicule
  const handleAddVehicule = () => {
    setSelectedVehicule(null);
    setShowVehiculeForm(true);
  };

  // Gérer la modification d'un véhicule
  const handleEditVehicule = (vehicule) => {
    setSelectedVehicule(vehicule);
    setShowVehiculeForm(true);
  };

  // Gérer la suppression d'un véhicule
  const handleDeleteVehicule = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      return;
    }
    
    try {
      await vehiculesAPI.delete(id);
      setVehicules(vehicules.filter(vehicule => (vehicule.id_vehicule || vehicule.id) !== id));
      setSnackbar({ open: true, message: 'Véhicule supprimé avec succès', severity: 'success' });
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      const errorMessage = err.response?.data?.error || 'Erreur lors de la suppression';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  // Gérer le succès du formulaire
  const handleFormSuccess = () => {
    fetchVehicules();
    setSnackbar({ open: true, message: 'Véhicule enregistré avec succès', severity: 'success' });
  };

  // Gérer la fermeture du snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fonction d'exportation Excel
  const handleExport = () => {
    try {
      // Préparer les données pour l'export
      const exportData = vehicules.map(vehicule => ({
        'ID': vehicule.id_vehicule || vehicule.id,
        'Client': vehicule.nom_client || vehicule.client_nom || 'N/A',
        'Marque': vehicule.marque || 'N/A',
        'Modèle': vehicule.modele || 'N/A',
        'Immatriculation': vehicule.immatriculation || 'N/A',
        'Année': vehicule.annee || 'N/A',
        'Kilométrage': vehicule.kilometrage || 'N/A',
        'Carburant': vehicule.carburant || 'N/A',
        'Date Création': vehicule.date_creation ? new Date(vehicule.date_creation).toLocaleDateString('fr-FR') : 'N/A'
      }));

      // Créer un nouveau classeur Excel
      const wb = XLSX.utils.book_new();
      
      // Créer une feuille de calcul avec les données
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Définir la largeur des colonnes
      const colWidths = [
        { wch: 8 },   // ID
        { wch: 20 },  // Client
        { wch: 15 },  // Marque
        { wch: 15 },  // Modèle
        { wch: 15 },  // Immatriculation
        { wch: 8 },   // Année
        { wch: 12 },  // Kilométrage
        { wch: 12 },  // Carburant
        { wch: 15 }   // Date Création
      ];
      ws['!cols'] = colWidths;
      
      // Ajouter la feuille au classeur
      XLSX.utils.book_append_sheet(wb, ws, 'Véhicules');
      
      // Générer le fichier Excel
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Créer et télécharger le fichier
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `vehicules_${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: `Export Excel réussi ! ${vehicules.length} véhicules exportés.`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'export des véhicules.',
        severity: 'error'
      });
    }
  };

  const statCards = [
    {
      title: 'Total Véhicules',
      value: vehicules.length,
      icon: <DirectionsCar />,
      color: '#1e40af',
      gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Essence',
      value: vehicules.filter(v => v.carburant === 'essence').length,
      icon: <LocalGasStation />,
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      trend: '+2%',
      trendUp: true
    },
    {
      title: 'Diesel',
      value: vehicules.filter(v => v.carburant === 'diesel').length,
      icon: <LocalGasStation />,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #93c5fd)',
      trend: '+1%',
      trendUp: false
    },
    {
      title: 'Hybride',
      value: vehicules.filter(v => v.carburant === 'hybride').length,
      icon: <Nature />,
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669, #10b981)',
      trend: '+3%',
      trendUp: true
    },
    {
      title: 'Électrique',
      value: vehicules.filter(v => v.carburant === 'electrique').length,
      icon: <ElectricBolt />,
      color: '#0284c7',
      gradient: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
      trend: '+4%',
      trendUp: true
    }
  ];

  return (
    <ModernPageTemplate
      title="Gestion des Véhicules"
      subtitle="Administration des véhicules"
      icon={DirectionsCar}
      statCards={statCards}
      loading={loading}
      error={error}
      colorScheme="green"
      onAdd={handleAddVehicule}
      onRefresh={fetchVehicules}
      onExport={handleExport}
      onFilter={() => {}}
    >
      {/* Barre d'outils */}
      <Paper sx={{ p: 2, mb: 3, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher un véhicule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'rgba(255,255,255,0.8)' }} />
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Filtrer par carburant</InputLabel>
            <Select
              value={carburantFilter}
              onChange={(e) => setCarburantFilter(e.target.value)}
              label="Filtrer par carburant"
            >
              <MenuItem value="all">Tous les carburants</MenuItem>
              <MenuItem value="essence">Essence</MenuItem>
              <MenuItem value="diesel">Diesel</MenuItem>
              <MenuItem value="hybride">Hybride</MenuItem>
              <MenuItem value="electrique">Électrique</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'rgba(255,255,255,0.1)' }}>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Client</strong></TableCell>
              <TableCell><strong>Marque</strong></TableCell>
              <TableCell><strong>Modèle</strong></TableCell>
              <TableCell><strong>Immatriculation</strong></TableCell>
              <TableCell><strong>Année</strong></TableCell>
              <TableCell><strong>Kilométrage</strong></TableCell>
              <TableCell><strong>Carburant</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicules.map((vehicule, index) => (
              <TableRow key={vehicule.id_vehicule || vehicule.id || `vehicule-${index}`} hover>
                <TableCell>{vehicule.id_vehicule || vehicule.id}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person fontSize="small" color="action" />
                    <Typography variant="body2">
                      {vehicule.client_nom} {vehicule.client_prenom}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {vehicule.marque}
                  </Typography>
                </TableCell>
                <TableCell>{vehicule.modele}</TableCell>
                <TableCell>
                  <Chip 
                    label={vehicule.numero_immatriculation}
                    size="small"
                    variant="outlined"
                    icon={<DirectionsCar />}
                  />
                </TableCell>
                <TableCell>
                  {vehicule.annee ? (
                    <Chip 
                      label={vehicule.annee}
                      size="small"
                      variant="outlined"
                    />
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {vehicule.kilometrage ? (
                    <Typography variant="body2">
                      {vehicule.kilometrage.toLocaleString()} km
                    </Typography>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getCarburantLabel(vehicule.carburant)}
                    color={getCarburantColor(vehicule.carburant)}
                    size="small"
                    icon={getCarburantIcon(vehicule.carburant)}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEditVehicule(vehicule)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteVehicule(vehicule.id_vehicule || vehicule.id)}
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
          {filteredVehicules.length} véhicule(s) trouvé(s)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={`Essence: ${vehicules.filter(v => v.carburant === 'essence').length}`}
            color="error"
            size="small"
          />
          <Chip 
            label={`Diesel: ${vehicules.filter(v => v.carburant === 'diesel').length}`}
            color="warning"
            size="small"
          />
          <Chip 
            label={`Total: ${vehicules.length}`}
            color="primary"
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
      
      {/* Formulaire Véhicule */}
      <VehiculeForm
        open={showVehiculeForm}
        onClose={() => setShowVehiculeForm(false)}
        onSuccess={handleFormSuccess}
        vehicule={selectedVehicule}
      />
    </ModernPageTemplate>
  );
};

export default VehiculesPage; 