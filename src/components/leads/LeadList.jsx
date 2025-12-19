import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
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
  DialogActions,
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
import {TablePagination} from '@mui/material';


const LeadList = () => {
  const { user, logout } = useAuth();

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
    fetchCustomerCareMembers();
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

      const response = await leadService.getLeadBymemberId(user._id);
      console.log(response, "res");


      setLeads(response.data.data);
      setTotal(response.total);
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerCareMembers = async () => {
    try {
      const response = await customerCareService.getAllUsers();
      
      // Safely handle the response - check if data exists
      if (response && response.data && Array.isArray(response.data.data)) {
        setCustomerCareMembers(response.data.data);
      } else {
        console.warn('Unexpected response structure:', response);
        setCustomerCareMembers([]); // Set to empty array as fallback
      }
    } catch (error) {
      console.error('Failed to fetch customer care members:', error);
      setCustomerCareMembers([]); // Set to empty array on error
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
    return new Date(dateString).toLocaleDateString();
  };

  const formatPhone = (phone) => {
    const phoneStr = phone.toString();
    return `${phoneStr.slice(0, 3)}-${phoneStr.slice(3, 6)}-${phoneStr.slice(6)}`;
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
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenForm(true)}
            >
              Add New Lead
            </Button>
          </Box>
        </Box>

        {/* Filters */}
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
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
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

            <FormControl size="small" sx={{ minWidth: 120 }}>
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

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Assigned To</InputLabel>
              <Select
                value={filters.assignedTo}
                label="Assigned To"
                onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {/* Use optional chaining to safely map over customerCareMembers */}
                {customerCareMembers && customerCareMembers.map ? 
                  customerCareMembers.map((member) => (
                    <MenuItem key={member._id} value={member._id}>
                      {member.name}
                    </MenuItem>
                  )) : null}
              </Select>
            </FormControl>

            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
              renderInput={(params) => (
                <TextField {...params} size="small" sx={{ minWidth: 150 }} />
              )}
            />

            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              renderInput={(params) => (
                <TextField {...params} size="small" sx={{ minWidth: 150 }} />
              )}
            />
          </Box>
        </Paper>

        {/* Bulk Actions */}
        {bulkAssignMode && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.selected' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>
                {selectedLeads.length} lead(s) selected
              </Typography>
              <Button
                variant="contained"
                startIcon={<AssignmentIcon />}
                onClick={handleBulkAssign}
              >
                Assign Selected
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedLeads([]);
                  setBulkAssignMode(false);
                }}
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
                <TableCell>
                  <Button
                    size="small"
                    startIcon={<FilterIcon />}
                    onClick={() => setBulkAssignMode(!bulkAssignMode)}
                  >
                    Select
                  </Button>
                </TableCell>
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
              {leads && leads.length > 0 ? (
                leads.map((lead) => (
                  <TableRow key={lead._id} hover>
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
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bold', color: 'primary.main' }}
                      >
                        {lead.Lead_Id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {lead.name}
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
                        {lead.Place}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lead.source}
                        size="small"
                        color={sourceColors[lead.source] || 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lead.status}
                        size="small"
                        color={statusColors[lead.status] || 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {lead.Assign_member ? (
                        <Typography variant="body2">
                          {lead.Assign_member.name}
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
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteLead(lead._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
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
        />

        {/* Lead Form Dialog */}
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

        {/* Assign Lead Dialog */}
        <AssignLeadModal
          open={openAssignModal}
          onClose={() => setOpenAssignModal(false)}
          leadIds={selectedLeads}
          onSuccess={handleAssignSuccess}
          customerCareMembers={customerCareMembers || []} // Pass empty array as fallback
        />
      </Box>
    </LocalizationProvider>
  );
};

export default LeadList;