import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
  Button,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Inventory,
  Warning
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { piecesAPI } from '../services/api';
import PieceForm from '../components/forms/PieceForm';
import ModernPageTemplate from '../components/ModernPageTemplate';
import { reparationsAPI } from '../services/api';

const PiecesPage = ({ readOnly = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('all');
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showPieceForm, setShowPieceForm] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [takeOpen, setTakeOpen] = useState(false);
  const [takeQty, setTakeQty] = useState('1');
  const [takeRepId, setTakeRepId] = useState('');
  const [repOptions, setRepOptions] = useState([]);
  const [taking, setTaking] = useState(false);

  // Charger les pièces
  useEffect(() => {
    fetchPieces();
  }, []);

  const fetchPieces = async () => {
    try {
      setLoading(true);
      const response = await piecesAPI.getAll();
      console.log('Réponse API pièces:', response);
      console.log('Données des pièces:', response.data);
      
      if (response.data && response.data.length > 0) {
        console.log('Première pièce:', response.data[0]);
        console.log('IDs des pièces:', response.data.map(p => ({ 
          id: p.id, 
          id_piece: p.id_piece, 
          nom_piece: p.nom_piece 
        })));
      }
      
      setPieces(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des pièces:', err);
      setError('Erreur lors du chargement des pièces');
    } finally {
      setLoading(false);
    }
  };

  // Charger réparations pour sélection (mode mécano uniquement)
  useEffect(() => {
    const loadReps = async () => {
      if (!readOnly) return;
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (u.role !== 'mecanicien') {
          // Ne pas appeler l'endpoint mécanicien pour les garages
          return;
        }
      } catch {}
      try {
        const res = await reparationsAPI.getMecanicienReparations();
        const data = res.data || [];
        setRepOptions(data.map(r => ({
          id: r.id_reparation || r.id,
          label: `${r.numero || `R-${r.id_reparation || r.id}`} - ${r.description_probleme || r.probleme || 'sans description'}`
        })));
      } catch (e) {
        console.warn('Impossible de charger les réparations pour sélection:', e);
      }
    };
    loadReps();
  }, [readOnly]);

  // Filtrer les pièces
  const filteredPieces = useMemo(() => pieces.filter(piece => {
    const matchesSearch = 
      piece.nom_piece?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      piece.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      piece.nom_fournisseur?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategorie = categorieFilter === 'all' || piece.description === categorieFilter;
    return matchesSearch && matchesCategorie;
  }), [pieces, searchTerm, categorieFilter]);

  // Gérer l'ajout d'une nouvelle pièce
  const handleAddPiece = () => {
    setSelectedPiece(null);
    setShowPieceForm(true);
  };

  // Ouvrir la prise de pièce (mécano)
  const handleTakePiece = (piece) => {
    setSelectedPiece(piece);
    setTakeQty('1');
    setTakeRepId('');
    setTakeOpen(true);
  };

  const confirmTakePiece = async () => {
    if (taking) return; // garde anti double-clic
    if (!selectedPiece) return;
    const repId = takeRepId;
    const qty = Math.max(1, parseInt(takeQty || '1', 10));
    const pieceId = selectedPiece.id_piece || selectedPiece.id;
    if (!repId || !pieceId) {
      setSnackbar({ open: true, message: 'Sélection réparation/pièce invalide', severity: 'error' });
      return;
    }
    try {
      setTaking(true);
      const token = localStorage.getItem('token');
      const nonce = `${pieceId}-${repId}-${qty}-${Date.now()}`;
      const resp = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/reparations/${repId}/pieces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ piece_id: pieceId, quantite: qty, client_request_id: nonce })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur serveur');
      }
      const data = await resp.json().catch(() => ({}));
      const remaining = typeof data.stock_after !== 'undefined' ? ` (stock restant: ${data.stock_after})` : '';
      setSnackbar({ open: true, message: `Pièce prise et ajoutée à la facture${remaining}`, severity: 'success' });
      setTakeOpen(false);
      setSelectedPiece(null);
      fetchPieces();
    } catch (e) {
      setSnackbar({ open: true, message: e.message, severity: 'error' });
    } finally {
      setTaking(false);
    }
  };

  // Gérer la modification d'une pièce
  const handleEditPiece = (piece) => {
    setSelectedPiece(piece);
    setShowPieceForm(true);
  };

  // Gérer la fermeture du formulaire
  const handleClosePieceForm = () => {
    setShowPieceForm(false);
    setSelectedPiece(null);
  };

  // Gérer le succès du formulaire
  const handlePieceFormSuccess = () => {
    fetchPieces();
    setSnackbar({ open: true, message: 'Pièce enregistrée avec succès', severity: 'success' });
  };

  // Gérer la suppression d'une pièce
  const handleDeletePiece = async (piece) => {
    const pieceId = piece.id_piece || piece.id;
    
    if (!pieceId) {
      setSnackbar({ 
        open: true, 
        message: 'Erreur: ID de pièce non trouvé', 
        severity: 'error' 
      });
      return;
    }

    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la pièce "${piece.nom_piece}" ?\n\n⚠️ Cette action est irréversible et supprimera définitivement la pièce de la base de données.`
    );

    if (confirmDelete) {
      try {
        console.log('Tentative de suppression de la pièce avec ID:', pieceId);
        
        const response = await piecesAPI.delete(pieceId);
        console.log('Réponse de suppression:', response);
        
        // Mise à jour de l'état local
        setPieces(prevPieces => 
          prevPieces.filter(p => (p.id_piece || p.id) !== pieceId)
        );
        
        setSnackbar({ 
          open: true, 
          message: `Pièce "${piece.nom_piece}" supprimée avec succès`, 
          severity: 'success' 
        });
      } catch (err) {
        console.error('Erreur détaillée lors de la suppression:', err);
        console.error('Code d\'erreur:', err.response?.status);
        console.error('Message d\'erreur:', err.response?.data);

        const status = err.response?.status;
        const apiMsg = err.response?.data?.error;
        const errorMessage = apiMsg
          || (status === 409 ? 'Impossible de supprimer: pièce utilisée dans des réparations'
              : status === 404 ? 'Pièce non trouvée dans la base de données'
              : status === 500 ? 'Erreur serveur lors de la suppression'
              : 'Erreur lors de la suppression');

        setSnackbar({ 
          open: true, 
          message: errorMessage, 
          severity: 'error',
          autoHideDuration: 8000
        });
      }
    }
  };

  // Gérer la fermeture du snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fonction d'exportation Excel pour les pièces
  const handleExport = () => {
    try {
      // Préparer les données pour l'export
      const exportData = pieces.map(piece => ({
        'ID': piece.id_piece || piece.id,
        'Nom': piece.nom || 'N/A',
        'Catégorie': piece.categorie || 'N/A',
        'Prix': piece.prix || 'N/A',
        'Stock': piece.stock || 'N/A',
        'Stock minimum': piece.stock_minimum || 'N/A',
        'Fournisseur': piece.nom_fournisseur || 'N/A',
        'Référence': piece.reference || 'N/A',
        'Description': piece.description || 'N/A'
      }));

      // Créer un nouveau classeur Excel
      const wb = XLSX.utils.book_new();
      
      // Créer une feuille de calcul avec les données
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Définir la largeur des colonnes
      const colWidths = [
        { wch: 8 },   // ID
        { wch: 25 },  // Nom
        { wch: 15 },  // Catégorie
        { wch: 12 },  // Prix
        { wch: 10 },  // Stock
        { wch: 12 },  // Stock minimum
        { wch: 20 },  // Fournisseur
        { wch: 15 },  // Référence
        { wch: 30 }   // Description
      ];
      ws['!cols'] = colWidths;
      
      // Ajouter la feuille au classeur
      XLSX.utils.book_append_sheet(wb, ws, 'Pièces');
      
      // Générer le fichier Excel
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Créer et télécharger le fichier
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `pieces_${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: `Export Excel réussi ! ${pieces.length} pièces exportées.`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'export des pièces.',
        severity: 'error'
      });
    }
  };

  const getStockColor = (quantite, seuil_alerte) => {
    if (quantite <= 0) return 'error';
    if (quantite <= seuil_alerte) return 'warning';
    return 'success';
  };

  const statCards = [
    {
      title: 'Total Pièces',
      value: pieces.length,
      icon: <Inventory />,
      color: '#1e40af',
      gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)',
      trend: '+3%',
      trendUp: true
    },
    {
      title: 'En stock',
      value: pieces.filter(p => parseInt(p.stock_actuel || 0) > 0).length,
      icon: <Inventory />,
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      trend: '+1%',
      trendUp: true
    },
    {
      title: 'Faible stock',
      value: pieces.filter(p => parseInt(p.stock_actuel || 0) > 0 && parseInt(p.stock_actuel || 0) <= parseInt(p.stock_minimum || 0)).length,
      icon: <Warning />,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #93c5fd)',
      trend: '+0%'
    }
  ];

  return (
    <ModernPageTemplate
      title="Gestion des Pièces"
      subtitle="Stocks et alertes"
      icon={Inventory}
      statCards={statCards}
      loading={loading}
      error={error}
      colorScheme={(() => {
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          return u.role === 'mecanicien' ? 'green' : 'blue';
        } catch { return 'blue'; }
      })()}
      onAdd={handleAddPiece}
      onRefresh={fetchPieces}
      onExport={handleExport}
      onFilter={() => {}}
    >
      {/* Barre d'outils */}
      <Paper sx={{ p: 2, mb: 3, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher une pièce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'rgba(255,255,255,0.8)' }} />
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Filtrer par catégorie</InputLabel>
            <Select
              value={categorieFilter}
              onChange={(e) => setCategorieFilter(e.target.value)}
              label="Filtrer par catégorie"
            >
              <MenuItem value="all">Toutes les catégories</MenuItem>
              <MenuItem value="moteur">Moteur</MenuItem>
              <MenuItem value="freinage">Freinage</MenuItem>
              <MenuItem value="suspension">Suspension</MenuItem>
              <MenuItem value="electricite">Électricité</MenuItem>
              <MenuItem value="carrosserie">Carrosserie</MenuItem>
              <MenuItem value="entretien">Entretien</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'rgba(255,255,255,0.1)' }}>
              <TableCell><strong>Référence</strong></TableCell>
              <TableCell><strong>Nom</strong></TableCell>
              <TableCell><strong>Catégorie</strong></TableCell>
              <TableCell><strong>Fournisseur</strong></TableCell>
              <TableCell><strong>Prix</strong></TableCell>
              <TableCell><strong>Stock</strong></TableCell>
              <TableCell><strong>Seuil d'alerte</strong></TableCell>
              {!readOnly && <TableCell><strong>Actions</strong></TableCell>}
              {readOnly && <TableCell><strong>Prendre</strong></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPieces.map((piece, index) => (
              <TableRow key={piece.id_piece || piece.id || `piece-${index}`} hover>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary">
                    {piece.reference}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {piece.nom_piece}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={piece.description || 'Non catégorisé'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{piece.nom_fournisseur || 'Aucun fournisseur'}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {parseFloat(piece.prix_unitaire || 0).toFixed(2)} €
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${parseInt(piece.stock_actuel || 0)} unités`}
                    color={getStockColor(parseInt(piece.stock_actuel || 0), parseInt(piece.stock_minimum || 0))}
                    size="small"
                    icon={parseInt(piece.stock_actuel || 0) <= parseInt(piece.stock_minimum || 0) ? <Warning /> : <Inventory />}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {parseInt(piece.stock_minimum || 0)} unités
                  </Typography>
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditPiece(piece)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeletePiece(piece)}
                        title="Supprimer la pièce"
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
                )}
                {readOnly && (
                  <TableCell>
                    <Button variant="contained" size="small" onClick={() => handleTakePiece(piece)} disabled={taking}>
                      Prendre pièce
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          {filteredPieces.length} pièce(s) trouvée(s)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={`En stock: ${pieces.filter(p => parseInt(p.stock_actuel || 0) > parseInt(p.stock_minimum || 0)).length}`}
            color="success"
            size="small"
          />
          <Chip 
            label={`Faible stock: ${pieces.filter(p => parseInt(p.stock_actuel || 0) > 0 && parseInt(p.stock_actuel || 0) <= parseInt(p.stock_minimum || 0)).length}`}
            color="warning"
            size="small"
          />
          <Chip 
            label={`Rupture: ${pieces.filter(p => parseInt(p.stock_actuel || 0) <= 0).length}`}
            color="error"
            size="small"
          />
        </Box>
      </Box>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Formulaire Pièce */}
      {!readOnly && (
        <PieceForm
          open={showPieceForm}
          onClose={handleClosePieceForm}
          onSuccess={handlePieceFormSuccess}
          piece={selectedPiece}
        />
      )}

      {/* Dialog Prendre pièce (mécano) */}
      {readOnly && (
        <Dialog open={takeOpen} onClose={() => setTakeOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Prendre une pièce</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Quantité"
                type="number"
                inputProps={{ min: 1 }}
                value={takeQty}
                onChange={(e) => setTakeQty(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Réparation</InputLabel>
                <Select value={takeRepId} label="Réparation" onChange={(e) => setTakeRepId(e.target.value)}>
                  {repOptions.map(opt => (
                    <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTakeOpen(false)} disabled={taking}>Annuler</Button>
            <Button variant="contained" onClick={confirmTakePiece} disabled={taking || !takeRepId}>Confirmer</Button>
          </DialogActions>
        </Dialog>
      )}
    </ModernPageTemplate>
  );
};

export default PiecesPage; 