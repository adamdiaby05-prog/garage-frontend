import React from 'react';
import { Box, Alert, Typography, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore, BugReport } from '@mui/icons-material';

const MecanicienDebugInfo = ({ onRetry }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  let userData = null;
  let parseError = null;
  
  try {
    if (user) {
      userData = JSON.parse(user);
    }
  } catch (e) {
    parseError = e.message;
  }

  return (
    <Box p={3}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          🔍 Informations de Debug - Authentification Mécanicien
        </Typography>
        <Typography variant="body2">
          Vous êtes connecté mais la vérification d'authentification échoue. Voici les détails :
        </Typography>
      </Alert>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={1}>
            <BugReport />
            <Typography variant="h6">Détails de l'Authentification</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box>
              <Typography variant="subtitle2" color="primary">Token:</Typography>
              <Typography variant="body2" fontFamily="monospace">
                {token ? `${token.substring(0, 30)}...` : '❌ Manquant'}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="primary">User (raw):</Typography>
              <Typography variant="body2" fontFamily="monospace">
                {user ? user.substring(0, 100) + '...' : '❌ Manquant'}
              </Typography>
            </Box>
            
            {parseError && (
              <Box>
                <Typography variant="subtitle2" color="error">Erreur de parsing:</Typography>
                <Typography variant="body2" color="error">{parseError}</Typography>
              </Box>
            )}
            
            {userData && (
              <Box>
                <Typography variant="subtitle2" color="primary">User (parsed):</Typography>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '10px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </Box>
            )}
            
            <Box>
              <Typography variant="subtitle2" color="primary">Vérification du rôle:</Typography>
              <Typography variant="body2">
                {userData?.role === 'mecanicien' ? '✅ Rôle mecanicien détecté' : `❌ Rôle incorrect: ${userData?.role || 'undefined'}`}
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Box mt={2} display="flex" gap={2}>
        <Button variant="contained" onClick={onRetry}>
          🔄 Réessayer
        </Button>
        <Button variant="outlined" onClick={() => window.location.href = '/login'}>
          🔑 Se reconnecter
        </Button>
      </Box>
    </Box>
  );
};

export default MecanicienDebugInfo;
