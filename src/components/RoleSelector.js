import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip
} from '@mui/material';
import {
  Security,
  Build,
  Person,
  DirectionsCar
} from '@mui/icons-material';

const RoleSelector = ({ onRoleChange, currentRole }) => {
  const roles = [
    {
      id: 'admin',
      name: 'Administrateur',
      description: 'Gestion complète du garage',
      icon: <Security sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      features: ['Gestion clients', 'Gestion employés', 'Réparations', 'Factures', 'Stock', 'Services']
    },
    {
      id: 'mecanicien',
      name: 'Mécanicien',
      description: 'Interface de réparation',
      icon: <Build sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      features: ['Mes réparations', 'Rendez-vous', 'Pièces', 'Véhicules']
    },
    {
      id: 'client',
      name: 'Client',
      description: 'Espace client',
      icon: <Person sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      features: ['Mes véhicules', 'Mes réparations', 'Mes factures', 'Prendre RDV']
    }
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <DirectionsCar sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
        <Typography variant="h3" gutterBottom>
          Garage Management System
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Sélectionnez votre rôle pour accéder à l'interface appropriée
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {roles.map((role) => (
          <Grid item xs={12} md={4} key={role.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: currentRole === role.id ? `3px solid ${role.color}` : '1px solid #e0e0e0',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  borderColor: role.color
                }
              }}
              onClick={() => onRoleChange(role.id)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 2,
                      backgroundColor: role.color 
                    }}
                  >
                    {role.icon}
                  </Avatar>
                  <Typography variant="h5" gutterBottom sx={{ color: role.color, fontWeight: 'bold' }}>
                    {role.name}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                    {role.description}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  {role.features.map((feature, index) => (
                    <Chip
                      key={index}
                      label={feature}
                      size="small"
                      sx={{ 
                        m: 0.5, 
                        backgroundColor: `${role.color}20`,
                        color: role.color,
                        border: `1px solid ${role.color}40`
                      }}
                    />
                  ))}
                </Box>

                <Button
                  variant={currentRole === role.id ? "contained" : "outlined"}
                  sx={{ 
                    backgroundColor: currentRole === role.id ? role.color : 'transparent',
                    color: currentRole === role.id ? 'white' : role.color,
                    borderColor: role.color,
                    '&:hover': {
                      backgroundColor: currentRole === role.id ? role.color : `${role.color}20`
                    }
                  }}
                  fullWidth
                >
                  {currentRole === role.id ? 'Rôle actuel' : 'Sélectionner'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {currentRole && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Rôle actuel : {roles.find(r => r.id === currentRole)?.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Utilisez la sidebar à gauche pour naviguer dans l'interface
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RoleSelector;
