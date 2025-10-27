import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  DirectionsCar,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Close,
  Star,
  Speed,
  Security,
  AttachMoney,
  Verified,
  Shield,
  LocationOn,
  Map
} from '@mui/icons-material';
import { vehiculesAPI, prixAPI } from '../services/vehiculesAPI';

const VehiculeOptionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicule, setVehicule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCouleur, setSelectedCouleur] = useState('');
  const [showAchatForm, setShowAchatForm] = useState(false);
  const [showEmpruntForm, setShowEmpruntForm] = useState(false);
  const [achatForm, setAchatForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    localisation: '',
    adresse: '',
    ville: '',
    codePostal: '',
    message: '',
    modePaiement: 'comptant',
    apport: '',
    mensualites: ''
  });
  const [empruntForm, setEmpruntForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    localisation: '',
    adresse: '',
    ville: '',
    codePostal: '',
    message: '',
    revenus: '',
    profession: '',
    garant: '',
    telephoneGarant: '',
    dateDebutEmprunt: '',
    dateFinEmprunt: ''
  });
  const [achatFormErrors, setAchatFormErrors] = useState({});
  const [empruntFormErrors, setEmpruntFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    fetchVehicule();
  }, [id]);

  // Fonction pour obtenir la géolocalisation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSnackbar({
        open: true,
        message: 'La géolocalisation n\'est pas supportée par ce navigateur',
        severity: 'error'
      });
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        
        try {
          // Utiliser l'API de géocodage inverse pour obtenir l'adresse
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY&language=fr&pretty=1`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const address = result.formatted;
            setEmpruntForm(prev => ({ ...prev, localisation: address }));
          } else {
            setEmpruntForm(prev => ({ 
              ...prev, 
              localisation: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
            }));
          }
        } catch (error) {
          console.error('Erreur géocodage:', error);
          setEmpruntForm(prev => ({ 
            ...prev, 
            localisation: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
          }));
        }
        
        setLocationLoading(false);
        setSnackbar({
          open: true,
          message: 'Position détectée avec succès !',
          severity: 'success'
        });
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        setLocationLoading(false);
        setSnackbar({
          open: true,
          message: 'Impossible d\'obtenir votre position',
          severity: 'error'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Fonction pour ouvrir Google Maps
  const openGoogleMaps = () => {
    if (userLocation) {
      const { latitude, longitude } = userLocation;
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(url, '_blank');
    } else {
      setSnackbar({
        open: true,
        message: 'Veuillez d\'abord détecter votre position',
        severity: 'warning'
      });
    }
  };

  const fetchVehicule = async () => {
    try {
      setLoading(true);
      console.log('Chargement du véhicule ID:', id);
      
      // Données de test si l'API échoue
      const testVehicule = {
        id: parseInt(id),
        marque: 'Toyota',
        modele: 'Corolla',
        annee: 2023,
        prix_vente: 25000000,
        prix_location_jour: 150000,
        kilometrage: 25000,
        puissance: '180 CV',
        carburant: 'Essence',
        transmission: 'Automatique',
        couleur: 'Blanc',
        statut: 'disponible',
        description: 'Véhicule familial confortable et économique',
        caracteristiques: ['Climatisation', 'GPS', 'Bluetooth', 'Caméra de recul', 'Airbags', 'ABS', 'Direction assistée'],
        consommation: '6.5L/100km',
        garantie: '3 ans',
        images: ['https://via.placeholder.com/600x400/00ff88/000000?text=Toyota+Corolla']
      };

      setVehicule(testVehicule);
      setSelectedCouleur(testVehicule.couleur || 'Blanc');
      console.log('Véhicule chargé:', testVehicule);
    } catch (error) {
      console.error('Erreur chargement véhicule:', error);
    } finally {
      setLoading(false);
    }
  };

  const couleursDisponibles = [
    { nom: 'Blanc', code: '#ffffff' },
    { nom: 'Noir', code: '#000000' },
    { nom: 'Gris', code: '#808080' },
    { nom: 'Rouge', code: '#ff0000' },
    { nom: 'Bleu', code: '#0000ff' },
    { nom: 'Argent', code: '#c0c0c0' }
  ];

  const handleAchatFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validation du formulaire d'achat
    const errors = {};
    if (!achatForm.nom.trim()) errors.nom = 'Le nom est obligatoire';
    if (!achatForm.prenom.trim()) errors.prenom = 'Le prénom est obligatoire';
    if (!achatForm.email.trim()) errors.email = 'L\'email est obligatoire';
    if (!achatForm.telephone.trim()) errors.telephone = 'Le numéro de téléphone est obligatoire';
    if (!achatForm.localisation.trim()) errors.localisation = 'La localisation est obligatoire';
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (achatForm.email && !emailRegex.test(achatForm.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    // Validation téléphone
    const phoneRegex = /^[+]?[0-9\s\-\(\)]{8,}$/;
    if (achatForm.telephone && !phoneRegex.test(achatForm.telephone)) {
      errors.telephone = 'Format de téléphone invalide';
    }
    
    setAchatFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setSnackbar({
        open: true,
        message: 'Veuillez corriger les erreurs du formulaire',
        severity: 'error'
      });
      return;
    }
    
     // Si validation OK, envoyer à l'API
     const prixFinal = prixAPI.calculerPrixTotal(vehicule, selectedCouleur, 'achat', 1);

     try {
       const response = await fetch('/api/boutique/demandes/achat', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           vehicule_id: vehicule.id,
           couleur: selectedCouleur,
           prix_final: prixFinal,
           nom: achatForm.nom,
           prenom: achatForm.prenom,
           email: achatForm.email,
           telephone: achatForm.telephone,
           localisation: achatForm.localisation,
           adresse: achatForm.adresse,
           ville: achatForm.ville,
           codePostal: achatForm.codePostal,
           message: achatForm.message,
           modePaiement: achatForm.modePaiement,
           apport: achatForm.apport,
           mensualites: achatForm.mensualites
         })
       });

       if (!response.ok) {
         throw new Error('Erreur lors de l\'envoi de la demande');
       }

       const result = await response.json();
       console.log('Demande d\'achat créée:', result);
       
       setSnackbar({
         open: true,
         message: 'Demande d\'achat envoyée avec succès !',
         severity: 'success'
       });
     } catch (error) {
       console.error('Erreur:', error);
       setSnackbar({
         open: true,
         message: 'Erreur lors de l\'envoi de la demande',
         severity: 'error'
       });
       return;
     }
    
    // Fermer le formulaire et réinitialiser
    setShowAchatForm(false);
    setAchatForm({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      localisation: '',
      adresse: '',
      ville: '',
      codePostal: '',
      message: '',
      modePaiement: 'comptant',
      apport: '',
      mensualites: ''
    });
    setAchatFormErrors({});
  };

  const handleEmpruntFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validation du formulaire d'emprunt
    const errors = {};
    if (!empruntForm.nom.trim()) errors.nom = 'Le nom est obligatoire';
    if (!empruntForm.prenom.trim()) errors.prenom = 'Le prénom est obligatoire';
    if (!empruntForm.email.trim()) errors.email = 'L\'email est obligatoire';
    if (!empruntForm.telephone.trim()) errors.telephone = 'Le numéro de téléphone est obligatoire';
    if (!empruntForm.localisation.trim()) errors.localisation = 'La localisation est obligatoire';
    if (!empruntForm.revenus.trim()) errors.revenus = 'Les revenus sont obligatoires';
    if (!empruntForm.profession.trim()) errors.profession = 'La profession est obligatoire';
    if (!empruntForm.garant.trim()) errors.garant = 'Le garant est obligatoire';
    if (!empruntForm.telephoneGarant.trim()) errors.telephoneGarant = 'Le téléphone du garant est obligatoire';
    if (!empruntForm.dateDebutEmprunt.trim()) errors.dateDebutEmprunt = 'La date de début est obligatoire';
    if (!empruntForm.dateFinEmprunt.trim()) errors.dateFinEmprunt = 'La date de fin est obligatoire';
    
    // Validation des dates
    if (empruntForm.dateDebutEmprunt && empruntForm.dateFinEmprunt) {
      const dateDebut = new Date(empruntForm.dateDebutEmprunt);
      const dateFin = new Date(empruntForm.dateFinEmprunt);
      const aujourdhui = new Date();
      aujourdhui.setHours(0, 0, 0, 0);
      
      if (dateDebut < aujourdhui) {
        errors.dateDebutEmprunt = 'La date de début ne peut pas être dans le passé';
      }
      if (dateFin <= dateDebut) {
        errors.dateFinEmprunt = 'La date de fin doit être après la date de début';
      }
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (empruntForm.email && !emailRegex.test(empruntForm.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    // Validation téléphone
    const phoneRegex = /^[+]?[0-9\s\-\(\)]{8,}$/;
    if (empruntForm.telephone && !phoneRegex.test(empruntForm.telephone)) {
      errors.telephone = 'Format de téléphone invalide';
    }
    if (empruntForm.telephoneGarant && !phoneRegex.test(empruntForm.telephoneGarant)) {
      errors.telephoneGarant = 'Format de téléphone invalide';
    }
    
    setEmpruntFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setSnackbar({
        open: true,
        message: 'Veuillez corriger les erreurs du formulaire',
        severity: 'error'
      });
      return;
    }
    
     // Si validation OK, envoyer à l'API
     const prixFinal = prixAPI.calculerPrixTotal(vehicule, selectedCouleur, 'achat', 1);

     try {
       const response = await fetch('/api/boutique/demandes/emprunt', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           vehicule_id: vehicule.id,
           couleur: selectedCouleur,
           prix_final: prixFinal,
           nom: empruntForm.nom,
           prenom: empruntForm.prenom,
           email: empruntForm.email,
           telephone: empruntForm.telephone,
           localisation: empruntForm.localisation,
           adresse: empruntForm.adresse,
           ville: empruntForm.ville,
           codePostal: empruntForm.codePostal,
           message: empruntForm.message,
           revenus: empruntForm.revenus,
           profession: empruntForm.profession,
           garant: empruntForm.garant,
           telephoneGarant: empruntForm.telephoneGarant,
           dateDebutEmprunt: empruntForm.dateDebutEmprunt,
           dateFinEmprunt: empruntForm.dateFinEmprunt
         })
       });

       if (!response.ok) {
         throw new Error('Erreur lors de l\'envoi de la demande');
       }

       const result = await response.json();
       console.log('Demande d\'emprunt créée:', result);
       
       setSnackbar({
         open: true,
         message: 'Demande d\'emprunt envoyée avec succès !',
         severity: 'success'
       });
     } catch (error) {
       console.error('Erreur:', error);
       setSnackbar({
         open: true,
         message: 'Erreur lors de l\'envoi de la demande',
         severity: 'error'
       });
       return;
     }
    
    // Fermer le formulaire et réinitialiser
    setShowEmpruntForm(false);
     setEmpruntForm({
       nom: '',
       prenom: '',
       email: '',
       telephone: '',
       localisation: '',
       adresse: '',
       ville: '',
       codePostal: '',
       message: '',
       revenus: '',
       profession: '',
       garant: '',
       telephoneGarant: '',
       dateDebutEmprunt: '',
       dateFinEmprunt: ''
     });
    setEmpruntFormErrors({});
  };

  const handleAchatFormChange = (field, value) => {
    setAchatForm(prev => ({ ...prev, [field]: value }));
    // Supprimer l'erreur du champ modifié
    if (achatFormErrors[field]) {
      setAchatFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleEmpruntFormChange = (field, value) => {
    setEmpruntForm(prev => ({ ...prev, [field]: value }));
    // Supprimer l'erreur du champ modifié
    if (empruntFormErrors[field]) {
      setEmpruntFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const AchatFormDialog = () => (
    <Dialog 
      open={showAchatForm} 
      onClose={() => setShowAchatForm(false)}
      maxWidth="md"
      fullWidth
      className="achat-form-dialog"
      TransitionProps={{ timeout: 0 }}
      BackdropProps={{ style: { animation: 'none', transition: 'none' } }}
    >
      <DialogTitle className="dialog-title">
        <div className="dialog-header">
          <Typography variant="h5">
            Formulaire d'Achat
          </Typography>
          <IconButton onClick={() => setShowAchatForm(false)} className="close-btn">
            <Close />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className="dialog-content">
        <form onSubmit={handleAchatFormSubmit} className="achat-form">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom *"
                value={achatForm.nom}
                onChange={(e) => handleAchatFormChange('nom', e.target.value)}
                error={!!achatFormErrors.nom}
                helperText={achatFormErrors.nom}
                className="form-field"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom *"
                value={achatForm.prenom}
                onChange={(e) => handleAchatFormChange('prenom', e.target.value)}
                error={!!achatFormErrors.prenom}
                helperText={achatFormErrors.prenom}
                className="form-field"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={achatForm.email}
                onChange={(e) => handleAchatFormChange('email', e.target.value)}
                error={!!achatFormErrors.email}
                helperText={achatFormErrors.email}
                className="form-field"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone *"
                value={achatForm.telephone}
                onChange={(e) => handleAchatFormChange('telephone', e.target.value)}
                error={!!achatFormErrors.telephone}
                helperText={achatFormErrors.telephone}
                className="form-field"
                placeholder="+225 XX XX XX XX"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Localisation *"
                value={achatForm.localisation}
                onChange={(e) => handleAchatFormChange('localisation', e.target.value)}
                error={!!achatFormErrors.localisation}
                helperText={achatFormErrors.localisation}
                className="form-field"
                placeholder="Ex: Abidjan, Cocody"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse complète"
                value={achatForm.adresse}
                onChange={(e) => handleAchatFormChange('adresse', e.target.value)}
                className="form-field"
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth className="form-control">
                <InputLabel>Mode de paiement</InputLabel>
                <Select
                  value={achatForm.modePaiement}
                  onChange={(e) => handleAchatFormChange('modePaiement', e.target.value)}
                  className="select-field"
                >
                  <MenuItem value="comptant">Comptant</MenuItem>
                  <MenuItem value="credit">Crédit</MenuItem>
                  <MenuItem value="financement">Financement</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apport initial (FCFA)"
                value={achatForm.apport}
                onChange={(e) => handleAchatFormChange('apport', e.target.value)}
                className="form-field"
                type="number"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message (optionnel)"
                value={achatForm.message}
                onChange={(e) => handleAchatFormChange('message', e.target.value)}
                className="form-field"
                multiline
                rows={3}
                placeholder="Dites-nous en plus sur vos besoins..."
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      <DialogActions className="dialog-actions">
        <Button 
          onClick={() => setShowAchatForm(false)} 
          className="cancel-btn"
        >
          Annuler
        </Button>
        <Button 
          variant="contained" 
          onClick={handleAchatFormSubmit}
          startIcon={<ShoppingCart />}
          className="submit-btn"
        >
          Confirmer l'Achat
        </Button>
      </DialogActions>
    </Dialog>
  );

  const EmpruntFormDialog = () => (
    <Dialog 
      open={showEmpruntForm} 
      onClose={() => setShowEmpruntForm(false)}
      maxWidth="md"
      fullWidth
      className="emprunt-form-dialog"
      TransitionProps={{ timeout: 0 }}
      BackdropProps={{ style: { animation: 'none', transition: 'none' } }}
    >
      <DialogTitle className="dialog-title">
        <div className="dialog-header">
          <Typography variant="h5">
            Formulaire d'Emprunt
          </Typography>
          <IconButton onClick={() => setShowEmpruntForm(false)} className="close-btn">
            <Close />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className="dialog-content">
        <form onSubmit={handleEmpruntFormSubmit} className="emprunt-form">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom *"
                value={empruntForm.nom}
                onChange={(e) => handleEmpruntFormChange('nom', e.target.value)}
                error={!!empruntFormErrors.nom}
                helperText={empruntFormErrors.nom}
                className="form-field"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom *"
                value={empruntForm.prenom}
                onChange={(e) => handleEmpruntFormChange('prenom', e.target.value)}
                error={!!empruntFormErrors.prenom}
                helperText={empruntFormErrors.prenom}
                className="form-field"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={empruntForm.email}
                onChange={(e) => handleEmpruntFormChange('email', e.target.value)}
                error={!!empruntFormErrors.email}
                helperText={empruntFormErrors.email}
                className="form-field"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone *"
                value={empruntForm.telephone}
                onChange={(e) => handleEmpruntFormChange('telephone', e.target.value)}
                error={!!empruntFormErrors.telephone}
                helperText={empruntFormErrors.telephone}
                className="form-field"
                placeholder="+225 XX XX XX XX"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Localisation *"
                value={empruntForm.localisation}
                onChange={(e) => handleEmpruntFormChange('localisation', e.target.value)}
                error={!!empruntFormErrors.localisation}
                helperText={empruntFormErrors.localisation}
                className="form-field"
                placeholder="Ex: Abidjan, Cocody"
                InputProps={{
                  endAdornment: (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        size="small"
                        sx={{ color: '#00ff88' }}
                      >
                        {locationLoading ? <CircularProgress size={20} /> : <LocationOn />}
                      </IconButton>
                      <IconButton
                        onClick={openGoogleMaps}
                        size="small"
                        sx={{ color: '#00ff88' }}
                      >
                        <Map />
                      </IconButton>
                    </Box>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Profession *"
                value={empruntForm.profession}
                onChange={(e) => handleEmpruntFormChange('profession', e.target.value)}
                error={!!empruntFormErrors.profession}
                helperText={empruntFormErrors.profession}
                className="form-field"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Revenus mensuels (FCFA) *"
                value={empruntForm.revenus}
                onChange={(e) => handleEmpruntFormChange('revenus', e.target.value)}
                error={!!empruntFormErrors.revenus}
                helperText={empruntFormErrors.revenus}
                className="form-field"
                type="number"
              />
            </Grid>
            
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom du garant *"
                value={empruntForm.garant}
                onChange={(e) => handleEmpruntFormChange('garant', e.target.value)}
                error={!!empruntFormErrors.garant}
                helperText={empruntFormErrors.garant}
                className="form-field"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone du garant *"
                value={empruntForm.telephoneGarant}
                onChange={(e) => handleEmpruntFormChange('telephoneGarant', e.target.value)}
                error={!!empruntFormErrors.telephoneGarant}
                helperText={empruntFormErrors.telephoneGarant}
                className="form-field"
                placeholder="+225 XX XX XX XX"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de début d'emprunt *"
                type="date"
                value={empruntForm.dateDebutEmprunt}
                onChange={(e) => handleEmpruntFormChange('dateDebutEmprunt', e.target.value)}
                error={!!empruntFormErrors.dateDebutEmprunt}
                helperText={empruntFormErrors.dateDebutEmprunt}
                className="form-field"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de fin d'emprunt *"
                type="date"
                value={empruntForm.dateFinEmprunt}
                onChange={(e) => handleEmpruntFormChange('dateFinEmprunt', e.target.value)}
                error={!!empruntFormErrors.dateFinEmprunt}
                helperText={empruntFormErrors.dateFinEmprunt}
                className="form-field"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message (optionnel)"
                value={empruntForm.message}
                onChange={(e) => handleEmpruntFormChange('message', e.target.value)}
                className="form-field"
                multiline
                rows={3}
                placeholder="Dites-nous en plus sur votre situation..."
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      <DialogActions className="dialog-actions">
        <Button 
          onClick={() => setShowEmpruntForm(false)} 
          className="cancel-btn"
        >
          Annuler
        </Button>
        <Button 
          variant="contained" 
          onClick={handleEmpruntFormSubmit}
          startIcon={<AttachMoney />}
          className="submit-btn"
        >
          Demander l'Emprunt
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="vehicule-options-container">
        <div className="loading-container">
          <CircularProgress className="loading-spinner" />
          <Typography className="loading-text">Chargement des options...</Typography>
        </div>
      </div>
    );
  }

  if (!vehicule) {
    return (
      <div className="vehicule-options-container">
        <div className="error-container">
          <Typography variant="h5" className="error-title">Véhicule non trouvé</Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/boutique-client')}
            startIcon={<ArrowBack />}
            className="back-btn"
          >
            Retour à la boutique
          </Button>
        </div>
      </div>
    );
  }

  const prixFinal = prixAPI.calculerPrixTotal(vehicule, selectedCouleur, 'achat', 1);

  return (
    <div className="vehicule-options-container">
      {/* Main Content */}
      <main className="main-section">
        <div className="container">
          <Grid container spacing={4}>
            {/* Image et infos principales */}
            <Grid item xs={12} md={6}>
              <Card className="vehicule-image-card">
                <div 
                  className="vehicule-image"
                  style={{
                    background: `linear-gradient(135deg, ${couleursDisponibles.find(c => c.nom === selectedCouleur)?.code || '#f0f0f0'} 0%, rgba(0,0,0,0.1) 100%)`
                  }}
                >
                  <DirectionsCar className="car-icon" />
                </div>
                <CardContent>
                  <Typography variant="h4" className="vehicule-title">
                    {vehicule.marque} {vehicule.modele}
                  </Typography>
                  <Typography variant="h6" className="vehicule-year">
                    {vehicule.annee}
                  </Typography>
                  <Typography className="vehicule-description">
                    {vehicule.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Options et configuration */}
            <Grid item xs={12} md={6}>
              <Card className="options-card">
                <CardContent>
                  <Typography variant="h5" className="options-title">
                    Configurez votre véhicule
                  </Typography>

                  {/* Sélection de couleur */}
                  <div className="option-section">
                    <Typography variant="h6" className="option-label">
                      Couleur
                    </Typography>
                    <div className="couleurs-grid">
                      {couleursDisponibles.map((couleur) => (
                        <div
                          key={couleur.nom}
                          className={`couleur-option ${selectedCouleur === couleur.nom ? 'selected' : ''}`}
                          onClick={() => setSelectedCouleur(couleur.nom)}
                          style={{ backgroundColor: couleur.code }}
                        >
                          <span className="couleur-name">{couleur.nom}</span>
                        </div>
                      ))}
                    </div>
                  </div>


                  {/* Prix */}
                  <div className="price-section">
                    <Typography variant="h4" className="price-label">
                      Prix total
                    </Typography>
                    <Typography variant="h3" className="price-value">
                      {prixAPI.formaterPrix(prixFinal)}
                    </Typography>
                     <Typography className="price-details">
                       Prix de vente pour {selectedCouleur}
                     </Typography>
                  </div>

                  {/* Boutons d'action */}
                  <div className="action-buttons">
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => setShowAchatForm(true)}
                      startIcon={<ShoppingCart />}
                      className="achat-btn"
                    >
                      Acheter maintenant
                    </Button>
                    
                     <Button
                       fullWidth
                       variant="outlined"
                       size="large"
                       onClick={() => setShowEmpruntForm(true)}
                       startIcon={<AttachMoney />}
                       className="emprunt-btn"
                     >
                       Demande de location
                     </Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>

            {/* Caractéristiques détaillées */}
            <Grid item xs={12}>
              <Card className="details-card">
                <CardContent>
                  <Typography variant="h5" className="details-title">
                    Caractéristiques détaillées
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <div className="detail-item">
                        <Speed className="detail-icon" />
                        <div className="detail-content">
                          <Typography className="detail-label">Puissance</Typography>
                          <Typography className="detail-value">{vehicule.puissance}</Typography>
                        </div>
                      </div>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <div className="detail-item">
                        <DirectionsCar className="detail-icon" />
                        <div className="detail-content">
                          <Typography className="detail-label">Carburant</Typography>
                          <Typography className="detail-value">{vehicule.carburant}</Typography>
                        </div>
                      </div>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <div className="detail-item">
                        <Security className="detail-icon" />
                        <div className="detail-content">
                          <Typography className="detail-label">Transmission</Typography>
                          <Typography className="detail-value">{vehicule.transmission}</Typography>
                        </div>
                      </div>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <div className="detail-item">
                        <Verified className="detail-icon" />
                        <div className="detail-content">
                          <Typography className="detail-label">Garantie</Typography>
                          <Typography className="detail-value">{vehicule.garantie}</Typography>
                        </div>
                      </div>
                    </Grid>
                  </Grid>

                  {/* Caractéristiques */}
                  <div className="features-section">
                    <Typography variant="h6" className="features-title">
                      Équipements inclus
                    </Typography>
                    <div className="features-grid">
                      {vehicule.caracteristiques.map((feature, index) => (
                        <Chip
                          key={index}
                          label={feature}
                          className="feature-chip"
                          icon={<Star />}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
      </main>

      <AchatFormDialog />
      <EmpruntFormDialog />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          className="snackbar-alert"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <style>{`
        .vehicule-options-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
          color: white;
          overflow-x: hidden;
          position: relative;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Main section */
        .main-section {
          padding-top: 20px;
          min-height: 100vh;
          position: relative;
          z-index: 10;
        }

        /* Cards */
        .vehicule-image-card, .options-card, .details-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          color: white;
        }

        .vehicule-image {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          margin: 20px;
          position: relative;
        }

        .car-icon {
          font-size: 120px;
          color: rgba(255, 255, 255, 0.8);
        }

        .vehicule-title {
          color: #00ff88;
          font-weight: 900;
          margin-bottom: 10px;
        }

        .vehicule-year {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 20px;
        }

        .vehicule-description {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
        }

        /* Options */
        .options-title {
          color: #00ff88;
          font-weight: 700;
          margin-bottom: 30px;
        }

        .option-section {
          margin-bottom: 30px;
        }

        .option-label {
          color: white;
          font-weight: 600;
          margin-bottom: 15px;
        }

        .couleurs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 15px;
        }

        .couleur-option {
          height: 60px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          position: relative;
        }

        .couleur-option:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .couleur-option.selected {
          border-color: #00ff88;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
        }

        .couleur-name {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 5px 10px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 12px;
        }

        .form-control {
          margin-bottom: 20px;
        }

        .form-field .MuiInputBase-root {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: white;
        }

        .form-field .MuiInputBase-input {
          color: white;
        }

        .form-field .MuiInputLabel-root {
          color: rgba(255, 255, 255, 0.7);
        }

        .form-field .MuiInputLabel-root.Mui-focused {
          color: #00ff88;
        }

        .form-field .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline {
          border-color: rgba(0, 255, 136, 0.3);
        }

        .form-field .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
          border-color: #00ff88;
        }

        .form-field .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: #00ff88;
        }

        .select-field .MuiSelect-select {
          color: white;
        }

        /* Prix */
        .price-section {
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 15px;
          padding: 20px;
          margin: 30px 0;
          text-align: center;
        }

        .price-label {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 10px;
        }

        .price-value {
          color: #00ff88;
          font-weight: 900;
          text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
        }

        .price-details {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        /* Action buttons */
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 30px;
        }

        .achat-btn {
          background: linear-gradient(135deg, #00ff88, #00aa55);
          color: #000;
          font-weight: 700;
          border-radius: 25px;
          padding: 15px 30px;
          font-size: 18px;
        }

        .achat-btn:hover {
          box-shadow: 0 10px 20px rgba(0, 255, 136, 0.3);
        }

        .emprunt-btn {
          background: transparent;
          color: #00ff88;
          border: 2px solid #00ff88;
          font-weight: 700;
          border-radius: 25px;
          padding: 15px 30px;
          font-size: 18px;
        }

        .emprunt-btn:hover {
          background: rgba(0, 255, 136, 0.1);
          box-shadow: 0 10px 20px rgba(0, 255, 136, 0.2);
        }

        /* Détails */
        .details-title {
          color: #00ff88;
          font-weight: 700;
          margin-bottom: 30px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          border: 1px solid rgba(0, 255, 136, 0.2);
        }

        .detail-icon {
          font-size: 30px;
          color: #00ff88;
        }

        .detail-content {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .detail-value {
          color: white;
          font-weight: 600;
        }

        .features-section {
          margin-top: 30px;
        }

        .features-title {
          color: white;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .features-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .feature-chip {
          background: rgba(0, 255, 136, 0.1);
          color: #00ff88;
          border: 1px solid rgba(0, 255, 136, 0.3);
        }

        /* Dialog */
        .achat-form-dialog .MuiDialog-paper,
        .emprunt-form-dialog .MuiDialog-paper {
          background: rgba(10, 10, 10, 0.95);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          animation: none !important;
          transform: none !important;
          transition: none !important;
        }

        .achat-form-dialog .MuiDialog-root,
        .emprunt-form-dialog .MuiDialog-root {
          animation: none !important;
        }

        .achat-form-dialog .MuiBackdrop-root,
        .emprunt-form-dialog .MuiBackdrop-root {
          animation: none !important;
          transition: none !important;
        }

        .achat-form-dialog *,
        .emprunt-form-dialog * {
          animation: none !important;
          transition: none !important;
        }

        .dialog-title {
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 170, 85, 0.1));
          border-bottom: 1px solid rgba(0, 255, 136, 0.2);
        }

        .dialog-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .close-btn {
          color: rgba(255, 255, 255, 0.7);
        }

        .close-btn:hover {
          color: #00ff88;
        }

        .contact-form {
          padding: 20px 0;
        }

        .form-field .MuiInputBase-root {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: white;
        }

        .form-field .MuiInputBase-input {
          color: white;
        }

        .form-field .MuiInputBase-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .form-field .MuiInputLabel-root {
          color: rgba(255, 255, 255, 0.7);
        }

        .form-field .MuiInputLabel-root.Mui-focused {
          color: #00ff88;
        }

        .form-field .MuiOutlinedInput-root {
          border-radius: 10px;
        }

        .form-field .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline {
          border-color: rgba(0, 255, 136, 0.3);
        }

        .form-field .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
          border-color: #00ff88;
        }

        .form-field .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: #00ff88;
        }

        .form-field .MuiFormHelperText-root {
          color: #ff6b6b;
        }

        .submit-btn {
          background: linear-gradient(135deg, #00ff88, #00aa55);
          color: #000;
          font-weight: 700;
          border-radius: 25px;
          padding: 12px 24px;
        }

        .submit-btn:hover {
          box-shadow: 0 10px 20px rgba(0, 255, 136, 0.3);
        }

        .cancel-btn {
          color: rgba(255, 255, 255, 0.7);
        }

        .cancel-btn:hover {
          color: #00ff88;
        }

        /* Loading */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          gap: 20px;
        }

        .loading-spinner {
          color: #00ff88;
        }

        .loading-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
        }

        /* Error */
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          gap: 20px;
        }

        .error-title {
          color: rgba(255, 255, 255, 0.8);
        }

        /* Snackbar */
        .snackbar-alert {
          background: rgba(10, 10, 10, 0.95);
          border: 1px solid rgba(0, 255, 136, 0.2);
          backdrop-filter: blur(10px);
        }

        /* Animations */
        @keyframes logoFloat {
          0%, 100% { transform: rotate(12deg) translateY(0px); }
          50% { transform: rotate(12deg) translateY(-5px); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .main-section {
            padding-top: 20px;
          }

          .action-buttons {
            gap: 10px;
          }

          .couleurs-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .detail-item {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default VehiculeOptionsPage;
