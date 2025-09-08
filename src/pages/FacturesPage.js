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
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem
} from '@mui/material';
import { Receipt, Visibility, Download, Search, FilterList, Delete } from '@mui/icons-material';
import { facturesAPI } from '../services/api';
import ModernPageTemplate from '../components/ModernPageTemplate';
import FactureComponent from '../components/FactureComponent';
import { useRef } from 'react';
import { renderToString } from 'react-dom/server';

const FacturesPage = () => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const printRef = useRef(null);
  const downloadRef = useRef(null);
  const printFrameRef = useRef(null);
  const [factureToDownload, setFactureToDownload] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchFactures = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await facturesAPI.getAll();
      setFactures(response.data || []);
    } catch (e) {
      console.error('Erreur lors du chargement des factures:', e);
      setError("Impossible de charger les factures. Vérifiez que le serveur est démarré.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const handleViewFacture = (facture) => {
    setSelectedFacture(facture);
    setViewDialogOpen(true);
  };

  const handlePrintFacture = () => {
    if (!selectedFacture || !printRef.current) return;
    const contentHtml = printRef.current.innerHTML;
    
    // Récupérer les styles actuels (MUI/emotion, feuilles CSS) pour un rendu identique
    const headStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join('');
    
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1200');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Facture ${selectedFacture.numero || ''}</title>
          ${headStyles}
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { padding: 24px; background: #fff; }
          </style>
        </head>
        <body>${contentHtml}</body>
      </html>`);
    printWindow.document.close();
    printWindow.focus();
    // Give the browser a tick to render before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const handleDownloadPdf = () => {
    if (!selectedFacture || !printRef.current) return;
    const iframe = printFrameRef.current;
    if (!iframe) return;
    const html = printRef.current.innerHTML;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    
    // Récupérer les styles actuels (MUI/emotion, feuilles CSS) pour un rendu identique
    const headStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join('');
    
    doc.open();
    doc.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Facture ${selectedFacture.numero || ''}</title>
          ${headStyles}
          <style>
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            body { padding: 24px; background: #fff; }
          </style>
        </head>
        <body>${html}</body>
      </html>`);
    doc.close();
    
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Impression iframe échouée:', e);
      }
    }, 150);
  };

  const handleDownloadPdfFor = (facture) => {
    if (!facture) return;
    setFactureToDownload(facture);
    // laisser React rendre le contenu caché avant d'imprimer
    setTimeout(() => {
      const container = downloadRef.current;
      const iframe = printFrameRef.current;
      if (!container || !iframe) return;
      const html = container.innerHTML;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      
      // Récupérer les styles actuels (MUI/emotion, feuilles CSS) pour un rendu identique
      const headStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((el) => el.outerHTML)
        .join('');
      
      doc.open();
      doc.write(`<!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Facture ${facture.numero || ''}</title>
            ${headStyles}
            <style>
              @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
              body { padding: 24px; background: #fff; }
            </style>
          </head>
          <body>${html}</body>
        </html>`);
      doc.close();
      
      // imprimer après un court délai pour laisser l'iframe charger
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error('Impression iframe échouée:', e);
        }
      }, 150);
    }, 50);
  };

  const handleDeleteFacture = async (facture) => {
    if (!facture) return;
    const id = facture.id || facture.id_facture;
    if (!id) {
      alert('ID de la facture introuvable');
      return;
    }
    const ok = window.confirm(`Supprimer définitivement la facture ${facture.numero || id} ?`);
    if (!ok) return;
    try {
      await facturesAPI.delete(id);
      setFactures(prev => prev.filter(f => (f.id || f.id_facture) !== id));
    } catch (e) {
      console.error('Erreur suppression facture:', e);
      alert(e?.response?.data?.error || e?.message || 'Erreur lors de la suppression');
    }
  };
  

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  // Filtrer les factures
  const filteredFactures = factures.filter(facture => {
    const matchesSearch = !searchTerm || 
      facture.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facture.client_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (facture.marque && facture.marque.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || facture.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculer les statistiques
  const stats = {
    total: factures.length,
    payees: factures.filter(f => f.statut === 'payee').length,
    enAttente: factures.filter(f => f.statut === 'envoyee').length,
    brouillons: factures.filter(f => f.statut === 'brouillon').length,
    totalMontant: factures.reduce((sum, f) => sum + parseFloat(f.total_ttc || 0), 0),
    montantPaye: factures
      .filter(f => f.statut === 'payee')
      .reduce((sum, f) => sum + parseFloat(f.total_ttc || 0), 0)
  };

  return (
    <ModernPageTemplate
      title="Gestion des Factures"
      subtitle="Suivi et gestion des factures clients"
      icon={Receipt}
      statCards={[
        { 
          title: 'Total Factures', 
          value: stats.total, 
          icon: <Receipt />, 
          gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)' 
        }
      ]}
      colorScheme="blue"
      onRefresh={fetchFactures}
    >
      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rechercher"
                placeholder="Numéro, client, véhicule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: '#666' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Statut"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                InputProps={{
                  startAdornment: <FilterList sx={{ mr: 1, color: '#666' }} />
                }}
              >
                <MenuItem value="">Tous les statuts</MenuItem>
                <MenuItem value="brouillon">Brouillon</MenuItem>
                <MenuItem value="envoyee">Envoyée</MenuItem>
                <MenuItem value="payee">Payée</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="textSecondary">
                {filteredFactures.length} facture(s) trouvée(s)
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredFactures.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Receipt sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              {factures.length === 0 ? 'Aucune facture trouvée' : 'Aucune facture ne correspond aux critères'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {factures.length === 0 
                ? 'Les factures apparaîtront ici une fois les réparations terminées.'
                : 'Essayez de modifier vos critères de recherche.'
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Numéro</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Client</strong></TableCell>
                <TableCell><strong>Véhicule</strong></TableCell>
                <TableCell><strong>Durée</strong></TableCell>
                <TableCell><strong>Montant TTC</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFactures.map((facture, idx) => (
                <TableRow key={facture.id || `facture-${idx}`} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {facture.numero}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(facture.date_facture)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {facture.client_nom}
                    </Typography>
                    {facture.client_email && (
                      <Typography variant="caption" color="textSecondary">
                        {facture.client_email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {facture.marque} {facture.modele}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {facture.numero_immatriculation}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {facture.duree_heures || 1}h
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(facture.total_ttc)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleViewFacture(facture)}
                        title="Voir la facture"
                      >
                        <Visibility />
                      </IconButton>
                      
                      <IconButton 
                        size="small" 
                        color="success" 
                        onClick={() => handleDownloadPdfFor(facture)}
                        title="Télécharger PDF"
                      >
                        <Download />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteFacture(facture)}
                        title="Supprimer facture"
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
      )}

      {/* Dialog pour voir la facture */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Facture {selectedFacture?.numero}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleDownloadPdf}
              >
                Télécharger PDF
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <div ref={printRef}>
            {selectedFacture && (
              <FactureComponent facture={selectedFacture} />
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
      {/* Iframe et conteneur cachés pour impression/téléchargement fiable sans popup */}
      <iframe ref={printFrameRef} title="print-frame" style={{ position: 'absolute', width: 0, height: 0, border: 0, left: -99999, top: 0 }} />
      <Box sx={{ position: 'absolute', left: -99999, top: 0, width: 0, height: 0, overflow: 'hidden' }}>
        <div ref={downloadRef}>
          {factureToDownload && (
            <FactureComponent facture={factureToDownload} />
          )}
        </div>
      </Box>
    </ModernPageTemplate>
  );
};

export default FacturesPage;