import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import { AccountCircle, Shield, CloudUpload } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/dashboard');
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        mb: 0,
      }}
    >
      <Toolbar sx={{ py: 2, px: { xs: 2, md: 4 } }}>
        <Box 
          display="flex" 
          alignItems="center" 
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <Shield sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography
            variant="h5"
            component="div"
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            Anonlink
          </Typography>
        </Box>

        <Chip
          icon={<Shield sx={{ fontSize: 16 }} />}
          label="Private & Secure"
          size="small"
          sx={{
            ml: 3,
            background: 'rgba(102, 126, 234, 0.1)',
            color: '#667eea',
            fontWeight: 600,
            display: { xs: 'none', md: 'flex' },
          }}
        />

        <Box sx={{ flexGrow: 1 }} />

        {isAuthenticated ? (
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              onClick={() => navigate('/dashboard')}
              sx={{
                color: '#333',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.08)',
                },
              }}
            >
              Dashboard
            </Button>
            <IconButton
              size="large"
              onClick={handleMenu}
              sx={{
                background: 'rgba(102, 126, 234, 0.1)',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.2)',
                },
              }}
            >
              <AccountCircle sx={{ color: '#667eea' }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                },
              }}
            >
              <MenuItem onClick={handleProfile} sx={{ px: 3, py: 1.5 }}>
                Dashboard ({user?.username})
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ px: 3, py: 1.5 }}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" gap={2}>
            <Button 
              onClick={() => navigate('/login')}
              sx={{
                color: '#333',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.08)',
                },
              }}
            >
              Sign In
            </Button>
            <Button 
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{
                px: 4,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                },
              }}
            >
              Get Started
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;