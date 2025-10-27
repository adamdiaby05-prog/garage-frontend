import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Star,
  Visibility,
  Store,
  CloudUpload,
  Image as ImageIcon,
  TrendingUp,
  Inventory
} from '@mui/icons-material';

const BoutiquePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('all');
  const [produits, setProduits] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // États pour le formulaire
  const [showForm, setShowForm] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [productType, setProductType] = useState('voiture'); // 'voiture' ou 'piece'
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    stock: '',
    categorie: '',
    marque: '',
    reference: '',
    image: '',
    // Champs spécifiques voiture
    modele: '',
    annee: '',
    couleur: '',
    kilometrage: '',
    carburant: 'essence',
    transmission: 'manuelle',
    puissance: '',
    statut: 'disponible',
    type_vente: 'vente'
  });
  const [imagePreview, setImagePreview] = useState('');
  
  // États pour la prévisualisation
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);

  // Fonction pour récupérer les produits depuis l'API
  function fetchProduits() {
    return (async () => {
      try {
        const response = await fetch('http://localhost:5000/api/boutique/vehicules');
        if (response.ok) {
          const data = await response.json();
          setProduits(data);
        } else {
          console.error('Erreur lors du chargement des produits:', response.status);
          setSnackbar({ open: true, message: 'Erreur lors du chargement des produits', severity: 'error' });
        }
      } catch (error) {
        console.error('Erreur fetchProduits:', error);
        setSnackbar({ open: true, message: 'Erreur de connexion', severity: 'error' });
      }
    })();
  }

  // Charger les produits au montage du composant
  useEffect(() => {
    fetchProduits();
  }, []);

  // Fonction pour générer une image SVG par défaut
  function generateDefaultImage(marque, nom) {
    const colors = {
      'Toyota': '#e60012',
      'BMW': '#0066cc',
      'Mercedes': '#00adef',
      'Audi': '#bb0a30',
      'Peugeot': '#002395',
      'Renault': '#ffcc00',
      'Volkswagen': '#1f2937',
      'Ford': '#003478',
      'Nissan': '#c8102f',
      'Honda': '#c8102e',
      'Hyundai': '#002c5f',
      'Kia': '#05141f'
    };
    
    const color = colors[marque] || '#10b981';
    const initial = (marque || nom || 'V').charAt(0).toUpperCase();
    
    const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${initial}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color}dd;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#grad${initial})" rx="16"/>
      <circle cx="100" cy="100" r="60" fill="rgba(255,255,255,0.1)"/>
      <text x="100" y="115" font-family="Arial, sans-serif" font-size="64" font-weight="bold" 
            text-anchor="middle" dominant-baseline="middle" fill="white">${initial}</text>
    </svg>`;
    
    // Utiliser des URLs d'images réelles au lieu de Base64
    const defaultImages = {
      'Toyota': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop',
      'BMW': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
      'Mercedes': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop',
      'Audi': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Peugeot': 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=400&h=300&fit=crop',
      'Renault': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Volkswagen': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'Ford': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'Nissan': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Honda': 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=400&h=300&fit=crop',
      'Hyundai': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'Kia': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Mazda': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'Subaru': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Lexus': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
      'Infiniti': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop',
      'Acura': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Genesis': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'Lincoln': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Cadillac': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'Buick': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Chevrolet': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'GMC': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Dodge': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'Chrysler': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Jeep': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'Ram': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Alfa Romeo': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'Fiat': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Maserati': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'Ferrari': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Lamborghini': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'Porsche': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Bentley': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'Rolls-Royce': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Aston Martin': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'McLaren': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Bugatti': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'Koenigsegg': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Pagani': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'Rimac': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Rivian': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'Tesla': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Lucid': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'Polestar': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Volvo': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'Saab': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Opel': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'Vauxhall': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Seat': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'Skoda': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Dacia': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'Lada': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'UAZ': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'GAZ': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'ZAZ': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'Tata': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Mahindra': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'Maruti': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Bajaj': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'TVS': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Hero': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'Yamaha': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Suzuki': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'Kawasaki': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Ducati': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'KTM': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Husqvarna': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'Aprilia': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Moto Guzzi': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'MV Agusta': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Triumph': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'Royal Enfield': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Harley-Davidson': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'Indian': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Victory': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'Polaris': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Can-Am': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'BRP': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Arctic Cat': 'https://images.unsplash.com/photo-1549399902-5ec3c2c0f56c?w=400&h=300&fit=crop',
      'Ski-Doo': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      'Sea-Doo': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      'Lynx': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      'Default': 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=400&h=300&fit=crop'
    };
    
    return defaultImages[marque] || defaultImages[marque?.toLowerCase()] || defaultImages['Default'];
  }

  // Fonction pour normaliser l'URL de l'image
  function normalizeImageUrl(url) {
    if (!url) return generateDefaultImage('Default', 'Product');
    
    // Si c'est déjà une URL complète, la retourner telle quelle
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Si ça commence par /uploads, c'est bon
    if (url.startsWith('/uploads/')) {
      return `http://localhost:5000${url}`;
    }
    
    // Si c'est juste un nom de fichier, ajouter le chemin complet
    if (!url.includes('/')) {
      return `http://localhost:5000/uploads/images/${url}`;
    }
    
    return url;
  }

  const filteredProduits = useMemo(() => produits.filter(produit => {
    const matchesSearch = 
      produit.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategorie = categorieFilter === 'all' || produit.marque === categorieFilter;
    return matchesSearch && matchesCategorie;
  }), [produits, searchTerm, categorieFilter]);

  // Gérer l'ajout d'un nouveau produit
  const handleAddProduit = () => {
    setSelectedProduit(null);
    setProductType('voiture');
    setFormData({
      nom: '',
      description: '',
      prix: '',
      stock: '',
      categorie: '',
      marque: '',
      reference: '',
      image: '',
      // Champs spécifiques voiture
      modele: '',
      annee: '',
      couleur: '',
      kilometrage: '',
      carburant: 'essence',
      transmission: 'manuelle',
      puissance: '',
      statut: 'disponible',
      type_vente: 'vente'
    });
    setImagePreview('');
    setShowForm(true);
  };

  // Gérer la modification d'un produit
  const handleEditProduit = (produit) => {
    setSelectedProduit(produit);
    setProductType(produit.type_produit || 'voiture');
    setFormData({
      nom: produit.nom || '',
      description: produit.description || '',
      prix: produit.prix || '',
      stock: produit.stock || '',
      categorie: produit.categorie || '',
      marque: produit.marque || '',
      reference: produit.reference || '',
      image: produit.image || '',
      // Champs spécifiques voiture
      modele: produit.modele || '',
      annee: produit.annee || '',
      couleur: produit.couleur || '',
      kilometrage: produit.kilometrage || '',
      carburant: produit.carburant || '',
      transmission: produit.transmission || '',
      puissance: produit.puissance || '',
      statut: produit.statut || 'disponible',
      type_vente: produit.type_vente || 'vente'
    });
    setImagePreview(produit.image || '');
    setShowForm(true);
  };

  // Gérer le changement d'URL d'image
  const handleImageUrlChange = (url) => {
    if (url) {
      setImagePreview(url);
      setFormData(prev => ({ ...prev, image: url }));
    }
  };

  // Gérer le changement d'image
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setSnackbar({ open: true, message: 'Veuillez sélectionner une image', severity: 'error' });
        return;
      }
      
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setSnackbar({ open: true, message: 'L\'image est trop volumineuse (max 10MB)', severity: 'error' });
        return;
      }

      try {
        // Upload de l'image vers le serveur
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('http://localhost:5000/api/upload/image', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          const imageUrl = `http://localhost:5000${result.url}`;
          setImagePreview(imageUrl);
          setFormData(prev => ({ ...prev, image: imageUrl }));
          setSnackbar({ open: true, message: 'Image uploadée avec succès', severity: 'success' });
        } else {
          throw new Error('Erreur lors de l\'upload');
        }
      } catch (error) {
        console.error('Erreur upload image:', error);
        setSnackbar({ open: true, message: 'Erreur lors de l\'upload de l\'image', severity: 'error' });
        
        // Fallback: conversion en base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;
          setImagePreview(base64String);
          setFormData(prev => ({ ...prev, image: base64String }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Gérer la suppression d'un produit
  const handleDeleteProduit = async (id) => {
    // Confirmation avant suppression
    const produit = produits.find(p => p.id === id);
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer "${produit?.nom || 'ce produit'}" ?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/boutique/vehicules/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Supprimer de la liste locale
      setProduits(produits.filter(produit => produit.id !== id));
      setSnackbar({ open: true, message: 'Produit supprimé avec succès', severity: 'success' });
      } else {
        const errorData = await response.json();
        console.error('Erreur suppression:', errorData);
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      setSnackbar({ open: true, message: 'Erreur de connexion lors de la suppression', severity: 'error' });
    }
  };

  // Gérer la fermeture du formulaire
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedProduit(null);
    setProductType('voiture');
    setFormData({
      nom: '',
      description: '',
      prix: '',
      stock: '',
      categorie: '',
      marque: '',
      reference: '',
      image: '',
      // Champs spécifiques voiture
      modele: '',
      annee: '',
      couleur: '',
      kilometrage: '',
      carburant: 'essence',
      transmission: 'manuelle',
      puissance: '',
      statut: 'disponible',
      type_vente: 'vente'
    });
    setImagePreview('');
  };

  // Gérer la soumission du formulaire
  const handleSubmitForm = async () => {
    if (!formData.nom || !formData.prix) {
      setSnackbar({ open: true, message: 'Veuillez remplir tous les champs obligatoires', severity: 'error' });
      return;
    }

    if (productType === 'voiture') {
      if (!formData.modele || !formData.annee) {
        setSnackbar({ open: true, message: 'Veuillez remplir le modèle et l\'année pour une voiture', severity: 'error' });
        return;
      }
    }

    try {
      const productData = {
        ...formData,
        type_produit: productType,
        image: imagePreview || generateDefaultImage(formData.marque, formData.nom)
      };

      if (selectedProduit) {
        // Modifier le produit existant
        const response = await fetch(`http://localhost:5000/api/boutique/vehicules/${selectedProduit.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        });

        if (response.ok) {
          setSnackbar({ open: true, message: 'Produit modifié avec succès', severity: 'success' });
          // Rafraîchir la liste des produits
          fetchProduits();
        } else {
          const errorData = await response.json();
          console.error('Erreur modification:', errorData);
          setSnackbar({ open: true, message: 'Erreur lors de la modification', severity: 'error' });
        }
      } else {
        // Ajouter un nouveau produit
        const response = await fetch('http://localhost:5000/api/boutique/vehicules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        });

        if (response.ok) {
          setSnackbar({ open: true, message: 'Produit ajouté avec succès', severity: 'success' });
          // Rafraîchir la liste des produits
          fetchProduits();
        } else {
          const errorData = await response.json();
          console.error('Erreur ajout:', errorData);
          setSnackbar({ open: true, message: 'Erreur lors de l\'ajout', severity: 'error' });
        }
      }

      handleCloseForm();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setSnackbar({ open: true, message: 'Erreur de connexion', severity: 'error' });
    }
  };

  const openPreview = (src) => {
    setPreviewSrc(src);
    setIsZoomed(false);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setTimeout(() => setPreviewSrc(''), 200);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getCategorieColor = (categorie) => {
    switch (categorie?.toLowerCase()) {
      case 'filtres': return '#10b981';
      case 'freinage': return '#ef4444';
      case 'électricité': return '#f59e0b';
      case 'moteur': return '#8b5cf6';
      case 'suspension': return '#06b6d4';
      case 'carrosserie': return '#84cc16';
      case 'entretien': return '#f97316';
      default: return '#6b7280';
    }
  };

  const getCategorieLabel = (categorie) => {
    const labels = {
      'filtres': 'Filtres',
      'freinage': 'Freinage',
      'électricité': 'Électricité',
      'moteur': 'Moteur',
      'suspension': 'Suspension',
      'carrosserie': 'Carrosserie',
      'entretien': 'Entretien'
    };
    return labels[categorie?.toLowerCase()] || categorie;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      p: 3
    }}>
      {/* En-tête avec animations */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.8 }
            }
          }}
        >
          <Store sx={{ fontSize: 48, mr: 2, verticalAlign: 'middle', color: '#10b981' }} />
          Boutique du Garage
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Gestion des produits et stock
        </Typography>
      </Box>

      {/* Cartes de statistiques animées */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)'
            },
            transition: 'all 0.3s ease'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{produits.length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Produits</Typography>
                </Box>
                <Badge 
                  badgeContent={<TrendingUp />} 
                  sx={{ 
                    '& .MuiBadge-badge': { 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      animation: 'bounce 1s ease-in-out infinite',
                      '@keyframes bounce': {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-10px)' }
                      }
                    }
                  }}
                >
                  <Store sx={{ fontSize: 48, opacity: 0.3 }} />
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: 'white',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 40px rgba(5, 150, 105, 0.4)'
            },
            transition: 'all 0.3s ease'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {produits.filter(p => p.stock > 0).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>En Stock</Typography>
                </Box>
                <Inventory sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
            color: 'white',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 40px rgba(4, 120, 87, 0.4)'
            },
            transition: 'all 0.3s ease'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {new Set(produits.map(p => p.categorie)).size}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Catégories</Typography>
                </Box>
                <Star sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barre de recherche et filtres */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        background: 'rgba(16, 185, 129, 0.1)', 
        backdropFilter: 'blur(20px)', 
        border: '1px solid rgba(16, 185, 129, 0.3)',
        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
          <TextField
              fullWidth
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: '#10b981' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Marque</InputLabel>
            <Select
              value={categorieFilter}
              onChange={(e) => setCategorieFilter(e.target.value)}
                label="Marque"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <MenuItem value="all">Toutes les marques</MenuItem>
                <MenuItem value="Toyota">Toyota</MenuItem>
                <MenuItem value="BMW">BMW</MenuItem>
                <MenuItem value="Mercedes">Mercedes</MenuItem>
                <MenuItem value="Audi">Audi</MenuItem>
            </Select>
          </FormControl>
          </Grid>

          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddProduit}
              sx={{ 
                background: 'linear-gradient(135deg, #10b981, #059669)',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
          >
            Nouveau Produit
          </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Grille de produits */}
      <Grid container spacing={3}>
        {filteredProduits.map((produit) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={produit.id}>
            <Card sx={{ 
              height: '100%',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-10px) scale(1.02)',
                boxShadow: '0 16px 48px rgba(16, 185, 129, 0.3)',
                border: '1px solid rgba(16, 185, 129, 0.5)'
              },
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.2), transparent)',
                transition: 'left 0.5s ease'
              },
              '&:hover::before': {
                left: '100%'
              }
            }}>
              <CardContent sx={{ pb: 1 }}>
                {/* Image avec effet */}
                <Box sx={{ 
                  position: 'relative',
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 180
                }}>
                  <img
                    src={normalizeImageUrl(produit.image)}
                    alt={produit.nom}
                    onError={(e) => {
                      console.error('Erreur de chargement image:', produit.nom, 'Image src:', produit.image);
                      e.target.src = generateDefaultImage(produit.marque || produit.categorie, produit.nom);
                    }}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: '12px',
                      cursor: 'zoom-in',
                      transition: 'transform 0.3s ease',
                      filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3))'
                    }}
                    onClick={() => openPreview(produit.image)}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                  
                  {/* Badge catégorie animé */}
                  <Chip 
                    label={getCategorieLabel(produit.categorie)}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: getCategorieColor(produit.categorie),
                      color: 'white',
                      fontWeight: 'bold',
                      animation: 'float 3s ease-in-out infinite',
                      '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-5px)' }
                      }
                    }}
                  />
                </Box>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 'bold',
                    mb: 1,
                    minHeight: 48
                  }}
                >
                  {produit.nom}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    mb: 2,
                    minHeight: 40
                  }}
                >
                  {produit.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: '#10b981',
                      fontWeight: 'bold'
                    }}
                  >
                    {parseFloat(produit.prix).toFixed(2)} €
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Star sx={{ fontSize: 16, color: '#fbbf24' }} />
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {produit.note}
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  label={`Stock: ${produit.stock}`}
                  size="small"
                  sx={{
                    mt: 1,
                    backgroundColor: produit.stock > 20 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: produit.stock > 20 ? '#10b981' : '#ef4444',
                    border: `1px solid ${produit.stock > 20 ? '#10b981' : '#ef4444'}`
                  }}
                />
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={() => openPreview(produit.image)}
                    sx={{
                      backgroundColor: 'rgba(251, 191, 36, 0.2)',
                      color: '#fbbf24',
                      border: '1px solid #fbbf24',
                      '&:hover': {
                        backgroundColor: '#fbbf24',
                        color: 'white',
                        transform: 'scale(1.15) rotate(5deg)',
                        boxShadow: '0 4px 12px rgba(251, 191, 36, 0.5)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Visibility />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    onClick={() => handleEditProduit(produit)}
                    sx={{
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                      border: '1px solid #10b981',
                      '&:hover': {
                        backgroundColor: '#10b981',
                        color: 'white',
                        transform: 'scale(1.15) rotate(-5deg)',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.5)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Edit />
                  </IconButton>
                  
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteProduit(produit.id)}
                    sx={{ 
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      border: '1px solid #ef4444',
                      '&:hover': {
                        backgroundColor: '#ef4444',
                        color: 'white',
                        transform: 'scale(1.15) rotate(5deg)',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.5)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Formulaire de produit */}
      <Dialog 
        open={showForm} 
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
                      color: 'white',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          borderBottom: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          {selectedProduit ? 'Modifier le produit' : 'Nouveau produit'}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {/* Sélection du type de produit */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Type de produit</InputLabel>
                <Select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  label="Type de produit"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                      '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  <MenuItem value="voiture">🚗 Voiture</MenuItem>
                  <MenuItem value="piece">🔧 Pièce détachée</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Aperçu de l'image */}
            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                width: 200,
                height: 200,
                margin: '0 auto',
                mb: 2,
                border: '2px dashed rgba(16, 185, 129, 0.5)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                '&:hover': {
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)'
                },
                transition: 'all 0.3s ease'
              }}>
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Aperçu" 
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }} 
                  />
                ) : (
                  <ImageIcon sx={{ fontSize: 80, color: 'rgba(16, 185, 129, 0.3)' }} />
                )}
                </Box>
              
                  <Button 
                    variant="contained" 
                component="label"
                startIcon={<CloudUpload />}
                sx={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  mb: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669, #047857)'
                  }
                }}
              >
                Choisir une image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
                  </Button>
          </Grid>

            {/* Champ pour URL d'image en ligne */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ou entrez une URL d'image en ligne"
                value={formData.image}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }
                }}
              />
      </Grid>

            {/* Aperçu de l'image */}
            {imagePreview && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
                    Aperçu de l'image :
        </Typography>
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '150px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '2px solid rgba(16, 185, 129, 0.3)'
                    }}
                    onError={(e) => {
                      console.error('Erreur de chargement aperçu:', imagePreview);
                      e.target.style.display = 'none';
                    }}
          />
        </Box>
              </Grid>
            )}

            {/* Champs communs */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du produit"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Marque"
                value={formData.marque}
                onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Prix (€)"
                type="number"
                value={formData.prix}
                onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {productType === 'voiture' ? 'Type de vente' : 'Catégorie'}
                </InputLabel>
                <Select
                  value={productType === 'voiture' ? (formData.type_vente || 'vente') : (formData.categorie || '')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    [productType === 'voiture' ? 'type_vente' : 'categorie']: e.target.value 
                  })}
                  label={productType === 'voiture' ? 'Type de vente' : 'Catégorie'}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  {productType === 'voiture' ? (
                    <>
                      <MenuItem value="vente">Vente</MenuItem>
                      <MenuItem value="location">Location</MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem value="filtres">Filtres</MenuItem>
                      <MenuItem value="freinage">Freinage</MenuItem>
                      <MenuItem value="électricité">Électricité</MenuItem>
                      <MenuItem value="moteur">Moteur</MenuItem>
                      <MenuItem value="suspension">Suspension</MenuItem>
                      <MenuItem value="carrosserie">Carrosserie</MenuItem>
                      <MenuItem value="entretien">Entretien</MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>
          </Grid>

            {/* Champs spécifiques aux voitures */}
            {productType === 'voiture' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Modèle *"
                    value={formData.modele}
                    onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }
                    }}
                  />
      </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Année *"
                    type="number"
                    value={formData.annee}
                    onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Couleur"
                    value={formData.couleur}
                    onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Kilométrage"
                    type="number"
                    value={formData.kilometrage}
                    onChange={(e) => setFormData({ ...formData, kilometrage: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Carburant</InputLabel>
                    <Select
                      value={formData.carburant || 'essence'}
                      onChange={(e) => setFormData({ ...formData, carburant: e.target.value })}
                      label="Carburant"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      <MenuItem value="essence">Essence</MenuItem>
                      <MenuItem value="diesel">Diesel</MenuItem>
                      <MenuItem value="hybride">Hybride</MenuItem>
                      <MenuItem value="electrique">Électrique</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Transmission</InputLabel>
                    <Select
                      value={formData.transmission || 'manuelle'}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      label="Transmission"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      <MenuItem value="manuelle">Manuelle</MenuItem>
                      <MenuItem value="automatique">Automatique</MenuItem>
                      <MenuItem value="semi-automatique">Semi-automatique</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Puissance (CV)"
                    type="number"
                    value={formData.puissance}
                    onChange={(e) => setFormData({ ...formData, puissance: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Statut</InputLabel>
                    <Select
                      value={formData.statut || 'disponible'}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      label="Statut"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      <MenuItem value="disponible">Disponible</MenuItem>
                      <MenuItem value="vendu">Vendu</MenuItem>
                      <MenuItem value="en_location">En location</MenuItem>
                      <MenuItem value="maintenance">En maintenance</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Référence"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <Button 
            onClick={handleCloseForm}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmitForm}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669, #047857)'
              }
            }}
          >
            {selectedProduit ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Prévisualisation d'image */}
      <Dialog
        open={previewOpen}
        onClose={closePreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }
        }}
      >
        <DialogContent sx={{ p: 0, textAlign: 'center' }}>
          <img
            src={previewSrc}
            alt="Prévisualisation"
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              cursor: isZoomed ? 'zoom-out' : 'zoom-in'
            }}
            onClick={() => setIsZoomed(!isZoomed)}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            background: snackbar.severity === 'success' 
              ? 'linear-gradient(135deg, #10b981, #059669)' 
              : 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BoutiquePage; 