import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Stack,
  Chip,
  Avatar,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { 
  Download, 
  Error, 
  Schedule,
  InsertDriveFile,
  Image,
  VideoFile,
  AudioFile,
  PictureAsPdf,
  Description,
} from '@mui/icons-material';
import { filesAPI } from '../services/api';
import { useSnackbar } from '../contexts/SnackbarContext';

interface FileInfo {
  original_filename: string;
  file_size: number;
  mime_type: string;
  download_count: number;
  expires_at?: string;
}

const PublicDownloadPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (token) {
      loadFileInfo();
    }
  }, [token]);

  const loadFileInfo = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await filesAPI.getFileInfo(token);
      if (response.success && response.data) {
        setFileInfo(response.data as FileInfo);
      } else {
        setError('File not found or expired');
      }
    } catch (error) {
      setError('File not found or expired');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!token) return;
    
    try {
      setDownloading(true);
  
      const downloadUrl = filesAPI.getPublicDownloadUrl(token);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileInfo?.original_filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSnackbar('Download started', 'success');
    } catch (error) {
      showSnackbar('Failed to download file', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image sx={{ fontSize: 32, color: '#10b981' }} />;
    if (mimeType.startsWith('video/')) return <VideoFile sx={{ fontSize: 32, color: '#f59e0b' }} />;
    if (mimeType.startsWith('audio/')) return <AudioFile sx={{ fontSize: 32, color: '#8b5cf6' }} />;
    if (mimeType === 'application/pdf') return <PictureAsPdf sx={{ fontSize: 32, color: '#ef4444' }} />;
    if (mimeType.includes('text') || mimeType.includes('document')) return <Description sx={{ fontSize: 32, color: '#3b82f6' }} />;
    return <InsertDriveFile sx={{ fontSize: 32, color: '#64748b' }} />;
  };

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '#10b981';
    if (mimeType.startsWith('video/')) return '#f59e0b';
    if (mimeType.startsWith('audio/')) return '#8b5cf6';
    if (mimeType === 'application/pdf') return '#ef4444';
    if (mimeType.includes('text') || mimeType.includes('document')) return '#3b82f6';
    return '#64748b';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m left`;
    return `${diffMinutes}m left`;
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) <= new Date();
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error || !fileInfo) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}>
        <Container component="main" maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}
          >
            <Error sx={{ fontSize: 64, color: '#ef4444', mb: 3 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
              File Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              The file you're looking for has either expired or doesn't exist.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.href = '/'}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              }}
            >
              Go to Homepage
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  const expired = fileInfo.expires_at && isExpired(fileInfo.expires_at);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
      display: 'flex',
      alignItems: 'center',
      py: 4,
    }}>
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          }}
        >
          {/* Header */}
          <Box textAlign="center" sx={{ mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                background: `${getFileTypeColor(fileInfo.mime_type)}15`,
                border: `2px solid ${getFileTypeColor(fileInfo.mime_type)}30`,
                mx: 'auto',
                mb: 3,
              }}
            >
              {getFileIcon(fileInfo.mime_type)}
            </Avatar>
            
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                color: '#1e293b', 
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {fileInfo.original_filename}
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              {formatFileSize(fileInfo.file_size)} • Downloaded {fileInfo.download_count} times
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
              {!expired ? (
                <Chip
                  label="Available"
                  size="small"
                  sx={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    fontWeight: 600,
                  }}
                />
              ) : (
                <Chip
                  label="Expired"
                  size="small"
                  sx={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    fontWeight: 600,
                  }}
                />
              )}
              {fileInfo.expires_at && !expired && (
                <Chip
                  icon={<Schedule sx={{ fontSize: 16 }} />}
                  label={getTimeRemaining(fileInfo.expires_at)}
                  size="small"
                  sx={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>
          </Box>
          
          {/* Download Button */}
          <Box textAlign="center">
            {expired ? (
              <Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  This file has expired and is no longer available for download.
                </Typography>
                <Button 
                  variant="outlined"
                  onClick={() => window.location.href = '/'}
                  sx={{ px: 6, py: 2, borderRadius: 2 }}
                >
                  Go to Homepage
                </Button>
              </Box>
            ) : (
              <Button
                onClick={handleDownload}
                variant="contained"
                size="large"
                disabled={downloading}
                startIcon={downloading ? <CircularProgress size={20} /> : <Download />}
                sx={{ 
                  px: 8,
                  py: 3,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                  },
                  '&:disabled': {
                    background: '#cbd5e1',
                    transform: 'none',
                    boxShadow: 'none',
                  },
                }}
              >
                {downloading ? 'Downloading...' : 'Download File'}
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PublicDownloadPage;
