import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
} from '@mui/material';
import {
  CloudUpload,
  Security,
  Devices,
  Share,
  Speed,
  VerifiedUser,
  OpenInNew,
  GitHub,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Security sx={{ fontSize: 32, color: '#667eea' }} />,
      title: 'Anonymous & Private',
      description: 'No tracking, no data collection. Your files, your privacy.',
      highlight: true,
    },
    {
      icon: <Speed sx={{ fontSize: 32, color: '#667eea' }} />,
      title: 'Lightning Fast',
      description: 'Direct transfers with optimized compression and delivery.',
    },
    {
      icon: <Devices sx={{ fontSize: 32, color: '#667eea' }} />,
      title: 'Cross-Platform',
      description: 'Seamlessly share between phones, tablets, and computers.',
    },
    {
      icon: <VerifiedUser sx={{ fontSize: 32, color: '#667eea' }} />,
      title: 'Self-Hostable',
      description: 'Deploy on your own infrastructure for complete control.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload',
      description: 'Drag & drop files or browse from any device',
    },
    {
      number: '02',
      title: 'Share',
      description: 'Get a secure, anonymous link instantly',
    },
    {
      number: '03',
      title: 'Transfer',
      description: 'Recipients download without registration',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
      <Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 12 }}>
          <Stack direction="row" justifyContent="center" sx={{ mb: 4 }}>
            <Chip
              icon={<Security sx={{ fontSize: 16 }} />}
              label="Privacy-First File Sharing"
              sx={{
                background: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea',
                fontWeight: 600,
                px: 2,
                py: 0.5,
              }}
            />
          </Stack>

          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 900,
              lineHeight: 1.1,
              mb: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            Share Files
            <br />
            <span style={{ fontSize: '0.8em', opacity: 0.8 }}>Anonymously</span>
          </Typography>

          <Typography 
            variant="h5" 
            sx={{ 
              mb: 6, 
              color: '#64748b',
              fontWeight: 400,
              lineHeight: 1.6,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Transfer files between devices without compromising your privacy. 
            No accounts required, no tracking, just secure file sharing.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center"
            sx={{ mb: 8 }}
          >
            {isAuthenticated ? (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/dashboard')}
                startIcon={<CloudUpload />}
                sx={{ 
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                  },
                }}
              >
                Open Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  startIcon={<CloudUpload />}
                  sx={{ 
                    px: 6,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                    },
                  }}
                >
                  Start Sharing
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                    borderColor: '#667eea',
                    color: '#667eea',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(102, 126, 234, 0.05)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  Sign In
                </Button>
              </>
            )}
          </Stack>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={4} 
            justifyContent="center"
            alignItems="center"
            sx={{ opacity: 0.7 }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Security sx={{ fontSize: 20, color: '#10b981' }} />
              <Typography variant="body2" fontWeight={600}>
                Zero-Knowledge Architecture
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <VerifiedUser sx={{ fontSize: 20, color: '#10b981' }} />
              <Typography variant="body2" fontWeight={600}>
                Open Source
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Speed sx={{ fontSize: 20, color: '#10b981' }} />
              <Typography variant="body2" fontWeight={600}>
                No Registration Required
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ mb: 12 }}>
          <Typography 
            variant="h3" 
            textAlign="center" 
            sx={{ 
              mb: 8, 
              fontWeight: 800,
              color: '#1e293b',
            }}
          >
            Built for Privacy & Simplicity
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    border: feature.highlight ? '2px solid #667eea' : '1px solid #e2e8f0',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    background: feature.highlight 
                      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                      : 'white',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                      borderColor: '#667eea',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ mb: 3 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1e293b' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: 12 }}>
          <Typography 
            variant="h3" 
            textAlign="center" 
            sx={{ 
              mb: 8, 
              fontWeight: 800,
              color: '#1e293b',
            }}
          >
            How It Works
          </Typography>
          <Grid container spacing={6} alignItems="center">
            {steps.map((step, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    {step.number}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#1e293b' }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Paper
          sx={{
            p: 8,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 800 }}>
              Take Full Control
            </Typography>
            <Typography variant="h6" sx={{ mb: 6, opacity: 0.9, lineHeight: 1.6, maxWidth: 600, mx: 'auto' }}>
              Deploy Anonlink on your own infrastructure. Complete privacy, 
              unlimited storage, and full customization.
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<GitHub />}
                href="https://github.com/yourusername/anonlink"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                View on GitHub
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<OpenInNew />}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.8)',
                    background: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Documentation
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage;