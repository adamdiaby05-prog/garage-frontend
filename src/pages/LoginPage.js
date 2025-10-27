import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Container,
  Checkbox,
  FormControlLabel,
  Grid
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Login, 
  Person, 
  Lock, 
  ArrowBack
} from '@mui/icons-material';
import { authAPI } from '../services/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [hoverKey, setHoverKey] = useState(null);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const containerRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Préparer les données pour l'API
      const loginData = {
        email: form.email,
        mot_de_passe: form.password // Convertir password en mot_de_passe
      };
      
      const { data } = await authAPI.login(loginData);
      try { console.log('🔐 Login OK → payload:', data); } catch {}
      // Normaliser le rôle à partir de la valeur backend et des attributs utilisateur
      const rawUser = data.user || {};
      const backendRole = ((rawUser.role || '') + '').toLowerCase();
      const normalizedRole =
        backendRole === 'garage'
          ? 'garage'
          : backendRole === 'mecanicien' && rawUser.garage_id
            ? 'garage'
            : backendRole || (rawUser.garage_id ? 'garage' : 'client');
      let user = { ...rawUser, role: normalizedRole };
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(user));
      try { console.log('💾 Stocké → token(length):', (data.token||'').length, 'user:', data.user); } catch {}
      // Notifier l'application qu'une authentification a eu lieu (pour recharger la sidebar)
      try {
        window.dispatchEvent(new CustomEvent('auth-changed'));
      } catch {}

      // Compléter les infos garage si manquantes
      try {
        if (user.role === 'garage' && !user.garage_id) {
          const me = await authAPI.me();
          const meUser = me?.data?.user || me?.data || {};
          if (meUser && (meUser.garage_id || meUser.garageId)) {
            user = { ...user, garage_id: meUser.garage_id || meUser.garageId };
            localStorage.setItem('user', JSON.stringify(user));
            try { window.dispatchEvent(new CustomEvent('auth-changed')); } catch {}
          }
        }
      } catch {}

      // Redirect: priority to previous requested route
      const from = location.state?.from || null;
      if (from) {
        navigate(from, { replace: true });
        return;
      }
      
      const role = user.role || 'client';
      try { console.log('🎭 Rôle après login:', role, '→ redirection...'); } catch {}
      // Redirection universelle
      navigate(`/dashboard/${role}`);
      try { console.log('➡️ Navigation effectuée'); } catch {}
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError('Identifiants invalides');
      } else if (status === 500) {
        setError('Connexion échouée');
      } else if (status === 400) {
        setError('Requête invalide');
      } else {
        setError('Connexion échouée');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        background: '#f8fafc'
      }}
    >
      {/* Section gauche - Image fixe */}
      <Box sx={{
        flex: 1,
        position: 'fixed',
        left: 0,
        top: 0,
        width: '50%',
        height: '100vh',
        display: { xs: 'none', lg: 'block' },
        overflow: 'hidden',
        zIndex: 1,
        transition: 'all 0.5s ease-in-out'
      }}>
        <img 
          src="/R.jpg" 
          alt="Promotion AutoSoft" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            animation: 'fadeIn 0.5s ease-in-out'
          }}
        />
      </Box>

      {/* Section droite - Formulaire de connexion scrollable */}
      <Box sx={{
        flex: 1,
        marginLeft: { lg: '50%' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        background: 'white',
        minHeight: '100vh',
        zIndex: 2,
        position: 'relative'
      }}>
        <Container maxWidth="sm" sx={{ 
          maxHeight: '80vh',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '4px',
            '&:hover': {
              background: '#a8a8a8'
            }
          }
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold', 
              color: '#1e40af',
              mb: 1
            }}>
              Connexion
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#64748b',
              fontSize: '1.1rem'
            }}>
              Bienvenue ! Connectez-vous à votre compte pour accéder à vos services.
          </Typography>
          </Box>

          {location.state?.registered && (
            <Alert severity="success" sx={{ 
              mb: 3, 
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: '#10b981'
              }
            }}>
              ✨ Inscription réussie. Vous pouvez maintenant vous connecter.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ 
              mb: 3, 
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: '#ef4444'
              }
            }}>
              ❌ {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setIsFocused({ ...isFocused, email: true })}
                  onBlur={() => setIsFocused({ ...isFocused, email: false })}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ 
                          color: isFocused.email ? '#3b82f6' : '#9ca3af'
                        }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': { 
                        borderColor: '#d1d5db'
                      },
                      '&:hover fieldset': { 
                        borderColor: '#9ca3af'
                      },
                      '&.Mui-focused fieldset': { 
                        borderColor: '#3b82f6',
                        borderWidth: 2
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Mot de passe"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setIsFocused({ ...isFocused, password: true })}
                  onBlur={() => setIsFocused({ ...isFocused, password: false })}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ 
                          color: isFocused.password ? '#3b82f6' : '#9ca3af'
                        }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ 
                            color: '#9ca3af',
                            '&:hover': {
                              background: 'transparent',
                              color: '#3b82f6'
                            }
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': { 
                        borderColor: '#d1d5db'
                      },
                      '&:hover fieldset': { 
                        borderColor: '#9ca3af'
                      },
                      '&.Mui-focused fieldset': { 
                        borderColor: '#3b82f6',
                        borderWidth: 2
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{
                        color: '#3b82f6',
                        '&.Mui-checked': {
                          color: '#3b82f6'
                        }
                      }}
                    />
                  }
                  label="Se souvenir de moi"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      color: '#6b7280',
                      fontSize: '0.9rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  fullWidth
                  onMouseEnter={() => setHoverKey('submit')}
                  onMouseLeave={() => setHoverKey(null)}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Login />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    background: '#3b82f6',
                    textTransform: 'none',
                    transform: hoverKey === 'submit' ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: hoverKey === 'submit' ? '0 10px 25px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(59, 130, 246, 0.3)',
                    '&:hover': {
                      background: '#2563eb'
                    }
                  }}
                >
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    component={Link}
                    to="/signup"
                    onMouseEnter={() => setHoverKey('signup')}
                    onMouseLeave={() => setHoverKey(null)}
                    startIcon={<ArrowBack />}
                    sx={{
                      color: '#6b7280',
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      '&:hover': {
                        color: '#3b82f6',
                        background: 'transparent'
                      }
                    }}
                  >
                    Pas de compte ? Créer un compte
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    component={Link}
                    to="/"
                    onMouseEnter={() => setHoverKey('home')}
                    onMouseLeave={() => setHoverKey(null)}
                    sx={{
                      color: '#6b7280',
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      '&:hover': {
                        color: '#3b82f6',
                        background: 'transparent'
                      }
                    }}
                  >
                    Retour à l'accueil
            </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Styles CSS pour les animations */}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Box>
  );
};

export default LoginPage;


