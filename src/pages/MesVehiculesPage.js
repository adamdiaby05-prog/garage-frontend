import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add, DirectionsCar, Delete, AttachMoney, Visibility } from '@mui/icons-material';
import { vehiculesAPI } from '../services/api';
import ModernPageTemplate from '../components/ModernPageTemplate';
import VehiculeForm from '../components/forms/VehiculeForm';
import VenteVehiculeForm from '../components/forms/VenteVehiculeForm';

// L'id client provient de l'authentification (localStorage.user.client_id)
const MesVehiculesPage = () => {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showVenteForm, setShowVenteForm] = useState(false);
  const [selectedVehicule, setSelectedVehicule] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [vehiculesEnVente, setVehiculesEnVente] = useState([]);

  const fetchVehicules = async () => {
    try {
      setLoading(true);
      setError('');
      if (!clientId) {
        throw new Error("Aucun client_id trouvé. Connectez-vous en tant que client.");
      }
      const response = await vehiculesAPI.getByClient(clientId);
      setVehicules(response.data || []);
      
      // Récupérer aussi les véhicules en vente
      await fetchVehiculesEnVente();
    } catch (err) {
      console.error('Erreur chargement véhicules client:', err);
      setError("Impossible de charger vos véhicules. "+ (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const fetchVehiculesEnVente = async () => {
    try {
      if (!clientId) return;
      
      // Récupérer l'ID utilisateur depuis localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) return;
      
      const response = await fetch(`http://localhost:5000/api/vente/vehicules/client/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setVehiculesEnVente(data);
      }
    } catch (err) {
      console.error('Erreur chargement véhicules en vente:', err);
    }
  };

  useEffect(() => {
    // Récupérer l'id client depuis l'auth
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u && u.role === 'client' && u.client_id) {
          setClientId(u.client_id);
        } else {
          setError("Connectez-vous avec un compte client pour gérer vos véhicules.");
        }
      } else {
        setError("Vous n'êtes pas connecté.");
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (clientId) fetchVehicules();
  }, [clientId]);

  // Gérer la suppression d'un véhicule
  const handleDeleteVehicule = async (vehicule) => {
    const vehiculeId = vehicule.id_vehicule || vehicule.id;
    
    if (!vehiculeId) {
      alert('Erreur: ID du véhicule non trouvé');
      return;
    }

    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le véhicule ${vehicule.marque} ${vehicule.modele} (${vehicule.numero_immatriculation}) ?\n\n⚠️ Cette action est irréversible et supprimera définitivement le véhicule de la base de données.`
    );

    if (confirmDelete) {
      try {
        console.log('Tentative de suppression du véhicule avec ID:', vehiculeId);
        
        const response = await vehiculesAPI.delete(vehiculeId);
        console.log('Réponse de suppression:', response);
        
        // Mise à jour de l'état local
        setVehicules(prevVehicules => 
          prevVehicules.filter(v => (v.id_vehicule || v.id) !== vehiculeId)
        );
        
        alert(`Véhicule ${vehicule.marque} ${vehicule.modele} supprimé avec succès`);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert(`Erreur lors de la suppression: ${err.response?.data?.error || err.message}`);
      }
    }
  };

  // Gérer la mise en vente d'un véhicule
  const handleVendreVehicule = (vehicule) => {
    setSelectedVehicule(vehicule);
    setShowVenteForm(true);
  };

  // Vérifier si un véhicule est en vente
  const isVehiculeEnVente = (vehiculeId) => {
    return vehiculesEnVente.some(v => v.vehicule_id === vehiculeId && v.statut === 'en_vente');
  };

  // Gérer le succès de la vente
  const handleVenteSuccess = () => {
    fetchVehicules(); // Recharger les données
  };

  return (
    <ModernPageTemplate
      title="Mes Véhicules"
      subtitle="Votre parc automobile"
      icon={DirectionsCar}
      colorScheme={(() => { try { const u = JSON.parse(localStorage.getItem('user')||'{}'); return u.role==='client'?'orange':'blue'; } catch { return 'orange'; } })()}
      onAdd={() => setShowForm(true)}
      onRefresh={fetchVehicules}
      statCards={[
        { title: 'Total', value: vehicules.length, icon: <DirectionsCar />, gradient: 'linear-gradient(135deg, #7c2d12, #ea580c)' },
        { title: 'Essence', value: vehicules.filter(v => (v.carburant||'').toLowerCase()==='essence').length, icon: <DirectionsCar />, gradient: 'linear-gradient(135deg, #c2410c, #f59e0b)' },
        { title: 'Diesel', value: vehicules.filter(v => (v.carburant||'').toLowerCase()==='diesel').length, icon: <DirectionsCar />, gradient: 'linear-gradient(135deg, #d97706, #fbbf24)' }
      ]}
    >

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Marque</TableCell>
                <TableCell>Modèle</TableCell>
                <TableCell>Immatriculation</TableCell>
                <TableCell>Carburant</TableCell>
                <TableCell>Couleur</TableCell>
                <TableCell>Année</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicules.map((v, idx) => (
                <TableRow key={v.id_vehicule || v.id || `vehicule-${idx}`} hover>
                  <TableCell>{v.marque || ''}</TableCell>
                  <TableCell>{v.modele || ''}</TableCell>
                  <TableCell>{v.numero_immatriculation || ''}</TableCell>
                  <TableCell>{v.carburant || ''}</TableCell>
                  <TableCell>{v.couleur || ''}</TableCell>
                  <TableCell>{v.annee || ''}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!isVehiculeEnVente(v.id_vehicule || v.id) ? (
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handleVendreVehicule(v)}
                          title="Mettre en vente"
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(76, 175, 80, 0.1)',
                              transform: 'scale(1.1)',
                              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <AttachMoney />
                        </IconButton>
                      ) : (
                        <IconButton 
                          size="small" 
                          color="info"
                          title="Déjà en vente"
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(33, 150, 243, 0.1)',
                              transform: 'scale(1.1)',
                              boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      )}
                      
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteVehicule(v)}
                        title="Supprimer le véhicule"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            transform: 'scale(1.1)',
                            boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {vehicules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Aucun véhicule trouvé. Cliquez sur "Nouvelle voiture" pour ajouter votre premier véhicule.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <VehiculeForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={fetchVehicules}
        vehicule={null}
        fixedClientId={clientId}
      />

      <VenteVehiculeForm
        open={showVenteForm}
        onClose={() => setShowVenteForm(false)}
        onSuccess={handleVenteSuccess}
        vehicule={selectedVehicule}
      />
    </ModernPageTemplate>
  );
};

export default MesVehiculesPage;


