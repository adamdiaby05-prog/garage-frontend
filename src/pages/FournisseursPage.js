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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Business,
  Phone,
  Email,
  LocationOn
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { fournisseursAPI } from '../services/api';
import ModernPageTemplate from '../components/ModernPageTemplate';

const FournisseursPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showForm, setShowForm] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [formData, setFormData] = useState({
    nom_fournisseur: '',
    telephone: '',
    email: '',
    adresse: '',
    contact_principal: ''
  });

  // Charger les fournisseurs
  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const fetchFournisseurs = async () => {
    try {
      setLoading(true);
      const response = await fournisseursAPI.getAll();
      setFournisseurs(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des fournisseurs:', err);
      setError('Erreur lors du chargement des fournisseurs');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les fournisseurs
  const filteredFournisseurs = useMemo(() => fournisseurs.filter(fournisseur =>
    fournisseur.nom_fournisseur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fournisseur.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fournisseur.contact_principal?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [fournisseurs, searchTerm]);

  // Gérer l'ajout d'un nouveau fournisseur
  const handleAddFournisseur = () => {
    setSelectedFournisseur(null);
    setFormData({
      nom_fournisseur: '',
      telephone: '',
      email: '',
      adresse: '',
      contact_principal: ''
    });
    setShowForm(true);
  };

  // Gérer la modification d'un fournisseur
  const handleEditFournisseur = (fournisseur) => {
    setSelectedFournisseur(fournisseur);
    setFormData({
      nom_fournisseur: fournisseur.nom_fournisseur || '',
      telephone: fournisseur.telephone || '',
      email: fournisseur.email || '',
      adresse: fournisseur.adresse || '',
      contact_principal: fournisseur.contact_principal || ''
    });
    setShowForm(true);
  };

  // Gérer la fermeture du formulaire
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedFournisseur(null);
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async () => {
    if (!formData.nom_fournisseur?.trim()) {
      setSnackbar({ open: true, message: 'Le nom du fournisseur est obligatoire', severity: 'error' });
      return;
    }

    try {
      if (selectedFournisseur) {
        await fournisseursAPI.update(selectedFournisseur.id_fournisseur || selectedFournisseur.id, formData);
        setSnackbar({ open: true, message: 'Fournisseur modifié avec succès', severity: 'success' });
      } else {
        await fournisseursAPI.create(formData);
        setSnackbar({ open: true, message: 'Fournisseur ajouté avec succès', severity: 'success' });
      }
      handleCloseForm();
      fetchFournisseurs();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
      setSnackbar({ open: true, message: 'Erreur lors de l\'enregistrement', severity: 'error' });
    }
  };

  // Gérer la suppression d'un fournisseur
  const handleDeleteFournisseur = async (id) => {
    try {
      await fournisseursAPI.delete(id);
      setSnackbar({ open: true, message: 'Fournisseur supprimé avec succès', severity: 'success' });
      fetchFournisseurs();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
    }
  };

  // Gérer la fermeture du snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fonction d'exportation Excel pour les fournisseurs
  const handleExport = () => {
    try {
      // Préparer les données pour l'export
      const exportData = fournisseurs.map(fournisseur => ({
        'ID': fournisseur.id_fournisseur || fournisseur.id,
        'Nom': fournisseur.nom_fournisseur || 'N/A',
        'Email': fournisseur.email || 'N/A',
        'Téléphone': fournisseur.telephone || 'N/A',
        'Adresse': fournisseur.adresse || 'N/A',
        'Contact': fournisseur.contact_principal || 'N/A',
        'Spécialité': fournisseur.specialite || 'N/A',
        'Date de création': fournisseur.date_creation ? new Date(fournisseur.date_creation).toLocaleDateString('fr-FR') : 'N/A'
      }));

      // Créer un nouveau classeur Excel
      const wb = XLSX.utils.book_new();
      
      // Créer une feuille de calcul avec les données
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Définir la largeur des colonnes
      const colWidths = [
        { wch: 8 },   // ID
        { wch: 20 },  // Nom
        { wch: 25 },  // Email
        { wch: 15 },  // Téléphone
        { wch: 30 },  // Adresse
        { wch: 20 },  // Contact
        { wch: 20 },  // Spécialité
        { wch: 15 }   // Date de création
      ];
      ws['!cols'] = colWidths;
      
      // Ajouter la feuille au classeur
      XLSX.utils.book_append_sheet(wb, ws, 'Fournisseurs');
      
      // Générer le fichier Excel
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Créer et télécharger le fichier
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `fournisseurs_${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: `Export Excel réussi ! ${fournisseurs.length} fournisseurs exportés.`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'export des fournisseurs.',
        severity: 'error'
      });
    }
  };

  const statCards = [
    {
      title: 'Total Fournisseurs',
      value: fournisseurs.length,
      icon: <Business />,
      color: '#1e40af',
      gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)',
      trend: '+2%',
      trendUp: true
    },
    {
      title: 'Avec contact',
      value: fournisseurs.filter(f => !!f.contact_principal).length,
      icon: <Phone />,
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      trend: '+1%',
      trendUp: true
    },
    {
      title: 'Emails renseignés',
      value: fournisseurs.filter(f => !!f.email).length,
      icon: <Email />,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #93c5fd)',
      trend: '+0%',
      trendUp: true
    }
  ];

  return (
    <ModernPageTemplate
      title="Gestion des Fournisseurs"
      subtitle="Partenaires et contacts"
      icon={Business}
      statCards={statCards}
      loading={loading}
      error={error}
      onAdd={handleAddFournisseur}
      onRefresh={fetchFournisseurs}
      onExport={handleExport}
      onFilter={() => {}}
    >
      {/* Barre d'outils */}
      <Paper sx={{ p: 2, mb: 3, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher un fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
          />
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'rgba(255,255,255,0.1)' }}>
              <TableCell><strong>Nom</strong></TableCell>
              <TableCell><strong>Contact</strong></TableCell>
              <TableCell><strong>Adresse</strong></TableCell>
              <TableCell><strong>Contact Principal</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFournisseurs.map((fournisseur, index) => (
              <TableRow key={fournisseur.id_fournisseur || fournisseur.id || `fournisseur-${index}`} hover>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#000000' }}>
                    {fournisseur.nom_fournisseur}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ fontSize: 16, color: 'action.active' }} />
                      <Typography variant="body2">{fournisseur.telephone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email sx={{ fontSize: 16, color: 'action.active' }} />
                      <Typography variant="body2">{fournisseur.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'action.active' }} />
                      <Typography variant="body2">
                        {fournisseur.adresse || 'Aucune adresse'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {fournisseur.contact_principal || 'Aucun contact'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{fournisseur.contact_principal || '-'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label="Actif"
                    color="success"
                    size="small"
                    icon={<Business />}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEditFournisseur(fournisseur)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteFournisseur(fournisseur.id_fournisseur || fournisseur.id)}
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
          {filteredFournisseurs.length} fournisseur(s) trouvé(s)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={`Total: ${fournisseurs.length}`}
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

      {/* Formulaire Fournisseur */}
      <Dialog open={showForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedFournisseur ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du fournisseur *"
                value={formData.nom_fournisseur}
                onChange={(e) => setFormData({ ...formData, nom_fournisseur: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact principal"
                value={formData.contact_principal}
                onChange={(e) => setFormData({ ...formData, contact_principal: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                multiline
                rows={3}
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedFournisseur ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </ModernPageTemplate>
  );
};

export default FournisseursPage;




