import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
  LinearProgress,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  alpha,
  useTheme,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as VerifyIcon,
  Verified as VerifiedIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Shield as ShieldIcon,
  Badge as BadgeIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { userService } from '../../services/user.service';

const UserPanel = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'verified', 'pending'
  const theme = useTheme();

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await userService.getAllUser();
      const usersData = response.data.data || [];
      setUsers(usersData);
      setFilteredUsers(usersData); // Initially show all users
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
      setSnackbar({
        open: true,
        message: 'Failed to fetch users',
        severity: 'error',
      });
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Filter and search users
  useEffect(() => {
    let result = users;

    // Apply filter
    if (filter === 'verified') {
      result = result.filter(user => user.Dealer_verification === true);
    } else if (filter === 'pending') {
      result = result.filter(user => user.Dealer_verification !== true);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.includes(term) ||
        user.business_name?.toLowerCase().includes(term) ||
        user.unique_code?.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(result);
  }, [users, searchTerm, filter]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle user verification
  const handleVerify = async (userId) => {
    setLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const data = {
        Dealer_verification: true,
        verified_at: new Date().toISOString(),
      };
      
      await userService.updateUserStatus(userId, data);
      
      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, ...data } : user
        )
      );
      
      setSnackbar({
        open: true,
        message: 'User verified successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error verifying user:', err);
      setSnackbar({
        open: true,
        message: 'Failed to verify user',
        severity: 'error',
      });
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Handle user suspension
  const handleSuspendUser = async (userId) => {
    try {
      const data = {
        is_suspended: true,
        suspended_at: new Date().toISOString(),
      };
      
      await userService.updateUserStatus(userId, data);
      
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, ...data } : user
        )
      );
      
      setSnackbar({
        open: true,
        message: 'User suspended successfully!',
        severity: 'warning',
      });
    } catch (err) {
      console.error('Error suspending user:', err);
      setSnackbar({
        open: true,
        message: 'Failed to suspend user',
        severity: 'error',
      });
    }
  };

  const isVerified = (user) => user.Dealer_verification === true;
  const isSuspended = (user) => user.is_suspended === true;

  const verifiedCount = users.filter(user => isVerified(user)).length;
  const pendingCount = users.length - verifiedCount;
  const verificationProgress = users.length > 0 ? (verifiedCount / users.length) * 100 : 0;

  const getStatusColor = (user) => {
    if (isSuspended(user)) return theme.palette.error.main;
    if (isVerified(user)) return theme.palette.success.main;
    return theme.palette.warning.main;
  };

  const getStatusBgColor = (user) => {
    if (isSuspended(user)) return alpha(theme.palette.error.main, 0.1);
    if (isVerified(user)) return alpha(theme.palette.success.main, 0.1);
    return alpha(theme.palette.warning.main, 0.1);
  };

  const getStatusText = (user) => {
    if (isSuspended(user)) return 'Suspended';
    if (isVerified(user)) return 'Verified';
    return 'Pending Verification';
  };

  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (isFetching && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and verify user accounts
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Refresh users">
              <IconButton onClick={fetchUsers} disabled={isFetching}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                textAlign: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
              }}
            >
              <Typography variant="h3" fontWeight="bold" color="primary">
                {users.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                textAlign: 'center',
                bgcolor: alpha(theme.palette.success.main, 0.05),
                borderRadius: 2,
              }}
            >
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {verifiedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Verified Users
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                textAlign: 'center',
                bgcolor: alpha(theme.palette.warning.main, 0.05),
                borderRadius: 2,
              }}
            >
              <Typography variant="h3" fontWeight="bold" color="warning.main">
                {pendingCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Verification
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Progress Section */}
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              Verification Progress
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold" color="primary">
              {verifiedCount}/{users.length} ({Math.round(verificationProgress)}%)
            </Typography>
          </Box>
          <Box sx={{ position: 'relative' }}>
            <LinearProgress
              variant="determinate"
              value={verificationProgress}
              sx={{ 
                height: 12, 
                borderRadius: 6,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
                }
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: `${verificationProgress}%`,
                width: 20,
                height: 20,
                bgcolor: 'white',
                border: `3px solid ${theme.palette.success.main}`,
                borderRadius: '50%',
                transform: 'translate(-50%, -25%)',
                boxShadow: 2,
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Search and Filter Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 3, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        {/* <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <TextField
            placeholder="Search users by name, email, phone..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mr: 2 }}
          />
        </Box> */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* <Chip 
            icon={<FilterIcon />} 
            label="Filter" 
            color="primary" 
            variant="outlined" 
          /> */}
          <Chip 
            label="All" 
            onClick={() => setFilter('all')} 
            color={filter === 'all' ? 'primary' : 'default'}
            variant={filter === 'all' ? 'filled' : 'outlined'}
          />
          <Chip 
            label="Verified" 
            onClick={() => setFilter('verified')} 
            color={filter === 'verified' ? 'success' : 'default'}
            variant={filter === 'verified' ? 'filled' : 'outlined'}
          />
          <Chip 
            label="Pending" 
            onClick={() => setFilter('pending')} 
            color={filter === 'pending' ? 'warning' : 'default'}
            variant={filter === 'pending' ? 'filled' : 'outlined'}
          />
        </Box>
      </Paper>

      {/* Users Grid */}
      {error && users.length === 0 ? (
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchUsers}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user._id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  border: `2px solid ${getStatusBgColor(user)}`,
                  bgcolor: getStatusBgColor(user),
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                    borderColor: getStatusColor(user),
                  },
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Status Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 1,
                  }}
                >
                  <Chip
                    label={getStatusText(user)}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(user),
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>

                {/* Status Indicator */}
                <Box
                  sx={{
                    height: 4,
                    width: '100%',
                    bgcolor: getStatusColor(user),
                  }}
                />

                <CardContent 
                  sx={{ flexGrow: 1, p: 3, cursor: 'pointer' }}
                  onClick={() => handleViewUserDetails(user)}
                >
                  {/* User Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: theme.palette.primary.main,
                        mr: 2,
                        boxShadow: 2,
                      }}
                    >
                      <PersonIcon fontSize="large" />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="div" fontWeight="bold" noWrap>
                        {user.name}
                      </Typography>
                      <Chip
                        label={user.role || 'User'}
                        size="small"
                        sx={{ 
                          mt: 1, 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontWeight: 'medium',
                        }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* User Info */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmailIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2" noWrap title={user.email}>
                        {user.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhoneIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2">{user.phone || 'Not provided'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BusinessIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2" noWrap title={user.business_name}>
                        {user.business_name || 'No business'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Footer Info */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.grey[200], 0.5),
                      borderRadius: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box className="flex gap-2">
                      <Typography variant="caption" color="text.secondary" display="block">
                        User ID
                      </Typography>
                      <Typography variant="caption" fontWeight="medium">
                        {user.unique_code}
                      </Typography>
                    </Box>
                    {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HistoryIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" fontWeight="medium">
                        {user.history_data?.length || 0}
                      </Typography>
                    </Box> */}
                  </Paper>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  {isVerified(user) ? (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<VerifiedIcon />}
                      sx={{
                        bgcolor: theme.palette.success.main,
                        '&:hover': {
                          bgcolor: theme.palette.success.dark,
                        },
                        fontWeight: 'bold',
                        py: 1,
                      }}
                    >
                      Verified User
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={loading[user._id] ? <CircularProgress size={20} color="inherit" /> : <VerifyIcon />}
                        onClick={() => handleVerify(user._id)}
                        disabled={loading[user._id]}
                        sx={{
                          fontWeight: 'bold',
                          py: 1,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                          },
                        }}
                      >
                        {loading[user._id] ? 'Verifying...' : 'Verify'}
                      </Button>
                      {/* <Tooltip title="Suspend User">
                        <IconButton 
                          onClick={() => handleSuspendUser(user._id)}
                          sx={{ 
                            bgcolor: theme.palette.error.main,
                            color: 'white',
                            '&:hover': { bgcolor: theme.palette.error.dark }
                          }}
                        >
                          <BlockIcon />
                        </IconButton>
                      </Tooltip> */}
                    </Box>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {filteredUsers.length === 0 && !isFetching && !error && (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            bgcolor: alpha(theme.palette.grey[200], 0.5),
            borderRadius: 2,
          }}
        >
          <BadgeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No users found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || filter !== 'all' ? 'Try changing your search or filter criteria' : 'Users will appear here once they register.'}
          </Typography>
          <Button variant="outlined" onClick={fetchUsers} startIcon={<RefreshIcon />}>
            Refresh
          </Button>
        </Paper>
      )}

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onClose={() => setShowUserDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">User Details</Typography>
          <IconButton onClick={() => setShowUserDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: theme.palette.primary.main,
                      mb: 2,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedUser.name}
                  </Typography>
                  <Chip
                    label={selectedUser.role}
                    color="primary"
                    sx={{ mt: 1, mb: 2 }}
                  />
                  <Chip
                    label={getStatusText(selectedUser)}
                    sx={{
                      bgcolor: getStatusColor(selectedUser),
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      value={selectedUser.email || ''}
                      fullWidth
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone"
                      value={selectedUser.phone || ''}
                      fullWidth
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Business Name"
                      value={selectedUser.business_name || ''}
                      fullWidth
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="User ID"
                      value={selectedUser.unique_code || ''}
                      fullWidth
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Registration Date"
                      value={new Date(selectedUser.createdAt).toLocaleDateString() || ''}
                      fullWidth
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  {selectedUser.history_data?.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        History ({selectedUser.history_data.length})
                      </Typography>
                      <Paper sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                        {selectedUser.history_data.map((item, index) => (
                          <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                            • {item.action || 'Action'} - {new Date(item.timestamp).toLocaleString()}
                          </Typography>
                        ))}
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUserDialog(false)}>Close</Button>
          {selectedUser && !isVerified(selectedUser) && (
            <Button
              variant="contained"
              startIcon={<VerifyIcon />}
              onClick={() => {
                handleVerify(selectedUser._id);
                setShowUserDialog(false);
              }}
            >
              Verify User
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserPanel;