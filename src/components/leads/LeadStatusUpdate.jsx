// src/components/leads/LeadStatusUpdate.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Paper,
  Divider,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Notes as NotesIcon,
  PhoneCallback as CallbackIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { leadService } from '../../services/lead.service';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'New', label: 'New', color: 'primary' },
  { value: 'Contacted', label: 'Contacted', color: 'info' },
  { value: 'Interested', label: 'Interested', color: 'success' },
  { value: 'Not Interested', label: 'Not Interested', color: 'error' },
  { value: 'Call Back', label: 'Call Back', color: 'warning' },
  { value: 'Customer Login', label: 'Customer Login', color: 'secondary' },
  { value: 'Dealer Login', label: 'Dealer Login', color: 'secondary' },
  { value: 'Follow-up', label: 'Follow-up', color: 'info' },
  { value: 'Closed', label: 'Closed', color: 'default' }
];

const statusDescriptions = {
  'New': 'Lead has been created but not contacted yet',
  'Contacted': 'Initial contact made with the lead',
  'Interested': 'Lead has shown interest in the product/service',
  'Not Interested': 'Lead is not interested at this time',
  'Call Back': 'Scheduled for a follow-up call',
  'Customer Login': 'Customer has logged into the system',
  'Dealer Login': 'Dealer has logged into the system',
  'Follow-up': 'Requires additional follow-up',
  'Closed': 'Lead has been closed (converted or lost)'
};

const LeadStatusUpdate = ({ open, onClose, lead, onUpdate }) => {
  const [status, setStatus] = useState(lead?.status || 'New');
  const [notes, setNotes] = useState('');
  const [callbackTime, setCallbackTime] = useState(null);
  const [nextFollowup, setNextFollowup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      if (lead.callback_time) {
        setCallbackTime(new Date(lead.callback_time));
      }
      if (lead.next_followup) {
        setNextFollowup(new Date(lead.next_followup));
      }
    }
  }, [lead]);

  const user=JSON.parse(localStorage.getItem("userprofile"))
  console.log(user._id,"sus");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!status) {
      setError('Please select a status');
      return;
    }
    

    // Validate callback time for "Call Back" status
    if (status === 'Call Back' && !callbackTime && !nextFollowup) {
      setError('Please schedule a callback time for "Call Back" status');
      return;
    }

    try {
      setLoading(true);
      
      const updateData = {
        status,
        notes: notes.trim() || undefined,
        callback_time: status === 'Call Back' && callbackTime ? callbackTime.toISOString() : undefined,
        next_followup: nextFollowup ? nextFollowup.toISOString() : undefined,
        called_by:user._id
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      await leadService.updateLeadStatus(lead._id, updateData);
      
      toast.success('Lead status updated successfully');
      onUpdate();
      resetForm();
    } catch (error) {
      console.error('Failed to update status:', error);
      setError(error.response?.data?.message || 'Failed to update status');
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStatus(lead?.status || 'New');
    setNotes('');
    setCallbackTime(null);
    setNextFollowup(null);
    setError('');
    onClose();
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    
    // Reset callback time if not "Call Back" status
    if (newStatus !== 'Call Back') {
      setCallbackTime(null);
    }
    
    // Reset next followup for certain statuses
    if (newStatus === 'Customer Login' || newStatus === 'Dealer Login') {
      setNextFollowup(null);
    }
  };

  const getStatusColor = (statusValue) => {
    const statusObj = statusOptions.find(s => s.value === statusValue);
    return statusObj?.color || 'default';
  };

  return (
    <Dialog 
      open={open} 
      onClose={resetForm}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Update Lead Status
          </Typography>
          <IconButton onClick={resetForm}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Lead Information */}
          {lead && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lead Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {lead.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Current Status
                  </Typography>
                  <Chip 
                    label={lead.status} 
                    color={getStatusColor(lead.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {lead.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lead ID
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {lead.Lead_Id}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          <Grid container spacing={3}>
            {/* Status Selection */}
            <Grid item xs={12}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2 }}>
                  Select New Status
                </FormLabel>
                <RadioGroup
                  row
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  sx={{ flexWrap: 'wrap', gap: 1 }}
                >
                  {statusOptions.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip
                            label={option.label}
                            color={option.color}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                        </Box>
                      }
                      sx={{ 
                        m: 0,
                        '& .MuiFormControlLabel-label': { 
                          display: 'flex', 
                          alignItems: 'center' 
                        }
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              
              {/* Status Description */}
              {status && (
                <Alert 
                  severity="info" 
                  sx={{ mt: 2 }}
                  icon={false}
                >
                  <Typography variant="body2">
                    {statusDescriptions[status]}
                  </Typography>
                </Alert>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Callback Time for "Call Back" Status */}
            {status === 'Call Back' && (
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <DateTimePicker
                      label="Callback Time"
                      value={callbackTime}
                      onChange={setCallbackTime}
                      minDateTime={new Date()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          helperText: "Schedule when to call back the lead"
                        }
                      }}
                    />
                    <DateTimePicker
                      label="Next Follow-up"
                      value={nextFollowup}
                      onChange={setNextFollowup}
                      minDateTime={new Date()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          helperText: "Optional: Set next follow-up reminder"
                        }
                      }}
                    />
                  </Box>
                </LocalizationProvider>
              </Grid>
            )}

            {/* Next Follow-up for other statuses (optional) */}
            {status !== 'Call Back' && status !== 'Customer Login' && status !== 'Dealer Login' && (
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Next Follow-up (Optional)"
                    value={nextFollowup}
                    onChange={setNextFollowup}
                    minDateTime={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: "Set a follow-up reminder for later"
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            )}

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this call or update..."
                helperText="Describe what was discussed or any important details"
                InputProps={{
                  startAdornment: (
                    <NotesIcon sx={{ mr: 1, color: 'action.active', mt: 2 }} />
                  )
                }}
              />
            </Grid>

            {/* Quick Notes Suggestions */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Quick Notes Suggestions:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  'Customer requested more information',
                  'Will discuss with family/partner',
                  'Price comparison needed',
                  'Needs time to think',
                  'Will call back tomorrow',
                  'Interested in demo',
                  'Budget constraints',
                  'Timing not right'
                ].map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    size="small"
                    onClick={() => setNotes(prev => prev ? `${prev}. ${suggestion}` : suggestion)}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={resetForm} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={<CallbackIcon />}
          >
            {loading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LeadStatusUpdate;