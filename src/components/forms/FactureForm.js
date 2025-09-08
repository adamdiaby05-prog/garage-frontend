import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { clientsAPI, reparationsAPI, facturesAPI } from '../../services/api';

const FactureForm = ({ open, onClose, facture, onSuccess }) => {
  const [formData, setFormData] = useState({
    numero: '',
    client_id: '',
    reparation_id: '',
    date_facture: '',
    total_ht: '',
    total_ttc: '',
    statut: 'brouillon',
    mode_paiement: ''
  });
  const [clients, setClients] = useState([]);
  const [reparations, setReparations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchClients();
      if (facture) {
        setFormData({
          numero: facture.numero || '',
          client_id: facture.client_id || '',
          reparation_id: facture.reparation_id || '',
          date_facture: facture.date_facture || '',
          total_ht: facture.total_ht || '',
          total_ttc: facture.total_ttc || '',
          statut: facture.statut || 'brouillon',
          mode_paiement: facture.mode_paiement || ''
        });
      } else {
        setFormData({
          numero: '',
          client_id: '',
          reparation_id: '',
          date_facture: new Date().toISOString().split('T')[0],
          total_ht: '',
          total_ttc: '',
          statut: 'brouillon',
          mode_paiement: ''
        });
      }
    }
  }, [open, facture]);

  useEffect(() => {
    if (formData.client_id) {
      fetchReparationsByClient(formData.client_id);
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

  const fetchReparationsByClient = async (clientId) => {
    try {
      const response = await reparationsAPI.getByClient(clientId);
      setReparations(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des réparations:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calculer automatiquement le TTC si HT change
    if (name === 'total_ht') {
      const ht = parseFloat(value) || 0;
      const ttc = ht * 1.2; // TVA 20%
      setFormData(prev => ({
        ...prev,
        total_ttc: ttc.toFixed(2)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

          try {
        if (facture) {
          await facturesAPI.update(facture.id, formData);
        } else {
          await facturesAPI.create(formData);
        }
        onSuccess();
        onClose();
      } catch (err) {
        console.error('Erreur lors de l\'enregistrement:', err);
        setError('Erreur lors de l\'enregistrement de la facture');
      } finally {
        setLoading(false);
      }
  };

  const statuts = [
    { value: 'brouillon', label: 'Brouillon' },
    { value: 'envoyee', label: 'Envoyée' },
    { value: 'payee', label: 'Payée' }
  ];

  const modesPaiement = [
    { value: 'especes', label: 'Espèces' },
    { value: 'carte', label: 'Carte' },
    { value: 'cheque', label: 'Chèque' },
    { value: 'virement', label: 'Virement' }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {facture ? 'Modifier la facture' : 'Nouvelle facture'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Numéro de facture"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de facture"
                name="date_facture"
                type="date"
                value={formData.date_facture}
                onChange={handleChange}
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Client</InputLabel>
                <Select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  label="Client"
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id_client} value={client.id_client}>
                      {client.nom} {client.prenom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Réparation</InputLabel>
                <Select
                  name="reparation_id"
                  value={formData.reparation_id}
                  onChange={handleChange}
                  label="Réparation"
                >
                  <MenuItem value="">
                    <em>Aucune</em>
                  </MenuItem>
                  {reparations.map((reparation) => (
                    <MenuItem key={reparation.id} value={reparation.id}>
                      {reparation.numero} - {reparation.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total HT (€)"
                name="total_ht"
                type="number"
                value={formData.total_ht}
                onChange={handleChange}
                required
                margin="normal"
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total TTC (€)"
                name="total_ttc"
                type="number"
                value={formData.total_ttc}
                onChange={handleChange}
                required
                margin="normal"
                inputProps={{ step: "0.01", min: "0" }}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  label="Statut"
                >
                  {statuts.map((statut) => (
                    <MenuItem key={statut.value} value={statut.value}>
                      {statut.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Mode de paiement</InputLabel>
                <Select
                  name="mode_paiement"
                  value={formData.mode_paiement}
                  onChange={handleChange}
                  label="Mode de paiement"
                >
                  <MenuItem value="">
                    <em>Non défini</em>
                  </MenuItem>
                  {modesPaiement.map((mode) => (
                    <MenuItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !formData.numero || !formData.client_id || !formData.total_ht}
          >
            {loading ? 'Enregistrement...' : (facture ? 'Modifier' : 'Créer')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FactureForm;
