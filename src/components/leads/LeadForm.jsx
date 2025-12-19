import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import { leadService } from '../../services/lead.service';
import { toast } from 'react-hot-toast';

const LeadForm = ({ onSuccess, onCancel, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    Place: initialData?.Place || '',
    source: initialData?.source || 'Social Media',
    status: initialData?.status || 'New',
    Assign_member: initialData?.Assign_member?._id || '',
    ...initialData,
  });

  const sources = [
    'Social Media',
    'Website',
    'Referral',
    'Walk-in',
    'Other',
  ];

  const statuses = [
    'New',
    'Contacted',
    'Interested',
    'Not Interested',
    'Call Back',
    'Customer Login',
    'Dealer Login',
    'Follow-up',
    'Closed',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData) {
        // Update existing lead
        await leadService.updateLead(initialData._id, formData);
        toast.success('Lead updated successfully');
      } else {
        // Create new lead
        await leadService.createLead(formData);
        toast.success('Lead created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={loading}
            inputProps={{ pattern: '[0-9]{10}' }}
            helperText="Enter 10-digit phone number"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Location"
            name="Place"
            value={formData.Place}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Source</InputLabel>
            <Select
              name="source"
              value={formData.source}
              onChange={handleChange}
              label="Source"
            >
              {sources.map((source) => (
                <MenuItem key={source} value={source}>
                  {source}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {initialData && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              multiline
              rows={3}
              disabled={loading}
            />
          </Grid>
        )}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Processing...' : initialData ? 'Update Lead' : 'Create Lead'}
        </Button>
      </Box>
    </Box>
  );
};

export default LeadForm;