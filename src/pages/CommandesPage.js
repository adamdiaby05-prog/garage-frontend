import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Toolbar, TextField, InputAdornment, Button } from '@mui/material';
import { Search, Refresh, OpenInNew, WhatsApp, Delete } from '@mui/icons-material';

const statutColor = (statut) => {
  switch ((statut || '').toLowerCase()) {
    case 'nouveau': return 'info';
    case 'en préparation': return 'warning';
    case 'expédié': return 'primary';
    case 'livré': return 'success';
    case 'annulé': return 'error';
    default: return 'default';
  }
};

const CommandesPage = () => {
  const API_BASE = process.env.REACT_APP_API_BASE_URL || '/api';
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/commandes`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des commandes');
      }
      const data = await response.json();
      const normalizeImage = (val) => {
        if (!val) return '';
        const raw = String(val).trim();
        if (!raw) return '';
        // Si chemin local uploads → construire URL absolue backend
        if (raw.startsWith('/uploads/') || raw.startsWith('uploads/')) {
          const SERVER_BASE = (process.env.REACT_APP_API_BASE_URL || '/api').replace(/\/api\/?$/, '');
          return `${SERVER_BASE}/${raw.replace(/^\/?/, '')}`;
        }
        // Déjà une data URL complète
        if (raw.startsWith('data:image/')) return raw.replace(/\s+/g, '');
        // Si URL http(s)
        if (/^https?:\/\//i.test(raw)) return raw;
        // Si ça ressemble à du base64 sans préfixe
        const cleaned = raw.replace(/\s+/g, '');
        const base64Like = cleaned.length > 50 && /^[A-Za-z0-9+/=]+$/.test(cleaned.slice(0, 80));
        if (base64Like) return `data:image/png;base64,${cleaned}`;
        return '';
      };

      const normalized = (Array.isArray(data) ? data : []).map((r) => {
        const imgRaw = r.image_produit ?? r.produit?.image ?? null;
        const img = normalizeImage(imgRaw);
        return ({
          id: r.id ?? r.id_commande ?? r.id,
          produit: {
            nom: r.nom_produit ?? r.produit?.nom ?? '-',
            reference: r.reference_produit ?? r.produit?.reference ?? '-',
            prix: r.prix_produit ?? r.produit?.prix ?? 0,
            image: img,
          },
          quantite: r.quantite ?? r.quantity ?? 0,
          client: {
            nom: r.nom_client ?? r.client?.nom ?? '-',
            email: r.email_client ?? r.client?.email ?? '-',
            telephone: r.telephone_client ?? r.client?.telephone ?? '-',
            adresse: r.adresse_client ?? r.client?.adresse ?? '-',
          },
          position: {
            lat: r.latitude ?? r.position?.lat ?? null,
            lng: r.longitude ?? r.position?.lng ?? null,
          },
          date: r.date_commande ?? r.date ?? new Date().toISOString(),
          statut: r.statut ?? 'en_attente',
        });
      });
      setOrders(normalized);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(o => (
      o.produit?.nom?.toLowerCase().includes(q) ||
      o.client?.nom?.toLowerCase().includes(q) ||
      o.client?.email?.toLowerCase().includes(q) ||
      o.id?.toLowerCase().includes(q)
    ));
  }, [orders, search]);

  const handleDeleteOrder = async (order) => {
    try {
      const id = order?.id;
      if (!id) return;
      const ok = window.confirm(`Supprimer la commande ${id} ?`);
      if (!ok) return;
      const resp = await fetch(`${API_BASE}/commandes/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Suppression échouée');
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (e) {
      console.error('Suppression commande', e);
      alert('Impossible de supprimer cette commande.');
    }
  };

  const sendToWhatsApp = (order) => {
    const lat = Number(order.position?.lat).toFixed(6);
    const lng = Number(order.position?.lng).toFixed(6);
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    const googleMapsShortUrl = `maps.google.com/?q=${lat},${lng}`;
    
    const message = `🛒 *Commande ${order.id}*

📦 *Produit:* ${order.produit?.nom}
🔢 *Quantité:* ${order.quantite}
💰 *Prix unitaire:* ${order.produit?.prix}€
💵 *Total:* ${(order.produit?.prix * order.quantite).toFixed(2)}€

👤 *Client:*
• Nom: ${order.client?.nom}
• Email: ${order.client?.email}
• Téléphone: ${order.client?.telephone}
• Adresse: ${order.client?.adresse}

📍 *Position du client:*
${googleMapsUrl}

🗺️ *Coordonnées:* ${lat}, ${lng}

📅 *Date:* ${new Date(order.date).toLocaleString()}
📊 *Statut:* ${order.statut}

---
Message envoyé depuis AutoParts Elite`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendAllToWhatsApp = () => {
    if (filtered.length === 0) return;
    
    let message = `📋 *RÉCAPITULATIF DES COMMANDES*\n\n`;
    let totalAmount = 0;
    
    filtered.forEach((order, index) => {
      const orderTotal = (order.produit?.prix * order.quantite) || 0;
      totalAmount += orderTotal;
      const lat = Number(order.position?.lat).toFixed(6);
      const lng = Number(order.position?.lng).toFixed(6);
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      
      message += `${index + 1}. *${order.produit?.nom}* x${order.quantite}\n`;
      message += `   👤 ${order.client?.nom} (${order.client?.telephone})\n`;
      message += `   💰 ${orderTotal.toFixed(2)}€ - ${order.statut}\n`;
      message += `   📍 Position: ${googleMapsUrl}\n\n`;
    });
    
    message += `💰 *TOTAL GÉNÉRAL: ${totalAmount.toFixed(2)}€*\n`;
    message += `📊 *${filtered.length} commande(s) au total*\n\n`;
    message += `---
Message envoyé depuis AutoParts Elite`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Chargement des commandes...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" sx={{ mb: 2 }}>Erreur: {error}</Typography>
        <Button onClick={loadOrders} startIcon={<Refresh />}>Réessayer</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Toolbar disableGutters sx={{ mb: 2, gap: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Commandes ({orders.length})</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Rechercher (commande, client, email, produit)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />
          <IconButton onClick={loadOrders} title="Actualiser">
            <Refresh />
          </IconButton>
          {filtered.length > 0 && (
            <Button
              variant="contained"
              startIcon={<WhatsApp />}
              onClick={sendAllToWhatsApp}
              sx={{
                backgroundColor: '#25D366',
                '&:hover': {
                  backgroundColor: '#128C7E',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease',
                fontWeight: 'bold'
              }}
            >
              Envoyer tout sur WhatsApp
            </Button>
          )}
        </Box>
      </Toolbar>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Commande</TableCell>
              <TableCell>Produit</TableCell>
              <TableCell>Quantité</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(order => (
              <TableRow key={order.id} hover>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {order.produit?.image ? (
                      <Box
                        component="img"
                        src={order.produit.image}
                        alt={order.produit.nom}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
                      />
                    ) : null}
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{order.produit?.nom}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{order.produit?.reference}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{order.quantite}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{order.client?.nom}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{order.client?.email} · {order.client?.telephone}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {order.client?.adresse || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {order.position?.lat && order.position?.lng ? (
                    <Button size="small" endIcon={<OpenInNew />} onClick={() => window.open(`https://www.google.com/maps?q=${Number(order.position.lat)},${Number(order.position.lng)}`, '_blank')}>
                      {Number(order.position.lat).toFixed(4)},{Number(order.position.lng).toFixed(4)}
                    </Button>
                  ) : '-' }
                </TableCell>
                <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip label={order.statut || 'N/A'} color={statutColor(order.statut)} size="small" />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <IconButton
                      size="small"
                      onClick={() => sendToWhatsApp(order)}
                      sx={{
                        color: '#25D366',
                        '&:hover': {
                          backgroundColor: 'rgba(37, 211, 102, 0.1)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                      title="Envoyer sur WhatsApp"
                    >
                      <WhatsApp />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteOrder(order)}
                      title="Supprimer la commande"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  Aucune commande trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CommandesPage;


