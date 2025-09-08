import React, { useMemo, useState } from 'react';
import { Box, Container, TextField, IconButton, Paper, Typography, Stack, Chip, Avatar, Divider, CircularProgress, Button, Tooltip } from '@mui/material';
import { Send, SmartToy, Storage, Bolt, Language, Psychology } from '@mui/icons-material';
import { aiAPI } from '../services/api';

const AssistantIA = () => {
  const [messages, setMessages] = useState([{ role: 'assistant', content: "Bonjour 👋 Je suis l'assistant AutoGenius. Posez-moi une question sur vos clients, véhicules, réparations, factures, pièces, services ou rendez‑vous. Je chercherai dans la base de données et je répondrai en français." }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('local'); // 'local' ou 'web'

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    
    const userMessage = { role: 'user', content: trimmed, mode: searchMode };
    setMessages((m) => [...m, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      let response;
      if (searchMode === 'web') {
        // Recherche web via GPT avec timeout plus long
        console.log('🌐 Envoi de la question web:', trimmed);
        response = await aiAPI.webSearch(trimmed);
        console.log('✅ Réponse web reçue:', response);
      } else {
        // Recherche locale dans la base
        response = await aiAPI.chat(trimmed);
      }
      
      const reply = response?.data?.reply || 'Aucune réponse.';
      const mode = searchMode === 'web' ? 'web' : 'local';
      
      setMessages((m) => [...m, { 
        role: 'assistant', 
        content: reply, 
        mode: mode,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (e) {
      const errorMsg = searchMode === 'web' 
        ? "Désolé, le service de recherche web est indisponible pour le moment." 
        : "Désolé, le service IA est indisponible pour le moment.";
      setMessages((m) => [...m, { role: 'assistant', content: errorMsg, mode: searchMode }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0c1445 0%, #1e3a8a 25%, #1d4ed8 50%, #2563eb 75%, #0c1445 100%)' }}>
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Paper elevation={8} sx={{ p: 3, borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(16px)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar sx={{ bgcolor: '#1d4ed8' }}><SmartToy /></Avatar>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Assistant IA AutoGenius</Typography>
            
            {/* Boutons de sélection du mode */}
            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
              <Tooltip title="Recherche dans votre base de données locale">
                <Button
                  variant={searchMode === 'local' ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<Storage />}
                  onClick={() => setSearchMode('local')}
                  sx={{
                    bgcolor: searchMode === 'local' ? 'rgba(96,165,250,0.8)' : 'transparent',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': {
                      bgcolor: searchMode === 'local' ? 'rgba(96,165,250,0.9)' : 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Base locale
                </Button>
              </Tooltip>
              
              <Tooltip title="Recherche web via GPT (conseils techniques, diagnostics)">
                <Button
                  variant={searchMode === 'web' ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<Language />}
                  onClick={() => setSearchMode('web')}
                  sx={{
                    bgcolor: searchMode === 'web' ? 'rgba(34,197,94,0.8)' : 'transparent',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': {
                      bgcolor: searchMode === 'web' ? 'rgba(34,197,94,0.9)' : 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  🌐 GPT Web
                </Button>
              </Tooltip>
            </Stack>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 2 }} />

          <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1, mb: 2 }}>
            {messages.map((m, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', mb: 1.5 }}>
                <Box sx={{
                  p: 1.5,
                  borderRadius: 3,
                  maxWidth: '85%',
                  bgcolor: m.role === 'user' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  position: 'relative'
                }}>
                  {/* Indicateur de mode pour les messages de l'assistant */}
                  {m.role === 'assistant' && m.mode && (
                    <Chip
                      icon={m.mode === 'web' ? <Language /> : <Storage />}
                      label={m.mode === 'web' ? 'GPT Web' : 'Base locale'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        left: 8,
                        bgcolor: m.mode === 'web' ? 'rgba(34,197,94,0.8)' : 'rgba(96,165,250,0.8)',
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />
                  )}
                  
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: m.role === 'assistant' && m.mode ? 1.5 : 0 }}>
                    {m.content}
                  </Typography>
                  
                  {/* Timestamp pour les messages de l'assistant */}
                  {m.role === 'assistant' && m.timestamp && (
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255,255,255,0.6)', 
                      display: 'block', 
                      mt: 1, 
                      textAlign: 'right',
                      fontSize: '0.7rem'
                    }}>
                      {m.timestamp}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.8)' }}>
                <CircularProgress size={18} sx={{ color: searchMode === 'web' ? '#22c55e' : '#60a5fa' }} />
                <Typography variant="caption">
                  {searchMode === 'web' ? '🌐 Recherche web via GPT...' : '🗄️ Consultation de la base...'}
                </Typography>
              </Box>
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              placeholder={
                searchMode === 'web' 
                  ? "🌐 Question technique ou diagnostic (ex: moteur qui tousse à froid, diagnostic freins ABS...)"
                  : "🗄️ Question sur vos données (ex: quelles réparations en cours pour la Clio ?)"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              InputProps={{ sx: { color: 'white' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 3,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: searchMode === 'web' ? 'rgba(34,197,94,0.4)' : 'rgba(96,165,250,0.4)' },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              endIcon={<Send />}
              sx={{
                px: 2.5,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 700,
                letterSpacing: 0.3,
                bgcolor: '#0b0f0f',
                color: '#ffffff',
                border: '2px solid #22c55e',
                boxShadow: '0 6px 18px rgba(34,197,94,0.25)',
                '&:hover': {
                  bgcolor: '#22c55e',
                  color: '#0b0f0f',
                  borderColor: '#16a34a',
                  boxShadow: '0 10px 24px rgba(34,197,94,0.35)'
                },
                '& .MuiSvgIcon-root': {
                  color: 'inherit'
                }
              }}
            >
              Envoyer
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default AssistantIA;

