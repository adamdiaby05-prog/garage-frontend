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
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Avatar,
  Badge,
  Tooltip,
  Fade,
  Slide,
  Grid,
  Divider
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Phone,
  Email,
  People,
  AutoAwesome,
  Bolt,
  Star,
  Timeline,
  LocationOn,
  CalendarToday,
  Person,
  Visibility,
  MoreVert,
  FilterList,
  Download,
  Refresh,
  TrendingUp,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { clientsAPI } from '../services/api';
import ClientForm from '../components/forms/ClientForm';

const ClientsPage = () => {
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hoveredRow, setHoveredRow] = useState(null);
  const [particles, setParticles] = useState([]);
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    actifs: 0,
    nouveaux: 0
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
        total: clients.length,
        actifs: clients.filter(c => c.date_inscription && new Date(c.date_inscription) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
        nouveaux: clients.filter(c => c.date_inscription && new Date(c.date_inscription) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
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
          nouveaux: Math.floor(targetStats.nouveaux * easeOutQuart)
        });

        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    };

    if (clients.length > 0) {
      animateStats();
    }
  }, [clients]);

  const filteredClients = useMemo(() => {
    if (!Array.isArray(clients) || clients.length === 0) {
      return [];
    }
    const q = (searchTerm || '').toLowerCase();
    if (!q) return clients;
    const filtered = clients.filter(client =>
      client && (
        (client.nom || '').toLowerCase().includes(q) ||
        (client.prenom || '').toLowerCase().includes(q) ||
        (client.email || '').toLowerCase().includes(q)
      )
    );
    return filtered;
  }, [clients, searchTerm]);

  // Fonction pour charger les clients depuis l'API
  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientsAPI.getAll();
      const rows = Array.isArray(response.data) ? response.data : [];
      console.log('Clients chargés:', rows);
      console.log('Nombre de clients:', rows.length);
      const normalized = rows.map((r) => ({
        id_client: r.id_client ?? r.id ?? r.client_id ?? r.idClient ?? null,
        nom: r.nom ?? r.nom_client ?? r.name ?? r.last_name ?? 'Inconnu',
        prenom: r.prenom ?? r.prenom_client ?? r.first_name ?? r.prenomClient ?? '',
        email: r.email ?? r.mail ?? r.email_client ?? '',
        telephone: r.telephone ?? r.tel ?? r.phone ?? r.telephone_client ?? '',
        adresse: r.adresse ?? r.address ?? r.adresse_client ?? '',
        date_inscription: r.date_inscription ?? r.created_at ?? r.date_creation ?? null,
        date_naissance: r.date_naissance ?? r.birthdate ?? null,
      }));
      setClients(normalized);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des clients:', err);
      setError('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  // Charger les clients depuis l'API
  useEffect(() => {
    fetchClients();
  }, []);

  // Gérer l'ajout d'un nouveau client
  const handleAddClient = () => {
    setSelectedClient(null);
    setShowClientForm(true);
  };

  // Gérer l'export des clients en Excel
  const handleExportClients = () => {
    try {
      // Préparer les données pour l'export
      const exportData = clients.map(client => ({
        'ID': client.id_client,
        'Nom': client.nom || 'N/A',
        'Prénom': client.prenom || 'N/A',
        'Email': client.email || 'N/A',
        'Téléphone': client.telephone || 'N/A',
        'Adresse': client.adresse || 'N/A',
        'Date de création': client.date_creation ? new Date(client.date_creation).toLocaleDateString('fr-FR') : 'N/A'
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
        { wch: 30 },  // Adresse
        { wch: 15 }   // Date de création
      ];
      ws['!cols'] = colWidths;
      
      // Ajouter la feuille au classeur
      XLSX.utils.book_append_sheet(wb, ws, 'Clients');
      
      // Générer le fichier Excel
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Créer et télécharger le fichier
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `clients_${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSnackbar({ open: true, message: `Export Excel réussi ! ${clients.length} clients exportés.`, severity: 'success' });
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
      setSnackbar({ open: true, message: 'Erreur lors de l\'export', severity: 'error' });
    }
  };

  // Gérer la modification d'un client
  const handleEditClient = (client) => {
    setSelectedClient(client);
    setShowClientForm(true);
  };

  // Gérer la suppression d'un client
  const handleDeleteClient = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      return;
    }
    
    try {
      await clientsAPI.delete(id);
      setClients(clients.filter(client => client.id_client !== id));
      setSnackbar({ open: true, message: 'Client supprimé avec succès', severity: 'success' });
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      const errorMessage = err.response?.data?.error || 'Erreur lors de la suppression';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  // Gérer la visualisation des détails d'un client
  const handleViewClient = (client) => {
    setSnackbar({ 
      open: true, 
      message: `Détails du client: ${client.prenom} ${client.nom} - ${client.email || 'Pas d\'email'}`, 
      severity: 'info' 
    });
  };

  // Gérer le succès du formulaire
  const handleFormSuccess = () => {
    fetchClients();
    setSnackbar({ open: true, message: 'Client enregistré avec succès', severity: 'success' });
  };

  // Gérer la fermeture du snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const statCards = [
    {
      title: 'Total Clients',
      value: animatedStats.total,
      icon: <People />,
      color: '#1e40af',
      gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Clients Actifs',
      value: animatedStats.actifs,
      icon: <CheckCircle />,
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Nouveaux (7j)',
      value: animatedStats.nouveaux,
      icon: <Star />,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #93c5fd)',
      trend: '+15%',
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
                <People sx={{ color: '#10b981', fontSize: 32 }} />
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
                Gestion des Clients
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 300,
                letterSpacing: '0.2em',
                textTransform: 'uppercase'
              }}>
                Administration des clients
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
              onClick={handleAddClient}
              sx={{
                background: 'linear-gradient(135deg, #059669, #10b981)',
                borderRadius: 3,
                py: 1.5,
                px: 3,
                fontWeight: 'bold',
                fontSize: '1rem',
                boxShadow: '0 10px 25px rgba(16,185,129,0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 15px 35px rgba(16,185,129,0.4)'
                }
              }}
            >
              Nouveau Client
            </Button>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchClients}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                borderRadius: 3,
                py: 1.5,
                px: 3,
                fontWeight: 'bold',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  borderColor: 'rgba(255,255,255,0.5)'
                }
              }}
            >
              Actualiser
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportClients}
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
                borderColor: 'rgba(255,255,255,0.3)',
                borderRadius: 3,
                py: 1.5,
                px: 3,
                fontWeight: 'bold',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  borderColor: 'rgba(255,255,255,0.5)'
                }
              }}
            >
              Filtres
            </Button>
          </Box>
        </Box>

        {/* Barre de recherche */}
        <Card sx={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
          mb: 4
        }}>
          <CardContent sx={{ p: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher un client par nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'rgba(255,255,255,0.8)' }} />
                  </InputAdornment>
                ),
                sx: {
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
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Tableau des clients */}
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
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Client</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Contact</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Adresse</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Date de naissance</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Inscription</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client, index) => (
                    <TableRow 
                      key={client.id_client || `client-${index}`} 
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
                          label={`#${client.id_client}`}
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
                            {client.prenom?.charAt(0)?.toUpperCase() || 'C'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              fontSize: '1rem'
                            }}>
                              {client.nom} {client.prenom}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: 'rgba(255,255,255,0.7)',
                              fontSize: '0.75rem'
                            }}>
                              Client #{client.id_client}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Email sx={{ fontSize: 16, color: '#60a5fa' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                              {client.email || 'Non renseigné'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Phone sx={{ fontSize: 16, color: '#60a5fa' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                              {client.telephone || 'Non renseigné'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 16, color: '#60a5fa' }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            {client.adresse || 'Non renseignée'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday sx={{ fontSize: 16, color: '#60a5fa' }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            {client.date_naissance ? new Date(client.date_naissance).toLocaleDateString('fr-FR') : 'Non renseignée'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Chip 
                          label={new Date(client.date_inscription).toLocaleDateString('fr-FR')}
                          size="small"
                          sx={{
                            background: 'rgba(34, 197, 94, 0.2)',
                            color: '#22c55e',
                            border: '1px solid #22c55e',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Voir les détails">
                            <IconButton 
                              size="medium" 
                              onClick={() => handleViewClient(client)}
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
                              onClick={() => handleEditClient(client)}
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
                          <Tooltip title="Supprimer">
                            <IconButton 
                              size="medium" 
                              onClick={() => handleDeleteClient(client.id_client)}
                              sx={{
                                color: '#ef4444',
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '2px solid #ef4444',
                                width: 40,
                                height: 40,
                                '&:hover': {
                                  background: 'rgba(239, 68, 68, 0.4)',
                                  transform: 'scale(1.1)',
                                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ color: 'rgba(255,255,255,0.7)', py: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <People sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {loading ? 'Chargement...' : 'Aucun client trouvé'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Commencez par ajouter votre premier client'}
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
            {filteredClients.length} client(s) trouvé(s) sur {clients.length} total
          </Typography>
          <Chip 
            label={`Total: ${clients.length} clients`}
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
        
        {/* Formulaire Client */}
        <ClientForm
          open={showClientForm}
          onClose={() => setShowClientForm(false)}
          onSuccess={handleFormSuccess}
          client={selectedClient}
        />
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

export default ClientsPage;
