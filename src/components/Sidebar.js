import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  Badge,
  Tooltip,
  Fade,
  Slide
} from '@mui/material';
import {
  Dashboard,
  People,
  DirectionsCar,
  Build,
  Receipt,
  Inventory,
  Schedule,
  Settings,
  Menu as MenuIcon,
  Person,
  Build as Engineering,
  Security,
  Store,
  Business,
  Logout,
  AutoAwesome,
  Bolt,
  Star,
  Notifications,
  Search,
  AccountCircle,
  ExpandMore,
  ExpandLess,
  Home,
  Timeline,
  Assessment,
  Payment,
  LocalShipping,
  Engineering as Tools,
  Assignment,
  CalendarToday,
  ShoppingCart,
  BusinessCenter,
  Support,
  SmartToy
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { dashboardAPI } from '../services/api';

const drawerWidth = 280;

const Sidebar = ({ userRole = 'admin' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [expandedSection, setExpandedSection] = useState('main');
  const [particles, setParticles] = useState([]);
  const [stats, setStats] = useState(null);
  const [supplierMode, setSupplierMode] = useState(() => {
    try { return localStorage.getItem('supplierMode') === '1'; } catch { return false; }
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  // Génération de particules pour l'effet de fond
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 0.5,
        color: (
          userRole === 'mecanicien'
            ? ['#065f46', '#10b981', '#34d399', '#6ee7b7']
            : userRole === 'client'
              ? ['#7c2d12', '#ea580c', '#f59e0b', '#fbbf24']
              : ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd']
        )[Math.floor(Math.random() * 4)],
        opacity: Math.random() * 0.6 + 0.2
      });
    }
    setParticles(newParticles);
  }, [userRole]);

  // Charger les statistiques pour les badges
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des stats sidebar:', error);
        // Utiliser des valeurs par défaut en cas d'erreur
        setStats({
          clients: 0,
          vehicules: 0,
          reparations: 0,
          factures: 0,
          employes: 0,
          reparationsEnCours: 0,
          reparationsTerminees: 0,
          rendezVous: 0
        });
      }
    };

    fetchStats();
  }, []);

  // Animation des particules
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: (particle.y - particle.speed * 0.1) % 105,
        opacity: particle.opacity + Math.sin(Date.now() * 0.001 + particle.id) * 0.1
      })));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Cacher totalement la barre d'app + sidebar sur les routes d'auth, l'accueil public et la boutique client publique
  if (
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/signup') ||
    location.pathname.startsWith('/boutique-client') ||
    (location.pathname === '/' && (!localStorage.getItem('token') || !localStorage.getItem('user')))
  ) {
    return null;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getMenuItems = () => {
    const commonItems = [
      { 
        text: 'Tableau de bord', 
        icon: <Dashboard />, 
        path: userRole === 'admin' ? '/dashboard/admin' : userRole === 'mecanicien' ? '/dashboard/mecanicien' : '/dashboard/client',
        badge: null,
        color: userRole === 'mecanicien' ? '#16a34a' : userRole === 'client' ? '#ea580c' : '#1e40af'
      }
    ];

    switch (userRole) {
      case 'admin':
        return [
          ...commonItems,
          { text: 'Clients', icon: <People />, path: '/clients', badge: stats?.clients?.toString() || '0', color: '#2563eb' },
          { text: 'Employés', icon: <Person />, path: '/employes', badge: stats?.employes?.toString() || '0', color: '#3b82f6' },
          { text: 'Véhicules', icon: <DirectionsCar />, path: '/vehicules', badge: stats?.vehicules?.toString() || '0', color: '#60a5fa' },
          { text: 'Réparations', icon: <Build />, path: '/reparations', badge: stats?.reparations?.toString() || '0', color: '#93c5fd' },
          { text: 'Factures', icon: <Receipt />, path: '/factures', badge: stats?.factures?.toString() || '0', color: '#1e40af' },
          { text: 'Commandes', icon: <ShoppingCart />, path: '/commandes', badge: stats?.commandes?.toString() || '0', color: '#16a34a' },
          { text: 'Pièces', icon: <Inventory />, path: '/pieces', badge: '156', color: '#2563eb' },
          { text: 'Fournisseurs', icon: <Business />, path: '/fournisseurs', badge: '12', color: '#3b82f6' },
          { text: 'Services', icon: <Settings />, path: '/services', badge: '8', color: '#60a5fa' },
          { text: 'Rendez-vous', icon: <Schedule />, path: '/rendez-vous', badge: stats?.rendezVous?.toString() || '0', color: '#93c5fd' },
          { text: 'Demandes Prestations', icon: <Build />, path: '/demandes-prestations', badge: stats?.demandesPrestations?.toString() || '0', color: '#059669' },
          { text: 'Garages', icon: <Business />, path: '/garages', badge: stats?.garages?.toString() || '0', color: '#10b981' },
          { text: 'Boutique', icon: <Store />, path: '/boutique', badge: '89', color: '#1e40af' },
          { text: 'Assistant IA', icon: <SmartToy />, path: '/assistant-ia', badge: '🤖', color: '#8b5cf6' }
        ];
      
      case 'mecanicien':
      case 'garage':
        return [
          ...commonItems,
          { text: 'Assistant IA', icon: <SmartToy />, path: '/assistant-ia', badge: '🤖', color: '#8b5cf6' },
          { text: 'Mes Demandes', icon: <Build />, path: '/garage-demandes', badge: stats?.demandesEnAttente?.toString() || '0', color: '#059669' },
          { text: 'Pièces', icon: <Inventory />, path: '/pieces-garage', badge: '45', color: '#34d399' },
          { text: 'Véhicules', icon: <DirectionsCar />, path: '/vehicules-garage', badge: stats?.vehicules?.toString() || '0', color: '#10b981' },
          ...(supplierMode ? [{ text: 'Fournisseur', icon: <Store />, path: '/fournisseur', badge: null, color: '#f59e0b' }] : [])
        ];
      
      case 'garage':
        return [
          ...commonItems,
          { text: 'Mes Demandes', icon: <Build />, path: '/garage-demandes', badge: stats?.demandesEnAttente?.toString() || '0', color: '#059669' }
        ];
      
      case 'client':
        return [
          ...commonItems,
          { text: 'Mes Véhicules', icon: <DirectionsCar />, path: '/mes-vehicules', badge: stats?.vehicules?.toString() || '0', color: '#ea580c' },
          { text: 'Mes Réparations', icon: <Build />, path: '/mes-reparations-client', badge: stats?.reparations?.toString() || '0', color: '#f59e0b' },
          { text: 'Mes Factures', icon: <Receipt />, path: '/mes-factures', badge: stats?.factures?.toString() || '0', color: '#fbbf24' },
          { text: 'Prendre RDV', icon: <Schedule />, path: '/prendre-rdv', badge: null, color: '#fb923c' },
          { text: 'Demander Prestation', icon: <Build />, path: '/demander-prestation', badge: null, color: '#059669' }
        ];
      
      default:
        return commonItems;
    }
  };

  const getRoleInfo = () => {
    switch (userRole) {
      case 'admin':
        return { 
          title: 'Administration', 
          subtitle: 'Gestion complète',
          icon: <Security />, 
          color: '#1e40af',
          gradient: 'linear-gradient(135deg, #1e40af, #2563eb)',
          avatar: 'A'
        };
      case 'mecanicien':
        return { 
          title: 'Mécanicien', 
          subtitle: 'Atelier technique',
          icon: <Engineering />, 
          color: '#16a34a',
          gradient: 'linear-gradient(135deg, #16a34a, #22c55e)',
          avatar: 'M'
        };
      case 'garage':
        return { 
          title: 'Garage', 
          subtitle: 'Gestion des prestations',
          icon: <Business />, 
          color: '#059669',
          gradient: 'linear-gradient(135deg, #059669, #10b981)',
          avatar: 'G'
        };
      case 'client':
        return { 
          title: 'Espace Client', 
          subtitle: 'Services clients',
          icon: <Person />, 
          color: '#ea580c',
          gradient: 'linear-gradient(135deg, #ea580c, #f59e0b)',
          avatar: 'C'
        };
      default:
        return { 
          title: 'Garage', 
          subtitle: 'Système de gestion',
          icon: <DirectionsCar />, 
          color: '#1e40af',
          gradient: 'linear-gradient(135deg, #1e40af, #2563eb)',
          avatar: 'G'
        };
    }
  };

  const roleInfo = getRoleInfo();
  // Lire le nom/prénom utilisateur depuis localStorage
  let connectedName = '';
  try {
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      const u = JSON.parse(userRaw);
      const nom = (u.nom || u.lastName || '').toString().trim();
      const prenom = (u.prenom || u.firstName || '').toString().trim();
      const fallback = (u.email || '').split('@')[0];
      connectedName = [prenom, nom].filter(Boolean).join(' ').trim() || fallback;
    }
  } catch {}
  const menuItems = getMenuItems();
  const drawerBackground = location.pathname === '/boutique-client'
    ? 'linear-gradient(180deg, #052e1a 0%, #065f46 50%, #10b981 100%)'
    : userRole === 'mecanicien'
      ? 'linear-gradient(180deg, #052e1a 0%, #065f46 50%, #10b981 100%)'
      : userRole === 'client'
        ? 'linear-gradient(180deg, #431407 0%, #7c2d12 50%, #ea580c 100%)'
        : 'linear-gradient(180deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)';
  const appBarBackground = location.pathname === '/boutique-client'
    ? 'rgba(16, 185, 129, 0.95)'
    : userRole === 'mecanicien'
      ? 'rgba(22, 163, 74, 0.95)'
      : userRole === 'client'
        ? 'rgba(234, 88, 12, 0.95)'
        : 'rgba(30, 64, 175, 0.95)';

  const drawer = (
    <Box sx={{ 
      height: '100vh', 
      background: drawerBackground,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
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

      {/* Header avec effet glassmorphism */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          minHeight: 120,
          position: 'relative',
          zIndex: 2,
          flexShrink: 0
        }}
      >
        {/* Logo animé */}
        <Box 
          onClick={() => navigate('/')}
          sx={{ 
            width: 60, 
            height: 60, 
            borderRadius: 4, 
            background: roleInfo.gradient,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
            animation: 'pulse 3s ease-in-out infinite alternate',
            mb: 2,
            position: 'relative',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              animation: 'none'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: -2,
              background: roleInfo.gradient,
              borderRadius: 5,
              zIndex: -1,
              animation: 'spin 4s linear infinite'
            }
          }}
        >
          <Box sx={{ 
            position: 'absolute', 
            inset: 4, 
            backgroundColor: 'rgba(255,255,255,0.95)', 
            borderRadius: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <AutoAwesome sx={{ color: roleInfo.color, fontSize: 24 }} />
          </Box>
        </Box>

        <Typography variant="h6" sx={{ 
          color: 'white', 
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 0.5,
          textShadow: '0 0 20px rgba(255,255,255,0.3)'
        }}>
          {roleInfo.title}
        </Typography>

        <Typography variant="body2" sx={{ 
          color: 'rgba(255,255,255,0.8)',
          textAlign: 'center',
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          {connectedName || roleInfo.subtitle}
        </Typography>

        {/* Indicateur de statut */}
        <Chip
          onClick={() => navigate('/')}
          icon={<Star sx={{ fontSize: 16 }} />}
          label="En ligne"
          size="small"
          sx={{
            mt: 1,
            background: 'rgba(34, 197, 94, 0.2)',
            color: '#22c55e',
            border: '1px solid #22c55e',
            fontWeight: 'bold',
            fontSize: '0.7rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(34, 197, 94, 0.3)',
              transform: 'scale(1.05)',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
            }
          }}
        />
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Menu principal avec scroll */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}>
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255,255,255,0.5)',
            },
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(255,255,255,0.5)',
          },
          '&::-webkit-scrollbar-corner': {
            background: 'transparent',
          },
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.3) rgba(255,255,255,0.1)',
        }}>
          <List sx={{ p: 2 }}>
            {menuItems.map((item, index) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
                  onMouseEnter={() => setHoveredItem(index)}
                  onMouseLeave={() => setHoveredItem(null)}
              sx={{
                    borderRadius: 3,
                    background: location.pathname === item.path 
                      ? 'rgba(255,255,255,0.15)' 
                      : 'transparent',
                    border: location.pathname === item.path 
                      ? '1px solid rgba(255,255,255,0.3)' 
                      : '1px solid transparent',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: hoveredItem === index ? 'translateX(8px) scale(1.02)' : 'translateX(0) scale(1)',
                    boxShadow: hoveredItem === index 
                      ? '0 10px 25px rgba(0,0,0,0.2)' 
                      : 'none',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.1)',
                      borderColor: 'rgba(255,255,255,0.4)'
                    },
                '&.Mui-selected': {
                      background: 'rgba(255,255,255,0.15)',
                      borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                        background: 'rgba(255,255,255,0.2)'
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: location.pathname === item.path ? item.color : 'rgba(255,255,255,0.8)',
                    minWidth: 40,
                    animation: hoveredItem === index ? 'pulse 1s ease-in-out infinite' : 'none'
                  }}>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: 2, 
                      background: location.pathname === item.path ? `${item.color}20` : 'rgba(255,255,255,0.1)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                {item.icon}
                    </Box>
              </ListItemIcon>
              <ListItemText 
                    primary={
                      <Typography sx={{
                        color: location.pathname === item.path ? 'white' : 'rgba(255,255,255,0.9)',
                        fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease'
                      }}>
                        {item.text}
                      </Typography>
                    }
                  />
                  {item.badge && (
                    <Badge
                      badgeContent={item.badge}
                sx={{
                        '& .MuiBadge-badge': {
                          background: item.color,
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          minWidth: 20,
                          height: 20
                  }
                }}
              />
                  )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

      {/* Section utilisateur */}
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'rgba(255,255,255,0.15)',
            transform: 'translateY(-2px)'
          }
        }}>
          <Avatar onClick={() => navigate('/')} sx={{ 
            background: roleInfo.gradient,
            width: 40,
            height: 40,
            fontWeight: 'bold',
            animation: 'pulse 2s ease-in-out infinite alternate',
            cursor: 'pointer',
            '&:hover': { boxShadow: '0 0 0 3px rgba(255,255,255,0.25)' }
          }}>
            {roleInfo.avatar}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              fontSize: '0.85rem'
            }}>
              {connectedName || roleInfo.title}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.75rem'
            }}>
              Connecté
            </Typography>
          </Box>
          <Tooltip title="Se déconnecter">
            <IconButton
              size="small"
              onClick={() => { 
                localStorage.removeItem('token'); 
                localStorage.removeItem('user'); 
                navigate('/'); 
              }}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                '&:hover': {
                  color: '#ef4444',
                  background: 'rgba(239, 68, 68, 0.2)'
                }
              }}
            >
              <Logout />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: appBarBackground,
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              background: 'rgba(255,255,255,0.1)',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box 
            onClick={() => navigate('/')}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              flexGrow: 1,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
                '& .logo-icon': {
                  animation: 'spin 1s linear infinite'
                }
              }
            }}
          >
            <AutoAwesome 
              className="logo-icon"
              sx={{ 
                color: '#fbbf24', 
                animation: 'spin 3s linear infinite',
                transition: 'all 0.3s ease'
              }} 
            />
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #fff, #93c5fd)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              transition: 'all 0.3s ease'
            }}>
              AutoGenius Pro
          </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Toggle fournisseur */}
            {userRole === 'garage' && (
              <Tooltip title={supplierMode ? 'Mode fournisseur activé' : 'Devenir fournisseur'}>
                <IconButton
                  onClick={() => {
                    const next = !supplierMode;
                    setSupplierMode(next);
                    try { localStorage.setItem('supplierMode', next ? '1' : '0'); } catch {}
                    try { window.dispatchEvent(new CustomEvent('supplier-mode-changed', { detail: { enabled: next } })); } catch {}
                  }}
                  sx={{ color: supplierMode ? '#f59e0b' : 'white' }}
                >
                  <Store />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Notifications">
              <IconButton sx={{ color: 'white' }}>
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Rechercher">
              <IconButton sx={{ color: 'white' }}>
                <Search />
              </IconButton>
            </Tooltip>

            <Chip
              onClick={() => navigate('/')}
              icon={<Star sx={{ fontSize: 16 }} />}
              label={roleInfo.title}
              size="small"
              sx={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255,255,255,0.3)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }
              }}
            />

            <Tooltip title="Se déconnecter">
              <IconButton 
                color="inherit" 
                onClick={() => { 
                  localStorage.removeItem('token'); 
                  localStorage.removeItem('user'); 
                  try { window.dispatchEvent(new CustomEvent('auth-changed')); } catch {}
                  navigate('/'); 
                }}
                sx={{
                  background: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#ef4444'
                  }
                }}
              >
                <Logout />
          </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: drawerBackground
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: drawerBackground,
              borderRight: '1px solid rgba(255,255,255,0.1)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Styles CSS pour les animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-10px); }
        }
        @keyframes glow {
          0% { box-shadow: 0 0 5px currentColor; filter: brightness(1); }
          100% { box-shadow: 0 0 15px currentColor; filter: brightness(1.2); }
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
    </>
  );
};

export default Sidebar;
