// src/components/customer-care/CustomerCareForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  AdminPanelSettings as AdminIcon,
  SupportAgent as SupportIcon,
  Engineering as ManagerIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { customerCareService } from '../../services/customerCare.service';
import toast from 'react-hot-toast';

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email address')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]+$/, 'Phone number must contain only digits')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits'),
  role: Yup.string()
    .required('Role is required')
    .oneOf(['admin', 'manager', 'customer_care'], 'Invalid role'),
  password: Yup.string()
    .when('isEdit', {
      is: false,
      then: schema => schema
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
      otherwise: schema => schema
        .notRequired()
        .min(6, 'Password must be at least 6 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
    }),
  confirmPassword: Yup.string()
    .when('password', {
      is: (val) => val && val.length > 0,
      then: schema => schema
        .required('Please confirm your password')
        .oneOf([Yup.ref('password')], 'Passwords must match'),
      otherwise: schema => schema.notRequired()
    })
});

const CustomerCareForm = ({ open, onClose, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const isEdit = !!user;

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone?.toString() || '',
      role: user?.role || 'customer_care',
      password: '',
      confirmPassword: '',
      isActive: user?.isActive !== false,
      isEdit: isEdit
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleSubmit(values);
    },
    enableReinitialize: true
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();
      setActiveStep(0);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open, user]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const userData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role,
        isActive: values.isActive
      };

      // Only include password if provided during edit
      if (values.password) {
        userData.password = values.password;
      }

      if (isEdit) {
        await customerCareService.updateUser(user._id, userData);
        toast.success('User updated successfully');
      } else {
        await customerCareService.createUser(userData);
        toast.success('User created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.message || 
        (isEdit ? 'Failed to update user' : 'Failed to create user');
      toast.error(errorMessage);
      
      // Set form error
      if (error.response?.data?.error) {
        formik.setFieldError('email', error.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    let isValid = true;
    switch (activeStep) {
      case 0: // Basic Info
        isValid = formik.values.name && formik.values.email && formik.values.phone;
        if (!isValid) {
          formik.setTouched({
            name: true,
            email: true,
            phone: true
          }, false);
        }
        break;
      case 1: // Role
        isValid = formik.values.role;
        if (!isValid) {
          formik.setTouched({
            role: true
          }, false);
        }
        break;
    }
    
    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminIcon />;
      case 'manager':
        return <ManagerIcon />;
      case 'customer_care':
      default:
        return <SupportIcon />;
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'manager':
        return 'Can manage customer care users and view all leads';
      case 'customer_care':
      default:
        return 'Can manage assigned leads and update lead status';
    }
  };

  const steps = ['Basic Information', 'Role & Permissions', 'Account Settings'];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {isEdit ? 'Edit User' : 'Add New User'}
          </Typography>
          <IconButton onClick={onClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
            {/* Step 1: Basic Information */}
            <Step>
              <StepLabel>Basic Information</StepLabel>
              <StepContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="name"
                      label="Full Name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="email"
                      label="Email Address"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="phone"
                      label="Phone Number"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" onClick={handleNext}>
                    Next
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 2: Role & Permissions */}
            <Step>
              <StepLabel>Role & Permissions</StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Select the appropriate role for this user. Each role has different permissions.
                </Typography>
                
                <Grid container spacing={2}>
                  {['customer_care', 'manager'].map((role) => (
                    <Grid item xs={12} md={4} key={role}>
                      <Paper
                        elevation={formik.values.role === role ? 3 : 0}
                        sx={{
                          p: 2,
                          border: 2,
                          borderColor: formik.values.role === role ? 'primary.main' : 'transparent',
                          borderRadius: 2,
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: 'action.hover',
                            backgroundColor: 'action.hover'
                          }
                        }}
                        onClick={() => formik.setFieldValue('role', role)}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                          <Box sx={{ color: formik.values.role === role ? 'primary.main' : 'text.secondary', mb: 1 }}>
                            {getRoleIcon(role)}
                          </Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {role.replace('_', ' ').toUpperCase()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                            {getRoleDescription(role)}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                
                {formik.touched.role && formik.errors.role && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {formik.errors.role}
                  </Alert>
                )}
                
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button onClick={handleBack}>
                    Back
                  </Button>
                  <Button variant="contained" onClick={handleNext}>
                    Next
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 3: Account Settings */}
            <Step>
              <StepLabel>Account Settings</StepLabel>
              <StepContent>
                {!isEdit && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Password must contain at least 6 characters, including uppercase, lowercase letters, and numbers.
                  </Alert>
                )}
                
                <Grid container spacing={3}>
                  {(!isEdit || formik.values.password) && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="password"
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.password && Boolean(formik.errors.password)}
                          helperText={formik.touched.password && formik.errors.password}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="confirmPassword"
                          label="Confirm Password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formik.values.confirmPassword}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                >
                                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                    </>
                  )}
                  
                  {isEdit && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        Leave password fields empty to keep current password
                      </Alert>
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.isActive}
                          onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">Account Status</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formik.values.isActive 
                              ? 'User will be able to login immediately' 
                              : 'User account will be deactivated'}
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button onClick={handleBack}>
                    Back
                  </Button>
                  <Button 
                    variant="contained" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>

          {/* Summary for completed steps */}
          {activeStep === steps.length && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Review the information below before creating the user
            </Alert>
          )}

          {/* Review Summary */}
          {activeStep === steps.length && (
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Review Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">
                    {formik.values.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {formik.values.email}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {formik.values.phone}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Role
                  </Typography>
                  <Typography variant="body1">
                    {formik.values.role.replace('_', ' ').toUpperCase()}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1">
                    {formik.values.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Password
                  </Typography>
                  <Typography variant="body1">
                    {formik.values.password ? '••••••••' : 'Unchanged'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          {activeStep === steps.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button onClick={() => setActiveStep(0)}>
                Edit Details
              </Button>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Button onClick={onClose}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={formik.handleSubmit}
                disabled={loading || activeStep < steps.length - 1}
                sx={{ ml: 1 }}
              >
                {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
              </Button>
            </Box>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CustomerCareForm;