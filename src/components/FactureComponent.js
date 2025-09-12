import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Grid
} from '@mui/material';
// Icônes supprimées sur la facture (pas de logos/icônes)

const FactureComponent = ({ facture, onPrint }) => {
  if (!facture) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Parser les lignes de pièces envoyées par l'API ("qte x nom @ prix")
  const parsedPieces = (() => {
    if (!facture.lignes_pieces) return [];
    return String(facture.lignes_pieces)
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => {
        const m = l.match(/^(\d+)\s*x\s*(.+)\s*@\s*([0-9]+[\.,]?[0-9]*)$/i);
        if (!m) return null;
        const qty = parseInt(m[1], 10) || 0;
        const name = m[2];
        const unit = parseFloat(String(m[3]).replace(',', '.')) || 0;
        return { qty, name, unit, total: qty * unit };
      })
      .filter(Boolean);
  })();

  // Lignes personnalisées encodées dans notes sous forme "1 x Nom @ Prix"
  const parsedCustomLines = (() => {
    const notes = String(facture.notes || '');
    const marker = 'LIGNES:';
    const pos = notes.indexOf(marker);
    if (pos === -1) return [];
    const block = notes.slice(pos + marker.length);
    return block
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => {
        const m = l.match(/^(\d+)\s*x\s*(.+)\s*@\s*([0-9]+[\.,]?[0-9]*)$/i);
        if (!m) return null;
        const qty = parseInt(m[1], 10) || 0;
        const name = m[2];
        const unit = parseFloat(String(m[3]).replace(',', '.')) || 0;
        return { qty, name, unit, total: qty * unit };
      })
      .filter(Boolean);
  })();

  // Totaux explicites envoyés par l'API (si disponibles)
  const hasExplicitTotals = facture.total_ht != null && facture.total_ht !== '';
  const explicitHT = hasExplicitTotals ? Number(facture.total_ht) : null;
  const explicitTTC = hasExplicitTotals ? Number(facture.total_ttc ?? (Number(facture.total_ht) * 1.2)) : null;

  // Tarification par défaut (fallback) si aucun total fourni
  const LABOR_UNIT_EUR = 30;
  const laborQty = parseFloat(facture.duree_heures || 1) || 1;
  const laborTotal = laborQty * LABOR_UNIT_EUR;
  const partsTotal = parsedPieces.reduce((sum, p) => sum + (p.total || 0), 0);
  const fallbackSubtotalHT = laborTotal + partsTotal;
  const fallbackTotalTTC = fallbackSubtotalHT * 1.2;

  const subtotalHT = hasExplicitTotals ? explicitHT : fallbackSubtotalHT;
  const totalTTC = hasExplicitTotals ? explicitTTC : fallbackTotalTTC;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 4, 
        maxWidth: 800, 
        mx: 'auto',
        backgroundColor: '#ffffff',
        border: '2px solid #111827'
      }}
    >
      {/* En-tête (sans logo ni icône) */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={6}>
            {/* Zone logo laissée vide */}
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Box>
              <Typography sx={{ fontSize: 28, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#111827', textAlign: 'center' }}>
                Garage
              </Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#111827', textAlign: 'center', mt: 1 }}>
                Facture
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', color: '#111827' }}>
                <Typography>N°</Typography>
                <Typography sx={{ fontWeight: 700 }}>{facture.numero}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#111827' }}>
                <Typography>Date</Typography>
                <Typography sx={{ fontWeight: 700 }}>{formatDate(facture.date_facture)}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 3, borderColor: '#111827' }} />

      {/* Informations client et véhicule (sans icônes) */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={6}>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            color: '#111827',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            Facturé à
          </Typography>
          <Box sx={{ 
            p: 2, 
            border: '1px solid #111827'
          }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {facture.client_nom}
            </Typography>
            {facture.client_email && (
              <Typography variant="body2" sx={{ color: '#666' }}>
                {facture.client_email}
              </Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            color: '#111827',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            Véhicule
          </Typography>
          <Box sx={{ 
            p: 2, 
            border: '1px solid #111827'
          }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {facture.marque} {facture.modele}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {facture.numero_immatriculation}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Détails de la facture (sans icône) */}
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold', 
        color: '#111827',
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        Détails des travaux
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #111827' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', borderRight: '1px solid #111827' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', borderRight: '1px solid #111827', width: 100 }}>Qté</TableCell>
              <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', borderRight: '1px solid #111827', width: 140 }}>Prix Unité</TableCell>
              <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', textAlign: 'right', width: 160 }}>Montant HT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hasExplicitTotals ? (
              parsedCustomLines.length > 0 ? (
                parsedCustomLines.map((p, idx) => (
                  <TableRow key={`custom-${idx}`}>
                    <TableCell sx={{ borderTop: '1px solid #111827', borderRight: '1px solid #111827' }}>
                      <Typography variant="body1">{p.name}</Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', borderTop: '1px solid #111827', borderRight: '1px solid #111827' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{p.qty}</Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', borderTop: '1px solid #111827', borderRight: '1px solid #111827' }}>
                      <Typography variant="body1">{formatCurrency(p.unit)}</Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', borderTop: '1px solid #111827' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{formatCurrency(p.total)}</Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell sx={{ borderTop: '1px solid #111827', borderRight: '1px solid #111827' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Montant saisi
                    </Typography>
                    {facture.description_travaux && (
                      <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                        {facture.description_travaux}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', borderTop: '1px solid #111827', borderRight: '1px solid #111827' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      1
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', borderTop: '1px solid #111827', borderRight: '1px solid #111827' }}>
                    <Typography variant="body1">
                      {formatCurrency(subtotalHT)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', borderTop: '1px solid #111827' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(subtotalHT)}
                    </Typography>
                  </TableCell>
                </TableRow>
              )
            ) : (
              <TableRow>
                <TableCell sx={{ borderTop: '1px solid #111827', borderRight: '1px solid #111827' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Main d'œuvre - Réparation véhicule
                  </Typography>
                  {facture.description_travaux && (
                    <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                      {facture.description_travaux}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ textAlign: 'center', borderTop: '1px solid #111827', borderRight: '1px solid #111827' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {facture.duree_heures || 1}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'center', borderTop: '1px solid #111827', borderRight: '1px solid #111827' }}>
                  <Typography variant="body1">
                    {formatCurrency(LABOR_UNIT_EUR)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'right', borderTop: '1px solid #111827' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(laborTotal)}
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!hasExplicitTotals && parsedPieces.map((p, idx) => (
              <TableRow key={`piece-${idx}`}>
                <TableCell sx={{ borderTop: '1px solid #111827', borderRight: '1px solid #111827' }}>
                  <Typography variant="body1">{p.name}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'center', borderTop: '1px solid #111827', borderRight: '1px solid #111827' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{p.qty}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'center', borderTop: '1px solid #111827', borderRight: '1px solid #111827' }}>
                  <Typography variant="body1">{formatCurrency(p.unit)}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'right', borderTop: '1px solid #111827' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{formatCurrency(p.total)}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Totaux */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ minWidth: 300 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Sous-total HT</TableCell>
                <TableCell sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                  {formatCurrency(subtotalHT)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>TVA (20%)</TableCell>
                <TableCell sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                  {formatCurrency(totalTTC - subtotalHT)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#111827' }}>
                  Total TTC
                </TableCell>
                <TableCell sx={{ 
                  textAlign: 'right', 
                  fontWeight: 'bold', 
                  fontSize: '1.1rem',
                  color: '#111827'
                }}>
                  {formatCurrency(totalTTC)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Box>

      {/* Statut de la facture */}
      <Box sx={{ mt: 4, p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
        <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
          Statut: <strong>{facture.statut}</strong> | 
          Facture générée automatiquement le {formatDate(facture.created_at)}
        </Typography>
      </Box>

      {/* Notes */}
      {facture.notes && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#fef3c7', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: '#92400e' }}>
            <strong>Notes:</strong> {facture.notes}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FactureComponent;


