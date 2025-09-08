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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Receipt, Visibility, Download } from '@mui/icons-material';
import { facturesAPI } from '../services/api';
import ModernPageTemplate from '../components/ModernPageTemplate';
import FactureComponent from '../components/FactureComponent';
import { useRef } from 'react';

const MesFacturesPage = () => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const printRef = useRef(null);
  const printFrameRef = useRef(null);

  // Récupérer l'ID du client depuis le localStorage
  const getClientId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      // Certains profils stockent l'ID client sous des clés différentes
      return user.id_client || user.client_id || user.id || user.idClient || user.clientId || 1;
    } catch {
      return 1; // Fallback pour les tests
    }
  };

  const fetchFactures = async () => {
    try {
      setLoading(true);
      setError('');
      const clientId = getClientId();
      let response = await facturesAPI.getByClient(clientId);
      let data = response.data || [];
      if (!Array.isArray(data)) data = [];
      if (data.length === 0) {
        // Fallback: récupérer toutes les factures et filtrer côté client
        try {
          const all = await facturesAPI.getAll();
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const possibleIds = [user.id_client, user.client_id, user.id, user.idClient, user.clientId].filter(Boolean);
          const possibleEmails = [user.email, user.client_email].filter(Boolean);
          const allData = Array.isArray(all.data) ? all.data : [];
          const filtered = allData.filter((f) => {
            const byId = possibleIds.includes(f.client_id);
            const byEmail = possibleEmails.includes(f.client_email);
            return byId || byEmail;
          });
          data = filtered.length > 0 ? filtered : allData; // si encore vide, montrer tout (debug)
        } catch (e) {
          console.warn('Fallback factures getAll échoué:', e?.message);
        }
      }
      setFactures(data);
    } catch (e) {
      console.error('Erreur lors du chargement des factures:', e);
      setError("Impossible de charger vos factures. Vérifiez que le serveur est démarré.");
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

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'brouillon': return 'default';
      case 'envoyee': return 'info';
      case 'payee': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'brouillon': return 'Brouillon';
      case 'envoyee': return 'Envoyée';
      case 'payee': return 'Payée';
      default: return statut;
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

  // Calculer les statistiques
  const stats = {
    total: factures.length,
    payees: factures.filter(f => f.statut === 'payee').length,
    enAttente: factures.filter(f => f.statut === 'envoyee').length,
    totalMontant: factures.reduce((sum, f) => sum + parseFloat(f.total_ttc || 0), 0)
  };

  return (
    <ModernPageTemplate
      title="Mes Factures"
      subtitle="Historique de vos factures"
      icon={Receipt}
      statCards={[
        { 
          title: 'Total Factures', 
          value: stats.total, 
          icon: <Receipt />, 
          gradient: 'linear-gradient(135deg, #7c2d12, #ea580c)' 
        },
        { 
          title: 'Total Montant', 
          value: formatCurrency(stats.totalMontant), 
          icon: <Receipt />, 
          gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)' 
        }
      ]}
      colorScheme="orange"
      onRefresh={fetchFactures}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : factures.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Receipt sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Aucune facture trouvée
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Vos factures apparaîtront ici une fois vos réparations terminées.
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
                <TableCell><strong>Véhicule</strong></TableCell>
                <TableCell><strong>Durée</strong></TableCell>
                <TableCell><strong>Montant TTC</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {factures.map((facture, idx) => (
                <TableRow key={facture.id || `facture-${idx}`} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {facture.numero}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(facture.date_facture)}</TableCell>
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
      {/* Iframe caché pour impression/téléchargement fiable */}
      <iframe ref={printFrameRef} title="print-frame" style={{ position: 'absolute', width: 0, height: 0, border: 0, left: -99999, top: 0 }} />
    </ModernPageTemplate>
  );
};

export default MesFacturesPage;
