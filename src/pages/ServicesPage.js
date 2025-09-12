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
  MenuItem
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Build,
  Star
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { servicesAPI } from '../services/api';
import ServiceForm from '../components/forms/ServiceForm';
import ModernPageTemplate from '../components/ModernPageTemplate';

const ServicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('all');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Charger les services
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des services...');
      const response = await servicesAPI.getAll();
      console.log('✅ Réponse API services:', response);
      console.log('📊 Type de réponse:', typeof response, Array.isArray(response));
      setServices(response);
      setError(null);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des services:', err);
      setError('Erreur lors du chargement des services: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les services
  const filteredServices = useMemo(() => {
    if (!Array.isArray(services)) return [];
    return services.filter(service => {
      const matchesSearch = 
        service.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategorie = categorieFilter === 'all' || service.categorie === categorieFilter;
      return matchesSearch && matchesCategorie;
    });
  }, [services, searchTerm, categorieFilter]);

  // Gérer l'ajout d'un nouveau service
  const handleAddService = () => {
    setSelectedService(null);
    setShowServiceForm(true);
  };

  // Gérer la modification d'un service
  const handleEditService = (service) => {
    setSelectedService(service);
    setShowServiceForm(true);
  };

  // Gérer la fermeture du formulaire
  const handleCloseServiceForm = () => {
    setShowServiceForm(false);
    setSelectedService(null);
  };

  // Gérer le succès du formulaire
  const handleServiceFormSuccess = () => {
    fetchServices();
    setSnackbar({ open: true, message: 'Service enregistré avec succès', severity: 'success' });
  };

  // Gérer la suppression d'un service
  const handleDeleteService = async (id) => {
    try {
      await servicesAPI.delete(id);
      if (Array.isArray(services)) {
        setServices(services.filter(service => service.id !== id));
      }
      setSnackbar({ open: true, message: 'Service supprimé avec succès', severity: 'success' });
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
    }
  };

  // Gérer la fermeture du snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fonction d'exportation Excel pour les services
  const handleExport = () => {
    try {
      // Préparer les données pour l'export
      const exportData = Array.isArray(services) ? services.map(service => ({
        'ID': service.id_service || service.id,
        'Nom': service.nom || 'N/A',
        'Description': service.description || 'N/A',
        'Prix': service.prix || 'N/A',
        'Durée': service.duree || 'N/A',
        'Catégorie': service.categorie || 'N/A',
        'Statut': service.statut || 'N/A',
        'Date de création': service.date_creation ? new Date(service.date_creation).toLocaleDateString('fr-FR') : 'N/A'
      })) : [];

      // Créer un nouveau classeur Excel
      const wb = XLSX.utils.book_new();
      
      // Créer une feuille de calcul avec les données
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Définir la largeur des colonnes
      const colWidths = [
        { wch: 8 },   // ID
        { wch: 25 },  // Nom
        { wch: 40 },  // Description
        { wch: 12 },  // Prix
        { wch: 12 },  // Durée
        { wch: 15 },  // Catégorie
        { wch: 12 },  // Statut
        { wch: 15 }   // Date de création
      ];
      ws['!cols'] = colWidths;
      
      // Ajouter la feuille au classeur
      XLSX.utils.book_append_sheet(wb, ws, 'Services');
      
      // Générer le fichier Excel
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Créer et télécharger le fichier
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `services_${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: `Export Excel réussi ! ${Array.isArray(services) ? services.length : 0} services exportés.`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'export des services.',
        severity: 'error'
      });
    }
  };

  const getCategorieColor = (categorie) => {
    switch (categorie) {
      case 'reparation': return 'primary';
      case 'entretien': return 'success';
      case 'diagnostic': return 'warning';
      case 'nettoyage': return 'info';
      default: return 'default';
    }
  };

  const getCategorieLabel = (categorie) => {
    switch (categorie) {
      case 'reparation': return 'Réparation';
      case 'entretien': return 'Entretien';
      case 'diagnostic': return 'Diagnostic';
      case 'nettoyage': return 'Nettoyage';
      default: return categorie;
    }
  };

  const statCards = useMemo(() => {
    const safeServices = Array.isArray(services) ? services : [];
    return [
      {
        title: 'Total Services',
        value: safeServices.length,
        icon: <Build />,
        color: '#1e40af',
        gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)',
        trend: '+3%',
        trendUp: true
      },
      {
        title: 'Actifs',
        value: safeServices.filter(s => s.statut === 'actif').length,
        icon: <Star />,
        color: '#2563eb',
        gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
        trend: '+1%',
        trendUp: true
      },
      {
        title: 'Catégories',
        value: new Set(safeServices.map(s => s.categorie)).size,
        icon: <Build />,
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6, #93c5fd)',
        trend: '+0%'
      }
    ];
  }, [services]);

  return (
    <ModernPageTemplate
      title="Gestion des Services"
      subtitle="Catalogue et opérations"
      icon={Build}
      statCards={statCards}
      loading={loading}
      error={error}
      onAdd={handleAddService}
      onRefresh={fetchServices}
      onExport={handleExport}
      onFilter={() => {}}
    >
      {/* Barre d'outils */}
      <Paper sx={{ p: 2, mb: 3, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher un service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'rgba(255,255,255,0.8)' }} />
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Filtrer par catégorie</InputLabel>
            <Select
              value={categorieFilter}
              onChange={(e) => setCategorieFilter(e.target.value)}
              label="Filtrer par catégorie"
            >
              <MenuItem value="all">Toutes les catégories</MenuItem>
              <MenuItem value="reparation">Réparation</MenuItem>
              <MenuItem value="entretien">Entretien</MenuItem>
              <MenuItem value="diagnostic">Diagnostic</MenuItem>
              <MenuItem value="nettoyage">Nettoyage</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'rgba(255,255,255,0.1)' }}>
              <TableCell><strong>Nom</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Catégorie</strong></TableCell>
              <TableCell><strong>Prix</strong></TableCell>
              <TableCell><strong>Durée estimée</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(filteredServices) ? filteredServices.map((service) => (
              <TableRow key={service.id} hover>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#000000' }}>
                    {service.nom}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {service.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getCategorieLabel(service.categorie)}
                    color={getCategorieColor(service.categorie)}
                    size="small"
                    icon={<Build />}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {typeof service.prix === 'number' ? service.prix.toFixed(2) : parseFloat(service.prix || 0).toFixed(2)} €
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {service.duree_estimee} min
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={service.statut === 'actif' ? 'Actif' : 'Inactif'}
                    color={service.statut === 'actif' ? 'success' : 'error'}
                    size="small"
                    icon={<Star />}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            )) : []}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          {Array.isArray(filteredServices) ? filteredServices.length : 0} service(s) trouvé(s)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={`Actifs: ${Array.isArray(services) ? services.filter(s => s.statut === 'actif').length : 0}`}
            color="success"
            size="small"
          />
          <Chip 
            label={`Inactifs: ${Array.isArray(services) ? services.filter(s => s.statut === 'inactif').length : 0}`}
            color="error"
            size="small"
          />
          <Chip 
            label={`Total: ${Array.isArray(services) ? services.length : 0}`}
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

      {/* Formulaire Service */}
      <ServiceForm
        open={showServiceForm}
        onClose={handleCloseServiceForm}
        onSuccess={handleServiceFormSuccess}
        service={selectedService}
      />
    </ModernPageTemplate>
  );
};

export default ServicesPage; 