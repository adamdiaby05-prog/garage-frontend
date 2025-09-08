import React, { useState } from 'react';
import {
  Box,
  Typography,
  Rating,
  Avatar,
  Chip,
  Collapse,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  Star, 
  ThumbUp, 
  ThumbDown,
  Add,
  Close
} from '@mui/icons-material';

const ProductReview = ({ produit, onReviewSubmit }) => {
  const [expanded, setExpanded] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    note: 5,
    commentaire: '',
    nom: '',
    email: ''
  });

  // Avis simulés pour démonstration
  const avis = [
    {
      id: 1,
      nom: 'Jean Dupont',
      note: 5,
      date: '2025-09-01',
      commentaire: 'Excellent produit, livraison rapide et qualité au rendez-vous !',
      utile: 12
    },
    {
      id: 2,
      nom: 'Marie Martin',
      note: 4,
      date: '2025-08-28',
      commentaire: 'Très satisfaite de ce produit, correspond parfaitement à mes attentes.',
      utile: 8
    },
    {
      id: 3,
      nom: 'Pierre Durand',
      note: 5,
      date: '2025-08-25',
      commentaire: 'Service client impeccable et produit de qualité. Je recommande !',
      utile: 15
    }
  ];

  const handleSubmitReview = () => {
    if (newReview.nom && newReview.commentaire) {
      const review = {
        id: Date.now(),
        ...newReview,
        date: new Date().toISOString().split('T')[0],
        utile: 0
      };
      
      if (onReviewSubmit) {
        onReviewSubmit(review);
      }
      
      setNewReview({
        note: 5,
        commentaire: '',
        nom: '',
        email: ''
      });
      setShowReviewForm(false);
    }
  };

  const averageRating = avis.reduce((acc, avis) => acc + avis.note, 0) / avis.length;
  const totalReviews = avis.length;

  return (
    <Box>
      {/* Résumé des notes */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Rating value={averageRating} precision={0.1} readOnly size="large" />
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
            {averageRating.toFixed(1)}
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          basé sur {totalReviews} avis
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => setShowReviewForm(true)}
          sx={{ ml: 'auto' }}
        >
          Laisser un avis
        </Button>
      </Box>

      {/* Répartition des notes */}
      <Box sx={{ mb: 3 }}>
        {[5, 4, 3, 2, 1].map((note) => {
          const count = avis.filter(a => a.note === note).length;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <Box key={note} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ minWidth: 40 }}>
                {note} <Star sx={{ fontSize: 16, color: '#fbbf24' }} />
              </Typography>
              <Box sx={{ flex: 1, mx: 2 }}>
                <Box
                  sx={{
                    height: 8,
                    backgroundColor: '#e5e7eb',
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${percentage}%`,
                      backgroundColor: '#fbbf24',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ minWidth: 40 }}>
                {count}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Bouton pour voir tous les avis */}
      <Button
        onClick={() => setExpanded(!expanded)}
        endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
        sx={{ mb: 2 }}
      >
        {expanded ? 'Masquer les avis' : `Voir tous les avis (${totalReviews})`}
      </Button>

      {/* Liste des avis */}
      <Collapse in={expanded}>
        <Box sx={{ space: 2 }}>
          {avis.map((avis) => (
            <Paper key={avis.id} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {avis.nom.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>
                      {avis.nom}
                    </Typography>
                    <Rating value={avis.note} readOnly size="small" />
                    <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                      {new Date(avis.date).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {avis.commentaire}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" sx={{ color: 'success.main' }}>
                      <ThumbUp fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" color="textSecondary">
                      {avis.utile} personnes ont trouvé cet avis utile
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </Collapse>

      {/* Formulaire d'ajout d'avis */}
      <Dialog open={showReviewForm} onClose={() => setShowReviewForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Laisser un avis</Typography>
            <IconButton onClick={() => setShowReviewForm(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Note globale
            </Typography>
            <Rating
              value={newReview.note}
              onChange={(event, newValue) => {
                setNewReview(prev => ({ ...prev, note: newValue }));
              }}
              size="large"
            />
          </Box>
          
          <TextField
            fullWidth
            label="Votre nom *"
            value={newReview.nom}
            onChange={(e) => setNewReview(prev => ({ ...prev, nom: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Email (optionnel)"
            type="email"
            value={newReview.email}
            onChange={(e) => setNewReview(prev => ({ ...prev, email: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Votre avis *"
            multiline
            rows={4}
            value={newReview.commentaire}
            onChange={(e) => setNewReview(prev => ({ ...prev, commentaire: e.target.value }))}
            placeholder="Partagez votre expérience avec ce produit..."
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowReviewForm(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={!newReview.nom || !newReview.commentaire}
          >
            Publier l'avis
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductReview;
