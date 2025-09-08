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
import { piecesAPI, fournisseursAPI } from '../../services/api';

const PieceForm = ({ open, onClose, piece, onSuccess }) => {
  const [formData, setFormData] = useState({
    reference: '',
    nom_piece: '',
    description: '',
    prix_unitaire: '',
    stock_actuel: '',
    stock_minimum: '',
    id_fournisseur: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loadingFournisseurs, setLoadingFournisseurs] = useState(false);

  // Charger les fournisseurs
  const fetchFournisseurs = async () => {
    try {
      setLoadingFournisseurs(true);
      const response = await fournisseursAPI.getAll();
      setFournisseurs(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des fournisseurs:', err);
    } finally {
      setLoadingFournisseurs(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchFournisseurs();
      if (piece) {
        setFormData({
          reference: piece.reference || '',
          nom_piece: piece.nom_piece || '',
          description: piece.description || '',
          prix_unitaire: piece.prix_unitaire || '',
          stock_actuel: (piece.stock_actuel ?? piece.stock ?? '').toString(),
          stock_minimum: (piece.stock_minimum ?? '').toString(),
          id_fournisseur: piece.id_fournisseur || ''
        });
      } else {
        setFormData({
          reference: '',
          nom_piece: '',
          description: '',
          prix_unitaire: '',
          stock_actuel: '0',
          stock_minimum: '5',
          id_fournisseur: ''
        });
      }
    }
  }, [open, piece]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (piece) {
        const pieceId = piece.id_piece || piece.id;
        await piecesAPI.update(pieceId, formData);
      } else {
        await piecesAPI.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement de la pièce');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'filtres',
    'lubrifiants',
    'freinage',
    'electricite',
    'moteur',
    'transmission',
    'suspension',
    'carrosserie',
    'accessoires'
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {piece ? 'Modifier la pièce' : 'Nouvelle pièce'}
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
                label="Référence"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                required
                margin="normal"
                placeholder="ex: FILT001"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom de la pièce"
                name="nom_piece"
                value={formData.nom_piece}
                onChange={handleChange}
                required
                margin="normal"
                placeholder="ex: Filtre à huile standard"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Description/Catégorie"
                name="description"
                value={formData.description}
                onChange={handleChange}
                margin="normal"
                placeholder="ex: Filtres, Lubrifiants, Freinage..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Fournisseur</InputLabel>
                <Select
                  name="id_fournisseur"
                  value={formData.id_fournisseur || ''}
                  onChange={handleChange}
                  label="Fournisseur"
                  disabled={loadingFournisseurs}
                >
                  <MenuItem value="">
                    <em>Aucun fournisseur</em>
                  </MenuItem>
                  {fournisseurs.map((f) => (
                    <MenuItem key={f.id_fournisseur || f.id} value={f.id_fournisseur || f.id}>
                      {f.nom_fournisseur || f.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prix unitaire (€)"
                name="prix_unitaire"
                type="number"
                value={formData.prix_unitaire}
                onChange={handleChange}
                required
                margin="normal"
                inputProps={{ step: "0.01", min: "0" }}
                placeholder="0.00"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock actuel"
                name="stock_actuel"
                type="number"
                value={formData.stock_actuel}
                onChange={handleChange}
                required
                margin="normal"
                inputProps={{ min: "0" }}
                placeholder="0"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock minimum"
                name="stock_minimum"
                type="number"
                value={formData.stock_minimum}
                onChange={handleChange}
                required
                margin="normal"
                inputProps={{ min: "0" }}
                placeholder="5"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              <strong>Note:</strong> Le stock minimum est utilisé pour déclencher des alertes de réapprovisionnement.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !formData.reference || !formData.nom_piece || !formData.prix_unitaire}
          >
            {loading ? 'Enregistrement...' : (piece ? 'Modifier' : 'Créer')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PieceForm;
