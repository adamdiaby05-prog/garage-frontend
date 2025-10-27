import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Rating,
  IconButton,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Divider,
  Paper,
  Avatar,
  Badge,
  Tooltip,
  Slider,
  Switch,
  FormLabel
} from '@mui/material';
import { 
  ShoppingCart, 
  Search, 
  AutoAwesome, 
  DirectionsCar, 
  Star,
  Verified,
  Speed,
  Shield,
  Bolt,
  Menu as MenuIcon,
  Close,
  FilterList,
  ZoomIn,
  ZoomOut,
  LocalShipping,
  AttachMoney,
  CalendarToday,
  Palette,
  Build,
  Eco,
  Security,
  Wifi,
  MusicNote,
  PhoneAndroid,
  Directions,
  Favorite,
  Share,
  Compare,
  Info,
  CheckCircle,
  Warning,
  Error,
  ArrowBack,
  Home
} from '@mui/icons-material';
import { vehiculesAPI, couleursAPI, filtresAPI, prixAPI } from '../services/vehiculesAPI';

const BoutiqueClientPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [vehicules, setVehicules] = useState([]);
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicule, setSelectedVehicule] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Debug pour le dialog
  useEffect(() => {
    console.log('Dialog state changed:', dialogOpen);
  }, [dialogOpen]);
  const [selectedCouleur, setSelectedCouleur] = useState('');
  const [typeAchat, setTypeAchat] = useState('achat');
  const [dureeLocation, setDureeLocation] = useState(1);
  const [filters, setFilters] = useState({
    marque: '',
    prixMin: 0,
    prixMax: 100000000,
    anneeMin: 2015,
    anneeMax: 2024,
    carburant: '',
    transmission: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    localisation: '',
    adresse: '',
    ville: '',
    codePostal: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // États pour les effets visuels
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Utiliser les services API
  const couleursDisponibles = couleursAPI.getCouleursDisponibles();
  const marquesPopulaires = filtresAPI.getMarquesPopulaires();


  // Initialisation des particules
  useEffect(() => {
    const initialParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.5 + 0.2,
      color: ['#00ff88', '#00cc6a', '#00aa55'][Math.floor(Math.random() * 3)]
    }));
    setParticles(initialParticles);

    const animateParticles = () => {
      setParticles(prev => prev.map(p => ({
          ...p,
        x: (p.x + p.speedX) > window.innerWidth ? 0 : (p.x + p.speedX) < 0 ? window.innerWidth : p.x + p.speedX,
        y: (p.y + p.speedY) > window.innerHeight ? 0 : (p.y + p.speedY) < 0 ? window.innerHeight : p.y + p.speedY
      })));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  // Gestion du scroll et de la souris
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    fetchVehicules();
    fetchPieces();
  }, []);

  // Debug des changements d'état
  useEffect(() => {
    console.log('=== État dialogOpen changé ===');
    console.log('dialogOpen:', dialogOpen);
    console.log('selectedVehicule:', selectedVehicule);
  }, [dialogOpen, selectedVehicule]);

  const fetchVehicules = async () => {
    try {
      setLoading(true);
      console.log('Chargement des véhicules...');
      
      // Récupérer les véhicules en vente depuis l'API
      const response = await fetch('http://localhost:5000/api/vente/vehicules');
      if (response.ok) {
        const vehiculesEnVente = await response.json();
        console.log('Véhicules en vente récupérés:', vehiculesEnVente);
        
        // Transformer les données pour correspondre au format attendu
        const vehicules = vehiculesEnVente.map(v => ({
          id: v.id,
          marque: v.marque,
          modele: v.modele,
          annee: v.annee,
          prix_vente: parseFloat(v.prix_vente),
          prix_location_jour: parseFloat(v.prix_vente) * 0.01, // 1% du prix de vente par jour
          kilometrage: v.kilometrage || 0,
          puissance: v.puissance || '',
          carburant: v.carburant || 'Essence',
          transmission: v.transmission || 'Manuelle',
          couleur: v.couleur || '',
          statut: 'disponible',
          description: v.description || `${v.marque} ${v.modele} ${v.annee} - ${v.couleur}`,
          caracteristiques: ['Climatisation', 'GPS', 'Bluetooth'],
          consommation: '6.5L/100km',
          garantie: '3 ans',
          image: v.image_principale || '',
          vendeur: `${v.client_prenom} ${v.client_nom}`,
          type_vente: 'vente'
        }));
        
        setVehicules(vehicules);
        return;
      }
      
      // Fallback: Données de test en dur pour s'assurer que ça fonctionne
      const testVehicules = [
        {
          id: 1,
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
          garantie: '3 ans'
        },
        {
          id: 2,
          marque: 'BMW',
          modele: 'X3',
          annee: 2023,
          prix_vente: 45000000,
          prix_location_jour: 250000,
          kilometrage: 15000,
          puissance: '250 CV',
          carburant: 'Essence',
          transmission: 'Automatique',
          couleur: 'Noir',
          statut: 'disponible',
          description: 'SUV premium avec toutes les options',
          caracteristiques: ['Climatisation', 'GPS', 'Bluetooth', 'Caméra de recul', 'Airbags', 'ABS', 'Direction assistée'],
          consommation: '8.2L/100km',
          garantie: '3 ans'
        }
      ];
      
      console.log('Utilisation des données de test:', testVehicules);
      setVehicules(testVehicules);
      
      // Essayer aussi l'API
      try {
        const data = await vehiculesAPI.getAll();
        console.log('Véhicules reçus de l\'API:', data);
        
        if (data && data.length > 0) {
          const vehiculesAvecCaracteristiques = data.map(vehicule => ({
            ...vehicule,
            statut: vehicule.statut || 'disponible',
            caracteristiques: vehicule.caracteristiques || [
              'Climatisation',
              'GPS',
              'Bluetooth',
              'Caméra de recul',
              'Airbags',
              'ABS',
              'Direction assistée'
            ],
            consommation: vehicule.consommation || 'Consommation non spécifiée',
            garantie: vehicule.garantie || 'Garantie constructeur'
          }));
          
          console.log('Véhicules avec caractéristiques:', vehiculesAvecCaracteristiques);
          setVehicules(vehiculesAvecCaracteristiques);
        }
      } catch (apiErr) {
        console.log('API non disponible, utilisation des données de test');
      }
      
    } catch (err) {
      console.error('Erreur lors du chargement des véhicules:', err);
      setError('Erreur lors du chargement des véhicules');
    } finally {
      setLoading(false);
    }
  };

  const fetchPieces = async () => {
    try {
      // Simulation de données pour les pièces
      const mockPieces = [
        {
          id: 1,
          nom: 'Pneus Michelin',
          prix: 150000,
          categorie: 'Pneus',
          stock: 50,
          description: 'Pneus haute performance'
        }
      ];
      setPieces(mockPieces);
    } catch (err) {
      console.error('Erreur chargement pièces:', err);
    }
  };

  const handleVehiculeClick = (vehicule) => {
    console.log('=== handleVehiculeClick appelé ===');
    console.log('Véhicule cliqué:', vehicule);
    console.log('État avant:', { dialogOpen, selectedVehicule });
    
    setSelectedVehicule(vehicule);
    setSelectedCouleur(vehicule.couleur || 'Blanc');
    setDialogOpen(true);
    
    console.log('États mis à jour - dialogOpen devrait être true');
    
    // Vérification après un délai
    setTimeout(() => {
      console.log('État après timeout:', { dialogOpen, selectedVehicule });
    }, 100);
  };

  const handleAchat = () => {
    if (!selectedVehicule) return;
    
    // Afficher le formulaire de contact au lieu d'ajouter directement au panier
    setShowContactForm(true);
  };

  const handleContactFormSubmit = (e) => {
    e.preventDefault();
    
    // Validation du formulaire
    const errors = {};
    if (!contactForm.nom.trim()) errors.nom = 'Le nom est obligatoire';
    if (!contactForm.prenom.trim()) errors.prenom = 'Le prénom est obligatoire';
    if (!contactForm.email.trim()) errors.email = 'L\'email est obligatoire';
    if (!contactForm.telephone.trim()) errors.telephone = 'Le numéro de téléphone est obligatoire';
    if (!contactForm.localisation.trim()) errors.localisation = 'La localisation est obligatoire';
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (contactForm.email && !emailRegex.test(contactForm.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    // Validation téléphone
    const phoneRegex = /^[+]?[0-9\s\-\(\)]{8,}$/;
    if (contactForm.telephone && !phoneRegex.test(contactForm.telephone)) {
      errors.telephone = 'Format de téléphone invalide';
    }
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setSnackbar({
        open: true,
        message: 'Veuillez corriger les erreurs du formulaire',
        severity: 'error'
      });
      return;
    }
    
    // Si validation OK, ajouter au panier
    const prixFinal = prixAPI.calculerPrixTotal(selectedVehicule, selectedCouleur, typeAchat, dureeLocation);

    const commande = {
      id: Date.now(),
      vehicule: selectedVehicule,
      couleur: selectedCouleur,
      type: typeAchat,
      prix: prixFinal,
      duree: typeAchat === 'location' ? dureeLocation : null,
      date: new Date().toISOString(),
      client: {
        nom: contactForm.nom,
        prenom: contactForm.prenom,
        email: contactForm.email,
        telephone: contactForm.telephone,
        localisation: contactForm.localisation,
        adresse: contactForm.adresse,
        ville: contactForm.ville,
        codePostal: contactForm.codePostal,
        message: contactForm.message
      }
    };

    setCart(prev => [...prev, commande]);
    setSnackbar({
      open: true,
      message: `${typeAchat === 'achat' ? 'Achat' : 'Location'} ajouté au panier avec succès !`,
      severity: 'success'
    });
    
    // Fermer les dialogs et réinitialiser le formulaire
    setDialogOpen(false);
    setShowContactForm(false);
    setContactForm({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      localisation: '',
      adresse: '',
      ville: '',
      codePostal: '',
      message: ''
    });
    setFormErrors({});
  };

  const handleContactFormChange = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
    // Supprimer l'erreur du champ modifié
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const filteredVehicules = vehicules.filter(vehicule => {
    const matchesSearch = vehicule.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicule.modele.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMarque = !filters.marque || vehicule.marque === filters.marque;
    const matchesPrix = vehicule.prix_vente >= filters.prixMin && vehicule.prix_vente <= filters.prixMax;
    const matchesAnnee = vehicule.annee >= filters.anneeMin && vehicule.annee <= filters.anneeMax;
    const matchesCarburant = !filters.carburant || vehicule.carburant === filters.carburant;
    const matchesTransmission = !filters.transmission || vehicule.transmission === filters.transmission;

    return matchesSearch && matchesMarque && matchesPrix && matchesAnnee && matchesCarburant && matchesTransmission;
  });

  const VehiculeCard = ({ vehicule }) => (
    <Card 
      className={`vehicule-card ${hoveredCard === vehicule.id ? 'hovered' : ''}`}
      onMouseEnter={() => setHoveredCard(vehicule.id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <div className="card-image-container">
        <div
          className="card-image"
          style={{
            background: `linear-gradient(135deg, ${couleursDisponibles.find(c => c.nom === vehicule.couleur)?.code || '#f0f0f0'} 0%, rgba(0,0,0,0.1) 100%)`
          }}
        >
          <DirectionsCar className="car-icon" />
        </div>
        <Chip 
          label={vehicule.statut === 'disponible' ? 'Disponible' : 'Indisponible'}
          className={`status-chip ${vehicule.statut === 'disponible' ? 'available' : 'unavailable'}`}
        />
        <IconButton
          className="favorite-btn"
          onClick={() => setSnackbar({ open: true, message: 'Ajouté aux favoris !', severity: 'info' })}
        >
          <Favorite />
        </IconButton>
      </div>

      <CardContent className="card-content">
        <Typography variant="h6" className="vehicle-title">
          {vehicule.marque} {vehicule.modele}
        </Typography>
        
        <div className="vehicle-specs">
          <Typography variant="body2" className="spec-text">
            {vehicule.annee}
          </Typography>
          <Chip label={vehicule.carburant} size="small" className="spec-chip" />
          <Chip label={vehicule.transmission} size="small" className="spec-chip" />
        </div>

        <Typography variant="body2" className="vehicle-details">
          {vehicule.kilometrage.toLocaleString()} km • {vehicule.puissance}
        </Typography>

        <div className="vehicle-features">
          <div className="feature-item">
            <Speed className="feature-icon" />
            <Typography variant="body2">
              {vehicule.consommation || 'Consommation non spécifiée'}
            </Typography>
          </div>
          <div className="feature-item">
            <Shield className="feature-icon" />
            <Typography variant="body2">
              Garantie {vehicule.garantie || 'Non spécifiée'}
            </Typography>
          </div>
        </div>

        <Typography variant="body2" className="vehicle-description">
          {vehicule.description}
        </Typography>

        <div className="price-section">
          <Typography variant="h6" className="price">
            {vehicule.prix_vente.toLocaleString()} FCFA
          </Typography>
          <Typography variant="body2" className="rental-price">
            Location: {vehicule.prix_location_jour.toLocaleString()} FCFA/jour
          </Typography>
        </div>

        <div className="features-tags">
          {vehicule.caracteristiques.slice(0, 3).map((carac, index) => (
            <Chip key={index} label={carac} size="small" className="feature-tag" />
          ))}
          {vehicule.caracteristiques.length > 3 && (
            <Chip label={`+${vehicule.caracteristiques.length - 3}`} size="small" className="more-features" />
          )}
        </div>
      </CardContent>

      <CardActions className="card-actions">
        <Button
          fullWidth
          className="action-button"
          startIcon={<DirectionsCar />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Redirection vers options du véhicule:', vehicule.id);
            navigate(`/vehicule-options/${vehicule.id}`);
          }}
          disabled={false}
        >
          Voir options
        </Button>
      </CardActions>
    </Card>
  );

  const ContactFormDialog = () => (
    <Dialog 
      open={showContactForm} 
      onClose={() => setShowContactForm(false)}
      maxWidth="md"
      fullWidth
      className="contact-form-dialog"
      TransitionProps={{ timeout: 0 }}
      BackdropProps={{ style: { animation: 'none', transition: 'none' } }}
    >
      <DialogTitle className="dialog-title">
        <div className="dialog-header">
          <Typography variant="h5">
            Informations de Contact
          </Typography>
          <IconButton onClick={() => setShowContactForm(false)} className="close-btn">
            <Close />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className="dialog-content">
        <form onSubmit={handleContactFormSubmit} className="contact-form">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom *"
                value={contactForm.nom}
                onChange={(e) => handleContactFormChange('nom', e.target.value)}
                error={!!formErrors.nom}
                helperText={formErrors.nom}
                className="form-field"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom *"
                value={contactForm.prenom}
                onChange={(e) => handleContactFormChange('prenom', e.target.value)}
                error={!!formErrors.prenom}
                helperText={formErrors.prenom}
                className="form-field"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={contactForm.email}
                onChange={(e) => handleContactFormChange('email', e.target.value)}
                error={!!formErrors.email}
                helperText={formErrors.email}
                className="form-field"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone *"
                value={contactForm.telephone}
                onChange={(e) => handleContactFormChange('telephone', e.target.value)}
                error={!!formErrors.telephone}
                helperText={formErrors.telephone}
                className="form-field"
                placeholder="+225 XX XX XX XX"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Localisation *"
                value={contactForm.localisation}
                onChange={(e) => handleContactFormChange('localisation', e.target.value)}
                error={!!formErrors.localisation}
                helperText={formErrors.localisation}
                className="form-field"
                placeholder="Ex: Abidjan, Cocody"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse complète"
                value={contactForm.adresse}
                onChange={(e) => handleContactFormChange('adresse', e.target.value)}
                className="form-field"
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ville"
                value={contactForm.ville}
                onChange={(e) => handleContactFormChange('ville', e.target.value)}
                className="form-field"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Code Postal"
                value={contactForm.codePostal}
                onChange={(e) => handleContactFormChange('codePostal', e.target.value)}
                className="form-field"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message (optionnel)"
                value={contactForm.message}
                onChange={(e) => handleContactFormChange('message', e.target.value)}
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
          onClick={() => setShowContactForm(false)} 
          className="cancel-btn"
        >
          Annuler
        </Button>
        <Button 
          variant="contained" 
          onClick={handleContactFormSubmit}
          startIcon={<ShoppingCart />}
          className="submit-btn"
        >
          Confirmer et Ajouter au Panier
        </Button>
      </DialogActions>
    </Dialog>
  );

  const VehiculeDialog = () => {
    console.log('=== VehiculeDialog rendu ===');
    console.log('dialogOpen:', dialogOpen);
    console.log('selectedVehicule:', selectedVehicule);
    console.log('Type de dialogOpen:', typeof dialogOpen);
    
    if (!dialogOpen) {
      console.log('Dialog fermé, pas de rendu');
      return null;
    }
    
    console.log('Dialog ouvert, rendu du contenu');
    return (
      <Dialog 
        open={true} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        className="vehicle-dialog"
        disableEscapeKeyDown={false}
        disableBackdropClick={false}
        TransitionProps={{
          timeout: 0
        }}
        BackdropProps={{
          style: {
            animation: 'none',
            transition: 'none',
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }
        }}
      >
      <DialogTitle className="dialog-title">
        <div className="dialog-header">
          <Typography variant="h5">
            {selectedVehicule?.marque} {selectedVehicule?.modele}
          </Typography>
          <IconButton onClick={() => setDialogOpen(false)} className="close-btn">
            <Close />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className="dialog-content">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <div className="vehicle-preview">
              <div
                className="preview-image"
                style={{
                  background: `linear-gradient(135deg, ${couleursDisponibles.find(c => c.nom === selectedCouleur)?.code || '#f0f0f0'} 0%, rgba(0,0,0,0.1) 100%)`
                }}
              >
                <DirectionsCar className="preview-car-icon" />
              </div>
            </div>

            <Typography variant="h6" className="features-title">
              Caractéristiques
            </Typography>
            <Grid container spacing={1}>
              {selectedVehicule?.caracteristiques.map((carac, index) => (
                <Grid item xs={6} key={index}>
                  <div className="feature-item-dialog">
                    <CheckCircle className="check-icon" />
                    <Typography variant="body2">{carac}</Typography>
                  </div>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl component="fieldset" className="purchase-type">
              <FormLabel component="legend">Type d'achat</FormLabel>
              <RadioGroup
                value={typeAchat}
                onChange={(e) => setTypeAchat(e.target.value)}
              >
                <FormControlLabel 
                  value="achat" 
                  control={<Radio />} 
                  label={`Achat - ${selectedVehicule?.prix_vente.toLocaleString()} FCFA`} 
                />
                <FormControlLabel 
                  value="location" 
                  control={<Radio />} 
                  label={`Location - ${selectedVehicule?.prix_location_jour.toLocaleString()} FCFA/jour`} 
                />
              </RadioGroup>
            </FormControl>

            {typeAchat === 'location' && (
              <FormControl fullWidth className="duration-select">
                <InputLabel>Durée de location</InputLabel>
                <Select
                  value={dureeLocation}
                  onChange={(e) => setDureeLocation(e.target.value)}
                >
                  <MenuItem value={1}>1 jour</MenuItem>
                  <MenuItem value={7}>1 semaine</MenuItem>
                  <MenuItem value={30}>1 mois</MenuItem>
                  <MenuItem value={90}>3 mois</MenuItem>
                  <MenuItem value={365}>1 an</MenuItem>
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth className="color-selector">
              <FormLabel>Couleur</FormLabel>
              <Grid container spacing={1}>
                {couleursDisponibles.map((couleur) => (
                  <Grid item xs={3} key={couleur.nom}>
                    <div
                      className={`color-option ${selectedCouleur === couleur.nom ? 'selected' : ''}`}
                      style={{ backgroundColor: couleur.code }}
                      onClick={() => setSelectedCouleur(couleur.nom)}
                    >
                      <Typography variant="caption" className="color-name">
                        {couleur.nom}
                      </Typography>
                      {couleur.prix > 0 && (
                        <Typography variant="caption" className="color-price">
                          +{couleur.prix.toLocaleString()} FCFA
                        </Typography>
                      )}
                    </div>
                  </Grid>
                ))}
              </Grid>
            </FormControl>

            <Paper className="order-summary">
              <Typography variant="h6" className="summary-title">
                Résumé de la commande
              </Typography>
              <div className="summary-line">
                <Typography>Prix de base:</Typography>
                <Typography>
                  {typeAchat === 'achat' 
                    ? selectedVehicule?.prix_vente.toLocaleString() 
                    : (selectedVehicule?.prix_location_jour * dureeLocation).toLocaleString()
                  } FCFA
                </Typography>
              </div>
              {couleursDisponibles.find(c => c.nom === selectedCouleur)?.prix > 0 && (
                <div className="summary-line">
                  <Typography>Supplément couleur:</Typography>
                  <Typography>
                    +{couleursDisponibles.find(c => c.nom === selectedCouleur)?.prix.toLocaleString()} FCFA
                  </Typography>
                </div>
              )}
              <Divider className="summary-divider" />
              <div className="summary-total">
                <Typography variant="h6" className="total-label">
                  Total:
                </Typography>
                <Typography variant="h6" className="total-price">
                  {(
                    (typeAchat === 'achat' ? selectedVehicule?.prix_vente : selectedVehicule?.prix_location_jour * dureeLocation) +
                    (couleursDisponibles.find(c => c.nom === selectedCouleur)?.prix || 0)
                  ).toLocaleString()} FCFA
                </Typography>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions className="dialog-actions">
        <Button onClick={() => setDialogOpen(false)} className="cancel-btn">
          Annuler
        </Button>
        <Button 
          variant="contained" 
          onClick={handleAchat}
          startIcon={<ShoppingCart />}
          className="add-to-cart-btn"
        >
          Ajouter au panier
        </Button>
      </DialogActions>
    </Dialog>
    );
  };

  const FiltersPanel = () => (
    <Paper className="filters-panel">
      <Typography variant="h6" className="filters-title">
        Filtres
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Marque</InputLabel>
            <Select
              value={filters.marque}
              onChange={(e) => setFilters(prev => ({ ...prev, marque: e.target.value }))}
            >
              <MenuItem value="">Toutes</MenuItem>
              {marquesPopulaires.map(marque => (
                <MenuItem key={marque} value={marque}>{marque}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Carburant</InputLabel>
            <Select
              value={filters.carburant}
              onChange={(e) => setFilters(prev => ({ ...prev, carburant: e.target.value }))}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="Essence">Essence</MenuItem>
              <MenuItem value="Diesel">Diesel</MenuItem>
              <MenuItem value="Hybride">Hybride</MenuItem>
              <MenuItem value="Électrique">Électrique</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Transmission</InputLabel>
            <Select
              value={filters.transmission}
              onChange={(e) => setFilters(prev => ({ ...prev, transmission: e.target.value }))}
            >
              <MenuItem value="">Toutes</MenuItem>
              <MenuItem value="Manuelle">Manuelle</MenuItem>
              <MenuItem value="Automatique">Automatique</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Typography className="price-label">Prix (FCFA)</Typography>
          <Slider
            value={[filters.prixMin, filters.prixMax]}
            onChange={(e, newValue) => setFilters(prev => ({ 
              ...prev, 
              prixMin: newValue[0], 
              prixMax: newValue[1] 
            }))}
            min={0}
            max={100000000}
            step={1000000}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${(value / 1000000).toFixed(0)}M`}
            className="price-slider"
          />
        </Grid>
      </Grid>
    </Paper>
  );

  if (loading) {
  return (
    <div className="boutique-container">
        <div className="loading-container">
          <CircularProgress className="loading-spinner" />
          <Typography className="loading-text">Chargement des véhicules...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="boutique-container">
      {/* Particules d'arrière-plan */}
      {particles.map(particle => (
        <div 
          key={particle.id} 
          className="particle" 
          style={{ 
            left: particle.x, 
            top: particle.y, 
            width: particle.size, 
            height: particle.size, 
            backgroundColor: particle.color, 
            opacity: particle.opacity
          }} 
        />
      ))}

      {/* Effet de curseur */}
      <div 
        className="cursor-glow" 
        style={{ 
          left: mousePosition.x - 150, 
          top: mousePosition.y - 150
        }} 
      />

      {/* Header avec navigation */}
      <header className={`header ${scrollY > 50 ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-content">
            <div className="logo-section" onClick={() => navigate('/')}>
              <div className="logo-icon">
                <div className="logo-inner">
                  <DirectionsCar className="logo-car" />
                </div>
              </div>
              <div className="logo-text">
                <h1>AutoSoft</h1>
                <span>Boutique Premium</span>
              </div>
            </div>
            
            <div className="header-actions">
              <Button 
                className="back-btn"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/')}
              >
                Retour
              </Button>
              <Button 
                className="home-btn"
                startIcon={<Home />}
                onClick={() => navigate('/')}
              >
                Accueil
              </Button>
          </div>
        </div>
          </div>
      </header>

      {/* Section principale */}
      <main className="main-section">
        <div className="container">
          {/* Hero section */}
          <div className="hero-section">
            <div className="hero-content">
              <div className="welcome-badge animate-badge">
                <Star className="star-icon rotating" />
                <span>Boutique Automobile Premium</span>
                <div className="badge-glow"></div>
                    </div>
              
              <Typography variant="h2" className="hero-title">
                <span className="title-line slide-in-1">Véhicules d'exception</span>
                <span className="title-line neon slide-in-2">à votre portée</span>
              </Typography>
              
              <Typography className="hero-description fade-in">
                Découvrez notre collection de 
                <span className="highlight pulse"> véhicules premium </span> 
                avec options de 
                <span className="highlight pulse"> vente et location</span>.
              </Typography>

              {/* Stats animés */}
              <div className="stats-row fade-in-up">
                <div className="stat-item">
                  <div className="stat-number counting">150+</div>
                  <div className="stat-label">Véhicules</div>
                    </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <div className="stat-number counting">98%</div>
                  <div className="stat-label">Satisfaction</div>
                  </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <div className="stat-number counting">24/7</div>
                  <div className="stat-label">Support</div>
                </div>
              </div>

              {/* Badges animés */}
              <div className="badges-container">
                <div className="badge-animated badge-bounce-1">
                  <div className="badge-icon-wrapper">
                    <Verified className="badge-icon rotating-slow" />
                    <div className="icon-ring ring-1"></div>
                    <div className="icon-ring ring-2"></div>
                  </div>
                  <div className="badge-content">
                    <div className="badge-title">Garantie</div>
                    <div className="badge-subtitle">3 ans inclus</div>
                  </div>
                  <div className="badge-shine"></div>
                </div>
                
                <div className="badge-animated badge-bounce-2">
                  <div className="badge-icon-wrapper">
                    <Speed className="badge-icon pulse-icon" />
                    <div className="icon-ring ring-1"></div>
                    <div className="icon-ring ring-2"></div>
                  </div>
                  <div className="badge-content">
                    <div className="badge-title">Livraison</div>
                    <div className="badge-subtitle">Express 24h</div>
                  </div>
                  <div className="badge-shine"></div>
                </div>
                
                <div className="badge-animated badge-bounce-3">
                  <div className="badge-icon-wrapper">
                    <Shield className="badge-icon float-icon" />
                    <div className="icon-ring ring-1"></div>
                    <div className="icon-ring ring-2"></div>
              </div>
                  <div className="badge-content">
                    <div className="badge-title">Sécurité</div>
                    <div className="badge-subtitle">100% garantie</div>
            </div>
                  <div className="badge-shine"></div>
          </div>

                <div className="badge-animated badge-bounce-4">
                  <div className="badge-icon-wrapper">
                    <AttachMoney className="badge-icon scale-icon" />
                    <div className="icon-ring ring-1"></div>
                    <div className="icon-ring ring-2"></div>
                  </div>
                  <div className="badge-content">
                    <div className="badge-title">Financement</div>
                    <div className="badge-subtitle">Flexibles</div>
                  </div>
                  <div className="badge-shine"></div>
                </div>
              </div>
              <div className="badges-container">
                <div className="badge-simple">
                  <Verified className="badge-icon" />
                  <div className="badge-text">
                    <div className="badge-title">Garantie</div>
                    <div className="badge-subtitle">3 ans</div>
                    </div>
                </div>
                <div className="badge-simple">
                  <Speed className="badge-icon" />
                    <div className="badge-text">
                    <div className="badge-title">Livraison</div>
                    <div className="badge-subtitle">24h</div>
                    </div>
                  </div>
                <div className="badge-simple">
                  <Shield className="badge-icon" />
                  <div className="badge-text">
                    <div className="badge-title">Sécurité</div>
                    <div className="badge-subtitle">100%</div>
              </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-section">
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              className="main-tabs"
            >
              <Tab 
                label="Véhicules" 
                icon={<DirectionsCar />} 
                iconPosition="start"
                className="tab-item"
              />
              <Tab 
                label="Pièces détachées" 
                icon={<Build />} 
                iconPosition="start"
                className="tab-item"
              />
            </Tabs>
          </div>

          {activeTab === 0 && (
            <>
              {/* Search and Filters */}
              <div className="search-filters">
              <TextField
                fullWidth
                  placeholder="Rechercher par marque ou modèle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                        <Search />
                    </InputAdornment>
                  ),
                }}
                />
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setShowFilters(!showFilters)}
                  className="filters-btn"
                >
                  Filtres
                </Button>
          </div>

              {showFilters && <FiltersPanel />}

              {/* Vehicles Grid */}
              <div className="vehicles-grid">
                {console.log('Rendu des véhicules, nombre:', filteredVehicules.length)}
                {filteredVehicules.map((vehicule) => {
                  console.log('Rendu véhicule:', vehicule.id, vehicule.marque, vehicule.modele);
                  return <VehiculeCard vehicule={vehicule} key={vehicule.id} />;
                })}
                    </div>
                    
              {filteredVehicules.length === 0 && (
                <div className="no-results">
                  <DirectionsCar className="no-results-icon" />
                  <Typography variant="h6" className="no-results-title">
                    Aucun véhicule trouvé
              </Typography>
                  <Typography variant="body2" className="no-results-text">
                Essayez de modifier vos critères de recherche
              </Typography>
            </div>
          )}
            </>
          )}

          {activeTab === 1 && (
            <div className="pieces-section">
              <Build className="pieces-icon" />
              <Typography variant="h6" className="pieces-title">
                Section pièces détachées en cours de développement
              </Typography>
            </div>
          )}
          </div>
      </main>

      <VehiculeDialog />
      <ContactFormDialog />

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
        .boutique-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
          color: white;
          overflow-x: hidden;
          position: relative;
        }

        /* Particules */
        .particle {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
          animation: float 6s ease-in-out infinite;
        }

        .cursor-glow {
          position: fixed;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(0, 255, 136, 0.15), transparent);
          border-radius: 50%;
          pointer-events: none;
          z-index: 2;
          filter: blur(30px);
          transition: all 0.1s ease;
        }

        /* Header */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 255, 136, 0.2);
          transition: all 0.3s ease;
        }

        .header.scrolled {
          background: rgba(10, 10, 10, 0.95);
          border-bottom: 1px solid rgba(0, 255, 136, 0.4);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 0;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 15px;
          cursor: pointer;
        }

        .logo-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #00ff88, #00aa55);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(12deg);
          box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
          animation: logoFloat 4s ease-in-out infinite;
        }

        .logo-inner {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          padding: 8px;
        }

        .logo-car {
          color: #00aa55;
        }

        .logo-text h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 900;
          background: linear-gradient(90deg, #fff, #00ff88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-text span {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .header-actions {
          display: flex;
          gap: 15px;
        }

        .back-btn, .home-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(0, 255, 136, 0.3);
          backdrop-filter: blur(10px);
          border-radius: 25px;
          padding: 10px 20px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .back-btn:hover, .home-btn:hover {
          background: rgba(0, 255, 136, 0.1);
          border-color: #00ff88;
          transform: translateY(-2px);
        }

        /* Main section */
        .main-section {
          padding-top: 120px;
          min-height: 100vh;
          position: relative;
          z-index: 10;
        }

        /* Hero section */
        .hero-section {
          text-align: center;
          padding: 60px 0;
          position: relative;
        }

        .welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(90deg, rgba(0, 255, 136, 0.2), rgba(0, 170, 85, 0.2));
          border: 1px solid rgba(0, 255, 136, 0.4);
          border-radius: 50px;
          padding: 10px 20px;
          margin-bottom: 30px;
          animation: glow 2s ease-in-out infinite alternate;
        }

        .star-icon {
          color: #ffff00;
          animation: twinkle 1.5s ease-in-out infinite;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 900;
          line-height: 1.1;
          margin: 0 0 30px 0;
          position: relative;
          z-index: 15;
        }

        .title-line {
          display: block;
          background: linear-gradient(90deg, #fff, rgba(255, 255, 255, 0.7));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .title-line.neon {
          color: #ffffff;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4);
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.5);
          z-index: 10;
          position: relative;
        }

        .hero-description {
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 40px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .fade-in {
          animation: fadeIn 1s ease-out 0.4s backwards;
        }

        /* Badges animés */
        .badges-container {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-top: 40px;
          flex-wrap: wrap;
        }

        .badge-animated {
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(0, 255, 136, 0.1);
          border: 2px solid rgba(0, 255, 136, 0.3);
          border-radius: 25px;
          padding: 15px 25px;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .badge-bounce-1 {
          animation: bounceIn 0.6s ease-out 0.2s backwards;
        }

        .badge-bounce-2 {
          animation: bounceIn 0.6s ease-out 0.4s backwards;
        }

        .badge-bounce-3 {
          animation: bounceIn 0.6s ease-out 0.6s backwards;
        }

        .badge-bounce-4 {
          animation: bounceIn 0.6s ease-out 0.8s backwards;
        }

        .badge-animated:hover {
          background: rgba(0, 255, 136, 0.2);
          border-color: #00ff88;
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
        }

        .badge-icon-wrapper {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .badge-icon {
          font-size: 24px;
          color: #00ff88;
          z-index: 2;
        }

        .rotating-slow {
          animation: rotateSlow 8s linear infinite;
        }

        .pulse-icon {
          animation: iconPulse 2s ease-in-out infinite;
        }

        .float-icon {
          animation: iconFloat 3s ease-in-out infinite;
        }

        .scale-icon {
          animation: iconScale 2s ease-in-out infinite;
        }

        .icon-ring {
          position: absolute;
          inset: -5px;
          border: 2px solid #00ff88;
          border-radius: 50%;
          opacity: 0;
        }

        .ring-1 {
          animation: ringPulse 2s ease-out infinite;
        }

        .ring-2 {
          animation: ringPulse 2s ease-out 1s infinite;
        }

        .badge-content {
          display: flex;
          flex-direction: column;
        }

        .badge-title {
          font-size: 14px;
          font-weight: 700;
          color: #00ff88;
          margin-bottom: 2px;
        }

        .badge-subtitle {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .badge-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: shine 3s infinite;
        }

        .pulse {
          animation: textPulse 2s ease-in-out infinite;
        }

        /* Stats row */
        .stats-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 40px;
          margin: 40px 0;
          padding: 20px;
          background: rgba(0, 255, 136, 0.05);
          border-radius: 20px;
          border: 1px solid rgba(0, 255, 136, 0.2);
          backdrop-filter: blur(10px);
        }

        .fade-in-up {
          animation: fadeInUp 0.8s ease-out 0.6s backwards;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 32px;
          font-weight: 900;
          color: #00ff88;
          text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
          margin-bottom: 5px;
        }

        .counting {
          animation: countUp 2s ease-out;
        }

        .stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
        }

        .stat-divider {
          width: 2px;
          height: 40px;
          background: linear-gradient(180deg, transparent, #00ff88, transparent);
          animation: dividerGlow 2s ease-in-out infinite;
        }

        .highlight {
          color: #00ff88;
          font-weight: 600;
          text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
        }

        /* Badges simples et stables */
        .badges-container {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-top: 30px;
          flex-wrap: wrap;
        }

        .badge-simple {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 25px;
          padding: 12px 20px;
          backdrop-filter: blur(10px);
        }

        .badge-simple:hover {
          background: rgba(0, 255, 136, 0.2);
          border-color: #00ff88;
        }

        .badge-icon {
          font-size: 20px;
          color: #00ff88;
        }

        .badge-text {
          display: flex;
          flex-direction: column;
        }

        .badge-title {
          font-size: 12px;
          font-weight: 700;
          color: #00ff88;
          line-height: 1.2;
        }

        .badge-subtitle {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 600;
          line-height: 1.1;
        }


        /* Tabs */
        .tabs-section {
          margin: 40px 0;
        }

        .main-tabs {
          border-bottom: 1px solid rgba(0, 255, 136, 0.2);
        }

        .tab-item {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 600;
        }

        .tab-item.Mui-selected {
          color: #00ff88;
        }

        /* Search and filters */
        .search-filters {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          align-items: center;
        }

        .search-input {
          flex: 1;
        }

        .search-input .MuiInputBase-root {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 25px;
          color: white;
        }

        .search-input .MuiInputBase-input {
          color: white;
        }

        .search-input .MuiInputBase-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .filters-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(0, 255, 136, 0.3);
          backdrop-filter: blur(10px);
          border-radius: 25px;
          padding: 12px 24px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .filters-btn:hover {
          background: rgba(0, 255, 136, 0.1);
          border-color: #00ff88;
          transform: translateY(-2px);
        }

        /* Filters panel */
        .filters-panel {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 30px;
          backdrop-filter: blur(10px);
        }

        .filters-title {
          color: #00ff88;
          margin-bottom: 20px;
          font-weight: 700;
        }

        .filters-panel .MuiFormControl-root {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .filters-panel .MuiInputBase-root {
          color: white;
        }

        .filters-panel .MuiInputLabel-root {
          color: rgba(255, 255, 255, 0.7);
        }

        .price-label {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 10px;
          font-weight: 600;
        }

        .price-slider .MuiSlider-thumb {
          background: #00ff88;
          box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        }

        .price-slider .MuiSlider-track {
          background: linear-gradient(90deg, #00ff88, #00aa55);
        }

        /* Vehicles grid */
        .vehicles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }

        /* Vehicle card */
        .vehicule-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 20px;
          overflow: hidden;
          backdrop-filter: blur(10px);
          position: relative;
        }

        .vehicule-card:hover {
          box-shadow: 0 20px 40px rgba(0, 255, 136, 0.2);
          border-color: #00ff88;
        }

        .card-image-container {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .card-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
        }

        .car-icon {
          font-size: 4rem;
          opacity: 0.8;
          color: rgba(255, 255, 255, 0.9);
        }

        .status-chip {
          position: absolute;
          top: 10px;
          right: 10px;
          font-weight: 700;
        }

        .status-chip.available {
          background: linear-gradient(135deg, #00ff88, #00aa55);
          color: #000;
        }

        .status-chip.unavailable {
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          color: white;
        }

        .favorite-btn {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          backdrop-filter: blur(10px);
        }

        .favorite-btn:hover {
          background: rgba(255, 107, 107, 0.8);
        }

        .card-content {
          padding: 20px;
        }

        .vehicle-title {
          color: white;
          font-weight: 700;
          margin-bottom: 15px;
        }

        .vehicle-specs {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .spec-text {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
        }

        .spec-chip {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
          border: 1px solid rgba(0, 255, 136, 0.3);
          font-weight: 600;
        }

        .vehicle-details {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 15px;
        }

        .vehicle-features {
          margin-bottom: 20px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .feature-icon {
          color: #00ff88;
          font-size: 16px;
        }

        .vehicle-description {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 20px;
          min-height: 40px;
        }

        .price-section {
          margin-bottom: 20px;
        }

        .price {
          color: #00ff88;
          font-weight: 700;
          font-size: 1.5rem;
        }

        .rental-price {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        .features-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .feature-tag {
          background: rgba(0, 255, 136, 0.1);
          color: #00ff88;
          border: 1px solid rgba(0, 255, 136, 0.3);
          font-weight: 600;
        }

        .more-features {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .card-actions {
          padding: 0 20px 20px;
        }

        .action-button {
          background: linear-gradient(135deg, #00ff88, #00aa55);
          color: #000;
          font-weight: 700;
          border-radius: 25px;
          padding: 12px 24px;
        }

        .action-button:hover {
          box-shadow: 0 10px 20px rgba(0, 255, 136, 0.3);
        }

        .action-button:disabled {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.3);
        }

        /* Dialog */
        .vehicle-dialog .MuiDialog-paper,
        .contact-form-dialog .MuiDialog-paper {
          background: rgba(10, 10, 10, 0.95);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          animation: none !important;
          transform: none !important;
          transition: none !important;
        }

        .vehicle-dialog .MuiDialog-root,
        .contact-form-dialog .MuiDialog-root {
          animation: none !important;
        }

        .vehicle-dialog .MuiBackdrop-root,
        .contact-form-dialog .MuiBackdrop-root {
          animation: none !important;
          transition: none !important;
        }

        .vehicle-dialog *,
        .contact-form-dialog * {
          animation: none !important;
          transition: none !important;
        }

        .dialog-title {
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 170, 85, 0.1));
          border-bottom: 1px solid rgba(0, 255, 136, 0.2);
        }

        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .close-btn {
          color: rgba(255, 255, 255, 0.7);
        }

        .close-btn:hover {
          color: #00ff88;
        }

        .dialog-content {
          background: rgba(255, 255, 255, 0.02);
          animation: none !important;
          transform: none !important;
          transition: none !important;
        }

        .vehicle-preview {
          margin-bottom: 20px;
        }

        .preview-image {
          width: 100%;
          height: 200px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-car-icon {
          font-size: 5rem;
          opacity: 0.8;
          color: rgba(255, 255, 255, 0.9);
        }

        .features-title {
          color: #00ff88;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .feature-item-dialog {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .check-icon {
          color: #00ff88;
          font-size: 16px;
        }

        .purchase-type {
          margin-bottom: 20px;
        }

        .purchase-type .MuiFormLabel-root {
          color: #00ff88;
          font-weight: 700;
        }

        .purchase-type .MuiRadio-root {
          color: #00ff88;
        }

        .purchase-type .MuiFormControlLabel-label {
          color: white;
        }

        .duration-select {
          margin-bottom: 20px;
        }

        .duration-select .MuiInputBase-root {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: white;
        }

        .duration-select .MuiInputLabel-root {
          color: rgba(255, 255, 255, 0.7);
        }

        .color-selector {
          margin-bottom: 20px;
        }

        .color-selector .MuiFormLabel-root {
          color: #00ff88;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .color-option {
          padding: 10px;
          border: 2px solid transparent;
          border-radius: 10px;
          cursor: pointer;
          text-align: center;
          min-height: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .color-option:hover {
          border-color: #00ff88;
        }

        .color-option.selected {
          border-color: #00ff88;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        }

        .color-name {
          font-weight: 700;
          text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }

        .color-price {
          font-weight: 600;
          text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }

        .order-summary {
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 15px;
          padding: 20px;
        }

        .summary-title {
          color: #00ff88;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .summary-line {
          color: rgba(255, 255, 255, 0.8);
        }

        .summary-divider {
          margin: 15px 0;
          background: rgba(0, 255, 136, 0.2);
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-label {
          color: #00ff88;
          font-weight: 700;
        }

        .total-price {
          color: #00ff88;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .dialog-actions {
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(0, 255, 136, 0.2);
        }

        .cancel-btn {
          color: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          padding: 10px 20px;
        }

        .add-to-cart-btn {
          background: linear-gradient(135deg, #00ff88, #00aa55);
          color: #000;
          font-weight: 700;
          border-radius: 25px;
          padding: 12px 24px;
        }

        .add-to-cart-btn:hover {
          box-shadow: 0 10px 20px rgba(0, 255, 136, 0.3);
        }

        /* Contact Form */
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

        /* No results */
        .no-results {
          text-align: center;
          padding: 60px 20px;
        }

        .no-results-icon {
          font-size: 4rem;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: 20px;
        }

        .no-results-title {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 10px;
        }

        .no-results-text {
          color: rgba(255, 255, 255, 0.6);
        }

        /* Pieces section */
        .pieces-section {
          text-align: center;
          padding: 60px 20px;
        }

        .pieces-icon {
          font-size: 4rem;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: 20px;
        }

        .pieces-title {
          color: rgba(255, 255, 255, 0.8);
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

        /* Snackbar */
        .snackbar-alert {
          background: rgba(10, 10, 10, 0.95);
          border: 1px solid rgba(0, 255, 136, 0.2);
          backdrop-filter: blur(10px);
        }

        /* Animations avancées */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 255, 136, 0.6); }
        }

        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes neonPulse {
          0%, 100% { 
            text-shadow: 
              0 0 10px rgba(0, 255, 136, 0.8),
              0 0 20px rgba(0, 255, 136, 0.6),
              0 0 30px rgba(0, 255, 136, 0.4);
          }
          50% { 
            text-shadow: 
              0 0 20px rgba(0, 255, 136, 1),
              0 0 30px rgba(0, 255, 136, 0.8),
              0 0 40px rgba(0, 255, 136, 0.6);
          }
        }

        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }

        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes countUp {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes dividerGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        @keyframes iconScale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes ringPulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        @keyframes textPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        @keyframes logoFloat {
          0%, 100% { transform: rotate(12deg) translateY(0px); }
          50% { transform: rotate(12deg) translateY(-5px); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 36px;
          }

          .vehicles-grid {
            grid-template-columns: 1fr;
          }

          .search-filters {
            flex-direction: column;
          }

          .badges-container {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default BoutiqueClientPage;