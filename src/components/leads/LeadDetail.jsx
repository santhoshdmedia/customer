import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  IconButton,
  LinearProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { leadService } from '../../services/lead.service';
import { customerCareService } from '../../services/customerCare.service';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const LeadDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customerCareMembers, setCustomerCareMembers] = useState([]);
  const [callData, setCallData] = useState({
    status: '',
    notes: '',
    next_followup: null,
  });
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc' for follow-up date sorting
  const [sortBy, setSortBy] = useState('next_followup'); // Column to sort by

  // Define status hierarchy for disabling previous statuses
  const statusHierarchy = [
    'New',
    'Contacted',
    'Interested',
    'Not Interested',
    'Call Back',
    'Customer Login',
    'Dealer Login',
    'Follow-up',
    'Closed'
  ];

  // Status colors for chips
  const statusColors = {
    New: 'primary',
    Contacted: 'info',
    Interested: 'success',
    'Not Interested': 'error',
    'Call Back': 'warning',
    'Customer Login': 'success',
    'Dealer Login': 'info',
    'Follow-up': 'warning',
    Closed: 'default',
  };

  useEffect(() => {
    fetchLeadDetails();
    fetchCustomerCareMembers();
  }, [id]);

  useEffect(() => {
    if (lead) {
      setCallData(prev => ({
        ...prev,
        status: lead.status
      }));
    }
  }, [lead]);

  const fetchLeadDetails = async () => {
    setLoading(true);
    try {
      const response = await leadService.getLeadById(id);
      setLead(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch lead details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerCareMembers = async () => {
    try {
      const response = await customerCareService.getAllUsers();
      if (response.data && response.data.data) {
        setCustomerCareMembers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch customer care members:', error);
    }
  };

  const handleAssignMember = async (memberId) => {
    try {
      const response = await leadService.assignMember(id, memberId);
      if (response.status==200) {
        toast.success('Member assigned successfully');
        fetchLeadDetails();
      } else {
        toast.error(response.error || 'Failed to assign member');
      }
    } catch (error) {
      toast.error('Failed to assign member');
    }
  };

  const handleAddCallHistory = async () => {
    if (!callData.status) {
      toast.error('Please select a status');
      return;
    }

    try {
      const updateData = {
        status: callData.status,
        notes: callData.notes,
        next_followup: callData.next_followup || null
      };

      const response = await leadService.updateLeadStatus(id, updateData);
      
      if (response.success || response.status === 200) {
        toast.success('Status updated successfully');
        
        // Reset form
        setCallData({
          status: lead.status, // Keep current status as default
          notes: '',
          next_followup: null,
        });
        
        // Refresh lead data
        fetchLeadDetails();
      } else {
        toast.error(response.error || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to add call history');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    const phoneStr = phone.toString().replace(/\D/g, '');
    return phoneStr.length === 10 
      ? `${phoneStr.slice(0, 3)}-${phoneStr.slice(3, 6)}-${phoneStr.slice(6)}`
      : phoneStr;
  };

  // Function to check if a status should be disabled
  const isStatusDisabled = (status) => {
    if (!lead || !lead.status) return false;
    
    const currentStatusIndex = statusHierarchy.indexOf(lead.status);
    const targetStatusIndex = statusHierarchy.indexOf(status);
    
    // If either status is not found in hierarchy, don't disable
    if (currentStatusIndex === -1 || targetStatusIndex === -1) return false;
    
    // Disable statuses that come before current status in hierarchy
    return targetStatusIndex < currentStatusIndex;
  };

  // Sort call history - FIXED VERSION
  const sortedCallHistory = useMemo(() => {
    if (!lead || !lead.call_history || lead.call_history.length === 0) {
      return [];
    }

    return [...lead.call_history].sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case 'next_followup':
          valueA = a.next_followup ? new Date(a.next_followup).getTime() : Infinity;
          valueB = b.next_followup ? new Date(b.next_followup).getTime() : Infinity;
          break;
        case 'called_at':
          valueA = a.called_at ? new Date(a.called_at).getTime() : 0;
          valueB = b.called_at ? new Date(b.called_at).getTime() : 0;
          break;
        case 'status':
          valueA = a.status || '';
          valueB = b.status || '';
          break;
        default:
          valueA = a.called_at ? new Date(a.called_at).getTime() : 0;
          valueB = b.called_at ? new Date(b.called_at).getTime() : 0;
      }

      // For date sorting, handle null/undefined values
      if (sortBy === 'next_followup') {
        // For ascending: nulls at end, for descending: nulls at beginning
        if (!a.next_followup && !b.next_followup) return 0;
        if (!a.next_followup) return sortOrder === 'asc' ? 1 : -1;
        if (!b.next_followup) return sortOrder === 'asc' ? -1 : 1;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });
  }, [lead, sortOrder, sortBy]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!lead) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        Lead not found
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/leads')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Lead Details
          </Typography>
          <Chip
            label={lead.Lead_Id}
            color="primary"
            sx={{ ml: 2, fontWeight: 'bold' }}
          />
        </Box>

        <Grid container spacing={3}>
          {/* Left Column - Lead Information */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">{lead.name}</Typography>
                <Chip
                  label={lead.status}
                  color={statusColors[lead.status] || 'default'}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>
                      <strong>Phone:</strong> {formatPhone(lead.phone)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>
                      <strong>Email:</strong> {lead.email || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>
                      <strong>Location:</strong> {lead.Place || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssignmentIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>
                      <strong>Source:</strong> {lead.source || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>
                      <strong>Assigned To:</strong>{' '}
                      {lead.Assign_member 
                        ? `${lead.Assign_member.name} (${lead.Assign_member.email})`
                        : 'Unassigned'
                      }
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    <strong>Created:</strong> {formatDate(lead.createdAt)}
                  </Typography>
                  <Typography variant="subtitle2">
                    <strong>Last Updated:</strong> {formatDate(lead.updatedAt)}
                  </Typography>
                </Grid>

                {lead.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      <strong>Notes:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {lead.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Call History Table */}
              {lead.call_history && lead.call_history.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Call History
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <TableSortLabel
                              active={sortBy === 'status'}
                              direction={sortBy === 'status' ? sortOrder : 'asc'}
                              onClick={() => handleSort('status')}
                            >
                              <strong>Status</strong>
                            </TableSortLabel>
                          </TableCell>
                          <TableCell><strong>Notes</strong></TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={sortBy === 'called_at'}
                              direction={sortBy === 'called_at' ? sortOrder : 'asc'}
                              onClick={() => handleSort('called_at')}
                            >
                              <strong>Called At</strong>
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={sortBy === 'next_followup'}
                              direction={sortBy === 'next_followup' ? sortOrder : 'asc'}
                              onClick={() => handleSort('next_followup')}
                            >
                              <strong>Next Follow-up</strong>
                            </TableSortLabel>
                          </TableCell>
                          <TableCell><strong>Called By</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedCallHistory.map((call, index) => (
                          <TableRow 
                            key={index} 
                            hover
                            sx={{
                              backgroundColor: call.status === 'Call Back' && call.next_followup 
                                ? 'rgba(255, 167, 38, 0.08)' 
                                : 'inherit'
                            }}
                          >
                            <TableCell>
                              <Chip
                                label={call.status}
                                size="small"
                                color={statusColors[call.status] || 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                {call.notes || 'No notes'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {formatDate(call.called_at)}
                            </TableCell>
                            <TableCell>
                              {call.next_followup ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                  {formatDateOnly(call.next_followup)}
                                </Box>
                              ) : (
                                'Not scheduled'
                              )}
                            </TableCell>
                            <TableCell>
                              {call.called_by?.name || 'Unknown'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Column - Actions */}
          <Grid item xs={12} md={4}>
            {/* Status Update */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Update Status
              </Typography>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={callData.status}
                  onChange={(e) => setCallData({ ...callData, status: e.target.value })}
                  label="New Status"
                  disabled={!lead}
                >
                  {statusHierarchy.map((status) => (
                    <MenuItem 
                      key={status} 
                      value={status}
                      disabled={isStatusDisabled(status)}
                    >
                      {status}
                      {isStatusDisabled(status) && (
                        <Typography variant="caption" sx={{ ml: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                          (Previous status)
                        </Typography>
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={callData.notes}
                onChange={(e) => setCallData({ ...callData, notes: e.target.value })}
                sx={{ mb: 2 }}
                placeholder="Add notes about this interaction..."
              />

              <DatePicker
                label="Next Follow-up"
                value={callData.next_followup}
                onChange={(date) => setCallData({ ...callData, next_followup: date })}
                renderInput={(params) => (
                  <TextField {...params} fullWidth sx={{ mb: 2 }} />
                )}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleAddCallHistory}
                disabled={!callData.status || (callData.status === lead.status && !callData.notes && !callData.next_followup)}
              >
                Update Status
              </Button>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Note: You cannot go back to previous statuses once advanced.
              </Typography>
            </Paper>

            {/* Assign to Member - FIXED: Only show for non-customer_care roles */}
            {user && user.role !== "customer_care" && customerCareMembers.length > 0 && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Assign to Member
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Select Member</InputLabel>
                  <Select
                    value=""
                    label="Select Member"
                    onChange={(e) => handleAssignMember(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Select a member</em>
                    </MenuItem>
                    {customerCareMembers.map((member) => (
                      <MenuItem key={member._id} value={member._id}>
                        {member.name} ({member.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">
                  Currently assigned to: {lead.Assign_member?.name || 'None'}
                </Typography>
              </Paper>
            )}

            {/* Quick Actions */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PhoneIcon />}
                sx={{ mb: 1 }}
                href={`tel:${lead.phone}`}
              >
                Call Now
              </Button>
              {lead.email && (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  sx={{ mb: 1 }}
                  href={`mailto:${lead.email}`}
                >
                  Send Email
                </Button>
              )}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ScheduleIcon />}
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setCallData({
                    ...callData,
                    next_followup: tomorrow,
                    status: callData.status || 'Call Back'
                  });
                }}
              >
                Schedule Follow-up
              </Button>
              
              {/* Quick Status Update Buttons */}
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Quick Status:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['Contacted', 'Interested', 'Not Interested', 'Call Back'].map((status) => (
                    <Button
                      key={status}
                      size="small"
                      variant="contained"
                      onClick={() => setCallData(prev => ({ ...prev, status }))}
                      disabled={isStatusDisabled(status)}
                      sx={{
                        flex: 1,
                        minWidth: '120px',
                        bgcolor: statusColors[status] + '.light',
                        '&:hover': {
                          bgcolor: statusColors[status] + '.main',
                        }
                      }}
                    >
                      {status}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default LeadDetail;