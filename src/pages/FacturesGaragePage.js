import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableBody, TableRow, TableCell, Chip, CircularProgress, Alert } from '@mui/material';
import { facturesGarageAPI } from '../services/api';

const FacturesGaragePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [factures, setFactures] = useState([]);

  useEffect(() => {
    const fetchFactures = async () => {
      try {
        setLoading(true);
        setError('');
        let user = {};
        try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}
        const garageId = user?.garage_id;
        if (!garageId) {
          setError('Garage non identifié');
          setLoading(false);
          return;
        }
        const data = await facturesGarageAPI.getByGarage(garageId);
        setFactures(Array.isArray(data) ? data : (data?.value || []));
      } catch (e) {
        console.error('Erreur chargement factures garage:', e);
        setError('Erreur lors du chargement des factures');
      } finally {
        setLoading(false);
      }
    };
    fetchFactures();
  }, []);

  if (loading) {
    return <Box sx={{ p: 3, display:'flex', justifyContent:'center' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Mes factures (garage)</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Total HT</TableCell>
              <TableCell align="right">Total TTC</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {factures.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.id}</TableCell>
                <TableCell>{f.client_nom} {f.client_prenom}</TableCell>
                <TableCell>{new Date(f.date_creation || f.created_at).toLocaleString('fr-FR')}</TableCell>
                <TableCell align="right">{Number(f.total_ht ?? 0).toFixed(2)} €</TableCell>
                <TableCell align="right">{Number(f.total_ttc ?? 0).toFixed(2)} €</TableCell>
                <TableCell>
                  <Chip size="small" label={f.statut || 'brouillon'} color={(f.statut === 'payee' || f.statut === 'payée') ? 'success' : 'default'} />
                </TableCell>
              </TableRow>
            ))}
            {factures.length === 0 && (
              <TableRow><TableCell colSpan={6}><Typography color="text.secondary">Aucune facture</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default FacturesGaragePage;


