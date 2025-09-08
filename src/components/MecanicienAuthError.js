import React from 'react';
import { Box, Alert, Button, Typography } from '@mui/material';
import { Login, Build } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const MecanicienAuthError = ({ message = "Vous devez être connecté en tant que mécanicien pour accéder à cette page." }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="60vh"
      p={3}
      gap={3}
    >
      <Build sx={{ fontSize: 80, color: 'primary.main' }} />
      
      <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
        Accès Mécanicien
      </Typography>
      
      <Alert 
        severity="warning" 
        sx={{ 
          maxWidth: 600, 
          width: '100%',
          '& .MuiAlert-message': {
            fontSize: '1.1rem'
          }
        }}
      >
        {message}
      </Alert>
      
      <Button
        variant="contained"
        size="large"
        startIcon={<Login />}
        onClick={handleLogin}
        sx={{
          mt: 2,
          px: 4,
          py: 1.5,
          fontSize: '1.1rem',
          borderRadius: 2
        }}
      >
        Se connecter
      </Button>
      
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
        Connectez-vous avec votre compte mécanicien pour accéder à vos véhicules, réparations et rendez-vous assignés.
      </Typography>
    </Box>
  );
};

export default MecanicienAuthError;
