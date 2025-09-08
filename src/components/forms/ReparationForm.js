import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress
} from '@mui/material';
import { reparationsAPI, clientsAPI, vehiculesAPI, employesAPI } from '../../services/api';

const ReparationForm = ({ open, onClose, onSuccess, reparation = null }) => {
  const [formData, setFormData] = useState({
    vehicule_id: reparation?.vehicule_id || '',
    employe_id: reparation?.employe_id || '',
    description_probleme: reparation?.description_probleme || '',
    description_travaux: reparation?.description_travaux || '',
    statut: reparation?.statut || 'ouvert'
  });
  const [clients, setClients] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statuts = [
    { value: 'ouvert', label: 'Ouvert' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'termine', label: 'Terminé' },
    { value: 'facture', label: 'Facturé' }
  ];

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, vehiculesRes, employesRes] = await Promise.all([
          clientsAPI.getAll(),
          vehiculesAPI.getAll(),
          employesAPI.getAll()
        ]);
        setClients(clientsRes.data);
        setVehicules(vehiculesRes.data);
        setEmployes(employesRes.data);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
      }
    };
    fetchData();
  }, []);

  // Filtrer les véhicules par client sélectionné
  const [selectedClientId, setSelectedClientId] = useState('');
  const filteredVehicules = vehicules.filter(v => 
    !selectedClientId || v.id_client === parseInt(selectedClientId)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      return newData;
    });
  };

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    setSelectedClientId(clientId);
    setFormData(prev => ({
      ...prev,
      vehicule_id: '' // Réinitialiser le véhicule quand le client change
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSend = {
        ...formData,
        vehicule_id: parseInt(formData.vehicule_id),
        employe_id: formData.employe_id ? parseInt(formData.employe_id) : null
      };

      if (reparation) {
        await reparationsAPI.update(reparation.id_reparation || reparation.id, dataToSend);
      } else {
        await reparationsAPI.create(dataToSend);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de la réparation');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      vehicule_id: '',
      employe_id: '',
      description_probleme: '',
      description_travaux: '',
      statut: 'ouvert'
    });
    setSelectedClientId('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {reparation ? 'Modifier la Réparation' : 'Nouvelle Réparation'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Client *</InputLabel>
                <Select
                  value={selectedClientId}
                  onChange={handleClientChange}
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id_client} value={client.id_client}>
                      {client.nom} {client.prenom} - {client.telephone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Véhicule *</InputLabel>
                <Select
                  name="vehicule_id"
                  value={formData.vehicule_id}
                  onChange={handleChange}
                  disabled={!selectedClientId}
                >
                  {filteredVehicules.map((vehicule) => (
                    <MenuItem key={vehicule.id_vehicule || vehicule.id} value={vehicule.id_vehicule || vehicule.id}>
                      {vehicule.marque} {vehicule.modele} - {vehicule.numero_immatriculation}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Mécanicien</InputLabel>
                <Select
                  name="employe_id"
                  value={formData.employe_id}
                  onChange={handleChange}
                >
                  <MenuItem value="">Aucun assigné</MenuItem>
                  {employes
                    .filter(emp => emp.poste === 'mecanicien' && emp.actif === 1)
                    .map((employe) => (
                      <MenuItem key={employe.id_employe || employe.id} value={employe.id_employe || employe.id}>
                        {employe.nom} {employe.prenom} - {employe.poste}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description_probleme"
                label="Problème signalé *"
                value={formData.description_probleme}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
                placeholder="Décrivez le problème signalé par le client..."
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description_travaux"
                label="Description des travaux"
                value={formData.description_travaux}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
                placeholder="Description des travaux effectués..."
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Statut</InputLabel>
                <Select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                >
                  {statuts.map((statut) => (
                    <MenuItem key={statut.value} value={statut.value}>
                      {statut.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !selectedClientId || !formData.vehicule_id || !formData.description_probleme}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {reparation ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ReparationForm; 