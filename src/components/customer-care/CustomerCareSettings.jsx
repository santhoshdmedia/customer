import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { customerCareService } from '../../services/customerCare.service';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const CustomerCareSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // Get id from URL params if editing other user
  
  // Use id from params if available, otherwise use current user's id
  const userId = id || user?._id;
  
  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [originalData, setOriginalData] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer_care',
    isActive: true,
    password: '',
    notes: '',
    department: '',
    permissions: [],
    assignable: true,
    maxLeadsPerDay: 20,
  });

  // Available roles
  const roles = [
    { value: 'customer_care', label: 'Customer Care', color: 'primary' },
    { value: 'customer_care_supervisor', label: 'Supervisor', color: 'info' },
    { value: 'customer_care_manager', label: 'Manager', color: 'warning' },
    { value: 'admin', label: 'Admin', color: 'error' },
    { value: 'viewer', label: 'Viewer', color: 'default' }
  ];

  // Available permissions
  const allPermissions = [
    { value: 'view_leads', label: 'View Leads', category: 'leads' },
    { value: 'edit_leads', label: 'Edit Leads', category: 'leads' },
    { value: 'assign_leads', label: 'Assign Leads', category: 'leads' },
    { value: 'delete_leads', label: 'Delete Leads', category: 'leads' },
    { value: 'view_customers', label: 'View Customers', category: 'customers' },
    { value: 'edit_customers', label: 'Edit Customers', category: 'customers' },
    { value: 'view_reports', label: 'View Reports', category: 'reports' },
    { value: 'export_data', label: 'Export Data', category: 'reports' },
    { value: 'manage_users', label: 'Manage Users', category: 'admin' },
    { value: 'system_settings', label: 'System Settings', category: 'admin' }
  ];



  // Stepper steps
  const steps = ['Basic Information', 'Settings & Security'];

  // Fetch user data on component mount
  useEffect(() => {
    if (userId) {
      fetchUserData();
    } else {
      setError('User ID is required');
      setLoading(false);
    }
  }, [userId]);

  const fetchUserData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await customerCareService.getUserById(userId);
      console.log(response, "user");
      
      if (response.data) {
        const userData = response.data;
        setOriginalData(userData);
        
        // Map API response to form data
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone?.toString() || '', // Convert to string if it's a number
          role: userData.role || 'customer_care',
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          password: '',
          notes: userData.notes || '',
          department: userData.department || '',
          permissions: userData.permissions || [],
          assignable: userData.assignable !== undefined ? userData.assignable : true,
          maxLeadsPerDay: userData.maxLeadsPerDay || 20,
        });
      } else {
        setError('User data not found');
        toast.error('Error loading user information');
      }
    } catch (err) {
      setError('Error loading user data');
      toast.error('Error loading user information');
      console.error('Fetch user error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear success message when user starts editing
    if (success) setSuccess('');
  };

  // Handle permission toggle
  const handlePermissionToggle = (permission) => {
    setFormData(prev => {
      const permissions = [...prev.permissions];
      const index = permissions.indexOf(permission);
      
      if (index === -1) {
        permissions.push(permission);
      } else {
        permissions.splice(index, 1);
      }
      
      return { ...prev, permissions };
    });
  };

  // Handle permission category toggle
  const handleCategoryToggle = (category) => {
    const categoryPermissions = allPermissions
      .filter(p => p.category === category)
      .map(p => p.value);
    
    const allCategorySelected = categoryPermissions.every(p => 
      formData.permissions.includes(p)
    );
    
    setFormData(prev => {
      let newPermissions = [...prev.permissions];
      
      if (allCategorySelected) {
        // Remove all permissions from this category
        newPermissions = newPermissions.filter(p => !categoryPermissions.includes(p));
      } else {
        // Add all permissions from this category
        categoryPermissions.forEach(p => {
          if (!newPermissions.includes(p)) {
            newPermissions.push(p);
          }
        });
      }
      
      return { ...prev, permissions: newPermissions };
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = [];

    if (!formData.name.trim()) {
      errors.push('Name is required');
    }

    if (!formData.email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!formData.phone.trim()) {
      errors.push('Phone number is required');
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.push('Please enter a valid 10-digit phone number');
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      }
      if (formData.password !== confirmPassword) {
        errors.push('Passwords do not match');
      }
    }

    if (formData.maxLeadsPerDay < 1 || formData.maxLeadsPerDay > 100) {
      errors.push('Max leads per day must be between 1 and 100');
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      // Prepare update data
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive,
        notes: formData.notes,
        department: formData.department,
        permissions: formData.permissions,
        assignable: formData.assignable,
        maxLeadsPerDay: formData.maxLeadsPerDay,
      };

      // Only include password if it's being changed
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      // Use userId instead of undefined id variable
      const response = await customerCareService.updateUser(userId, updateData);
      
      if (response) {
        setSuccess('User updated successfully!');
        toast.success('Customer care user updated successfully');
        
        // Update original data with response data if available
        if (response.data) {
          setOriginalData({ ...originalData, ...response.data });
        } else {
          setOriginalData({ ...originalData, ...updateData });
        }
        
        // Clear password fields
        setFormData(prev => ({ ...prev, password: '' }));
        setConfirmPassword('');
      } else {
        setError(response.message || 'Failed to update user');
        toast.error(response.message || 'Update failed');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('An error occurred while updating the user');
      toast.error('Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete user
  const handleDelete = async () => {
    try {
      // Use userId instead of undefined id variable
      const response = await customerCareService.deleteUser(userId);
      console.log(response);
      
      if (response.success) {
        toast.success('User deleted successfully');
        navigate('/customer-care');
      } else {
        toast.error(response.message || 'Delete failed');
      }
    } catch (err) {
      toast.error('Delete failed. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setDeleteDialog(false);
    }
  };

  // Reset form to original values
  const handleReset = () => {
    if (originalData) {
      setFormData({
        name: originalData.name || '',
        email: originalData.email || '',
        phone: originalData.phone?.toString() || '',
        role: originalData.role || 'customer_care',
        isActive: originalData.isActive !== undefined ? originalData.isActive : true,
        password: '',
        notes: originalData.notes || '',
        department: originalData.department || '',
        permissions: originalData.permissions || [],
        assignable: originalData.assignable !== undefined ? originalData.assignable : true,
        maxLeadsPerDay: originalData.maxLeadsPerDay || 20,
      });
      setConfirmPassword('');
      setError('');
      setSuccess('');
      toast.info('Form reset to original values');
    }
  };

  // Navigation handlers
  const handleNextStep = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBackStep = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Check if form has changes
  const hasChanges = () => {
    if (!originalData) return false;

    const currentData = { ...formData };
    delete currentData.password; // Don't compare password
    
    const originalCopy = { ...originalData };
    delete originalCopy.password;
    delete originalCopy.__v;
    delete originalCopy.createdAt;
    delete originalCopy.updatedAt;

    // Convert phone to string for comparison
    if (originalCopy.phone) {
      originalCopy.phone = originalCopy.phone.toString();
    }

    return JSON.stringify(currentData) !== JSON.stringify(originalCopy);
  };

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number *"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
          
              
         
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    startAdornment: (
                      <InputAdornment position="start">
                        <SecurityIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={formData.password !== '' && formData.password !== confirmPassword}
                  helperText={
                    formData.password !== '' && formData.password !== confirmPassword
                      ? 'Passwords do not match'
                      : ''
                  }
                />
              </Grid>
              
              
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => 
                        setFormData(prev => ({ ...prev, isActive: e.target.checked }))
                      }
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">Active Status</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formData.isActive ? 'User is active' : 'User is inactive'}
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: 'warning.light' }}>
                  <Typography variant="subtitle2" gutterBottom color="warning.dark">
                    <WarningIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Security Note
                  </Typography>
                  <Typography variant="body2" color="warning.dark">
                    Changing user permissions or deactivating accounts may affect system access.
                    Ensure proper authorization before making changes.
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !originalData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/customer-care')}
        >
          Back to Customer Care
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigate('/customer-care')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              {id ? 'Edit Customer Care User' : 'My Profile Settings'}
            </Typography>
         
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => navigate('/customer-care')}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={saving || !hasChanges()}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      {/* User Info Card */}
      <Card sx={{ mb: 3, bgcolor: '#fef9e8' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 60, height: 60, bgcolor: '#f2c41a' }}>
                {formData.name.charAt(0).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h6">
                {formData.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.email} • {formData.phone}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  label={formData.role.replace(/_/g, ' ')}
                  size="small"
                  color={
                    roles.find(r => r.value === formData.role)?.color || 'default'
                  }
                />
                <Chip
                  label={formData.isActive ? 'Active' : 'Inactive'}
                  size="small"
                  color={formData.isActive ? 'success' : 'error'}
                  icon={formData.isActive ? <CheckCircleIcon /> : <WarningIcon />}
                />
                {formData.department && (
                  <Chip
                    label={formData.department}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Grid>
            <Grid item>
              {id && ( // Only show delete button if editing another user (not own profile)
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialog(true)}
                >
                  Delete User
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stepper */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Main Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}
          
          {/* Form Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Box>
              {activeStep > 0 && (
                <Button onClick={handleBackStep} sx={{ mr: 2 }}>
                  Back
                </Button>
              )}
              {activeStep < steps.length - 1 && (
                <Button
                  variant="contained"
                  onClick={handleNextStep}
                >
                  Next
                </Button>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                disabled={!hasChanges()}
              >
                Reset
              </Button>
              
              {activeStep === steps.length - 1 && (
                <Button
                  variant="contained"
                  type="submit"
                  startIcon={<SaveIcon />}
                  disabled={saving || !hasChanges()}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Changes Indicator */}
      {hasChanges() && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have unsaved changes. Please save to keep your changes.
        </Alert>
      )}

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{formData.name}</strong>?
            This action cannot be undone and will permanently remove all user data.
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Warning: Deleting this user will remove all their assigned leads and activity history.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete Permanently
          </Button>
        </DialogActions> 
      </Dialog>

   
    </Container>
  );
};

export default CustomerCareSettings;