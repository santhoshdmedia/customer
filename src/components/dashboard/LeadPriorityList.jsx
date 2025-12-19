import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LeadPriorityList = ({ leads }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    const colors = {
      New: 'primary',
      Followup: 'warning',
      'Call Back': 'error',
      Interested: 'success',
      Closed: 'default',
    };
    return colors[status] || 'default';
  };

  const formatPhone = (phone) => {
    const phoneStr = phone.toString();
    return `${phoneStr.slice(0, 3)}-${phoneStr.slice(3, 6)}-${phoneStr.slice(6)}`;
  };

  return (
    <List sx={{ width: '100%' }}>
      {leads.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
          No leads found
        </Typography>
      ) : (
        leads.map((lead, index) => (
          <React.Fragment key={lead._id}>
            <ListItem
              alignItems="flex-start"
              sx={{
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
              onClick={() => navigate(`/leads/${lead._id}`)}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {lead.name.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" component="span">
                      {lead.name}
                    </Typography>
                    <Chip
                      label={lead.status}
                      size="small"
                      color={getStatusColor(lead.status)}
                    />
                  </Box>
                }
                secondary={
                  <React.Fragment>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ mr: 2 }}
                      >
                        {formatPhone(lead.phone)}
                      </Typography>
                      {lead.email && (
                        <>
                          <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {lead.email}
                          </Typography>
                        </>
                      )}
                    </Box>
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                    >
                      ID: {lead.Lead_Id} | Source: {lead.source} | Created:{' '}
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < leads.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))
      )}
    </List>
  );
};

export default LeadPriorityList;