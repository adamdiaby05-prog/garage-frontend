import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { rendezVousAPI, clientsAPI, vehiculesAPI, employesAPI, servicesAPI } from '../../services/api';

const RendezVousForm = ({ open, onClose, onSuccess, rendezVous = null, fixedClientId = null, simpleClientMode = false }) => {
  const [formData, setFormData] = useState({
    client_id: fixedClientId || rendezVous?.client_id || '',
    vehicule_id: rendezVous?.vehicule_id || '',
    employe_id: rendezVous?.employe_id || '',
    service_id: rendezVous?.service_id || '',
    date_rdv: rendezVous?.date_rdv ? new Date(rendezVous.date_rdv).toISOString().slice(0, 16) : '',
    motif: rendezVous?.motif || '',
    statut: rendezVous?.statut || 'en_attente'
  });
  const [clients, setClients] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (!fixedClientId) {
        fetchClients();
      }
      if (!simpleClientMode) {
        fetchEmployes();
      }
      fetchServices();
      // Si un client est imposé, forcer sa prise en compte et charger ses véhicules
      if (fixedClientId) {
        setFormData(prev => ({ ...prev, client_id: fixedClientId }));
        fetchVehiculesByClient(fixedClientId);
      }
    }
  }, [open, fixedClientId, simpleClientMode]);

  useEffect(() => {
    if (formData.client_id) {
      fetchVehiculesByClient(formData.client_id);
    }
  }, [formData.client_id]);

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      setClients(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des clients:', err);
    }
  };

  const fetchVehiculesByClient = async (clientId) => {
    try {
      const response = await vehiculesAPI.getByClient(clientId);
      setVehicules(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des véhicules:', err);
    }
  };

  const fetchEmployes = async () => {
    try {
      const response = await employesAPI.getAll();
      setEmployes(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des employés:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des services:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        statut: simpleClientMode ? 'en_attente' : (formData.statut || 'en_attente')
      };
      if (rendezVous) {
        // Modification
        await rendezVousAPI.update(rendezVous.id, payload);
      } else {
        // Création
        await rendezVousAPI.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement du rendez-vous');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      client_id: '',
      vehicule_id: '',
      employe_id: '',
      service_id: '',
      date_rdv: '',
      motif: '',
      statut: 'en_attente'
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {rendezVous ? 'Modifier le Rendez-vous' : 'Nouveau Rendez-vous'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            {!fixedClientId && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Client</InputLabel>
                  <Select
                    name="client_id"
                    value={formData.client_id || ''}
                    onChange={handleChange}
                    label="Client"
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.id_client || `client-${client.id}` || `client-${Math.random()}`} value={client.id_client || client.id || ''}>
                        {client.nom} {client.prenom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Véhicule</InputLabel>
                <Select
                  name="vehicule_id"
                  value={formData.vehicule_id || ''}
                  onChange={handleChange}
                  label="Véhicule"
                  disabled={!formData.client_id}
                >
                  {vehicules.map((vehicule) => (
                    <MenuItem key={vehicule.id_vehicule || vehicule.id || `vehicule-${Math.random()}`} value={vehicule.id_vehicule || vehicule.id || ''}>
                      {vehicule.marque} {vehicule.modele} - {vehicule.numero_immatriculation || vehicule.immatriculation || 'N/A'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {!simpleClientMode && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Mécanicien</InputLabel>
                  <Select
                    name="employe_id"
                    value={formData.employe_id || ''}
                    onChange={handleChange}
                    label="Mécanicien"
                  >
                    <MenuItem value="">Non assigné</MenuItem>
                    {employes.filter(emp => emp.role === 'mecanicien').map((employe) => (
                      <MenuItem key={employe.id_employe || employe.id || `employe-${Math.random()}`} value={employe.id_employe || employe.id || ''}>
                        {employe.nom} {employe.prenom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required={simpleClientMode}>
                <InputLabel>Service</InputLabel>
                <Select
                  name="service_id"
                  value={formData.service_id || ''}
                  onChange={handleChange}
                  label="Service"
                >
                  <MenuItem value="">Aucun service</MenuItem>
                  {services.map((service) => (
                    <MenuItem key={service.id || `service-${Math.random()}`} value={service.id || ''}>
                      {service.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="date_rdv"
                label="Date et heure *"
                type="datetime-local"
                value={formData.date_rdv || ''}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            {!simpleClientMode && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Statut</InputLabel>
                  <Select
                    name="statut"
                    value={formData.statut || ''}
                    onChange={handleChange}
                    label="Statut"
                  >
                    <MenuItem value="en_attente">En attente</MenuItem>
                    <MenuItem value="confirme">Confirmé</MenuItem>
                    <MenuItem value="annule">Annulé</MenuItem>
                    <MenuItem value="termine">Terminé</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                name="motif"
                label="Motif"
                value={formData.motif || ''}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
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
            disabled={loading || !formData.client_id || !formData.vehicule_id || !formData.date_rdv}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {rendezVous ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RendezVousForm; 