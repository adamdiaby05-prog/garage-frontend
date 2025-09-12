import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

const AuthGuard = ({ children, requiredRole = null }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        try { console.log('🔎 AuthGuard check | token?', !!token, '| user?', !!user, '| requiredRole:', requiredRole); } catch {}
        
        if (!token || !user) {
          console.log('🔒 Utilisateur non authentifié, redirection vers la connexion');
          navigate('/login');
          return;
        }
        
        const userData = JSON.parse(user);
        try { console.log('👤 AuthGuard user:', userData); } catch {}
        
        // Vérifier le rôle si spécifié
        if (requiredRole && userData.role !== requiredRole) {
          try { console.log('🚫 Role mismatch:', userData.role, '≠', requiredRole); } catch {}
          console.log('🚫 Accès refusé - rôle non autorisé:', userData.role, 'requis:', requiredRole);
          setError(`Accès refusé. Rôle requis: ${requiredRole}`);
          // Si l'utilisateur est garage mais page demandée pour mecanicien, on redirige vers l'équivalent garage
          try {
            if (userData.role === 'garage') {
              navigate('/garage-demandes');
            } else if (userData.role === 'mecanicien') {
              navigate('/garage-demandes');
            } else {
              navigate('/login');
            }
          } catch {
            navigate('/login');
          }
          return;
        }
        
        setIsAuthenticated(true);
        setError('');
        setIsLoading(false);
      } catch (e) {
        console.log('❌ Erreur parsing user data:', e);
        setError('Erreur d\'authentification');
        navigate('/login');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="50vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="h6">Vérification de l'authentification...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null; // La redirection est gérée dans useEffect
  }

  return children;
};

export default AuthGuard;
