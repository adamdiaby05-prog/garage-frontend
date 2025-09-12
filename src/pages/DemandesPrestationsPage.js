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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add, Visibility, CheckCircle, Delete } from '@mui/icons-material';
import ModernPageTemplate from '../components/ModernPageTemplate';
import { Assignment } from '@mui/icons-material';
import { demandesPrestationsAPI, garagesAPI, usersAPI } from '../services/api';

const DemandesPrestationsPage = () => {
  const [demandes, setDemandes] = useState([]);
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [acceptForm, setAcceptForm] = useState({
    garage_id: '',
    prix_estime: '',
    duree_estimee: ''
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [demandeToDelete, setDemandeToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [demandesData, garagesData] = await Promise.all([
        demandesPrestationsAPI.getAll(),
        garagesAPI.getAll()
      ]);
      
      // L'API retourne un objet avec une propriété 'value' qui contient le tableau
      setDemandes(Array.isArray(demandesData) ? demandesData : (demandesData?.value || []));

      // Normaliser garages depuis l'API garages
      const baseGarages = Array.isArray(garagesData) ? garagesData : (garagesData?.value || []);

      // Ajouter aussi les utilisateurs ayant role 'garage'
      let garageUsers = [];
      try {
        const usersRes = await usersAPI.getAll();
        const users = usersRes?.data || [];
        garageUsers = users.filter(u => ((u.role || u.type_compte || '').toString().toLowerCase()) === 'garage');
      } catch (_) {
        // silencieux si l'endpoint utilisateurs n'est pas dispo
      }

      // Fusionner les garages de la table garages avec les utilisateurs role='garage'
      const mergedGarages = [...baseGarages];
      
      // Enrichir les garages existants avec les infos utilisateur garage
      garageUsers.forEach(user => {
        if (user.garage_id) {
          // Chercher le garage correspondant
          const garageIndex = mergedGarages.findIndex(g => g.id === user.garage_id);
          if (garageIndex >= 0) {
            // Enrichir le garage avec les infos utilisateur
            mergedGarages[garageIndex] = {
              ...mergedGarages[garageIndex],
              user_info: {
                id: user.id,
                nom: user.nom || user.name,
                prenom: user.prenom || user.firstName,
                email: user.email,
                telephone: user.telephone || user.phone
              },
              __hasUser: true,
              __userDisplayName: `${user.nom || user.name || ''} ${user.prenom || user.firstName || ''}`.trim() || user.email
            };
          }
        }
      });

      console.log('🔍 Garages chargés:', mergedGarages);
      console.log('🔍 Nombre de garages:', mergedGarages.length);
      setGarages(mergedGarages);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDemande = async () => {
    try {
      const garageId = acceptForm.garage_id;
      const prixNum = acceptForm.prix_estime === '' ? null : parseFloat(acceptForm.prix_estime);
      const dureeNum = acceptForm.duree_estimee === '' ? null : parseInt(acceptForm.duree_estimee, 10);

      console.log('🔍 Garage ID sélectionné:', garageId);
      console.log('🔍 Garages disponibles:', garages.map(g => ({ id: g.id, nom: g.nom_garage })));

      if (!selectedDemande?.id) {
        setError("Aucune demande sélectionnée.");
        return;
      }
      if (!garageId) {
        setError("Veuillez sélectionner un garage valide.");
        return;
      }
      
      // Vérifier que le garage_id existe dans la liste des garages valides
      const validGarage = garages.find(g => g.id === garageId);
      if (!validGarage) {
        setError("Garage sélectionné invalide.");
        return;
      }
      
      // Tous les garages sont maintenant valides (liés à des utilisateurs ou garages existants)
      if (prixNum !== null && !Number.isFinite(prixNum)) {
        setError("Le prix estimé doit être un nombre.");
        return;
      }
      if (dureeNum !== null && !Number.isFinite(dureeNum)) {
        setError("La durée estimée doit être un nombre.");
        return;
      }

      // Utiliser directement l'ID du garage (maintenant tous les garages sont valides)
      const realGarageId = parseInt(garageId, 10);
      console.log('🔍 Utilisation du garage_id:', realGarageId);
      
      await demandesPrestationsAPI.accept(selectedDemande.id, {
        garage_id: realGarageId,
        ...(prixNum !== null ? { prix_estime: prixNum } : {}),
        ...(dureeNum !== null ? { duree_estimee: dureeNum } : {})
      });
      setAcceptDialogOpen(false);
      setAcceptForm({ garage_id: '', prix_estime: '', duree_estimee: '' });
      fetchData();
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
      setError('Erreur lors de l\'acceptation de la demande');
    }
  };

  const handleDeleteDemande = async () => {
    try {
      if (!demandeToDelete?.id) {
        setError("Aucune demande sélectionnée pour la suppression.");
        return;
      }

      await demandesPrestationsAPI.delete(demandeToDelete.id);
      setDemandes(demandes.filter(d => d.id !== demandeToDelete.id));
      setDeleteDialogOpen(false);
      setDemandeToDelete(null);
      setError('');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression de la demande');
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'en_attente': return 'warning';
      case 'acceptee': return 'info';
      case 'en_cours': return 'primary';
      case 'terminee': return 'success';
      case 'annulee': return 'error';
      default: return 'default';
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'acceptee': return 'Acceptée';
      case 'en_cours': return 'En cours';
      case 'terminee': return 'Terminée';
      case 'annulee': return 'Annulée';
      default: return statut;
    }
  };

  if (loading) {
    return (
      <ModernPageTemplate title="Demandes de Prestations" icon={Assignment}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </ModernPageTemplate>
    );
  }

  return (
    <ModernPageTemplate title="Demandes de Prestations" icon={Assignment}>
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Gestion des demandes de prestations
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Nouvelle demande
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Véhicule</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Date demande</TableCell>
                <TableCell>Date souhaitée</TableCell>
                <TableCell>Garage assigné</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(demandes) && demandes.map((demande) => (
                <TableRow key={demande.id}>
                  <TableCell>
                    {demande.client_nom} {demande.client_prenom}
                  </TableCell>
                  <TableCell>
                    {demande.marque} {demande.modele} ({demande.immatriculation})
                  </TableCell>
                  <TableCell>
                    {demande.service_nom}
                  </TableCell>
                  <TableCell>
                    {new Date(demande.date_demande).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {demande.date_souhaitee ? new Date(demande.date_souhaitee).toLocaleDateString('fr-FR') : '-'}
                  </TableCell>
                  <TableCell>
                    {demande.nom_garage || '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatutLabel(demande.statut)}
                      color={getStatutColor(demande.statut)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedDemande(demande);
                        setAcceptDialogOpen(true);
                      }}
                      disabled={demande.statut !== 'en_attente'}
                    >
                      <CheckCircle />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedDemande(demande);
                        setDialogOpen(true);
                      }}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDemandeToDelete(demande);
                        setDeleteDialogOpen(true);
                      }}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog d'acceptation */}
        <Dialog open={acceptDialogOpen} onClose={() => setAcceptDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Accepter la demande</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Garage</InputLabel>
                  <Select
                    value={acceptForm.garage_id}
                    onChange={(e) => setAcceptForm({ ...acceptForm, garage_id: e.target.value })}
                    label="Garage"
                  >
                    {Array.isArray(garages) && garages.map((garage) => (
                      <MenuItem key={garage.id} value={garage.id}>
                        {garage.__hasUser && garage.__userDisplayName 
                          ? `${garage.__userDisplayName} (${garage.nom_garage})` 
                          : garage.nom_garage} - {garage.ville}
                        {garage.__hasUser && ' (Utilisateur connecté)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Prix estimé (€)"
                  type="number"
                  value={acceptForm.prix_estime}
                  onChange={(e) => setAcceptForm({ ...acceptForm, prix_estime: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Durée estimée (min)"
                  type="number"
                  value={acceptForm.duree_estimee}
                  onChange={(e) => setAcceptForm({ ...acceptForm, duree_estimee: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAcceptDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAcceptDemande} variant="contained">
              Accepter
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de confirmation de suppression */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer cette demande de prestation ?
              <br />
              <strong>Cette action est irréversible.</strong>
            </Typography>
            {demandeToDelete && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Client:</strong> {demandeToDelete.client_nom} {demandeToDelete.client_prenom}
                  <br />
                  <strong>Véhicule:</strong> {demandeToDelete.marque} {demandeToDelete.modele}
                  <br />
                  <strong>Service:</strong> {demandeToDelete.service_nom}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleDeleteDemande} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ModernPageTemplate>
  );
};

export default DemandesPrestationsPage;
