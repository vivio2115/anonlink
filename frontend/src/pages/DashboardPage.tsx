import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  CircularProgress,
  Grid,
  Stack,
  Chip,
} from '@mui/material';
import { 
  CloudUpload, 
  Storage, 
  Download,
  TrendingUp,
  Security,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import { FileItem, filesAPI } from '../services/api';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await filesAPI.getUserFiles();
      if (response.success && response.data) {
        setFiles(response.data);
      } else {
        throw new Error(response.error || 'Failed to load files');
      }
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to load files', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleUploadSuccess = () => {
    loadFiles();
  };

  const handleFileDeleted = () => {
    loadFiles();
  };

  const totalFiles = files.length;
  const totalSize = files.reduce((sum, file) => sum + file.file_size, 0);
  const totalDownloads = files.reduce((sum, file) => sum + file.download_count, 0);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stats = [
    {
      icon: <CloudUpload sx={{ fontSize: 32, color: '#667eea' }} />,
      label: 'Files Uploaded',
      value: totalFiles.toString(),
      color: '#667eea',
    },
    {
      icon: <Storage sx={{ fontSize: 32, color: '#10b981' }} />,
      label: 'Storage Used',
      value: formatFileSize(totalSize),
      color: '#10b981',
    },
    {
      icon: <Download sx={{ fontSize: 32, color: '#f59e0b' }} />,
      label: 'Total Downloads',
      value: totalDownloads.toString(),
      color: '#f59e0b',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 32, color: '#8b5cf6' }} />,
      label: 'Avg. Downloads',
      value: totalFiles > 0 ? (totalDownloads / totalFiles).toFixed(1) : '0',
      color: '#8b5cf6',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 6 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b' }}>
              Dashboard
            </Typography>
            <Chip
              icon={<Security sx={{ fontSize: 16 }} />}
              label="Secure"
              sx={{
                background: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea',
                fontWeight: 600,
              }}
            />
          </Stack>
          <Typography variant="h6" color="text.secondary">
            Welcome back, {user?.username}! Manage your files securely.
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    borderColor: stat.color,
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      background: `${stat.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Upload Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#1e293b' }}>
            Upload New File
          </Typography>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </Box>

        <Divider sx={{ my: 6, borderColor: '#e2e8f0' }} />

        {/* Files Section */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Your Files
            </Typography>
            <Chip
              label={`${totalFiles} files`}
              sx={{
                background: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea',
                fontWeight: 600,
                px: 2,
              }}
            />
          </Stack>
          
          {loading ? (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center"
              py={8}
              sx={{
                background: 'rgba(248, 250, 252, 0.5)',
                borderRadius: 4,
                border: '1px dashed #cbd5e1',
              }}
            >
              <Stack alignItems="center" spacing={2}>
                <CircularProgress sx={{ color: '#667eea' }} />
                <Typography color="text.secondary" fontWeight={600}>
                  Loading your files...
                </Typography>
              </Stack>
            </Box>
          ) : (
            <FileList files={files} onFileDeleted={handleFileDeleted} />
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardPage;