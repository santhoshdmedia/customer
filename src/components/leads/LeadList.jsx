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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source: '',
    assignedTo: '',
    startDate: null,
    endDate: null,
  });
  const [customerCareMembers, setCustomerCareMembers] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [bulkAssignMode, setBulkAssignMode] = useState(false);

  // Status colors
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

  // Source colors
  const sourceColors = {
    'Social Media': 'secondary',
    Website: 'info',
    Referral: 'success',
    'Walk-in': 'warning',
    Other: 'default',
  };

  useEffect(() => {
    fetchLeads();
    if (!isCustomerCare) {
      fetchCustomerCareMembers();
    }
  }, [page, rowsPerPage, filters]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
        startDate: filters.startDate ? filters.startDate.toISOString() : '',
        endDate: filters.endDate ? filters.endDate.toISOString() : '',
      };

      let response;
      if (user.role !== 'customer_care') {
        response = await leadService.getAllLeads(params);
      } else {
        response = await leadService.getLeadBymemberId(user._id, params);
      }

      console.log(response, "API Response");
      
      if (response && response.data) {
        setLeads(response.data.data || response.data);
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
      console.log(response, "Customer Care Members Response");

      if (response && response.data) {
        // Filter out the current user from the list
        const filteredMembers = Array.isArray(response.data) 
          ? response.data.filter(member => member._id !== user._id)
          : Array.isArray(response.data.data)
          ? response.data.data.filter(member => member._id !== user._id)
          : [];
        
        setCustomerCareMembers(filteredMembers);
        console.log(filteredMembers, "Filtered Customer Care Members");
      } else {
        console.warn('Unexpected response structure:', response);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    const phoneStr = phone.toString();
    if (phoneStr.length === 10) {
      return `${phoneStr.slice(0, 3)}-${phoneStr.slice(3, 6)}-${phoneStr.slice(6)}`;
    }
    return phoneStr;
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
        {/* {!isCustomerCare && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                disabled={loading}
              />

              <FormControl size="small" sx={{ minWidth: 120 }} disabled={loading}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="Contacted">Contacted</MenuItem>
                  <MenuItem value="Interested">Interested</MenuItem>
                  <MenuItem value="Not Interested">Not Interested</MenuItem>
                  <MenuItem value="Call Back">Call Back</MenuItem>
                  <MenuItem value="Customer Login">Customer Login</MenuItem>
                  <MenuItem value="Dealer Login">Dealer Login</MenuItem>
                  <MenuItem value="Follow-up">Follow-up</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>

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
                renderInput={(params) => (
                  <TextField {...params} size="small" sx={{ minWidth: 150 }} disabled={loading} />
                )}
              />

              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                renderInput={(params) => (
                  <TextField {...params} size="small" sx={{ minWidth: 150 }} disabled={loading} />
                )}
              />
            </Box>
          </Paper>
        )} */}

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
                {/* Select column - Hidden for customer_care */}
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
                <TableCell>Created Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isCustomerCare ? 9 : 10} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      Loading leads...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : leads && leads.length > 0 ? (
                leads.map((lead) => (
                  <TableRow key={lead._id} hover>
                    {/* Select checkbox - Hidden for customer_care */}
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
                      <Chip
                        label={lead.status || 'New'}
                        size="small"
                        color={statusColors[lead.status] || 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {lead.Assign_member ? (
                        <Typography variant="body2">
                          {lead.Assign_member.name || lead.Assign_member.fullName || 'Unknown'}
                        </Typography>
                      ) : (
                        <Chip label="Unassigned" size="small" color="warning" />
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(lead.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/leads/${lead._id}`)}
                          disabled={loading}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {!isCustomerCare && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteLead(lead._id)}
                            disabled={loading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isCustomerCare ? 9 : 10} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No leads found
                    </Typography>
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
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          disabled={loading}
        />

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