import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { CheckCircle, Visibility, Build, Delete } from '@mui/icons-material';
import ModernPageTemplate from '../components/ModernPageTemplate';
import { demandesPrestationsAPI, garagesAPI, authAPI, facturesAPI } from '../services/api';

const GarageDemandesPage = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [factureForm, setFactureForm] = useState({
    prix_ht: '',
    tva_percent: '20',
    mode_paiement: 'especes',
    notes: ''
  });
  const [itemDraft, setItemDraft] = useState({ nom: '', montant: '' });
  const [items, setItems] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [demandeToDelete, setDemandeToDelete] = useState(null);

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      let user = {};
      try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}

      // Sécurité: rôle requis
      if ((user.role || '').toLowerCase() !== 'garage') {
        setError("Accès refusé: rôle 'garage' requis.");
        return;
      }

      // 1) Si garage_id manquant, tenter de le récupérer via /auth/me
      if (!user.garage_id) {
        try {
          const me = await authAPI.me();
          const meUser = me?.data?.user || me?.data || {};
          if (meUser && (meUser.garage_id || meUser.garageId)) {
            user = { ...user, garage_id: meUser.garage_id || meUser.garageId };
            localStorage.setItem('user', JSON.stringify(user));
            try { window.dispatchEvent(new CustomEvent('auth-changed')); } catch {}
          }
        } catch {}
      }

      // 2) Si encore manquant, mapper par email vers un garage existant
      if (!user.garage_id && user.email) {
        try {
          const garages = await garagesAPI.getAll();
          const list = Array.isArray(garages) ? garages : (garages?.value || []);
          const match = list.find(g => (g.email || '').toLowerCase() === (user.email || '').toLowerCase());
          if (match?.id) {
            user = { ...user, garage_id: match.id };
            localStorage.setItem('user', JSON.stringify(user));
            try { window.dispatchEvent(new CustomEvent('auth-changed')); } catch {}
          }
        } catch {}
      }

      const garageId = user.garage_id;
      if (!garageId) {
        setError('Garage non identifié');
        return;
      }

      const demandesData = await demandesPrestationsAPI.getByGarage(garageId);
      // L'API retourne un objet avec une propriété 'value' qui contient le tableau
      setDemandes(Array.isArray(demandesData) ? demandesData : (demandesData?.value || []));
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
      setError('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatut = async (demandeId, nouveauStatut) => {
    try {
      await demandesPrestationsAPI.updateStatut(demandeId, { statut: nouveauStatut });
      fetchDemandes();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setError('Erreur lors de la mise à jour du statut');
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

  const getStatutActions = (demande) => {
    switch (demande.statut) {
      case 'acceptee':
        return (
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<Build />}
            onClick={() => handleUpdateStatut(demande.id, 'en_cours')}
          >
            Commencer
          </Button>
        );
      case 'en_cours':
        return (
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => {
              setSelectedDemande(demande);
              setDialogOpen(true);
            }}
          >
            Terminer
          </Button>
        );
      default:
        return null;
    }
  };

  const handleDeleteDemande = async () => {
    if (!demandeToDelete) return;
    try {
      await demandesPrestationsAPI.delete(demandeToDelete.id);
      setDemandes((prev) => prev.filter((d) => d.id !== demandeToDelete.id));
      setSuccess('Demande supprimée avec succès');
    } catch (e) {
      console.error('Erreur suppression demande:', e);
      setError('Erreur lors de la suppression de la demande');
    } finally {
      setDeleteDialogOpen(false);
      setDemandeToDelete(null);
    }
  };

  const computeTotals = (prixHtStr, tvaPercentStr) => {
    const baseHt = Math.max(0, parseFloat(prixHtStr || '0'));
    const itemsHt = items.reduce((sum, it) => sum + (Number(it.montant) || 0), 0);
    const ht = baseHt + itemsHt;
    const tvaPct = Math.max(0, parseFloat(tvaPercentStr || '0'));
    const ttc = ht * (1 + tvaPct / 100);
    return { total_ht: ht.toFixed(2), total_ttc: ttc.toFixed(2) };
  };

  const handleCreateFacture = async () => {
    if (!selectedDemande) return;
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const { total_ht, total_ttc } = computeTotals(factureForm.prix_ht, factureForm.tva_percent);

      const numero = `FAC-${Date.now()}`;
      const date_facture = new Date().toISOString().slice(0, 10);
      const clientId = selectedDemande.client_id || selectedDemande.clientId;

      if (!clientId) {
        setError("Impossible de générer la facture: client_id manquant.");
        return;
      }

      const repId = selectedDemande.reparation_id || selectedDemande.id_reparation || null;

      const mainOeuvre = Number(factureForm.prix_ht) > 0 ? [`1 x Main d'œuvre @ ${Number(factureForm.prix_ht)}`] : [];
      const itemLines = items.map(it => `1 x ${it.nom} @ ${Number(it.montant) || 0}`);
      const allLines = [...mainOeuvre, ...itemLines];
      const linesBlock = allLines.length > 0
        ? `\nLIGNES:\n${allLines.join('\\n')}`
        : '';
      const created = await facturesAPI.create({
        numero,
        client_id: clientId,
        reparation_id: repId,
        date_facture,
        total_ht: parseFloat(total_ht),
        total_ttc: parseFloat(total_ttc),
        mode_paiement: factureForm.mode_paiement,
        notes: (factureForm.notes || '') + linesBlock,
        statut: 'brouillon'
      });

      await demandesPrestationsAPI.updateStatut(selectedDemande.id, { statut: 'terminee' });
      setDialogOpen(false);
      setSelectedDemande(null);
      setFactureForm({ prix_ht: '', tva_percent: '20', mode_paiement: 'especes', notes: '' });
      setItems([]);
      setItemDraft({ nom: '', montant: '' });
      setSuccess(`Facture créée (#${created?.id || created?.facture?.id || 'N/A'}) — HT: ${(created?.total_ht ?? total_ht)} €, TTC: ${(created?.total_ttc ?? total_ttc)} €`);
      fetchDemandes();
    } catch (e) {
      console.error('Erreur génération facture:', e);
      const apiMsg = e?.response?.data?.error || e?.message || 'Erreur lors de la génération de la facture';
      setError(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ModernPageTemplate title="Mes Demandes" icon={Build}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </ModernPageTemplate>
    );
  }

  return (
    <ModernPageTemplate title="Mes Demandes" icon={Build}>
      <Box>
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

        {/* Statistiques rapides */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  En attente
                </Typography>
                <Typography variant="h4">
                  {demandes.filter(d => d.statut === 'en_attente').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Acceptées
                </Typography>
                <Typography variant="h4">
                  {demandes.filter(d => d.statut === 'acceptee').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  En cours
                </Typography>
                <Typography variant="h4">
                  {demandes.filter(d => d.statut === 'en_cours').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Terminées
                </Typography>
                <Typography variant="h4">
                  {demandes.filter(d => d.statut === 'terminee').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Demandes de prestations
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Véhicule</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Date demande</TableCell>
                <TableCell>Date souhaitée</TableCell>
                <TableCell>Prix estimé</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {demandes.map((demande) => (
                <TableRow key={demande.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {demande.client_nom} {demande.client_prenom}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {demande.client_telephone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {demande.marque} {demande.modele}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {demande.immatriculation}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {demande.service_nom}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {demande.service_prix}€
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(demande.date_demande).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {demande.date_souhaitee ? new Date(demande.date_souhaitee).toLocaleDateString('fr-FR') : '-'}
                  </TableCell>
                  <TableCell>
                    {demande.prix_estime ? `${demande.prix_estime}€` : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatutLabel(demande.statut)}
                      color={getStatutColor(demande.statut)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {getStatutActions(demande)}
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedDemande(demande);
                          setDialogOpen(true);
                        }}
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => { setDemandeToDelete(demande); setDeleteDialogOpen(true); }}
                        color="error"
                        title="Supprimer la demande"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {demandes.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              Aucune demande de prestation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Les demandes de vos clients apparaîtront ici
            </Typography>
          </Box>
        )}

        {/* Dialog Terminer → Génération facture */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Terminer la demande et générer la facture</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Nom de la ligne (ex: Freins)"
                  value={itemDraft.nom}
                  onChange={(e) => setItemDraft({ ...itemDraft, nom: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Montant (€)"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={itemDraft.montant}
                  onChange={(e) => setItemDraft({ ...itemDraft, montant: e.target.value })}
                  sx={{ width: 180 }}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    const nom = String(itemDraft.nom || '').trim();
                    const montant = Number(itemDraft.montant);
                    if (!nom || !Number.isFinite(montant) || montant < 0) return;
                    setItems([...items, { nom, montant }]);
                    setItemDraft({ nom: '', montant: '' });
                  }}
                >Ajouter</Button>
              </Box>
              {items.length > 0 && (
                <Box>
                  <Typography variant="subtitle2">Lignes ajoutées:</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Montant (€)</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((it, idx) => (
                        <TableRow key={`it-${idx}`}>
                          <TableCell>{it.nom}</TableCell>
                          <TableCell align="right">{Number(it.montant).toFixed(2)}</TableCell>
                          <TableCell align="right">
                            <Button size="small" color="error" onClick={() => setItems(items.filter((_, i) => i !== idx))}>Supprimer</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
              <TextField
                label="Prix HT (€)"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                value={factureForm.prix_ht}
                onChange={(e) => setFactureForm({ ...factureForm, prix_ht: e.target.value })}
                fullWidth
              />
              <TextField
                label="TVA (%)"
                type="number"
                inputProps={{ min: 0, step: 1 }}
                value={factureForm.tva_percent}
                onChange={(e) => setFactureForm({ ...factureForm, tva_percent: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Mode de paiement</InputLabel>
                <Select
                  label="Mode de paiement"
                  value={factureForm.mode_paiement}
                  onChange={(e) => setFactureForm({ ...factureForm, mode_paiement: e.target.value })}
                >
                  <MenuItem value="especes">Espèces</MenuItem>
                  <MenuItem value="carte">Carte</MenuItem>
                  <MenuItem value="cheque">Chèque</MenuItem>
                  <MenuItem value="virement">Virement</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Notes"
                multiline
                minRows={3}
                value={factureForm.notes}
                onChange={(e) => setFactureForm({ ...factureForm, notes: e.target.value })}
                fullWidth
              />
              {(() => { const t = computeTotals(factureForm.prix_ht, factureForm.tva_percent); return (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">Total HT: <strong>{t.total_ht} €</strong></Typography>
                  <Typography variant="body2">Total TTC: <strong>{t.total_ttc} €</strong></Typography>
                </Box>
              ); })()}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button variant="contained" color="success" onClick={handleCreateFacture} disabled={!selectedDemande}>Générer la facture</Button>
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

export default GarageDemandesPage;
