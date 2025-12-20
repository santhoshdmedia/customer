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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        // backgroundColor: '#fffde7'
      }}>
        <CircularProgress sx={{ color: '#ffd600' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#ff8f00', fontWeight: 'bold' }}>
          Welcome, {dashboardData?.member_info?.name || 'User'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          sx={{
            borderColor: '#ffd600',
            color: '#ff8f00',
            '&:hover': {
              borderColor: '#ffca28',
              backgroundColor: 'rgba(255, 214, 0, 0.08)',
            }
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* User Role Badge */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: '#fff9c4', borderRadius: 1 }}>
        <Typography variant="subtitle1" sx={{ color: '#ff6f00', fontWeight: 'bold' }}>
          Role: <span style={{ textTransform: 'capitalize', color: '#ff9800' }}>
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
            color="#ffd600"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Today's Callbacks"
            value={dashboardData?.stats?.todays_callbacks || 0}
            icon={<PhoneCallbackIcon />}
            color="#ffca28"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Overdue Callbacks"
            value={dashboardData?.stats?.overdue_callbacks || 0}
            icon={<ScheduleIcon />}
            color="#ffb300"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="New Leads Today"
            value={dashboardData?.stats?.new_leads_today || 0}
            icon={<PersonAddIcon />}
            color="#ffa000"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Conversion Rate"
            value={`${dashboardData?.stats?.conversion_rate || '0.00'}%`}
            icon={<TrendingUpIcon />}
            color="#ff8f00"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Assigned Leads"
            value={dashboardData?.stats?.assigned_leads || 0}
            icon={<AssignmentIcon />}
            color="#ff6f00"
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
            title="Pending Calls"
            value={dashboardData?.stats?.pending_calls || 0}
            icon={<CallIcon />}
            color="#ffab00"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Leads */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ 
            p: 2, 
            height: '100%',
            backgroundColor: '#fff9c4',
            border: '1px solid #ffd600'
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#ff6f00', fontWeight: 'bold' }}>
              Recent Leads
            </Typography>
            <LeadPriorityList leads={recentLeads} />
          </Paper>
        </Grid>

        {/* Lead Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ 
            p: 2, 
            mb: 3,
            backgroundColor: '#fff9c4',
            border: '1px solid #ffd600'
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#ff6f00', fontWeight: 'bold' }}>
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
                    bgcolor: '#fff59d',
                    border: '1px solid #ffd600',
                    '&:hover': {
                      bgcolor: '#ffecb3',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s',
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ 
                    textTransform: 'capitalize',
                    color: '#ff6f00',
                    fontWeight: 'medium'
                  }}>
                    {item._id}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'bold',
                    color: '#ff8f00'
                  }}>
                    {item.count}
                  </Typography>
                </Box>
              ))}
              {getStatusCountsArray().length === 0 && (
                <Typography variant="body2" sx={{ 
                  color: '#ff9800', 
                  textAlign: 'center', 
                  py: 2 
                }}>
                  No lead status data available
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Quick Stats Summary */}
          <Paper sx={{ 
            p: 2,
            backgroundColor: '#fff9c4',
            border: '1px solid #ffd600'
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#ff6f00', fontWeight: 'bold' }}>
              Quick Summary
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2, 
                p: 1.5, 
                bgcolor: '#fff8e1', 
                borderRadius: 1,
                border: '1px solid #ffecb3'
              }}>
                <Typography variant="body2" sx={{ color: '#ff8f00' }}>Member Since</Typography>
                <Typography variant="body2" sx={{ 
                  fontWeight: 'bold',
                  color: '#ff6f00'
                }}>
                  {dashboardData?.member_info?.createdAt 
                    ? new Date(dashboardData.member_info.createdAt).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2, 
                p: 1.5, 
                bgcolor: '#fff8e1', 
                borderRadius: 1,
                border: '1px solid #ffecb3'
              }}>
                <Typography variant="body2" sx={{ color: '#ff8f00' }}>Account Status</Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: dashboardData?.member_info?.isActive ? '#2e7d32' : '#d32f2f'
                  }}
                >
                  {dashboardData?.member_info?.isActive ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: 1.5, 
                bgcolor: '#fff8e1', 
                borderRadius: 1,
                border: '1px solid #ffecb3'
              }}>
                <Typography variant="body2" sx={{ color: '#ff8f00' }}>Total Call Tasks</Typography>
                <Typography variant="body2" sx={{ 
                  fontWeight: 'bold',
                  color: '#ff6f00'
                }}>
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