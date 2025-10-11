import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Toolbar, TextField, InputAdornment, Button, Badge } from '@mui/material';
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
  const [particles, setParticles] = useState([]);

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
        if (raw.startsWith('/uploads/') || raw.startsWith('uploads/')) {
          const SERVER_BASE = (process.env.REACT_APP_API_BASE_URL || '/api').replace(/\/api\/?$/, '');
          return `${SERVER_BASE}/${raw.replace(/^\/?/, '')}`;
        }
        if (raw.startsWith('data:image/')) return raw.replace(/\s+/g, '');
        if (/^https?:\/\//i.test(raw)) return raw;
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

  // Particules de fond (thème admin vert)
  useEffect(() => {
    const p = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 2 + 0.5,
      color: ['#059669', '#10b981', '#34d399', '#6ee7b7'][Math.floor(Math.random() * 4)],
      opacity: Math.random() * 0.6 + 0.2
    }));
    setParticles(p);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setParticles(prev => prev.map(pt => ({
        ...pt,
        y: (pt.y - pt.speed * 0.06 + 105) % 105,
        opacity: 0.3 + Math.sin(Date.now() * 0.002 + pt.id) * 0.25
      })));
    }, 80);
    return () => clearInterval(id);
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
    const message = `🛒 *Commande ${order.id}*\n\n📦 *Produit:* ${order.produit?.nom}\n🔢 *Quantité:* ${order.quantite}\n💰 *Prix unitaire:* ${order.produit?.prix}€\n💵 *Total:* ${(order.produit?.prix * order.quantite).toFixed(2)}€\n\n👤 *Client:*\n• Nom: ${order.client?.nom}\n• Email: ${order.client?.email}\n• Téléphone: ${order.client?.telephone}\n• Adresse: ${order.client?.adresse}\n\n📍 *Position du client:*\n${googleMapsUrl}\n\n📅 *Date:* ${new Date(order.date).toLocaleString()}\n📊 *Statut:* ${order.statut}`;
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
    message += `📊 *${filtered.length} commande(s) au total*`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f172a 50%, #1e293b 75%, #0a0a0a 100%)' }}>
        <Typography sx={{ color: 'white' }}>Chargement des commandes...</Typography>
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
    <Box sx={{ p: 0, minHeight: '100vh', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f172a 50%, #1e293b 75%, #0a0a0a 100%)' }}>
      {particles.map(pt => (
        <Box key={pt.id} sx={{ position: 'absolute', left: `${pt.x}%`, top: `${pt.y}%`, width: pt.size, height: pt.size, backgroundColor: pt.color, borderRadius: '50%', opacity: pt.opacity, filter: 'blur(0.8px)', boxShadow: `0 0 ${pt.size * 2}px ${pt.color}`, zIndex: 1, pointerEvents: 'none' }} />
      ))}

      <Box sx={{ position: 'relative', zIndex: 2, p: 3 }}>
        <Toolbar disableGutters sx={{ mb: 2, gap: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Commandes</Typography>
            <Badge badgeContent={orders.length} sx={{ '& .MuiBadge-badge': { background: '#10b981', color: '#0b0f0f', fontWeight: 'bold' } }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Rechercher (commande, client, email, produit)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: 'rgba(255,255,255,0.8)' }} /></InputAdornment> }}
              sx={{
                minWidth: 340,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
                  '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: 2 }
                }
              }}
            />
            <IconButton onClick={loadOrders} title="Actualiser" sx={{ color: 'white', background: 'rgba(255,255,255,0.08)', '&:hover': { background: 'rgba(255,255,255,0.18)' } }}>
              <Refresh />
            </IconButton>
            {filtered.length > 0 && (
              <Button
                variant="contained"
                startIcon={<WhatsApp />}
                onClick={sendAllToWhatsApp}
                sx={{
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  color: '#0b0f0f',
                  fontWeight: 'bold',
                  '&:hover': { filter: 'brightness(1.05)', transform: 'translateY(-1px)' },
                  boxShadow: '0 8px 24px rgba(16,185,129,0.25)'
                }}
              >
                Envoyer tout sur WhatsApp
              </Button>
            )}
          </Box>
        </Toolbar>

        <TableContainer component={Paper} sx={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'rgba(255,255,255,0.06)' }}>
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
                <TableRow key={order.id} hover sx={{ '&:hover': { background: 'rgba(255,255,255,0.04)' }, transition: 'background 0.2s ease' }}>
                  <TableCell>
                    <Chip label={`#${order.id}`} size="small" sx={{ background: 'rgba(16,185,129,0.18)', color: '#10b981', border: '1px solid #10b981', fontWeight: 'bold' }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {order.produit?.image ? (
                        <Box
                          component="img"
                          src={order.produit.image}
                          alt={order.produit.nom}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          sx={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 1, boxShadow: '0 6px 14px rgba(0,0,0,0.3)' }}
                        />
                      ) : null}
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{order.produit?.nom}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{order.produit?.reference}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={`x${order.quantite}`} size="small" sx={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }} />
                  </TableCell>
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
                      <Button size="small" endIcon={<OpenInNew />} onClick={() => window.open(`https://www.google.com/maps?q=${Number(order.position.lat)},${Number(order.position.lng)}`, '_blank')} sx={{ color: '#10b981' }}>
                        {Number(order.position.lat).toFixed(4)},{Number(order.position.lng).toFixed(4)}
                      </Button>
                    ) : '-' }
                  </TableCell>
                  <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={order.statut || 'N/A'} color={statutColor(order.statut)} size="small" sx={{ fontWeight: 'bold' }} />
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

      <style>{`@keyframes float { 0% { transform: translateY(0px); } 100% { transform: translateY(-10px); } }`}</style>
    </Box>
  );
};

export default CommandesPage;


