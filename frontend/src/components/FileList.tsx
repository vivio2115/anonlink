import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Avatar,
} from '@mui/material';
import {
  MoreVert,
  Download,
  Delete,
  Share,
  FileCopy,
  InsertDriveFile,
  Image,
  VideoFile,
  AudioFile,
  PictureAsPdf,
  Description,
  Schedule,
} from '@mui/icons-material';
import { FileItem, filesAPI } from '../services/api';
import { useSnackbar } from '../contexts/SnackbarContext';

interface FileListProps {
  files: FileItem[];
  onFileDeleted: () => void;
}

const FileList: React.FC<FileListProps> = ({ files, onFileDeleted }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, file: FileItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFile(null);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image sx={{ fontSize: 24, color: '#10b981' }} />;
    if (mimeType.startsWith('video/')) return <VideoFile sx={{ fontSize: 24, color: '#f59e0b' }} />;
    if (mimeType.startsWith('audio/')) return <AudioFile sx={{ fontSize: 24, color: '#8b5cf6' }} />;
    if (mimeType === 'application/pdf') return <PictureAsPdf sx={{ fontSize: 24, color: '#ef4444' }} />;
    if (mimeType.includes('text') || mimeType.includes('document')) return <Description sx={{ fontSize: 24, color: '#3b82f6' }} />;
    return <InsertDriveFile sx={{ fontSize: 24, color: '#64748b' }} />;
  };

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '#10b981';
    if (mimeType.startsWith('video/')) return '#f59e0b';
    if (mimeType.startsWith('audio/')) return '#8b5cf6';
    if (mimeType === 'application/pdf') return '#ef4444';
    if (mimeType.includes('text') || mimeType.includes('document')) return '#3b82f6';
    return '#64748b';
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await filesAPI.downloadFile(file.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = file.original_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSnackbar('Download started', 'success');
    } catch (error) {
      showSnackbar('Failed to download file', 'error');
    }
    handleMenuClose();
  };

  const handleShare = async (file: FileItem) => {
    setSelectedFile(file);
    setShareDialogOpen(true);
    handleMenuClose();
    
    try {
      const response = await filesAPI.regenerateShareLink(file.id);
      if (response.success && response.data) {
        setSelectedFile(response.data);
        showSnackbar('New share link generated!', 'success');
      }
    } catch (error: any) {
      console.error('Failed to generate new link:', error);
    }
  };

  const handleDelete = (file: FileItem) => {
    setSelectedFile(file);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (!selectedFile) return;

    try {
      const response = await filesAPI.deleteFile(selectedFile.id);
      if (response.success) {
        showSnackbar('File deleted successfully', 'success');
        onFileDeleted();
      } else {
        throw new Error(response.error || 'Delete failed');
      }
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to delete file', 'error');
    }
    setDeleteDialogOpen(false);
    setSelectedFile(null);
  };

  const copyShareLink = () => {
    if (!selectedFile) return;
    
    const shareLink = `${window.location.protocol}//${window.location.host}/download/${selectedFile.download_token}`;
    navigator.clipboard.writeText(shareLink);
    showSnackbar('Share link copied to clipboard!', 'success');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (files.length === 0) {
    return (
      <Box 
        textAlign="center" 
        py={8}
        sx={{
          background: 'rgba(248, 250, 252, 0.5)',
          borderRadius: 4,
          border: '1px dashed #cbd5e1',
        }}
      >
        <InsertDriveFile sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          No files uploaded yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload your first file using the area above
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {files.map((file) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={file.id}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  borderColor: '#667eea',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: `${getFileTypeColor(file.mime_type)}15`,
                      border: `2px solid ${getFileTypeColor(file.mime_type)}30`,
                    }}
                  >
                    {getFileIcon(file.mime_type)}
                  </Avatar>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, file)}
                    sx={{
                      color: '#64748b',
                      '&:hover': {
                        background: 'rgba(102, 126, 234, 0.1)',
                        color: '#667eea',
                      },
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 1,
                    fontWeight: 600,
                    color: '#1e293b',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {file.original_filename}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {formatFileSize(file.file_size)} • {formatDate(file.created_at)}
                  {file.expires_at && (
                    <>
                      <br />
                      <Box component="span" sx={{ 
                        color: isExpired(file.expires_at) ? '#ef4444' : '#f59e0b',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mt: 0.5
                      }}>
                        <Schedule sx={{ fontSize: 14 }} />
                        {isExpired(file.expires_at) ? 'Expired' : getTimeRemaining(file.expires_at)}
                      </Box>
                    </>
                  )}
                </Typography>
                
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <Chip
                    label={`${file.download_count} downloads`}
                    size="small"
                    sx={{
                      background: 'rgba(102, 126, 234, 0.1)',
                      color: '#667eea',
                      fontWeight: 600,
                    }}
                  />
                  {file.expires_at && !isExpired(file.expires_at) && (
                    <Chip 
                      label="Active" 
                      size="small" 
                      sx={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {file.expires_at && isExpired(file.expires_at) && (
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
                  {file.mime_type.startsWith('image/') && (
                    <Chip 
                      label="Image" 
                      size="small" 
                      sx={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid #e2e8f0',
          },
        }}
      >
        <MenuItem 
          onClick={() => selectedFile && handleDownload(selectedFile)}
          sx={{ px: 3, py: 1.5 }}
        >
          <Download sx={{ mr: 2, fontSize: 20 }} />
          Download
        </MenuItem>
        <MenuItem 
          onClick={() => selectedFile && handleShare(selectedFile)}
          sx={{ px: 3, py: 1.5 }}
        >
          <Share sx={{ mr: 2, fontSize: 20 }} />
          Share
        </MenuItem>
        <MenuItem 
          onClick={() => selectedFile && handleDelete(selectedFile)}
          sx={{ px: 3, py: 1.5, color: '#ef4444' }}
        >
          <Delete sx={{ mr: 2, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5" fontWeight={700}>
            Share File
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Typography gutterBottom sx={{ mb: 3, color: '#64748b' }}>
            Anyone with this link can download your file. No registration required.
            {selectedFile && selectedFile.expires_at && (
              <Box sx={{ mt: 1, p: 2, background: '#fef3cd', borderRadius: 1, border: '1px solid #fed7aa' }}>
                <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 600 }}>
                  ⏰ This link will expire {isExpired(selectedFile.expires_at) ? 'soon' : getTimeRemaining(selectedFile.expires_at)}
                </Typography>
              </Box>
            )}
          </Typography>
          <TextField
            fullWidth
            value={selectedFile ? `${window.location.protocol}//${window.location.host}/download/${selectedFile.download_token}` : ''}
            InputProps={{
              readOnly: true,
              sx: {
                borderRadius: 2,
                background: '#f8fafc',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShareDialogOpen(false)}
            sx={{ px: 3, py: 1 }}
          >
            Close
          </Button>
          <Button 
            onClick={copyShareLink} 
            variant="contained" 
            startIcon={<FileCopy />}
            sx={{
              px: 4,
              py: 1,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={700}>
            Delete File
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#64748b' }}>
            Are you sure you want to delete "{selectedFile?.original_filename}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ px: 3, py: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            color="error"
            sx={{ px: 4, py: 1, borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileList;