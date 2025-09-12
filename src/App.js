import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RoleSelector from './components/RoleSelector';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import BoutiqueClientPage from './pages/BoutiqueClientPage';
import ClientsPage from './pages/ClientsPage';
import EmployesPage from './pages/EmployesPage';
import VehiculesPage from './pages/VehiculesPage';
import ReparationsPage from './pages/ReparationsPage';
import FacturesPage from './pages/FacturesPage';
import PiecesPage from './pages/PiecesPage';
import FournisseursPage from './pages/FournisseursPage';
import ServicesPage from './pages/ServicesPage';
import RendezVousPage from './pages/RendezVousPage';
import BoutiquePage from './pages/BoutiquePage';
import MesVehiculesPage from './pages/MesVehiculesPage';
import PrendreRdvPage from './pages/PrendreRdvPage';
import MesReparationsPage from './pages/MesReparationsPage';
import MesReparationsClientPage from './pages/MesReparationsClientPage';
import MesFacturesPage from './pages/MesFacturesPage';
import FacturesGaragePage from './pages/FacturesGaragePage';
import FournisseurPage from './pages/FournisseurPage';
import RendezVousMecanoPage from './pages/RendezVousMecanoPage';
import PiecesMecanoPage from './pages/PiecesMecanoPage';
import VehiculesMecanoPage from './pages/VehiculesMecanoPage';
import AssistantIA from './pages/AssistantIA';
import CommandesPage from './pages/CommandesPage';
// Nouvelles pages pour le système de prestations
import DemandesPrestationsPage from './pages/DemandesPrestationsPage';
import DemanderPrestationPage from './pages/DemanderPrestationPage';
import GarageDemandesPage from './pages/GarageDemandesPage';
import GaragesPage from './pages/GaragesPage';

// Pages de base pour les autres sections
const PlaceholderPage = ({ title, description }) => (
  <Box sx={{ flexGrow: 1, p: 3 }}>
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <h2>{title}</h2>
      <p>{description}</p>
    </Box>
  </Box>
);

const App = () => {
  const [userRole, setUserRole] = useState('admin');
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [user, setUser] = useState(() => {
    // Vérifier si le token et l'utilisateur sont valides
    const token = localStorage.getItem('token');
    const raw = localStorage.getItem('user');
    
    if (!token || !raw) {
      return null;
    }
    
    try {
      const userData = JSON.parse(raw);
      // Vérifier que l'utilisateur a un rôle valide (inclure garage)
      if (!userData.role || !['admin', 'mecanicien', 'garage', 'client'].includes(userData.role)) {
        return null;
      }
      return userData;
    } catch {
      return null;
    }
  });

  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#ed6c02',
      },
      background: {
        default: window.location.pathname === '/boutique-client' ? '#0f0f0f' : '#ffffff',
      },
    },
  });

  const handleRoleChange = (newRole) => {
    setUserRole(newRole);
    setShowRoleSelector(false);
  };

  // Fonction pour revenir au sélecteur de rôle (pour usage futur)
  // const handleBackToRoleSelector = () => {
  //   setShowRoleSelector(true);
  // };

  useEffect(() => {
    // Nettoyer le localStorage au démarrage si les données sont invalides
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setUserRole('admin');
      return;
    }
    
    try {
      const userData = JSON.parse(storedUser);
      if (!userData.role || !['admin', 'mecanicien', 'garage', 'client'].includes(userData.role)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setUserRole('admin');
        return;
      }
      
      if (userData.role) {
        setUserRole(userData.role);
        setShowRoleSelector(false);
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setUserRole('admin');
    }
  }, [user]);

  // Écouter les changements d'auth (login/logout) pour mettre à jour immédiatement le rôle/Sidebar
  useEffect(() => {
    const handler = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const userData = storedUser ? JSON.parse(storedUser) : null;
        setUser(userData);
        setUserRole(userData?.role || 'admin');
      } catch {
        setUser(null);
        setUserRole('admin');
      }
    };
    window.addEventListener('auth-changed', handler);
    return () => window.removeEventListener('auth-changed', handler);
  }, []);

  const roleHome = useMemo(() => ({
    admin: '/dashboard',
    mecanicien: '/dashboard',
    garage: '/dashboard',
    client: '/dashboard',
  }), []);

  const ProtectedRoute = ({ element, roles }) => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    const currentUser = stored ? JSON.parse(stored) : null;
    if (!token) return <Navigate to="/login" replace />;
    if (roles && currentUser && !roles.includes(currentUser.role)) {
      const role = currentUser.role || 'client';
      return <Navigate to={`/dashboard/${role}`} replace />;
    }
    return element;
  };

  if (!localStorage.getItem('token') && showRoleSelector) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RoleSelector onRoleChange={handleRoleChange} currentRole={userRole} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          {/* Cacher Sidebar automatiquement via son retour null en /login, /signup, et accueil invité */}
          {<Sidebar key={(localStorage.getItem('user') && (() => { try { return JSON.parse(localStorage.getItem('user')).role } catch { return 'guest' } })()) || 'guest'} userRole={(() => {
            try {
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                const userData = JSON.parse(storedUser);
                return userData.role || 'admin';
              }
            } catch (e) {
              console.error('Erreur parsing user:', e);
            }
            return 'admin';
          })()} />}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 0,
              width: { md: `calc(100% - 240px)` },
              mt: { xs: 7, md: 8 },
              backgroundColor: window.location.pathname === '/boutique-client' 
                ? 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)' 
                : 'transparent',
              minHeight: '100vh'
            }}
          >
            <Routes>
              <Route path="/" element={
                (() => {
                  const token = localStorage.getItem('token');
                  const storedUser = localStorage.getItem('user');
                  if (!token || !storedUser) {
                    return <HomePage />;
                  }
                  try {
                    const userData = JSON.parse(storedUser);
                    return <Navigate to={`/dashboard/${userData.role || 'admin'}`} replace />;
                  } catch {
                    return <HomePage />;
                  }
                })()
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              {/* Route dashboard générique - redirige vers le dashboard du rôle connecté */}
              <Route path="/dashboard" element={
                (() => {
                  const token = localStorage.getItem('token');
                  const storedUser = localStorage.getItem('user');
                  if (!token || !storedUser) {
                    return <Navigate to="/login" replace />;
                  }
                  try {
                    const userData = JSON.parse(storedUser);
                    return <Navigate to={`/dashboard/${userData.role || 'admin'}`} replace />;
                  } catch {
                    return <Navigate to="/login" replace />;
                  }
                })()
              } />
              <Route path="/dashboard/admin" element={<ProtectedRoute element={<Dashboard userRole="admin" />} roles={[ 'admin' ]} />} />
              <Route path="/dashboard/mecanicien" element={<ProtectedRoute element={<Dashboard userRole="mecanicien" />} roles={[ 'mecanicien' ]} />} />
              <Route path="/dashboard/garage" element={<ProtectedRoute element={<Dashboard userRole="garage" />} roles={[ 'garage' ]} />} />
              <Route path="/dashboard/client" element={<ProtectedRoute element={<Dashboard userRole="client" />} roles={[ 'client' ]} />} />
              
              {/* Routes Admin */}
              <Route path="/clients" element={<ProtectedRoute element={<ClientsPage />} roles={[ 'admin' ]} />} />
              <Route path="/employes" element={<ProtectedRoute element={<EmployesPage />} roles={[ 'admin' ]} />} />
              <Route path="/vehicules" element={<ProtectedRoute element={<VehiculesPage />} roles={[ 'admin', 'mecanicien' ]} />} />
              <Route path="/reparations" element={<ProtectedRoute element={<ReparationsPage />} roles={[ 'admin', 'mecanicien' ]} />} />
              <Route path="/factures" element={<ProtectedRoute element={<FacturesPage />} roles={[ 'admin' ]} />} />
              <Route path="/pieces" element={<ProtectedRoute element={<PiecesPage />} roles={[ 'admin', 'mecanicien' ]} />} />
              <Route path="/fournisseurs" element={<ProtectedRoute element={<FournisseursPage />} roles={[ 'admin' ]} />} />
              <Route path="/services" element={<ProtectedRoute element={<ServicesPage />} roles={[ 'admin' ]} />} />
              <Route path="/rendez-vous" element={<ProtectedRoute element={<RendezVousPage userRole={userRole} />} roles={[ 'admin', 'mecanicien', 'client' ]} />} />
              <Route path="/demandes-prestations" element={<ProtectedRoute element={<DemandesPrestationsPage />} roles={[ 'admin' ]} />} />
              <Route path="/garages" element={<ProtectedRoute element={<GaragesPage />} roles={[ 'admin' ]} />} />
              <Route path="/boutique" element={<ProtectedRoute element={<BoutiquePage />} roles={[ 'admin' ]} />} />
              <Route path="/commandes" element={<ProtectedRoute element={<CommandesPage />} roles={[ 'admin' ]} />} />
              <Route path="/boutique-client" element={<BoutiqueClientPage />} />
              <Route path="/assistant-ia" element={<ProtectedRoute element={<AssistantIA />} roles={[ 'admin', 'mecanicien' ]} />} />
              
              {/* Routes Garage */}
              <Route path="/mes-reparations" element={<ProtectedRoute element={<MesReparationsPage />} roles={[ 'garage', 'admin' ]} />} />
              <Route path="/rendez-vous-garage" element={<ProtectedRoute element={<RendezVousMecanoPage />} roles={[ 'garage' ]} />} />
              <Route path="/pieces-garage" element={<ProtectedRoute element={<PiecesMecanoPage />} roles={[ 'garage' ]} />} />
              <Route path="/vehicules-garage" element={<ProtectedRoute element={<VehiculesMecanoPage />} roles={[ 'garage' ]} />} />
              
              {/* Routes Garage */}
              <Route path="/garage-demandes" element={<ProtectedRoute element={<GarageDemandesPage />} roles={[ 'garage' ]} />} />
              <Route path="/factures-garage" element={<ProtectedRoute element={<FacturesGaragePage />} roles={[ 'garage' ]} />} />
              <Route path="/fournisseur" element={<ProtectedRoute element={<FournisseurPage />} roles={[ 'garage' ]} />} />
              
              {/* Routes Client */}
              <Route path="/mes-vehicules" element={<ProtectedRoute element={<MesVehiculesPage />} roles={[ 'client' ]} />} />
              <Route path="/mes-reparations" element={<ProtectedRoute element={<MesReparationsPage />} roles={[ 'client' ]} />} />
              <Route path="/mes-factures" element={<ProtectedRoute element={<MesFacturesPage />} roles={[ 'client', 'garage' ]} />} />
              <Route path="/mes-reparations-client" element={<ProtectedRoute element={<MesReparationsClientPage />} roles={[ 'client' ]} />} />
              <Route path="/prendre-rdv" element={<ProtectedRoute element={<PrendreRdvPage />} roles={[ 'client' ]} />} />
              <Route path="/demander-prestation" element={<ProtectedRoute element={<DemanderPrestationPage />} roles={[ 'client' ]} />} />
              
              {/* Route par défaut */}
              <Route path="*" element={
                (() => {
                  const token = localStorage.getItem('token');
                  const storedUser = localStorage.getItem('user');
                  if (!token || !storedUser) {
                    return <Navigate to="/login" replace />;
                  }
                  try {
                    const userData = JSON.parse(storedUser);
                    return <Navigate to={`/dashboard/${userData.role || 'admin'}`} replace />;
                  } catch {
                    return <Navigate to="/login" replace />;
                  }
                })()
              } />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
