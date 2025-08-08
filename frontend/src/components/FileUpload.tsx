import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Stack,
  Chip,
} from '@mui/material';
import { 
  CloudUpload, 
  InsertDriveFile, 
  CheckCircle,
  Security,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { filesAPI } from '../services/api';
import { useSnackbar } from '../contexts/SnackbarContext';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const { showSnackbar } = useSnackbar();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showSnackbar('File too large (max 10MB)', 'error');
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadComplete(false);

    try {
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const response = await filesAPI.uploadFile(file);
      
      clearInterval(interval);
      setProgress(100);
      
      if (response.success) {
        setUploadComplete(true);
        showSnackbar('File uploaded successfully!', 'success');
        setTimeout(() => {
          onUploadSuccess();
          setUploadComplete(false);
        }, 1500);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error: any) {
      showSnackbar(error.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  }, [showSnackbar, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: uploading,
  });

  const formatFileSize = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Paper
      {...getRootProps()}
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        border: '2px dashed',
        borderColor: isDragActive ? '#667eea' : uploading ? '#10b981' : '#cbd5e1',
        borderRadius: 4,
        background: isDragActive 
          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
          : uploading 
          ? 'rgba(16, 185, 129, 0.05)'
          : 'rgba(248, 250, 252, 0.8)',
        cursor: uploading ? 'default' : 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: uploading ? '#10b981' : '#667eea',
          background: uploading 
            ? 'rgba(16, 185, 129, 0.05)'
            : 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
        },
      }}
    >
      <input {...getInputProps()} />
      
      {uploadComplete ? (
        <Box>
          <CheckCircle sx={{ fontSize: 64, color: '#10b981', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#10b981', mb: 1 }}>
            Upload Complete!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your file is ready to share
          </Typography>
        </Box>
      ) : uploading ? (
        <Box>
          <CloudUpload sx={{ 
            fontSize: 64, 
            color: '#10b981', 
            mb: 2,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 },
            },
          }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Uploading your file...
          </Typography>
          <Box sx={{ width: '100%', maxWidth: 300, mx: 'auto', mb: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                  borderRadius: 4,
                },
              }} 
            />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
            {progress}% complete
          </Typography>
        </Box>
      ) : (
        <Box>
          <CloudUpload sx={{ 
            fontSize: 64, 
            color: isDragActive ? '#667eea' : '#94a3b8', 
            mb: 3,
            transition: 'all 0.3s ease',
          }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
            {isDragActive ? 'Drop your file here' : 'Upload & Share'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
            {isDragActive 
              ? 'Release to upload your file securely'
              : 'Drag and drop a file here, or click to browse'
            }
          </Typography>
          
          {!isDragActive && (
            <Button 
              variant="contained" 
              size="large"
              startIcon={<InsertDriveFile />}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                mb: 4,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                },
              }}
            >
              Choose File
            </Button>
          )}

          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Chip
              icon={<Security sx={{ fontSize: 16 }} />}
              label="End-to-end encrypted"
              size="small"
              sx={{
                background: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea',
                fontWeight: 600,
              }}
            />
            <Chip
              label="Expires in 24h"
              size="small"
              sx={{
                background: 'rgba(245, 158, 11, 0.1)',
                color: '#f59e0b',
                fontWeight: 600,
              }}
            />
            <Chip
              label="Max 10MB"
              size="small"
              variant="outlined"
              sx={{
                borderColor: '#cbd5e1',
                color: '#64748b',
                fontWeight: 600,
              }}
            />
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default FileUpload;