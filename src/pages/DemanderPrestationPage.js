import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Send, Build } from '@mui/icons-material';
import ModernPageTemplate from '../components/ModernPageTemplate';
import { servicesAPI, vehiculesAPI, demandesPrestationsAPI } from '../services/api';

const DemanderPrestationPage = () => {
  const [services, setServices] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    vehicule_id: '',
    service_id: '',
    date_souhaitee: '',
    description_probleme: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (user.role !== 'client') {
        setError('Vous devez être connecté en tant que client');
        return;
      }

      const [servicesData, vehiculesData] = await Promise.all([
        servicesAPI.getAll(),
        vehiculesAPI.getClientVehicules() // Utilise l'API spéciale pour les clients connectés
      ]);
      
      console.log('🔍 Services data:', servicesData);
      console.log('🚗 Véhicules data:', vehiculesData);
      console.log('🔍 Type véhicules:', typeof vehiculesData, Array.isArray(vehiculesData));
      
      // L'API /api/client/vehicules retourne directement un tableau
      // L'API /api/services peut retourner un objet avec 'value' ou directement un tableau
      setServices(Array.isArray(servicesData) ? servicesData : (servicesData?.value || []));
      setVehicules(Array.isArray(vehiculesData) ? vehiculesData : (vehiculesData?.value || []));
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clientId = user.client_id;

      if (!clientId) {
        setError('Client non identifié');
        return;
      }

      const demandeData = {
        client_id: clientId,
        vehicule_id: formData.vehicule_id,
        service_id: formData.service_id,
        date_souhaitee: formData.date_souhaitee,
        description_probleme: formData.description_probleme
      };

      await demandesPrestationsAPI.create(demandeData);
      
      setSuccess('Demande de prestation envoyée avec succès !');
      setFormData({
        vehicule_id: '',
        service_id: '',
        date_souhaitee: '',
        description_probleme: ''
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      setError('Erreur lors de l\'envoi de la demande');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getSelectedService = () => {
    if (!Array.isArray(services)) return null;
    return services.find(s => s.id === parseInt(formData.service_id));
  };

  const getSelectedVehicule = () => {
    if (!Array.isArray(vehicules)) return null;
    return vehicules.find(v => v.id === parseInt(formData.vehicule_id));
  };

  if (loading) {
    return (
      <ModernPageTemplate title="Demander une Prestation" icon={Build}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </ModernPageTemplate>
    );
  }

  return (
    <ModernPageTemplate title="Demander une Prestation" icon={Build}>
      <Box maxWidth="800px" mx="auto">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Nouvelle demande de prestation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Sélectionnez le service souhaité et votre véhicule pour faire une demande de prestation.
              Un garage vous contactera pour confirmer le rendez-vous.
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Véhicule</InputLabel>
                    <Select
                      name="vehicule_id"
                      value={formData.vehicule_id}
                      onChange={handleChange}
                      label="Véhicule"
                    >
                      {Array.isArray(vehicules) && vehicules.length > 0 ? (
                        vehicules.map((vehicule) => (
                          <MenuItem key={vehicule.id} value={vehicule.id}>
                            {vehicule.marque} {vehicule.modele} ({vehicule.immatriculation})
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          {Array.isArray(vehicules) ? 'Aucun véhicule trouvé' : 'Chargement...'}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Service souhaité</InputLabel>
                    <Select
                      name="service_id"
                      value={formData.service_id}
                      onChange={handleChange}
                      label="Service souhaité"
                    >
                      {Array.isArray(services) && services.length > 0 ? (
                        services.map((service) => (
                          <MenuItem key={service.id} value={service.id}>
                            {service.nom} - {service.prix}€
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          {Array.isArray(services) ? 'Aucun service trouvé' : 'Chargement...'}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="date_souhaitee"
                    label="Date souhaitée"
                    type="datetime-local"
                    value={formData.date_souhaitee}
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      min: new Date().toISOString().slice(0, 16)
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="description_probleme"
                    label="Description du problème / Besoin"
                    multiline
                    rows={4}
                    value={formData.description_probleme}
                    onChange={handleChange}
                    placeholder="Décrivez le problème ou le service dont vous avez besoin..."
                  />
                </Grid>

                {/* Résumé de la sélection */}
                {(getSelectedService() || getSelectedVehicule()) && (
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Résumé de votre demande :
                      </Typography>
                      {getSelectedVehicule() && (
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Typography variant="body2">Véhicule :</Typography>
                          <Chip 
                            label={`${getSelectedVehicule()?.marque} ${getSelectedVehicule()?.modele} (${getSelectedVehicule()?.immatriculation})`}
                            size="small"
                          />
                        </Box>
                      )}
                      {getSelectedService() && (
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Typography variant="body2">Service :</Typography>
                          <Chip 
                            label={`${getSelectedService()?.nom} - ${getSelectedService()?.prix}€`}
                            size="small"
                            color="primary"
                          />
                        </Box>
                      )}
                      {formData.date_souhaitee && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">Date souhaitée :</Typography>
                          <Chip 
                            label={new Date(formData.date_souhaitee).toLocaleString('fr-FR')}
                            size="small"
                            color="secondary"
                          />
                        </Box>
                      )}
                    </Card>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Send />}
                    disabled={submitting || !formData.vehicule_id || !formData.service_id}
                    fullWidth
                  >
                    {submitting ? 'Envoi en cours...' : 'Envoyer la demande'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </ModernPageTemplate>
  );
};

export default DemanderPrestationPage;
