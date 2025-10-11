import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  Avatar,
  Badge,
  Tooltip,
  Grid,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Phone,
  Email,
  Work,
  Person,
  AutoAwesome,
  Bolt,
  Star,
  Timeline,
  LocationOn,
  CalendarToday,
  Visibility,
  MoreVert,
  FilterList,
  Download,
  Refresh,
  TrendingUp,
  CheckCircle,
  Warning,
  Error,
  Engineering,
  Business,
  Assignment,
  Group
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { employesAPI, usersAPI } from '../services/api';
import EmployeForm from '../components/forms/EmployeForm';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
// (usersAPI déjà importé ci-dessus)

const EmployesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posteFilter, setPosteFilter] = useState('all');
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showEmployeForm, setShowEmployeForm] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [particles, setParticles] = useState([]);
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    actifs: 0,
    mecaniciens: 0
  });

  // Génération de particules pour l'effet de fond (thème admin vert)
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 25; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 3 + 0.5,
        color: ['#064e3b', '#059669', '#10b981', '#34d399', '#a7f3d0'][Math.floor(Math.random() * 5)],
        opacity: Math.random() * 0.6 + 0.2
      });
    }
    setParticles(newParticles);
  }, []);

  // Animation des particules
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: (particle.y - particle.speed * 0.1) % 105,
        x: (particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 0.1) % 105,
        opacity: particle.opacity + Math.sin(Date.now() * 0.002 + particle.id) * 0.1
      })));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Animation des statistiques
  useEffect(() => {
    const animateStats = () => {
      const targetStats = {
        total: employes.length,
        actifs: employes.filter(e => e.actif).length,
        mecaniciens: employes.filter(e => e.poste === 'mecanicien').length
      };

      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        setAnimatedStats({
          total: Math.floor(targetStats.total * easeOutQuart),
          actifs: Math.floor(targetStats.actifs * easeOutQuart),
          mecaniciens: Math.floor(targetStats.mecaniciens * easeOutQuart)
        });

        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    };

    if (employes.length > 0) {
      animateStats();
    }
  }, [employes]);

  // Charger les employés
  useEffect(() => {
    fetchEmployes();
  }, []);

  // Debug: Afficher les employés à chaque changement
  useEffect(() => {
    console.log('État des employés mis à jour:', employes);
    console.log('Nombre d\'employés:', employes.length);
    if (employes.length > 0) {
      console.log('Premier employé:', employes[0]);
      console.log('IDs des employés:', employes.map(e => ({ id: e.id, id_employe: e.id_employe, nom: e.nom, prenom: e.prenom })));
    }
  }, [employes]);

  const fetchEmployes = async () => {
    try {
      setLoading(true);
      // Charger depuis la table utilisateurs et mapper au format d'affichage
      const respUsers = await usersAPI.getAll();
      const users = Array.isArray(respUsers.data) ? respUsers.data : [];
      const mapped = users.map(u => ({
        id: u.id,
        nom: u.nom || '',
        prenom: u.prenom || '',
        email: u.email || '',
        telephone: u.telephone || '',
        poste: u.role || 'utilisateur',
        actif: true
      }));
      setEmployes(mapped);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des employés:', err);
      setError('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les employés
  const filteredEmployes = employes.filter(employe => {
    const matchesSearch = 
      employe.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employe.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employe.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employe.telephone?.includes(searchTerm);
    
    const matchesPoste = posteFilter === 'all' || employe.poste === posteFilter;
    
    return matchesSearch && matchesPoste;
  });

  // Gérer l'ajout d'un nouvel employé
  const handleAddEmploye = () => {
    setSelectedEmploye(null);
    setShowEmployeForm(true);
  };

  // Gérer la modification d'un employé
  const [editUser, setEditUser] = useState(null);
  const [editOpenUser, setEditOpenUser] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const handleEditEmploye = (employe) => {
    setEditUser({
      id: employe.id,
      nom: employe.nom || '',
      prenom: employe.prenom || '',
      email: employe.email || '',
      telephone: employe.telephone || '',
      role: (employe.poste || 'client')
    });
    setEditOpenUser(true);
  };

  const saveUser = async () => {
    if (!editUser) return;
    try {
      setSavingUser(true);
      const payload = { ...editUser };
      // Mot de passe optionnel: inclure seulement s'il est saisi
      if (!payload.password) delete payload.password;
      await usersAPI.update(editUser.id, payload);
      setEditOpenUser(false);
      setEditUser(null);
      await fetchEmployes();
      setSnackbar({ open: true, message: 'Utilisateur modifié', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: e.response?.data?.error || 'Erreur de mise à jour', severity: 'error' });
    } finally {
      setSavingUser(false);
    }
  };

  // Fonction d'exportation Excel pour les employés
  const handleExportEmployes = () => {
    try {
      // Préparer les données pour l'export
      const exportData = employes.map(employe => ({
        'ID': employe.id_employe || employe.id,
        'Nom': employe.nom || 'N/A',
        'Prénom': employe.prenom || 'N/A',
        'Email': employe.email || 'N/A',
        'Téléphone': employe.telephone || 'N/A',
        'Poste': employe.poste || 'N/A',
        'Salaire': employe.salaire || 'N/A',
        'Date d\'embauche': employe.date_embauche ? new Date(employe.date_embauche).toLocaleDateString('fr-FR') : 'N/A',
        'Statut': employe.statut || 'N/A'
      }));

      // Créer un nouveau classeur Excel
      const wb = XLSX.utils.book_new();
      
      // Créer une feuille de calcul avec les données
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Définir la largeur des colonnes
      const colWidths = [
        { wch: 8 },   // ID
        { wch: 15 },  // Nom
        { wch: 15 },  // Prénom
        { wch: 25 },  // Email
        { wch: 15 },  // Téléphone
        { wch: 20 },  // Poste
        { wch: 12 },  // Salaire
        { wch: 15 },  // Date d'embauche
        { wch: 12 }   // Statut
      ];
      ws['!cols'] = colWidths;
      
      // Ajouter la feuille au classeur
      XLSX.utils.book_append_sheet(wb, ws, 'Employés');
      
      // Générer le fichier Excel
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Créer et télécharger le fichier
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `employes_${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSnackbar({ open: true, message: `Export Excel réussi ! ${employes.length} employés exportés.`, severity: 'success' });
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
      setSnackbar({ open: true, message: 'Erreur lors de l\'export', severity: 'error' });
    }
  };

  // Gérer la suppression/désactivation d'un employé
  const handleDeleteEmploye = async (id) => {
    const employeToDelete = employes.find(e => (e.id_employe || e.id) === id);
    if (!employeToDelete) {
      setSnackbar({ open: true, message: 'Employé non trouvé', severity: 'error' });
      return;
    }

    if (!window.confirm(`Supprimer définitivement ${employeToDelete.prenom} ${employeToDelete.nom} ?`)) {
      return;
    }
    try {
      await employesAPI.delete(id);
      setEmployes(prev => prev.filter(e => (e.id_employe || e.id) !== id));
      setSnackbar({ open: true, message: 'Employé supprimé', severity: 'success' });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Erreur lors de la suppression';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  // Fonction pour désactiver un employé
  const performDeactivation = async (id, employeToDelete) => {
    try {
      console.log('Désactivation de l\'employé avec ID:', id);
      
      // Appel à l'API pour désactiver l'employé
      const response = await employesAPI.update(id, {
        ...employeToDelete,
        actif: false
      });
      
      console.log('Réponse de désactivation:', response);
      
      // Mise à jour de l'état local
      setEmployes(prevEmployes => 
        prevEmployes.map(employe => 
          (employe.id_employe || employe.id) === id 
            ? { ...employe, actif: false }
            : employe
        )
      );
      
      // Mise à jour des statistiques
      setAnimatedStats(prev => ({
        ...prev,
        actifs: prev.actifs - 1
      }));
      
      setSnackbar({ 
        open: true, 
        message: `Employé ${employeToDelete.prenom} ${employeToDelete.nom} désactivé avec succès`, 
        severity: 'success',
        autoHideDuration: 4000
      });
    } catch (err) {
      console.error('Erreur lors de la désactivation:', err);
      setSnackbar({ 
        open: true, 
        message: `Erreur lors de la désactivation: ${err.response?.data?.error || err.message}`, 
        severity: 'error',
        autoHideDuration: 6000
      });
    }
  };

  // Fonction pour supprimer définitivement un employé (UNIQUEMENT pour les employés inactifs SANS réparations)
  const performHardDelete = async (id, employeToDelete) => {
    // Vérification de sécurité STRICTE : empêcher la suppression d'employés actifs
    if (employeToDelete.actif) {
      console.error('Tentative de suppression d\'un employé actif bloquée:', employeToDelete);
      setSnackbar({ 
        open: true, 
        message: `ERREUR: Impossible de supprimer ${employeToDelete.prenom} ${employeToDelete.nom} car il est actif et a des réparations associées. Utilisez la désactivation à la place.`, 
        severity: 'error',
        autoHideDuration: 10000
      });
      return;
    }

    // Vérification de sécurité SUPPLÉMENTAIRE : empêcher la suppression d'employés avec réparations
    // Même s'ils sont inactifs, ils ont un historique à préserver
    setSnackbar({ 
      open: true, 
      message: `⚠️ ATTENTION: ${employeToDelete.prenom} ${employeToDelete.nom} ne peut PAS être supprimé définitivement car il a des réparations associées dans l'historique.\n\n✅ La désactivation est la SEULE option possible pour préserver l'intégrité des données.`, 
      severity: 'warning',
      autoHideDuration: 12000
    });
    
    console.log('Tentative de suppression d\'un employé avec réparations bloquée:', employeToDelete);
    return;
  };



  // Gérer la visualisation des détails d'un employé
  const handleViewEmploye = (employe) => {
    setSnackbar({ 
      open: true, 
      message: `Détails de l'employé: ${employe.prenom} ${employe.nom} - ${employe.poste || 'Poste non défini'} - ${employe.salaire ? employe.salaire + '€' : 'Salaire non défini'}`, 
      severity: 'info',
      autoHideDuration: 6000
    });
  };

  // Gérer le succès du formulaire
  const handleFormSuccess = () => {
    fetchEmployes();
    setSnackbar({ open: true, message: 'Employé enregistré avec succès', severity: 'success' });
  };

  // Gérer la fermeture du snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getPosteColor = (poste) => {
    switch (poste) {
      case 'gerant': return '#1e40af';
      case 'mecanicien': return '#2563eb';
      case 'vendeur': return '#3b82f6';
      case 'secretaire': return '#60a5fa';
      default: return '#93c5fd';
    }
  };

  const getPosteLabel = (poste) => {
    switch (poste) {
      case 'gerant': return 'Gérant';
      case 'mecanicien': return 'Mécanicien';
      case 'vendeur': return 'Vendeur';
      case 'secretaire': return 'Secrétaire';
      default: return poste;
    }
  };

  const statCards = [
    {
      title: 'Total Employés',
      value: animatedStats.total,
      icon: <Group />,
      color: '#1e40af',
      gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Employés Actifs',
      value: animatedStats.actifs,
      icon: <CheckCircle />,
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Mécaniciens',
      value: animatedStats.mecaniciens,
      icon: <Engineering />,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #93c5fd)',
      trend: '+5%',
      trendUp: true
    }
  ];

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f172a 50%, #1e293b 75%, #0a0a0a 100%)'
      }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f172a 50%, #1e293b 75%, #0a0a0a 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Particules de fond */}
      {particles.map(particle => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: '50%',
            opacity: particle.opacity,
            filter: 'blur(1px)',
            animation: `float ${particle.speed * 2}s ease-in-out infinite alternate, glow 3s ease-in-out infinite alternate`
          }}
        />
      ))}

      {/* Overlay avec effet glassmorphism */}
      <Box sx={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
        backdropFilter: 'blur(8px)',
        zIndex: 1
      }} />

      <Box sx={{ position: 'relative', zIndex: 10, p: 4 }}>
        {/* Header avec animation - thème admin */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, mb: 3 }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              background: 'linear-gradient(135deg, #059669, #10b981, #34d399)', 
              borderRadius: 4, 
              transform: 'rotate(12deg) perspective(1000px) rotateY(15deg)', 
              boxShadow: '0 20px 40px rgba(16,185,129,0.35), 0 0 0 1px rgba(255,255,255,0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              animation: 'spin 8s linear infinite, float 3s ease-in-out infinite alternate',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: -2,
                background: 'linear-gradient(45deg, #059669, #10b981, #34d399, #6ee7b7)',
                borderRadius: 6,
                zIndex: -1,
                animation: 'spin 4s linear infinite reverse'
              }
            }}>
              <Box sx={{ 
                position: 'absolute', 
                inset: 8, 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <Person sx={{ color: '#10b981', fontSize: 32 }} />
              </Box>
            </Box>
            <Box>
              <Typography variant="h2" sx={{ 
                fontWeight: 900, 
                background: 'linear-gradient(135deg, #eafff6, #a7f3d0, #6ee7b7)', 
                WebkitBackgroundClip: 'text', 
                color: 'transparent',
                animation: 'pulse 3s infinite, glow 2s ease-in-out infinite alternate',
                textShadow: '0 0 30px rgba(16,185,129,0.35)',
                letterSpacing: '0.1em'
              }}>
                Gestion des Employés
      </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 300,
                letterSpacing: '0.2em',
                textTransform: 'uppercase'
              }}>
                Administration du personnel
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Cartes de statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} md={4} key={card.title}>
              <Card sx={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: 3, 
                      background: card.gradient,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                      animation: 'pulse 2s ease-in-out infinite alternate'
                    }}>
                      <Box sx={{ color: 'white', fontSize: 28 }}>
                        {card.icon}
                      </Box>
                    </Box>
                    <Chip
                      icon={<TrendingUp />}
                      label={card.trend}
                      size="small"
                      sx={{
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#22c55e',
                        border: '1px solid #22c55e',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>

                  <Typography variant="h3" sx={{ 
                    fontWeight: 'bold', 
                    color: 'white',
                    mb: 1,
                    textShadow: '0 0 20px rgba(255,255,255,0.3)'
                  }}>
                    {card.value.toLocaleString()}
                  </Typography>

                  <Typography variant="h6" sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 600
                  }}>
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Barre d'actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddEmploye}
              sx={{
                background: 'linear-gradient(135deg, #059669, #10b981)',
                borderRadius: 3,
                py: 1.5,
                px: 3,
                fontWeight: 'bold',
                fontSize: '1rem',
                boxShadow: '0 10px 25px rgba(16,185,129,0.3)',
                border: '2px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 20px 40px rgba(16,185,129,0.45)',
                  background: 'linear-gradient(135deg, #047857, #059669)'
                }
              }}
            >
              Nouvel Employé
            </Button>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchEmployes}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                borderRadius: 3,
                py: 1.5,
                px: 3,
                fontWeight: 'bold',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                borderWidth: '2px',
                '&:hover': {
                  background: 'rgba(255,255,255,0.25)',
                  borderColor: 'rgba(255,255,255,0.8)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(255,255,255,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Actualiser
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportEmployes}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                borderRadius: 3,
                py: 1.5,
                px: 3,
                fontWeight: 'bold',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                borderWidth: '2px',
                '&:hover': {
                  background: 'rgba(255,255,255,0.25)',
                  borderColor: 'rgba(255,255,255,0.8)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(255,255,255,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Exporter
            </Button>

            <Button
              variant="outlined"
              startIcon={<FilterList />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                borderRadius: 3,
                py: 1.5,
                px: 3,
                fontWeight: 'bold',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                borderWidth: '2px',
                '&:hover': {
                  background: 'rgba(255,255,255,0.25)',
                  borderColor: 'rgba(255,255,255,0.8)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(255,255,255,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Filtres
            </Button>
          </Box>
        </Box>

        {/* Barre de recherche et filtres */}
        <Card sx={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
          mb: 4
        }}>
          <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'rgba(255,255,255,0.8)' }} />
                }}
                sx={{
                  minWidth: 250,
                  color: 'white',
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)',
                    '& fieldset': { 
                      borderColor: 'rgba(255,255,255,0.3)',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': { 
                      borderColor: 'rgba(255,255,255,0.6)',
                      borderWidth: '2px'
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: '#10b981',
                      borderWidth: '3px'
                    }
                  },
                  '& .MuiInputLabel-root': { 
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500
                  },
                  '& input::placeholder': {
                    color: 'rgba(255,255,255,0.6)',
                    opacity: 1
                  }
                }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.8)' }}>Filtrer par poste</InputLabel>
            <Select
              value={posteFilter}
              onChange={(e) => setPosteFilter(e.target.value)}
              label="Filtrer par poste"
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 3,
                      backdropFilter: 'blur(10px)',
                      '& fieldset': { 
                        borderColor: 'rgba(255,255,255,0.3)',
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': { 
                        borderColor: 'rgba(255,255,255,0.6)',
                        borderWidth: '2px'
                      },
                      '&.Mui-focused fieldset': { 
                        borderColor: '#60a5fa',
                        borderWidth: '3px'
                      }
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'rgba(255,255,255,0.8)'
                    }
                  }}
            >
              <MenuItem value="all">Tous les postes</MenuItem>
              <MenuItem value="gerant">Gérant</MenuItem>
              <MenuItem value="mecanicien">Mécanicien</MenuItem>
              <MenuItem value="vendeur">Vendeur</MenuItem>
              <MenuItem value="secretaire">Secrétaire</MenuItem>
            </Select>
          </FormControl>
        </Box>
          </CardContent>
        </Card>

        {/* Tableau des employés */}
        <Card sx={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
          overflow: 'hidden'
        }}>
          <TableContainer>
        <Table>
          <TableHead>
                <TableRow sx={{ 
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Employé</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Poste</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Contact</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Salaire</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Statut</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Embauche</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
                {filteredEmployes.length > 0 ? (
                  filteredEmployes.map((employe, index) => (
                    <TableRow 
                      key={employe.id_employe || employe.id} 
                      hover
                      onMouseEnter={() => setHoveredRow(index)}
                      onMouseLeave={() => setHoveredRow(null)}
                      sx={{
                        background: hoveredRow === index ? 'rgba(255,255,255,0.05)' : 'transparent',
                        transition: 'all 0.3s ease',
                        transform: hoveredRow === index ? 'scale(1.01)' : 'scale(1)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.05)'
                        }
                      }}
                    >
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Chip 
                          label={`#${employe.id_employe || employe.id}`}
                          size="small"
                          sx={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            color: '#60a5fa',
                            border: '1px solid #60a5fa',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                            width: 40,
                            height: 40,
                            fontWeight: 'bold'
                          }}>
                            {employe.prenom?.charAt(0)?.toUpperCase() || 'E'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              fontSize: '1rem'
                            }}>
                              {employe.nom} {employe.prenom}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: 'rgba(255,255,255,0.7)',
                              fontSize: '0.75rem'
                            }}>
                              Employé #{employe.id_employe || employe.id}
                  </Typography>
                          </Box>
                        </Box>
                </TableCell>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Chip 
                    label={getPosteLabel(employe.poste)}
                    size="small"
                    icon={<Work />}
                          sx={{
                            background: `${getPosteColor(employe.poste)}20`,
                            color: getPosteColor(employe.poste),
                            border: `1px solid ${getPosteColor(employe.poste)}`,
                            fontWeight: 'bold'
                          }}
                  />
                </TableCell>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Email sx={{ fontSize: 16, color: '#60a5fa' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {employe.email}
                            </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Phone sx={{ fontSize: 16, color: '#60a5fa' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {employe.telephone}
                            </Typography>
                          </Box>
                  </Box>
                </TableCell>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255,255,255,0.9)',
                          fontWeight: 'bold'
                        }}>
                  {employe.salaire ? `${employe.salaire}€` : '-'}
                        </Typography>
                </TableCell>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Chip 
                    label={employe.actif ? 'Actif' : 'Inactif'}
                    size="small"
                          sx={{
                            background: employe.actif ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: employe.actif ? '#22c55e' : '#ef4444',
                            border: `1px solid ${employe.actif ? '#22c55e' : '#ef4444'}`,
                            fontWeight: 'bold'
                          }}
                  />
                </TableCell>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                  {employe.date_embauche ? (
                    <Chip 
                      label={new Date(employe.date_embauche).toLocaleDateString('fr-FR')}
                      size="small"
                            sx={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              color: '#60a5fa',
                              border: '1px solid #60a5fa',
                              fontWeight: 'bold'
                            }}
                    />
                  ) : '-'}
                </TableCell>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Voir les détails">
                            <IconButton 
                              size="medium" 
                              onClick={() => handleViewEmploye(employe)}
                              sx={{
                                color: '#60a5fa',
                                background: 'rgba(96, 165, 250, 0.2)',
                                border: '2px solid #60a5fa',
                                width: 40,
                                height: 40,
                                '&:hover': {
                                  background: 'rgba(96, 165, 250, 0.4)',
                                  transform: 'scale(1.1)',
                                  boxShadow: '0 4px 12px rgba(96, 165, 250, 0.4)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Modifier">
                    <IconButton 
                      size="medium" 
                      onClick={() => handleEditEmploye(employe)}
                              sx={{
                                color: '#fbbf24',
                                background: 'rgba(251, 191, 36, 0.2)',
                                border: '2px solid #fbbf24',
                                width: 40,
                                height: 40,
                                '&:hover': {
                                  background: 'rgba(251, 191, 36, 0.4)',
                                  transform: 'scale(1.1)',
                                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                    >
                      <Edit />
                    </IconButton>
                          </Tooltip>
                          <Tooltip title="Désactiver (recommandé) - La suppression définitive n'est pas possible">
                    <IconButton 
                      size="medium" 
                      onClick={() => handleDeleteEmploye(employe.id_employe || employe.id)}
                              sx={{
                                color: '#f59e0b',
                                background: 'rgba(245, 158, 11, 0.2)',
                                border: '2px solid #f59e0b',
                                width: 40,
                                height: 40,
                                '&:hover': {
                                  background: 'rgba(245, 158, 11, 0.4)',
                                  transform: 'scale(1.1)',
                                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                    >
                      <Warning />
                    </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ color: 'rgba(255,255,255,0.7)', py: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Person sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {loading ? 'Chargement...' : 'Aucun employé trouvé'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Commencez par ajouter votre premier employé'}
                        </Typography>
                  </Box>
                </TableCell>
              </TableRow>
                )}
          </TableBody>
        </Table>
      </TableContainer>
        </Card>

        {/* Statistiques en bas */}
        <Box sx={{ 
          mt: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {filteredEmployes.length} employé(s) trouvé(s) sur {employes.length} total
        </Typography>
        <Chip 
          label={`Total: ${employes.length} employés`}
            sx={{
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              border: '1px solid #60a5fa',
              fontWeight: 'bold'
            }}
        />
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
      
      {/* Formulaire Employé */}
      <EmployeForm
        open={showEmployeForm}
        onClose={() => setShowEmployeForm(false)}
        onSuccess={handleFormSuccess}
        employe={selectedEmploye}
      />

      {/* Dialog édition utilisateur (table utilisateurs) */}
      <Dialog open={editOpenUser} onClose={() => setEditOpenUser(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier l'utilisateur</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Prénom" value={editUser?.prenom || ''} onChange={(e)=>setEditUser({...editUser, prenom: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Nom" value={editUser?.nom || ''} onChange={(e)=>setEditUser({...editUser, nom: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" type="email" value={editUser?.email || ''} onChange={(e)=>setEditUser({...editUser, email: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Téléphone" value={editUser?.telephone || ''} onChange={(e)=>setEditUser({...editUser, telephone: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Rôle</InputLabel>
                <Select label="Rôle" value={editUser?.role || 'client'} onChange={(e)=>setEditUser({...editUser, role: e.target.value})}>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="mecanicien">Mécanicien</MenuItem>
                  <MenuItem value="client">Client</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Nouveau mot de passe (optionnel)" type="password" value={editUser?.password || ''} onChange={(e)=>setEditUser({...editUser, password: e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setEditOpenUser(false)} disabled={savingUser}>Annuler</Button>
          <Button variant="contained" onClick={saveUser} disabled={savingUser}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
      </Box>

      {/* Styles CSS pour les animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0% { box-shadow: 0 0 5px currentColor; filter: brightness(1); }
          100% { box-shadow: 0 0 20px currentColor; filter: brightness(1.3); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </Box>
  );
};

export default EmployesPage; 