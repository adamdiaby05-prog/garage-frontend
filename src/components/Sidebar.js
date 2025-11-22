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
  SmartToy,
  FlashOn,
  TrendingUp,
  Favorite,
  EmojiEvents,
  WhatsHot,
  Speed,
  Brightness7,
  BrightnessHigh
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { dashboardAPI } from '../services/api';

const drawerWidth = 300;

const Sidebar = ({ userRole = 'admin' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [expandedSection, setExpandedSection] = useState('main');
  const [particles, setParticles] = useState([]);
  const [neonParticles, setNeonParticles] = useState([]);
  const [stats, setStats] = useState(null);
  const [supplierMode, setSupplierMode] = useState(() => {
    try { return localStorage.getItem('supplierMode') === '1'; } catch { return false; }
  });
  const [pulsingBadges, setPulsingBadges] = useState(new Set());
  const [glowingItems, setGlowingItems] = useState(new Set());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  // Génération de particules pour l'effet de fond
  useEffect(() => {
    const newParticles = [];
    const newNeonParticles = [];

    const isAdmin = userRole === 'admin';
    // Particules principales
    for (let i = 0; i < (isAdmin ? 25 : 15); i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (isAdmin ? 4 : 3) + 1,
        speed: Math.random() * (isAdmin ? 3 : 2) + 0.5,
        color: (
          isAdmin
            ? ['#059669', '#10b981', '#34d399', '#6ee7b7', '#00ff88'][Math.floor(Math.random() * 5)]
            : userRole === 'mecanicien'
              ? ['#065f46', '#10b981', '#34d399', '#6ee7b7'][Math.floor(Math.random() * 4)]
              : userRole === 'client'
                ? ['#7c2d12', '#ea580c', '#f59e0b', '#fbbf24'][Math.floor(Math.random() * 4)]
                : ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'][Math.floor(Math.random() * 4)]
        ),
        opacity: Math.random() * (isAdmin ? 0.8 : 0.6) + 0.2,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 2 + 0.5
      });
    }
    // Particules néon pour admin
    if (isAdmin) {
      for (let i = 0; i < 15; i++) {
        newNeonParticles.push({
          id: i + 100,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 1 + 0.2,
          glowSize: Math.random() * 20 + 10,
          color: ['#00ff88', '#39ff14', '#00ffff', '#40e0d0'][Math.floor(Math.random() * 4)]
        });
      }
    }

    setParticles(newParticles);
    setNeonParticles(newNeonParticles);
  }, [userRole]);

  // Charger les statistiques pour les badges
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des stats sidebar:', error);
        // Valeurs par défaut en cas d'erreur
        setStats({
          clients: Math.floor(Math.random() * 150) + 50,
          vehicules: Math.floor(Math.random() * 200) + 80,
          reparations: Math.floor(Math.random() * 300) + 120,
          factures: Math.floor(Math.random() * 250) + 90,
          employes: Math.floor(Math.random() * 50) + 15,
          reparationsEnCours: Math.floor(Math.random() * 80) + 25,
          reparationsTerminees: Math.floor(Math.random() * 180) + 60,
          rendezVous: Math.floor(Math.random() * 40) + 10,
          demandesPrestations: Math.floor(Math.random() * 60) + 20,
          garages: Math.floor(Math.random() * 30) + 8,
          commandes: Math.floor(Math.random() * 100) + 35
        });
      }
    };

    fetchStats();
  }, []);

  // Animation des particules (et néon)
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: (particle.y - particle.speed * 0.05) % 105,
        rotation: (particle.rotation ?? 0) + (particle.rotationSpeed ?? 0),
        opacity: 0.3 + Math.sin(Date.now() * 0.002 + particle.id) * 0.3
      })));
      setNeonParticles(prev => prev.map(particle => ({
        ...particle,
        y: (particle.y - particle.speed * 0.03) % 105,
        glowSize: (particle.glowSize ?? 10) + Math.sin(Date.now() * 0.003 + particle.id) * 5
      })));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Animation des badges pulsants et éléments lumineux (admin)
  useEffect(() => {
    if (userRole !== 'admin') return;
    const interval = setInterval(() => {
      const randomItems = new Set();
      for (let i = 0; i < 3; i++) {
        randomItems.add(Math.floor(Math.random() * 10));
      }
      setPulsingBadges(randomItems);

      const glowItems = new Set();
      for (let i = 0; i < 2; i++) {
        glowItems.add(Math.floor(Math.random() * 10));
      }
      setGlowingItems(glowItems);
    }, 2000);
    return () => clearInterval(interval);
  }, [userRole]);

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
        color: userRole === 'admin' ? '#00ff88' : userRole === 'mecanicien' ? '#16a34a' : userRole === 'client' ? '#ea580c' : '#1e40af',
        priority: 'high'
      }
    ];

    switch (userRole) {
      case 'admin':
        return [
          ...commonItems,
          { text: 'Clients', icon: <People />, path: '/clients', badge: stats?.clients?.toString() || '0', color: '#10b981', priority: 'high' },
          { text: 'Employés', icon: <Person />, path: '/employes', badge: stats?.employes?.toString() || '0', color: '#34d399', priority: 'medium' },
          { text: 'Véhicules', icon: <DirectionsCar />, path: '/vehicules', badge: stats?.vehicules?.toString() || '0', color: '#6ee7b7', priority: 'high' },
          { text: 'Réparations', icon: <Build />, path: '/reparations', badge: stats?.reparations?.toString() || '0', color: '#00ff88', priority: 'critical' },
          { text: 'Factures', icon: <Receipt />, path: '/factures', badge: stats?.factures?.toString() || '0', color: '#059669', priority: 'medium' },
          { text: 'Commandes', icon: <ShoppingCart />, path: '/commandes', badge: stats?.commandes?.toString() || '0', color: '#10b981', priority: 'high' },
          { text: 'Pièces', icon: <Inventory />, path: '/pieces', badge: '156', color: '#34d399', priority: 'low' },
          { text: 'Fournisseurs', icon: <Business />, path: '/fournisseurs', badge: '12', color: '#6ee7b7', priority: 'low' },
          { text: 'Services', icon: <Settings />, path: '/services', badge: '8', color: '#00ff88', priority: 'low' },
          { text: 'Demandes Prestations', icon: <Build />, path: '/demandes-prestations', badge: stats?.demandesPrestations?.toString() || '0', color: '#10b981', priority: 'high' },
          { text: 'Garages', icon: <Business />, path: '/garages', badge: stats?.garages?.toString() || '0', color: '#34d399', priority: 'medium' },
          { text: 'Boutique', icon: <Store />, path: '/boutique', badge: '89', color: '#6ee7b7', priority: 'low' },
          { text: 'Assistant IA', icon: <SmartToy />, path: '/assistant-ia', badge: '🤖', color: '#00ff88', priority: 'medium' }
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

  // Style badge dynamique (admin)
  const getBadgeStyle = (index, priority) => {
    const isPulsing = pulsingBadges.has(index);
    const isGlowing = glowingItems.has(index);
    let baseColor = '#00ff88';
    let shadowColor = '#00ff88';
    switch (priority) {
      case 'critical':
        baseColor = '#ff6b6b';
        shadowColor = '#ff6b6b';
        break;
      case 'high':
        baseColor = '#00ff88';
        shadowColor = '#00ff88';
        break;
      case 'medium':
        baseColor = '#34d399';
        shadowColor = '#34d399';
        break;
      default:
        baseColor = '#6ee7b7';
        shadowColor = '#6ee7b7';
    }
    return {
      background: `linear-gradient(135deg, ${baseColor}, ${baseColor}aa)`,
      color: '#000',
      fontWeight: 'bold',
      fontSize: '0.7rem',
      minWidth: 24,
      height: 24,
      borderRadius: '50%',
      border: `2px solid ${baseColor}`,
      boxShadow: isGlowing 
        ? `0 0 20px ${shadowColor}, 0 0 40px ${shadowColor}66, 0 0 60px ${shadowColor}33`
        : `0 0 10px ${shadowColor}66`,
      animation: isPulsing 
        ? 'badgePulse 1s ease-in-out infinite, badgeGlow 2s ease-in-out infinite alternate'
        : isGlowing 
          ? 'badgeGlow 2s ease-in-out infinite alternate'
          : 'badgeFloat 3s ease-in-out infinite',
      transform: isPulsing ? 'scale(1.2)' : 'scale(1)',
      transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    };
  };
  const drawerBackground = userRole === 'admin'
    ? `radial-gradient(ellipse at top, #064e3b 0%, #022c22 30%, #000 100%),
       linear-gradient(180deg, #0a3d2e 0%, #064e3b 25%, #022c22 50%, #000 100%)`
    : location.pathname === '/boutique-client'
      ? 'linear-gradient(180deg, #052e1a 0%, #065f46 50%, #10b981 100%)'
      : userRole === 'mecanicien'
        ? 'linear-gradient(180deg, #052e1a 0%, #065f46 50%, #10b981 100%)'
        : userRole === 'client'
          ? 'linear-gradient(180deg, #431407 0%, #7c2d12 50%, #ea580c 100%)'
          : 'linear-gradient(180deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)';
  const appBarBackground = userRole === 'admin'
    ? 'rgba(6, 78, 59, 0.95)'
    : location.pathname === '/boutique-client'
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
      flexDirection: 'column',
      '&::before': userRole === 'admin' ? {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, #00ff8844 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, #39ff1444 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, #00ffff22 0%, transparent 50%)
        `,
        zIndex: 1,
        pointerEvents: 'none'
      } : undefined
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
            transform: `rotate(${particle.rotation ?? 0}deg)`,
            filter: userRole === 'admin' ? 'blur(0.5px)' : 'blur(1px)',
            boxShadow: userRole === 'admin' ? `0 0 ${particle.size * 2}px ${particle.color}` : undefined,
            zIndex: 1,
            animation: `float ${particle.speed * 2}s ease-in-out infinite alternate, glow 3s ease-in-out infinite alternate`,
            pointerEvents: 'none'
          }}
        />
      ))}

      {/* Particules néon (admin) */}
      {userRole === 'admin' && neonParticles.map(particle => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(1px)',
            boxShadow: `0 0 ${particle.glowSize}px ${particle.color}`,
            zIndex: 1,
            animation: 'neonPulse 3s ease-in-out infinite alternate',
            pointerEvents: 'none'
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
          background: userRole === 'admin' ? `
            linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 78, 59, 0.2) 100%),
            rgba(255,255,255,0.05)
          ` : 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: userRole === 'admin' ? '2px solid rgba(0, 255, 136, 0.3)' : '1px solid rgba(255,255,255,0.2)',
          boxShadow: userRole === 'admin' ? '0 8px 32px rgba(0, 255, 136, 0.1)' : undefined,
          minHeight: userRole === 'admin' ? 140 : 120,
          position: 'relative',
          zIndex: 2,
          flexShrink: 0,
          '&::before': userRole === 'admin' ? {
            content: '""',
            position: 'absolute',
            top: -2,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #00ff88, transparent)',
            animation: 'shimmer 2s linear infinite'
          } : undefined
        }}
      >
        {/* Logo animé */}
        <Box 
          onClick={() => navigate('/')}
          sx={{ 
            width: userRole === 'admin' ? 70 : 60, 
            height: userRole === 'admin' ? 70 : 60, 
            borderRadius: userRole === 'admin' ? 5 : 4, 
            background: userRole === 'admin' ? `
              linear-gradient(135deg, #059669, #10b981, #34d399),
              radial-gradient(circle at 30% 30%, rgba(0, 255, 136, 0.8), transparent 70%)
            ` : roleInfo.gradient,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: userRole === 'admin' ? `
              0 0 30px rgba(0, 255, 136, 0.5),
              0 0 60px rgba(0, 255, 136, 0.3),
              0 20px 40px rgba(0, 0, 0, 0.3)
            ` : '0 15px 35px rgba(0,0,0,0.3)',
            animation: userRole === 'admin' ? 'logoGlow 3s ease-in-out infinite alternate' : 'pulse 3s ease-in-out infinite alternate',
            mb: 2,
            position: 'relative',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': userRole === 'admin' ? {
              transform: 'scale(1.1) rotate(5deg)',
              boxShadow: `
                0 0 40px rgba(0, 255, 136, 0.8),
                0 0 80px rgba(0, 255, 136, 0.4),
                0 25px 50px rgba(0, 0, 0, 0.4)
              `,
              animation: 'logoSpin 0.5s linear infinite'
            } : {
              transform: 'scale(1.1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              animation: 'none'
            },
            '&::before': userRole === 'admin' ? {
              content: '""',
              position: 'absolute',
              inset: -3,
              background: 'conic-gradient(from 0deg, #00ff88, #39ff14, #00ffff, #00ff88)',
              borderRadius: 6,
              zIndex: -1,
              animation: 'borderSpin 4s linear infinite',
              opacity: 0.7
            } : {
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
            inset: userRole === 'admin' ? 2 : 4, 
            backgroundColor: userRole === 'admin' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255,255,255,0.95)', 
            borderRadius: userRole === 'admin' ? 4 : 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <AutoAwesome sx={{ 
              color: userRole === 'admin' ? '#000' : roleInfo.color, 
              fontSize: userRole === 'admin' ? 32 : 24,
              zIndex: 1,
              filter: userRole === 'admin' ? 'drop-shadow(0 0 5px rgba(0, 255, 136, 0.8))' : 'none',
              animation: userRole === 'admin' ? 'iconFloat 2s ease-in-out infinite alternate' : undefined
            }} />
          </Box>
        </Box>

        <Typography variant="h6" sx={{ 
          color: userRole === 'admin' ? '#00ff88' : 'white', 
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 0.5,
          textShadow: userRole === 'admin' ? `
            0 0 10px rgba(0, 255, 136, 0.5),
            0 0 20px rgba(0, 255, 136, 0.3),
            0 0 30px rgba(0, 255, 136, 0.1)
          ` : '0 0 20px rgba(255,255,255,0.3)',
          background: userRole === 'admin' ? 'linear-gradient(135deg, #00ff88, #34d399, #6ee7b7)' : undefined,
          WebkitBackgroundClip: userRole === 'admin' ? 'text' : undefined,
          backgroundClip: userRole === 'admin' ? 'text' : undefined,
          animation: userRole === 'admin' ? 'textGlow 2s ease-in-out infinite alternate' : undefined
        }}>
          {userRole === 'admin' ? 'AutoSoft Pro' : roleInfo.title}
        </Typography>

        <Typography variant="body2" sx={{ 
          color: userRole === 'admin' ? 'rgba(52, 211, 153, 0.9)' : 'rgba(255,255,255,0.8)',
          textAlign: 'center',
          fontSize: userRole === 'admin' ? '0.8rem' : '0.75rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          textShadow: userRole === 'admin' ? '0 0 5px rgba(52, 211, 153, 0.5)' : undefined
        }}>
          {connectedName || (userRole === 'admin' ? 'Système Avancé' : roleInfo.subtitle)}
        </Typography>

        {/* Indicateur de statut */}
        <Chip
          onClick={() => navigate('/')}
          icon={<BrightnessHigh sx={{ fontSize: 16, animation: 'spin 2s linear infinite' }} />}
          label={userRole === 'admin' ? 'SYSTÈME ACTIF' : 'En ligne'}
          size="small"
          sx={{
            mt: 2,
            background: userRole === 'admin' ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(52, 211, 153, 0.3))' : 'rgba(34, 197, 94, 0.2)',
            color: userRole === 'admin' ? '#00ff88' : '#22c55e',
            border: userRole === 'admin' ? '2px solid #00ff88' : '1px solid #22c55e',
            fontWeight: 'bold',
            fontSize: '0.7rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: userRole === 'admin' ? '0 0 20px rgba(0, 255, 136, 0.3)' : undefined,
            animation: userRole === 'admin' ? 'chipPulse 2s ease-in-out infinite' : undefined,
            '&:hover': {
              background: userRole === 'admin' ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.3), rgba(52, 211, 153, 0.4))' : 'rgba(34, 197, 94, 0.3)',
              transform: 'scale(1.05)',
              boxShadow: userRole === 'admin' ? '0 0 30px rgba(0, 255, 136, 0.5)' : '0 4px 12px rgba(34, 197, 94, 0.3)',
              borderColor: userRole === 'admin' ? '#34d399' : undefined
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
        minHeight: 0,
        position: 'relative',
        zIndex: 2
      }}>
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          position: 'relative',
          zIndex: 2,
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
                    borderRadius: 4,
                    background: location.pathname === item.path 
                      ? (userRole === 'admin' ? `linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(52, 211, 153, 0.15))` : 'rgba(255,255,255,0.15)')
                      : (userRole === 'admin' ? 'rgba(255,255,255,0.02)' : 'transparent'),
                    border: location.pathname === item.path 
                      ? (userRole === 'admin' ? '2px solid rgba(0, 255, 136, 0.5)' : '1px solid rgba(255,255,255,0.3)')
                      : '2px solid transparent',
                    backdropFilter: 'blur(20px)',
                    transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                    transform: hoveredItem === index 
                      ? (userRole === 'admin' ? 'translateX(12px) scale(1.03) rotateY(5deg)' : 'translateX(8px) scale(1.02)')
                      : 'translateX(0) scale(1) rotateY(0deg)',
                    boxShadow: hoveredItem === index 
                      ? (userRole === 'admin' ? `
                        0 15px 35px rgba(0, 0, 0, 0.3),
                        0 0 30px rgba(0, 255, 136, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1)
                      ` : '0 10px 25px rgba(0,0,0,0.2)') 
                      : (location.pathname === item.path && userRole === 'admin' ? '0 0 20px rgba(0, 255, 136, 0.2)' : 'none'),
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      background: userRole === 'admin' ? `linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(52, 211, 153, 0.1))` : 'rgba(255,255,255,0.1)',
                      borderColor: userRole === 'admin' ? 'rgba(0, 255, 136, 0.7)' : 'rgba(255,255,255,0.4)'
                    },
                    '&.Mui-selected': {
                      background: userRole === 'admin' ? `linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(52, 211, 153, 0.15))` : 'rgba(255,255,255,0.15)',
                      borderColor: userRole === 'admin' ? 'rgba(0, 255, 136, 0.6)' : 'rgba(255,255,255,0.5)'
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
                        '& .MuiBadge-badge': userRole === 'admin' 
                          ? getBadgeStyle(index, item.priority)
                          : {
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
      <Box sx={{ p: 2, flexShrink: 0, position: 'relative', zIndex: 2 }}>
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
              AutoSoft Pro
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
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes badgeGlow {
          0% { box-shadow: 0 0 10px currentColor; }
          100% { box-shadow: 0 0 25px currentColor; }
        }
        @keyframes badgeFloat {
          0% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
          100% { transform: translateY(0); }
        }
        @keyframes neonPulse {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        @keyframes logoGlow {
          0% { filter: drop-shadow(0 0 6px rgba(0,255,136,0.3)); }
          100% { filter: drop-shadow(0 0 14px rgba(0,255,136,0.6)); }
        }
        @keyframes logoSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes borderSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes textGlow {
          0% { text-shadow: 0 0 10px rgba(0,255,136,0.2); }
          100% { text-shadow: 0 0 20px rgba(0,255,136,0.5); }
        }
        @keyframes iconFloat {
          0% { transform: translateY(0); }
          100% { transform: translateY(-3px); }
        }
        @keyframes chipPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
