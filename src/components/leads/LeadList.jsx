import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Grid,
  Divider,
  Alert,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Avatar,
  Card,
  CardContent,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FilterAltOff as FilterOffIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Notes as NotesIcon,
  PhoneCallback as CallbackIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  KeyboardArrowRight as ArrowRightIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  Call as CallIcon,
  Star as StarIcon,
  Numbers as NumbersIcon,
} from '@mui/icons-material';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { leadService } from '../../services/lead.service';
import { customerCareService } from '../../services/customerCare.service';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import LeadForm from './LeadForm';
import AssignLeadModal from './AssignLeadModal';
import { useAuth } from '../../context/AuthContext';
import { TablePagination } from '@mui/material';

const LeadList = () => {
  const { user } = useAuth();
  const isCustomerCare = user?.role === 'customer_care';
  const navigate = useNavigate();
  
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Initial filter state
  const initialFilters = {
    search: '',
    status: '',
    source: '',
    assignedTo: '',
    startDate: null,
    endDate: null,
    sortBy: 'next_followup',
    sortOrder: 'asc',
  };
  
  const [filters, setFilters] = useState(initialFilters);
  const [customerCareMembers, setCustomerCareMembers] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [bulkAssignMode, setBulkAssignMode] = useState(false);
  
  // Status update modal state
  const [statusUpdateModal, setStatusUpdateModal] = useState({
    open: false,
    lead: null,
    status: '',
    notes: '',
    callbackTime: null,
    nextFollowup: null,
    called_by: user._id,
    loading: false,
    error: '',
  });

  // Call history modal state
  const [callHistoryModal, setCallHistoryModal] = useState({
    open: false,
    lead: null,
    history: [],
    loading: false,
    currentIndex: 0,
  });

  // Status options with colors
  const statusOptions = [
    { value: 'New', label: 'New', color: 'primary', icon: <StarIcon fontSize="small" /> },
    { value: 'Contacted', label: 'Contacted', color: 'info', icon: <PhoneIcon fontSize="small" /> },
    { value: 'Interested', label: 'Interested', color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
    { value: 'Not Interested', label: 'Not Interested', color: 'error', icon: <CancelIcon fontSize="small" /> },
    { value: 'Call Back', label: 'Call Back', color: 'warning', icon: <CallbackIcon fontSize="small" /> },
    { value: 'Customer Login', label: 'Customer Login', color: 'secondary', icon: <PersonIcon fontSize="small" /> },
    { value: 'Dealer Login', label: 'Dealer Login', color: 'secondary', icon: <PersonIcon fontSize="small" /> },
    { value: 'Follow-up', label: 'Follow-up', color: 'info', icon: <ScheduleIcon fontSize="small" /> },
    { value: 'Closed', label: 'Closed', color: 'default', icon: <CheckCircleIcon fontSize="small" /> },
  ];

  const statusColors = {
    'New': 'primary',
    'Contacted': 'info',
    'Interested': 'success',
    'Not Interested': 'error',
    'Call Back': 'warning',
    'Customer Login': 'success',
    'Dealer Login': 'info',
    'Follow-up': 'warning',
    'Closed': 'default',
  };

  const sourceColors = {
    'Social Media': 'secondary',
    'Website': 'info',
    'Referral': 'success',
    'Walk-in': 'warning',
    'Other': 'default',
  };

  useEffect(() => {
    fetchLeads();
    if (user.role !== 'customer_care') {
      fetchCustomerCareMembers();
    }
  }, [page, rowsPerPage, filters]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: filters.search,
        status: filters.status,
        source: filters.source,
        assignedTo: filters.assignedTo,
        startDate: filters.startDate ? filters.startDate.toISOString() : '',
        endDate: filters.endDate ? filters.endDate.toISOString() : '',
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      let response;
      if (user.role !== 'customer_care') {
        response = await leadService.getAllLeads(params);
      } else {
        response = await leadService.getLeadBymemberId(user._id, params);
      }

      if (response && response.data) {
        let leadsData = response.data.data || response.data;
        
        if (filters.sortBy === 'next_followup') {
          leadsData.sort((a, b) => {
            const dateA = a.next_followup ? new Date(a.next_followup) : new Date('9999-12-31');
            const dateB = b.next_followup ? new Date(b.next_followup) : new Date('9999-12-31');
            
            if (filters.sortOrder === 'asc') {
              return dateA - dateB;
            } else {
              return dateB - dateA;
            }
          });
        }

        setLeads(leadsData);
        setTotal(response.total || response.data.total || response.data.length || 0);
      } else {
        setLeads([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerCareMembers = async () => {
    try {
      const response = await customerCareService.getAllUsers();
      if (response && response.data) {
        const filteredMembers = Array.isArray(response.data) 
          ? response.data.filter(member => member._id !== user._id && member.role !== 'customer_care')
          : Array.isArray(response.data.data)
          ? response.data.data.filter(member => member._id !== user._id && member.role !== 'customer_care')
          : [];
        setCustomerCareMembers(filteredMembers);
      } else {
        setCustomerCareMembers([]);
      }
    } catch (error) {
      console.error('Failed to fetch customer care members:', error);
      setCustomerCareMembers([]);
      toast.error('Failed to load customer care members');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleSortChange = (field) => {
    if (field === filters.sortBy) {
      setFilters(prev => ({
        ...prev,
        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        sortBy: field,
        sortOrder: 'asc'
      }));
    }
    setPage(0);
  };

  // Reset all filters to initial state
  const resetFilters = () => {
    setFilters(initialFilters);
    setPage(0);
    toast.success('Filters reset successfully');
  };

  // Calculate reverse serial number
  const getReverseSerialNumber = (index) => {
    // Total count minus (current page * rows per page + index)
    return total - (page * rowsPerPage + index);
  };

  const handleStatusChange = async (lead, newStatus) => {
    if (newStatus === 'Call Back' || newStatus === 'Follow-up') {
      setStatusUpdateModal({
        open: true,
        lead,
        status: newStatus,
        notes: '',
        callbackTime: null,
        nextFollowup: null,
        loading: false,
        error: '',
      });
    } else {
      try {
        await leadService.updateLeadStatus(lead._id, {
          status: newStatus,
          called_by: user._id,
        });
        toast.success('Status updated successfully');
        fetchLeads();
      } catch (error) {
        toast.error('Failed to update status');
      }
    }
  };

  const handleStatusUpdate = async () => {
    const { lead, status, notes, callbackTime, nextFollowup } = statusUpdateModal;
    
    if (!status) {
      setStatusUpdateModal(prev => ({ ...prev, error: 'Please select a status' }));
      return;
    }

    if ((status === 'Call Back' || status === 'Follow-up') && !callbackTime && !nextFollowup) {
      setStatusUpdateModal(prev => ({ ...prev, error: 'Please schedule a callback/follow-up time' }));
      return;
    }

    try {
      setStatusUpdateModal(prev => ({ ...prev, loading: true }));
      
      const updateData = {
        status,
        notes: notes.trim() || undefined,
        callback_time: callbackTime ? callbackTime.toISOString() : undefined,
        next_followup: nextFollowup ? nextFollowup.toISOString() : undefined,
        called_by: user._id,
      };

      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      await leadService.updateLeadStatus(lead._id, updateData);
      
      toast.success('Lead status updated successfully');
      setStatusUpdateModal(prev => ({ ...prev, open: false }));
      fetchLeads();
    } catch (error) {
      console.error('Failed to update status:', error);
      setStatusUpdateModal(prev => ({ 
        ...prev, 
        error: error.response?.data?.message || 'Failed to update status' 
      }));
      toast.error('Failed to update status');
    } finally {
      setStatusUpdateModal(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchCallHistory = async (leadId) => {
    try {
      setCallHistoryModal(prev => ({ ...prev, loading: true }));
      const response = await leadService.getLeadById(leadId);
      
      const history = Array.isArray(response.data.data?.call_history) 
        ? response.data.data.call_history.sort((a, b) => 
            new Date(b.called_at || b.createdAt || 0) - new Date(a.called_at || a.createdAt || 0)
          )
        : [];
      
      setCallHistoryModal(prev => ({ 
        ...prev, 
        history,
        loading: false,
        currentIndex: 0
      }));
    } catch (error) {
      console.error('Failed to fetch call history:', error);
      toast.error('Failed to load call history');
      setCallHistoryModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleOpenCallHistory = (lead) => {
    setCallHistoryModal({
      open: true,
      lead,
      history: [],
      loading: true,
      currentIndex: 0,
    });
    fetchCallHistory(lead._id);
  };

  const handleNextHistory = () => {
    setCallHistoryModal(prev => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.history.length - 1)
    }));
  };

  const handlePrevHistory = () => {
    setCallHistoryModal(prev => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0)
    }));
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadService.deleteLead(id);
        toast.success('Lead deleted successfully');
        fetchLeads();
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const handleBulkAssign = () => {
    if (selectedLeads.length === 0) {
      toast.error('Please select at least one lead');
      return;
    }
    setOpenAssignModal(true);
  };

  const handleAssignSuccess = () => {
    setSelectedLeads([]);
    setBulkAssignMode(false);
    fetchLeads();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((date - now) / (1000 * 60 * 60 * 24));
      
      if (diffInDays < 0) {
        return `${Math.abs(diffInDays)} days ago`;
      } else if (diffInDays === 0) {
        return 'Today';
      } else if (diffInDays === 1) {
        return 'Tomorrow';
      } else {
        return `in ${diffInDays} days`;
      }
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    const phoneStr = phone.toString();
    if (phoneStr.length === 10) {
      return `+91 ${phoneStr.slice(0, 5)}-${phoneStr.slice(5)}`;
    }
    return phoneStr;
  };

  const getTimeFieldLabel = (status) => {
    switch(status) {
      case 'Call Back': return 'Callback Time';
      case 'Follow-up': return 'Next Follow-up';
      default: return 'Schedule Time';
    }
  };

  const getStatusIcon = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.icon : <PhoneIcon fontSize="small" />;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Leads Management
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchLeads}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            {!isCustomerCare && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenForm(true)}
                disabled={loading}
              >
                Add New Lead
              </Button>
            )}
          </Box>
        </Box>

        {/* Filters - Hidden for customer_care */}
        {!isCustomerCare && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                Filters
              </Typography>
              <Button
                variant="outlined"
                startIcon={<FilterOffIcon />}
                onClick={resetFilters}
                size="small"
                disabled={loading || (
                  filters.search === '' &&
                  filters.status === '' &&
                  filters.source === '' &&
                  filters.assignedTo === '' &&
                  filters.startDate === null &&
                  filters.endDate === null &&
                  filters.sortBy === 'next_followup' &&
                  filters.sortOrder === 'asc'
                )}
                title="Reset all filters to default"
              >
                Reset Filters
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search leads..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />


              <FormControl size="small" sx={{ minWidth: 120 }} disabled={loading}>
                <InputLabel>Source</InputLabel>
                <Select
                  value={filters.source}
                  label="Source"
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Social Media">Social Media</MenuItem>
                  <MenuItem value="Website">Website</MenuItem>
                  <MenuItem value="Referral">Referral</MenuItem>
                  <MenuItem value="Walk-in">Walk-in</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }} disabled={loading}>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  value={filters.assignedTo}
                  label="Assigned To"
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {Array.isArray(customerCareMembers) && customerCareMembers.map((member) => (
                    <MenuItem key={member._id} value={member._id}>
                      {member.name || member.fullName || `User ${member._id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { minWidth: 150 }
                  }
                }}
              />

              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { minWidth: 150 }
                  }
                }}
              />

              <Button
                variant={filters.sortBy === 'next_followup' ? 'contained' : 'outlined'}
                onClick={() => handleSortChange('next_followup')}
                startIcon={<ScheduleIcon />}
                endIcon={
                  filters.sortBy === 'next_followup' ? (
                    filters.sortOrder === 'asc' ? <ArrowRightIcon /> : <ArrowLeftIcon />
                  ) : null
                }
                size="small"
              >
                Sort by Follow-up
              </Button>
            </Box>
          </Paper>
        )}

        {/* Bulk Actions - Hidden for customer_care */}
        {!isCustomerCare && bulkAssignMode && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.selected' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>
                {selectedLeads.length} lead(s) selected
              </Typography>
              <Button
                variant="contained"
                startIcon={<AssignmentIcon />}
                onClick={handleBulkAssign}
                disabled={loading}
              >
                Assign Selected
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedLeads([]);
                  setBulkAssignMode(false);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          </Paper>
        )}

        {/* Leads Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <NumbersIcon fontSize="small" />
                    <span>S.No</span>
                  </Box>
                </TableCell>
                {!isCustomerCare && (
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<FilterIcon />}
                      onClick={() => setBulkAssignMode(!bulkAssignMode)}
                      disabled={loading}
                    >
                      Select
                    </Button>
                  </TableCell>
                )}
                <TableCell>Lead ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon fontSize="small" />
                    <Typography variant="inherit">
                      Next Follow-up
                      {filters.sortBy === 'next_followup' && (
                        <Box component="span" sx={{ ml: 0.5 }}>
                          {filters.sortOrder === 'asc' ? '↑' : '↓'}
                        </Box>
                      )}
                    </Typography>
                  </Box>
                </TableCell>
                {/* <TableCell>Created Date</TableCell> */}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isCustomerCare ? 11 : 12} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      Loading leads...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : leads && leads.length > 0 ? (
                leads.map((lead, index) => (
                  <TableRow key={lead._id} hover>
                    {/* Serial Number Column - Reverse Order */}
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: 'primary.50',
                        borderRadius: 1,
                        py: 0.5,
                        mx: 'auto',
                        width: 40,
                        height: 40
                      }}>
                        {getReverseSerialNumber(index)}
                      </Box>
                    </TableCell>
                    
                    {!isCustomerCare && (
                      <TableCell>
                        {bulkAssignMode && (
                          <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLeads([...selectedLeads, lead._id]);
                              } else {
                                setSelectedLeads(
                                  selectedLeads.filter((id) => id !== lead._id)
                                );
                              }
                            }}
                            disabled={loading}
                          />
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bold', color: 'primary.main' }}
                      >
                        {lead.Lead_Id || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {lead.name || 'N/A'}
                      </Typography>
                      {lead.email && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: 'text.secondary',
                          }}
                        >
                          <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {lead.email}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {formatPhone(lead.phone)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {lead.Place || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lead.source || 'Unknown'}
                        size="small"
                        color={sourceColors[lead.source] || 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={lead.status || 'New'}
                          onChange={(e) => handleStatusChange(lead, e.target.value)}
                          sx={{ 
                            height: 32,
                            '& .MuiSelect-select': { py: 0.5 }
                          }}
                        >
                          {statusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: `${option.color}.main`,
                                  }}
                                >
                                  {option.icon}
                                </Box>
                                {option.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      {lead.Assign_member ? (
                        <Tooltip title={lead.Assign_member.email || ''}>
                          <Typography variant="body2">
                            {lead.Assign_member.name || lead.Assign_member.fullName || 'Unknown'}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Chip label="Unassigned" size="small" color="warning" />
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.next_followup ? (
                        <Box>
                          <Typography variant="body2">
                            {formatDate(lead.next_followup)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatRelativeTime(lead.next_followup)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not scheduled
                        </Typography>
                      )}
                    </TableCell>
                    {/* <TableCell>
                      {formatDate(lead.createdAt)}
                    </TableCell> */}
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Call History">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenCallHistory(lead)}
                            disabled={loading}
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {/* <Tooltip title="Edit Lead">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/leads/${lead._id}`)}
                            disabled={loading}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip> */}
                        {!isCustomerCare && (
                          <Tooltip title="Delete Lead">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteLead(lead._id)}
                              disabled={loading}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isCustomerCare ? 11 : 12} align="center">
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <SearchIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No leads found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Object.values(filters).some(value => 
                          value !== '' && value !== null && 
                          (typeof value !== 'object' || (value && Object.keys(value).length > 0))
                        ) ? (
                          <>
                            Try adjusting your filters or{' '}
                            <Button 
                              onClick={resetFilters} 
                              size="small" 
                              sx={{ textTransform: 'none' }}
                            >
                              reset filters
                            </Button>
                          </>
                        ) : (
                          'Start by adding a new lead'
                        )}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          disabled={loading}
        />

        {/* Status Update Modal */}
        <Dialog 
          open={statusUpdateModal.open} 
          onClose={() => setStatusUpdateModal(prev => ({ ...prev, open: false }))}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                Update Lead Status
              </Typography>
              <IconButton onClick={() => setStatusUpdateModal(prev => ({ ...prev, open: false }))}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent>
            {statusUpdateModal.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {statusUpdateModal.error}
              </Alert>
            )}

            {statusUpdateModal.lead && (
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Lead Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {statusUpdateModal.lead.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {formatPhone(statusUpdateModal.lead.phone)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" sx={{ mb: 1 }}>
                    New Status
                  </FormLabel>
                  <RadioGroup
                    row
                    value={statusUpdateModal.status}
                    onChange={(e) => setStatusUpdateModal(prev => ({ 
                      ...prev, 
                      status: e.target.value 
                    }))}
                    sx={{ flexWrap: 'wrap', gap: 1 }}
                  >
                    {statusOptions.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio size="small" />}
                        label={
                          <Chip
                            label={option.label}
                            color={option.color}
                            size="small"
                            variant={statusUpdateModal.status === option.value ? "filled" : "outlined"}
                            icon={option.icon}
                          />
                        }
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>

              {(statusUpdateModal.status === 'Call Back' || statusUpdateModal.status === 'Follow-up') && (
                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label={getTimeFieldLabel(statusUpdateModal.status)}
                      value={statusUpdateModal.status === 'Call Back' 
                        ? statusUpdateModal.callbackTime 
                        : statusUpdateModal.nextFollowup
                      }
                      onChange={(date) => {
                        if (statusUpdateModal.status === 'Call Back') {
                          setStatusUpdateModal(prev => ({ ...prev, callbackTime: date }));
                        } else {
                          setStatusUpdateModal(prev => ({ ...prev, nextFollowup: date }));
                        }
                      }}
                      minDateTime={new Date()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={statusUpdateModal.notes}
                  onChange={(e) => setStatusUpdateModal(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes about this update..."
                  InputProps={{
                    startAdornment: (
                      <NotesIcon sx={{ mr: 1, color: 'action.active', mt: 2 }} />
                    )
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <Box sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              onClick={() => setStatusUpdateModal(prev => ({ ...prev, open: false }))}
              disabled={statusUpdateModal.loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleStatusUpdate}
              disabled={statusUpdateModal.loading}
              startIcon={<CheckCircleIcon />}
            >
              {statusUpdateModal.loading ? 'Updating...' : 'Update Status'}
            </Button>
          </Box>
        </Dialog>

        {/* Call History Modal */}
        <Dialog 
          open={callHistoryModal.open} 
          onClose={() => setCallHistoryModal(prev => ({ ...prev, open: false }))}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { height: '80vh' }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon color="primary" />
                  <Typography variant="h6">
                    Call History Timeline
                  </Typography>
                </Box>
                {callHistoryModal.lead && (
                  <Badge 
                    badgeContent={callHistoryModal.history.length} 
                    color="primary"
                    sx={{ ml: 2 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {callHistoryModal.lead.name} • {formatPhone(callHistoryModal.lead.phone)}
                    </Typography>
                  </Badge>
                )}
              </Box>
              <IconButton onClick={() => setCallHistoryModal(prev => ({ ...prev, open: false }))}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent>
            {callHistoryModal.loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography>Loading call history...</Typography>
              </Box>
            ) : callHistoryModal.history.length > 0 ? (
              <Box sx={{ height: '100%', position: 'relative' }}>
                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: 0, 
                  right: 0, 
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  zIndex: 1,
                  px: 2
                }}>
                  <IconButton
                    onClick={handlePrevHistory}
                    disabled={callHistoryModal.currentIndex === 0}
                    sx={{
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleNextHistory}
                    disabled={callHistoryModal.currentIndex === callHistoryModal.history.length - 1}
                    sx={{
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>

                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {callHistoryModal.currentIndex + 1} of {callHistoryModal.history.length}
                  </Typography>
                </Box>

                {callHistoryModal.history[callHistoryModal.currentIndex] && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ 
                                bgcolor: `${statusColors[callHistoryModal.history[callHistoryModal.currentIndex].status] || 'primary'}.main`,
                                width: 56,
                                height: 56
                              }}>
                                {getStatusIcon(callHistoryModal.history[callHistoryModal.currentIndex].status)}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" gutterBottom>
                                  {callHistoryModal.history[callHistoryModal.currentIndex].status}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDateTime(callHistoryModal.history[callHistoryModal.currentIndex].called_at || 
                                    callHistoryModal.history[callHistoryModal.currentIndex].createdAt)}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label={`Step ${callHistoryModal.currentIndex + 1}`}
                              color="primary"
                              size="small"
                            />
                          </Box>
                        </Grid>

                        {callHistoryModal.history[callHistoryModal.currentIndex].notes && (
                          <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Notes
                              </Typography>
                              <Typography variant="body1">
                                {callHistoryModal.history[callHistoryModal.currentIndex].notes}
                              </Typography>
                            </Paper>
                          </Grid>
                        )}

                        <Grid item xs={12} md={6}>
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon fontSize="small" />
                              Action Details
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              {callHistoryModal.history[callHistoryModal.currentIndex].callback_time && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <CallbackIcon color="warning" fontSize="small" />
                                  <Typography variant="body2">
                                    Callback scheduled for: {formatDateTime(callHistoryModal.history[callHistoryModal.currentIndex].callback_time)}
                                  </Typography>
                                </Box>
                              )}
                              {callHistoryModal.history[callHistoryModal.currentIndex].next_followup && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <ScheduleIcon color="info" fontSize="small" />
                                  <Typography variant="body2">
                                    Next follow-up: {formatDateTime(callHistoryModal.history[callHistoryModal.currentIndex].next_followup)}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon fontSize="small" />
                              Updated By
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {callHistoryModal.history[callHistoryModal.currentIndex].called_by?.name || 
                               callHistoryModal.history[callHistoryModal.currentIndex].called_by?.fullName || 
                               'System'}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Timeline Overview
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    overflowX: 'auto', 
                    gap: 2, 
                    py: 2,
                    '&::-webkit-scrollbar': {
                      height: 8,
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: 4,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#888',
                      borderRadius: 4,
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: '#555',
                    },
                  }}>
                    {callHistoryModal.history.map((record, index) => (
                      <Card
                        key={record._id || index}
                        sx={{
                          minWidth: 200,
                          cursor: 'pointer',
                          border: index === callHistoryModal.currentIndex ? '2px solid' : '1px solid',
                          borderColor: index === callHistoryModal.currentIndex ? 'primary.main' : 'divider',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 3,
                          }
                        }}
                        onClick={() => setCallHistoryModal(prev => ({ ...prev, currentIndex: index }))}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: `${statusColors[record.status] || 'primary'}.main`,
                              }}
                            />
                            <Typography variant="subtitle2" noWrap>
                              {record.status}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {formatDate(record.called_at || record.createdAt)}
                          </Typography>
                          {record.notes && (
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                mt: 0.5
                              }}
                            >
                              {record.notes}
                            </Typography>
                          )}
                          {index < callHistoryModal.history.length - 1 && (
                            <Box sx={{ 
                              position: 'absolute', 
                              right: -16, 
                              top: '50%',
                              color: 'divider'
                            }}>
                              <ArrowRightIcon />
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 4 }}>
                <HistoryIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Call History
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  No call history records found for this lead.
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Lead Form Dialog - Only for non-customer_care */}
        {!isCustomerCare && (
          <Dialog
            open={openForm}
            onClose={() => setOpenForm(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogContent>
              <LeadForm
                onSuccess={() => {
                  setOpenForm(false);
                  fetchLeads();
                }}
                onCancel={() => setOpenForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Assign Lead Dialog - Only for non-customer_care */}
        {!isCustomerCare && (
          <AssignLeadModal
            open={openAssignModal}
            onClose={() => setOpenAssignModal(false)}
            leadIds={selectedLeads}
            onSuccess={handleAssignSuccess}
            customerCareMembers={customerCareMembers}
          />
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default LeadList;