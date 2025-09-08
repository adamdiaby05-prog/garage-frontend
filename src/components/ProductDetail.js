import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Rating,
  Divider,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ShoppingCart,
  Star,
  LocalShipping,
  Security,
  Support,
  ExpandMore,
  CheckCircle,
  Info
} from '@mui/icons-material';
import ProductReview from './ProductReview';

const ProductDetail = ({ produit, onOrderClick }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState('panel1');

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  // Fonction pour obtenir l'image selon la catégorie
  const getProductImage = (categorie) => {
    switch (categorie?.toLowerCase()) {
      case 'filtres':
        return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
      case 'freinage':
        return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
      case 'électricité':
        return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
      case 'moteur':
        return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
      case 'suspension':
        return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
      case 'carrosserie':
        return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
      case 'entretien':
        return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
      default:
        return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
    }
  };

  if (!produit) return null;

  return (
    <Box>
      <Grid container spacing={4}>
        {/* Image du produit */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardMedia
              component="img"
              height="400"
              image={getProductImage(produit.categorie)}
              alt={produit.nom}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Chip
                  label={produit.categorie || 'Général'}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={produit.stock ? 'En stock' : 'Rupture'}
                  color={produit.stock ? 'success' : 'error'}
                />
              </Box>
              
              {/* Système d'étoiles */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating
                  value={produit.note || 4}
                  readOnly
                  precision={0.5}
                  size="large"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="textSecondary">
                  ({produit.nombreAvis || 25} avis)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Informations du produit */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {produit.nom}
            </Typography>
            
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
              {produit.prix ? `${produit.prix}€` : 'Prix sur demande'}
            </Typography>

            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              {produit.description || 'Description détaillée du produit non disponible'}
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={() => onOrderClick(produit)}
              disabled={!produit.stock}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                },
                py: 1.5,
                px: 4
              }}
            >
              Commander maintenant
            </Button>
          </Box>

          {/* Caractéristiques principales */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Caractéristiques principales
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Qualité premium garantie"
                  secondary="Produit de haute qualité testé et approuvé"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocalShipping color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Livraison rapide"
                  secondary="Livraison sous 24-48h en France métropolitaine"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Security color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Garantie 2 ans"
                  secondary="Garantie complète sur tous nos produits"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Support color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary="Support technique"
                  secondary="Assistance technique gratuite disponible"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Onglets détaillés */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Description détaillée" />
          <Tab label="Spécifications techniques" />
          <Tab label="Avis clients" />
          <Tab label="Informations livraison" />
        </Tabs>

        {/* Contenu des onglets */}
        {selectedTab === 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Description complète
            </Typography>
            <Typography variant="body1" paragraph>
              {produit.description || 'Ce produit de qualité exceptionnelle est conçu pour répondre aux besoins les plus exigeants. Fabriqué avec des matériaux de première qualité et selon les normes internationales les plus strictes.'}
            </Typography>
            <Typography variant="body1" paragraph>
              Notre équipe d'experts a sélectionné ce produit pour sa durabilité, sa performance et sa fiabilité. Idéal pour tous types de véhicules, il garantit une utilisation optimale et une longue durée de vie.
            </Typography>
          </Paper>
        )}

        {selectedTab === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Spécifications techniques
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Référence"
                      secondary={produit.reference || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Catégorie"
                      secondary={produit.categorie || 'Général'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Stock disponible"
                      secondary={produit.stock || 0}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Prix HT"
                      secondary={produit.prix_ht ? `${produit.prix_ht}€` : 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Prix TTC"
                      secondary={produit.prix ? `${produit.prix}€` : 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Garantie"
                      secondary="2 ans"
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        )}

        {selectedTab === 2 && (
          <Paper sx={{ p: 3 }}>
            <ProductReview produit={produit} />
          </Paper>
        )}

        {selectedTab === 3 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Informations de livraison
            </Typography>
            
            <Accordion expanded={expandedAccordion === 'panel1'} onChange={handleAccordionChange('panel1')}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Options de livraison
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Livraison standard (3-5 jours ouvrables)"
                      secondary="Gratuite pour toute commande supérieure à 50€"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Livraison express (24-48h)"
                      secondary="Frais de 9.90€"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Point relais"
                      secondary="Gratuite, disponible dans plus de 5000 points"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion expanded={expandedAccordion === 'panel2'} onChange={handleAccordionChange('panel2')}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Zones de livraison
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Nous livrons dans toute la France métropolitaine, en Corse et dans les DOM-TOM. 
                  Les délais de livraison peuvent varier selon la destination.
                </Typography>
                <Typography variant="body2">
                  Pour les livraisons internationales, veuillez nous contacter directement.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion expanded={expandedAccordion === 'panel3'} onChange={handleAccordionChange('panel3')}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Suivi de commande
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Dès votre commande expédiée, vous recevrez un email avec le numéro de suivi 
                  pour suivre votre colis en temps réel.
                </Typography>
                <Typography variant="body2">
                  Notre service client est disponible pour toute question concernant votre livraison.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ProductDetail;
