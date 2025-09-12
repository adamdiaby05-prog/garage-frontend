import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  ToggleButtonGroup, 
  ToggleButton, 
  Alert,
  CircularProgress,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Container
} from '@mui/material';
import { 
  Security, 
  Build, 
  Person, 
  Email,
  Lock,
  ArrowBack,
  Visibility,
  VisibilityOff,
  CheckCircle
} from '@mui/icons-material';
import { authAPI } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const typeCompteMeta = {
  admin: { label: 'Administrateur', icon: <Security />, color: '#1e40af', description: 'Accès complet au système' },
  mecanicien: { label: 'Mécanicien', icon: <Build />, color: '#2563eb', description: 'Gestion des réparations et véhicules' },
  garage: { label: 'Garage', icon: <Build />, color: '#059669', description: 'Gestion des demandes de prestations' },
  client: { label: 'Client', icon: <Person />, color: '#3b82f6', description: 'Accès à la boutique et suivi des réparations' },
};

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    nom: '', 
    prenom: '', 
    email: '', 
    password: '', 
    role: 'client',
    // Champs spécifiques aux garages
    nom_garage: '',
    adresse: '',
    ville: '',
    code_postal: '',
    telephone_garage: '',
    siret: '',
    specialites: '',
    // Géolocalisation (UI uniquement)
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [hoverKey, setHoverKey] = useState(null);
  const [isFocused, setIsFocused] = useState({ nom: false, prenom: false, email: false, password: false });
  const containerRef = useRef(null);
  const [locating, setLocating] = useState(false);
  const [geolocError, setGeolocError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (_e, newRole) => {
    if (newRole) setForm((prev) => ({ ...prev, role: newRole }));
  };

  const handleLocate = async () => {
    try {
      setGeolocError('');
      setLocating(true);
      if (!('geolocation' in navigator)) {
        setGeolocError("La géolocalisation n'est pas supportée par ce navigateur.");
        setLocating(false);
        return;
      }

      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          // Précision max (5 décimales ~ 1.1m, 6 ~ 0.11m)
          const latStr = latitude.toFixed(6);
          const lonStr = longitude.toFixed(6);
          setForm((prev) => ({ ...prev, latitude: latStr, longitude: lonStr }));

          // Reverse geocoding précis via Nominatim (sans clé)
          try {
            const params = new URLSearchParams({
              format: 'jsonv2',
              lat: String(latitude),
              lon: String(longitude),
              addressdetails: '1',
              zoom: '18' // zoom élevé pour le numéro et la rue
            });
            const url = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
            const data = await res.json();
            const a = data?.address || {};

            // Construire une adresse précise: numéro + rue + quartier si dispo
            const houseNumber = a.house_number ? `${a.house_number} ` : '';
            const road = a.road || a.pedestrian || a.footway || a.residential || '';
            const neighbourhood = a.neighbourhood || a.suburb || a.hamlet || '';
            const constructedAdresse = [
              `${houseNumber}${road}`.trim(),
              neighbourhood
            ].filter(Boolean).join(', ');

            const ville = a.city || a.town || a.village || a.municipality || a.city_district || a.county || '';
            const codePostal = a.postcode || '';

            setForm((prev) => ({
              ...prev,
              // Adresse: si vide on propose la valeur détectée
              adresse: prev.adresse || constructedAdresse,
              // Ville et code postal: toujours mis à jour depuis la géolocalisation
              ville: ville,
              code_postal: codePostal
            }));
          } catch (_) {
            // silencieux: coordonnées restent disponibles
          }

          // Optionnel: journaliser la précision en console
          try { console.log(`📍 Localisé (${latStr}, ${lonStr}) ±${Math.round(accuracy)}m`); } catch {}

          resolve();
        }, (err) => {
          setGeolocError(err.message || 'Impossible de récupérer la position.');
          reject(err);
        }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
      });
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.register(form);

      // Auto-login après inscription et redirection selon type_compte/role
      try {
        const { data } = await authAPI.login({ email: form.email, password: form.password });
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
        try {
          if (user.role === 'garage' && !user.garage_id) {
            const me = await authAPI.me();
            const meUser = me?.data?.user || me?.data || {};
            if (meUser && (meUser.garage_id || meUser.garageId)) {
              user = { ...user, garage_id: meUser.garage_id || meUser.garageId };
              localStorage.setItem('user', JSON.stringify(user));
            }
          }
        } catch {}
        try { window.dispatchEvent(new CustomEvent('auth-changed')); } catch {}
        navigate(`/dashboard/${user.role}`);
      } catch (e2) {
        // Si l'auto-login échoue, retour à la connexion classique
        navigate('/login', { state: { registered: true } });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Inscription échouée');
    } finally {
      setLoading(false);
    }
  };

  const meta = typeCompteMeta[form.role];

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        background: '#f8fafc'
      }}
    >
      {/* Section gauche - Image dynamique selon le rôle */}
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
        {form.role === 'client' && (
          <img 
            src="/cl.jpg" 
            alt="Promotion Client" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              animation: 'fadeIn 0.5s ease-in-out'
            }}
          />
        )}
        
        {form.role === 'garage' && (
          <img 
            src="/ad.jpg" 
            alt="Promotion Garage" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              animation: 'fadeIn 0.5s ease-in-out'
            }}
          />
        )}
        
        {form.role === 'admin' && (
          <img 
            src="/admin.jpeg" 
            alt="Promotion Admin" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              animation: 'fadeIn 0.5s ease-in-out'
            }}
          />
        )}
      </Box>

      {/* Section droite - Formulaire scrollable */}
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
              Inscription
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#64748b',
              fontSize: '1.1rem'
            }}>
              Bienvenue ! Créez votre compte pour accéder à des services premium et des offres exclusives.
            </Typography>
          </Box>

          {/* Sélecteur de rôle */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              mb: 2, 
              color: '#374151',
              textAlign: 'center',
              fontWeight: 600
            }}>
              Choisissez votre rôle
            </Typography>
            <ToggleButtonGroup 
              exclusive 
              value={form.role} 
              onChange={handleRoleChange} 
              fullWidth 
              sx={{ 
                '& .MuiToggleButton-root': {
                  color: '#6b7280',
                  background: '#f9fafb',
                  border: '2px solid #e5e7eb',
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: '#f3f4f6',
                    borderColor: '#d1d5db'
                  },
                  '&.Mui-selected': {
                    background: '#3b82f6',
                    color: 'white',
                    borderColor: '#3b82f6',
                    '&:hover': {
                      background: '#2563eb'
                    }
                  }
                }
              }}
            >
              <ToggleButton value="admin">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security />
                  <span>Admin</span>
                </Box>
              </ToggleButton>
              <ToggleButton value="garage">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Build />
                  <span>Garage</span>
                </Box>
              </ToggleButton>
              <ToggleButton value="client">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person />
                  <span>Client</span>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {error && (
            <Alert severity="error" sx={{ 
              mb: 3, 
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: '#ef4444'
              }
            }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nom"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  onFocus={() => setIsFocused({ ...isFocused, nom: true })}
                  onBlur={() => setIsFocused({ ...isFocused, nom: false })}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ 
                          color: isFocused.nom ? '#3b82f6' : '#9ca3af'
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
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Prénom"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  onFocus={() => setIsFocused({ ...isFocused, prenom: true })}
                  onBlur={() => setIsFocused({ ...isFocused, prenom: false })}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ 
                          color: isFocused.prenom ? '#3b82f6' : '#9ca3af'
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
                        <Email sx={{ 
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
                        <Button
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ 
                            minWidth: 'auto', 
                            p: 1,
                            color: '#9ca3af',
                            '&:hover': {
                              background: 'transparent',
                              color: '#3b82f6'
                            }
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
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

              {/* Champs spécifiques aux garages */}
              {form.role === 'garage' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ color: '#059669', mb: 2 }}>
                      Informations du garage
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      onClick={handleLocate}
                      disabled={locating}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      {locating ? 'Localisation…' : '📍 Localiser ma position'}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {geolocError ? (
                      <Alert severity="warning">{geolocError}</Alert>
                    ) : null}
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Nom du garage *"
                      name="nom_garage"
                      value={form.nom_garage}
                      onChange={handleChange}
                      required
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': { borderColor: '#d1d5db' },
                          '&:hover fieldset': { borderColor: '#9ca3af' },
                          '&.Mui-focused fieldset': { borderColor: '#059669', borderWidth: 2 }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Adresse"
                      name="adresse"
                      value={form.adresse}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={2}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': { borderColor: '#d1d5db' },
                          '&:hover fieldset': { borderColor: '#9ca3af' },
                          '&.Mui-focused fieldset': { borderColor: '#059669', borderWidth: 2 }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Ville"
                      name="ville"
                      value={form.ville}
                      onChange={handleChange}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': { borderColor: '#d1d5db' },
                          '&:hover fieldset': { borderColor: '#9ca3af' },
                          '&.Mui-focused fieldset': { borderColor: '#059669', borderWidth: 2 }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Code postal"
                      name="code_postal"
                      value={form.code_postal}
                      onChange={handleChange}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': { borderColor: '#d1d5db' },
                          '&:hover fieldset': { borderColor: '#9ca3af' },
                          '&.Mui-focused fieldset': { borderColor: '#059669', borderWidth: 2 }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Latitude"
                      name="latitude"
                      value={form.latitude}
                      onChange={handleChange}
                      fullWidth
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Longitude"
                      name="longitude"
                      value={form.longitude}
                      onChange={handleChange}
                      fullWidth
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Téléphone du garage"
                      name="telephone_garage"
                      value={form.telephone_garage}
                      onChange={handleChange}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': { borderColor: '#d1d5db' },
                          '&:hover fieldset': { borderColor: '#9ca3af' },
                          '&.Mui-focused fieldset': { borderColor: '#059669', borderWidth: 2 }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="SIRET"
                      name="siret"
                      value={form.siret}
                      onChange={handleChange}
                      fullWidth
                      placeholder="14 chiffres"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': { borderColor: '#d1d5db' },
                          '&:hover fieldset': { borderColor: '#9ca3af' },
                          '&.Mui-focused fieldset': { borderColor: '#059669', borderWidth: 2 }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Spécialités / Services proposés"
                      name="specialites"
                      value={form.specialites}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Ex: Vidange, Révision, Diagnostic, Réparation moteur, Contrôle technique..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': { borderColor: '#d1d5db' },
                          '&:hover fieldset': { borderColor: '#9ca3af' },
                          '&.Mui-focused fieldset': { borderColor: '#059669', borderWidth: 2 }
                        }
                      }}
                    />
                  </Grid>
                </>
              )}

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
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
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
                  {loading ? 'Création en cours...' : 'Créer mon compte'}
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    component={Link}
                    to="/login"
                    onMouseEnter={() => setHoverKey('login')}
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
                    Déjà un compte ? Se connecter
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Styles CSS pour les animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Box>
  );
};

export default SignupPage;