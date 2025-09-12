import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Alert, CircularProgress, Card, CardMedia, CardContent } from '@mui/material';
import { boutiqueClientAPI } from '../services/api';

const FournisseurPage = () => {
  const [form, setForm] = useState({ nom: '', description: '', prix: '', stock: '', categorie: '', reference: '', image: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    setPreview(form.image || '');
  }, [form.image]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const payload = {
        nom: form.nom,
        description: form.description,
        prix: parseFloat(form.prix || '0'),
        stock: parseInt(form.stock || '0', 10),
        categorie: form.categorie || null,
        reference: form.reference || null,
        image: form.image || null,
      };
      const res = await boutiqueClientAPI.createProduit(payload);
      setSuccess('Produit ajouté avec succès');
      setForm({ nom: '', description: '', prix: '', stock: '', categorie: '', reference: '', image: '' });
      setFileName('');
    } catch (e) {
      console.error('Erreur ajout produit:', e);
      setError('Erreur lors de l\'ajout du produit');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setForm((f) => ({ ...f, image: typeof dataUrl === 'string' ? dataUrl : '' }));
      setPreview(typeof dataUrl === 'string' ? dataUrl : '');
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Espace Fournisseur</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Paper sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Nom du produit" fullWidth required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Référence" fullWidth value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" fullWidth multiline minRows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Prix (€)" type="number" inputProps={{ min: 0, step: 0.01 }} fullWidth required value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Stock" type="number" inputProps={{ min: 0, step: 1 }} fullWidth required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Catégorie" fullWidth value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="URL de l'image (optionnel)" fullWidth value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button component="label" variant="outlined" fullWidth>
                {fileName ? `Image sélectionnée: ${fileName}` : 'Choisir une image depuis votre PC'}
                <input hidden type="file" accept="image/*" onChange={handleFileChange} />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={loading} fullWidth>{loading ? 'Envoi...' : 'Ajouter le produit'}</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {preview && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Aperçu de l'image</Typography>
          <Card sx={{ maxWidth: 360 }}>
            <CardMedia component="img" image={preview} alt="Aperçu" />
            <CardContent>
              <Typography variant="body2" color="text.secondary">Cette image sera visible dans la boutique client.</Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default FournisseurPage;


