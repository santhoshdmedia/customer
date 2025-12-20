import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  PersonAdd as PersonAddIcon,
  CallMissed as CallMissedIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  PhoneCallback as PhoneCallbackIcon,
  Schedule as ScheduleIcon,
  Call as CallIcon,
} from '@mui/icons-material';
import { leadService } from '../../services/lead.service';
import { toast } from 'react-hot-toast';
import StatsCard from './StatsCard';
import LeadPriorityList from './LeadPriorityList';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  console.log(user,"user");
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentLeads, setRecentLeads] = useState([]);
  // useEffect(()=>{
  //   if (user) {
  //     window.location.reload()
  //   }
  // },[user])

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard stats
      const statsResponse = await leadService.getDashboardStats(user._id);
      console.log('Dashboard Stats:', statsResponse.data.data);
      
      // Set the entire dashboard data including member_info
      setDashboardData(statsResponse.data.data);

      // Fetch recent leads
      const leadsResponse = await leadService.getAllLeads({
        page: 1,
        limit: 5,
      });
      setRecentLeads(leadsResponse.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper to get status count from leads_by_status object
  const getStatusCount = (status) => {
    if (!dashboardData?.stats?.leads_by_status) return 0;
    return dashboardData.stats.leads_by_status[status] || 0;
  };

  // Convert leads_by_status object to array for display
  const getStatusCountsArray = () => {
    if (!dashboardData?.stats?.leads_by_status) return [];
    return Object.entries(dashboardData.stats.leads_by_status).map(([status, count]) => ({
      _id: status,
      count: count
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Welcome, {dashboardData?.member_info?.name || 'User'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
        >
          Refresh
        </Button>
      </Box>

      {/* User Role Badge */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" color="text.secondary">
          Role: <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
            {dashboardData?.member_info?.role}
          </span>
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Leads"
            value={dashboardData?.stats?.total_leads || 0}
            icon={<PeopleIcon />}
            color="#1976d2"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Today's Callbacks"
            value={dashboardData?.stats?.todays_callbacks || 0}
            icon={<PhoneCallbackIcon />}
            color="#2e7d32"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Overdue Callbacks"
            value={dashboardData?.stats?.overdue_callbacks || 0}
            icon={<ScheduleIcon />}
            color="#ed6c02"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Today's Calls"
            value={dashboardData?.stats?.todays_calls || 0}
            icon={<CallIcon />}
            color="#9c27b0"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Conversion Rate"
            value={`${dashboardData?.stats?.conversion_rate || '0.00'}%`}
            icon={<TrendingUpIcon />}
            color="#2196f3"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="New Leads"
            value={getStatusCount('New')}
            icon={<PersonAddIcon />}
            color="#4caf50"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Follow-up Needed"
            value={getStatusCount('Follow-up')}
            icon={<CallMissedIcon />}
            color="#ff9800"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Interested"
            value={getStatusCount('Interested')}
            icon={<TrendingUpIcon />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Leads */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Leads
            </Typography>
            <LeadPriorityList leads={recentLeads} />
          </Paper>
        </Grid>

        {/* Lead Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lead Distribution by Status
            </Typography>
            <Box sx={{ mt: 2 }}>
              {getStatusCountsArray().map((item) => (
                <Box
                  key={item._id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {item._id}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {item.count}
                  </Typography>
                </Box>
              ))}
              {getStatusCountsArray().length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No lead status data available
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Quick Stats Summary */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Summary
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="body2">Member Since</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {dashboardData?.member_info?.createdAt 
                    ? new Date(dashboardData.member_info.createdAt).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 1.5, bgcolor: '#f3e5f5', borderRadius: 1 }}>
                <Typography variant="body2">Account Status</Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: dashboardData?.member_info?.isActive ? 'success.main' : 'error.main'
                  }}
                >
                  {dashboardData?.member_info?.isActive ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                <Typography variant="body2">Total Call Tasks</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {(dashboardData?.stats?.todays_callbacks || 0) + (dashboardData?.stats?.overdue_callbacks || 0)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;