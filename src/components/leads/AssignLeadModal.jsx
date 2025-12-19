import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { leadService } from '../../services/lead.service';
import { toast } from 'react-hot-toast';

const AssignLeadModal = ({ 
  open, 
  onClose, 
  leadIds, 
  onSuccess, 
  customerCareMembers = [] 
}) => {
  const [selectedMember, setSelectedMember] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAssign = async () => {
    if (!selectedMember) {
      setError('Please select a customer care member');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (leadIds.length === 1) {
        // Single lead assignment
        await leadService.assignMember(leadIds[0], selectedMember);
        toast.success('Lead assigned successfully');
      } else {
        let data={leadIds:leadIds, Assign_member:selectedMember}
        // Bulk assignment
        console.log(data);
        
        await leadService.assignMultipleLeads(data);
        toast.success(`${leadIds.length} leads assigned successfully`);
      }
      
      onSuccess();
      handleClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to assign leads');
      toast.error('Failed to assign leads');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedMember('');
    setError('');
    onClose();
  };

  const getMemberName = (memberId) => {
    const member = customerCareMembers.find(m => m._id === memberId);
    return member ? member.name : '';
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Assign {leadIds.length > 1 ? 'Multiple Leads' : 'Lead'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {leadIds.length > 1 
              ? `You are about to assign ${leadIds.length} leads to a customer care member.`
              : 'Select a customer care member to assign this lead to.'
            }
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel>Select Customer Care Member</InputLabel>
            <Select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              label="Select Customer Care Member"
              disabled={loading}
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

          {selectedMember && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Assignment Summary:
              </Typography>
              <Typography variant="body2">
                • Leads to assign: {leadIds.length}
              </Typography>
              <Typography variant="body2">
                • Assigned to: {getMemberName(selectedMember)}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={loading || !selectedMember}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Assigning...' : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignLeadModal;