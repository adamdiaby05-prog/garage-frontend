import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Edit, Visibility, CheckCircle, Cancel } from '@mui/icons-material';
import ModernPageTemplate from '../components/ModernPageTemplate';
import { Business } from '@mui/icons-material';
import { garagesAPI, usersAPI } from '../services/api';
import GarageForm from '../components/forms/GarageForm';
import { normalizeApiDataWithLogging } from '../utils/apiUtils';

const GaragesPage = () => {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGarage, setSelectedGarage] = useState(null);

  useEffect(() => {
    fetchGarages();
  }, []);

  const fetchGarages = async () => {
    try {
      setLoading(true);
      console.log('🔍 Chargement des garages...');
      const garagesData = await garagesAPI.getAll();
      const garagesList = normalizeApiDataWithLogging(garagesData, 'Garages');

      // Charger aussi les utilisateurs avec role 'garage'
      let garageUsers = [];
      try {
        const usersRes = await usersAPI.getAll();
        const users = usersRes?.data || [];
        garageUsers = users.filter(u => ((u.role || u.type_compte || '').toString().toLowerCase()) === 'garage');
      } catch (e) {
        // silencieux: si l'endpoint utilisateurs n'est pas dispo on ignore
      }

      // Enrichir les garages existants avec les infos utilisateur si disponible
      const normalized = garagesList.map(garage => {
        // Chercher si un utilisateur garage est lié à ce garage
        const linkedUser = garageUsers.find(u => u.garage_id === garage.id);
        
        if (linkedUser) {
          return {
            ...garage,
            user_info: {
              id: linkedUser.id,
              nom: linkedUser.nom || linkedUser.name,
              prenom: linkedUser.prenom || linkedUser.firstName,
              email: linkedUser.email,
              telephone: linkedUser.telephone || linkedUser.phone
            },
            __hasUser: true
          };
        }
        
        return garage;
      });

      setGarages(normalized);
    } catch (error) {
      console.error('Erreur lors du chargement des garages:', error);
      setError('Erreur lors du chargement des garages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGarage = async (garageData) => {
    try {
      await garagesAPI.create(garageData);
      fetchGarages();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      throw error;
    }
  };

  const handleUpdateGarage = async (garageData) => {
    try {
      await garagesAPI.update(selectedGarage.id, garageData);
      fetchGarages();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      throw error;
    }
  };

  const handleToggleStatut = async (garage) => {
    try {
      const nouveauStatut = garage.statut === 'actif' ? 'inactif' : 'actif';
      await garagesAPI.update(garage.id, { statut: nouveauStatut });
      fetchGarages();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      setError('Erreur lors du changement de statut');
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'actif': return 'success';
      case 'inactif': return 'error';
      case 'en_attente': return 'warning';
      default: return 'default';
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'actif': return 'Actif';
      case 'inactif': return 'Inactif';
      case 'en_attente': return 'En attente';
      default: return statut;
    }
  };

  if (loading) {
    return (
      <ModernPageTemplate title="Gestion des Garages" icon={Business}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </ModernPageTemplate>
    );
  }

  return (
    <ModernPageTemplate title="Gestion des Garages" icon={Business}>
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Liste des garages partenaires
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedGarage(null);
              setDialogOpen(true);
            }}
          >
            Ajouter un garage
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom du garage</TableCell>
                <TableCell>Ville</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Spécialités</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {garages.map((garage) => (
                <TableRow key={garage.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {garage.nom_garage || '-'}
                      </Typography>
                      {garage.siret && (
                        <Typography variant="caption" color="text.secondary">
                          SIRET: {garage.siret}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {garage.ville || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {garage.code_postal || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {garage.telephone || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {garage.email || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200 }}>
                      {garage.specialites ? 
                        (garage.specialites.length > 50 ? 
                          `${garage.specialites.substring(0, 50)}...` : 
                          garage.specialites
                        ) : 
                        '-'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatutLabel(garage.statut)}
                      color={getStatutColor(garage.statut)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatut(garage)}
                      color={garage.statut === 'actif' ? 'error' : 'success'}
                    >
                      {garage.statut === 'actif' ? <Cancel /> : <CheckCircle />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedGarage(garage);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        // TODO: Ouvrir dialog de détails
                      }}
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {garages.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              Aucun garage enregistré
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Commencez par ajouter un garage partenaire
            </Typography>
          </Box>
        )}

        <GarageForm
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={selectedGarage ? handleUpdateGarage : handleCreateGarage}
          garage={selectedGarage}
        />
      </Box>
    </ModernPageTemplate>
  );
};

export default GaragesPage;
