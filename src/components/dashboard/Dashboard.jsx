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

  // Modern color palette
  const colors = {
    primary: '#4361ee',     // Vibrant blue
    secondary: '#3a0ca3',   // Deep purple
    accent: '#f72585',      // Pink accent
    success: '#4cc9f0',     // Light blue
    warning: '#ff9e00',     // Orange
    danger: '#f72585',      // Pink-red
    info: '#7209b7',        // Purple
    light: '#f8f9fa',       // Light background
    dark: '#212529',        // Dark text
    gradient: {
      primary: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
      secondary: 'linear-gradient(135deg, #f72585 0%, #b5179e 100%)',
      success: 'linear-gradient(135deg, #4cc9f0 0%, #4361ee 100%)',
      warning: 'linear-gradient(135deg, #ff9e00 0%, #ff5400 100%)',
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsResponse = await leadService.getDashboardStats(user._id);
      console.log('Dashboard Stats:', statsResponse.data.data);
      
      setDashboardData(statsResponse.data.data);

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

  const getStatusCount = (status) => {
    if (!dashboardData?.stats?.leads_by_status) return 0;
    return dashboardData.stats.leads_by_status[status] || 0;
  };

  const getStatusCountsArray = () => {
    if (!dashboardData?.stats?.leads_by_status) return [];
    return Object.entries(dashboardData.stats.leads_by_status).map(([status, count]) => ({
      _id: status,
      count: count
    }));
  };

  // Status color mapping
  const getStatusColor = (status) => {
    const colorMap = {
      'New': colors.primary,
      'Contacted': colors.success,
      'Follow-up': colors.warning,
      'Converted': '#4ade80',
      'Closed': colors.danger,
      'Pending': colors.info,
      'default': colors.primary
    };
    return colorMap[status] || colorMap.default;
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        background: colors.gradient.primary
      }}>
        <CircularProgress sx={{ color: '#ffffff' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
    }}>
      {/* Header Section */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        borderRadius: 2,
        background: colors.gradient.primary,
        boxShadow: '0 8px 32px rgba(67, 97, 238, 0.3)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Welcome back, {dashboardData?.member_info?.name || 'User'}!
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Here's what's happening with your leads today
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchDashboardData}
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.3)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease',
              },
            }}
          >
            Refresh
          </Button>
        </Box>
        
        {/* User Info Badge */}
        <Box sx={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 1, 
          px: 2, 
          py: 1, 
          borderRadius: 2,
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
            Role:
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
            {dashboardData?.member_info?.role}
          </Typography>
          <Box sx={{ 
            ml: 1,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: dashboardData?.member_info?.isActive ? '#4ade80' : '#ef4444',
            animation: dashboardData?.member_info?.isActive ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.5 },
            }
          }} />
        </Box>
      </Box>

      {/* Stats Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Total Leads", value: dashboardData?.stats?.total_leads || 0, icon: <PeopleIcon />, color: colors.gradient.primary },
          { title: "Today's Callbacks", value: dashboardData?.stats?.todays_callbacks || 0, icon: <PhoneCallbackIcon />, color: colors.gradient.success },
          { title: "Overdue Callbacks", value: dashboardData?.stats?.overdue_callbacks || 0, icon: <ScheduleIcon />, color: colors.gradient.warning },
          // { title: "New Leads Today", value: dashboardData?.stats?.new_leads_today || 0, icon: <PersonAddIcon />, color: colors.gradient.secondary },
          { title: "Conversion Rate", value: `${dashboardData?.stats?.conversion_rate || '0.00'}%`, icon: <TrendingUpIcon />, color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
          // { title: "Assigned Leads", value: dashboardData?.stats?.assigned_leads || 0, icon: <AssignmentIcon />, color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
          // { title: "Follow-up Needed", value: getStatusCount('Follow-up'), icon: <CallMissedIcon />, color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
          // { title: "Pending Calls", value: dashboardData?.stats?.pending_calls || 0, icon: <CallIcon />, color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatsCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Leads */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ 
            p: 3, 
            height: '100%',
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
              transform: 'translateY(-4px)',
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ 
                width: 4, 
                height: 24, 
                background: colors.gradient.primary,
                borderRadius: 2,
                mr: 2 
              }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                background: colors.gradient.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Recent Leads
              </Typography>
            </Box>
            <LeadPriorityList leads={recentLeads} />
          </Paper>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Lead Distribution */}
          <Paper sx={{ 
            p: 3, 
            mb: 3,
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ 
                width: 4, 
                height: 24, 
                background: colors.gradient.secondary,
                borderRadius: 2,
                mr: 2 
              }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                background: colors.gradient.secondary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Lead Distribution
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              {getStatusCountsArray().map((item) => (
                <Box
                  key={item._id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, rgba(248, 249, 250, 0.8) 0%, rgba(233, 236, 239, 0.4) 100%)',
                    borderLeft: `4px solid ${getStatusColor(item._id)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(8px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: getStatusColor(item._id),
                    }} />
                    <Typography variant="body1" sx={{ 
                      textTransform: 'capitalize',
                      color: colors.dark,
                      fontWeight: 'medium'
                    }}>
                      {item._id}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    color: getStatusColor(item._id)
                  }}>
                    {item.count}
                  </Typography>
                </Box>
              ))}
              {getStatusCountsArray().length === 0 && (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  color: colors.dark,
                  opacity: 0.6
                }}>
                  <Typography variant="body1">
                    No lead status data available
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Quick Summary */}
          <Paper sx={{ 
            p: 3,
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ 
                width: 4, 
                height: 24, 
                background: colors.gradient.success,
                borderRadius: 2,
                mr: 2 
              }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                background: colors.gradient.success,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Quick Summary
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              {[
                {
                  label: 'Member Since',
                  value: dashboardData?.member_info?.createdAt 
                    ? new Date(dashboardData.member_info.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A',
                  icon: '📅'
                },
                {
                  label: 'Account Status',
                  value: dashboardData?.member_info?.isActive ? 'Active' : 'Inactive',
                  color: dashboardData?.member_info?.isActive ? '#10b981' : '#ef4444',
                  icon: dashboardData?.member_info?.isActive ? '✅' : '⏸️'
                },
                {
                  label: 'Total Call Tasks',
                  value: (dashboardData?.stats?.todays_callbacks || 0) + (dashboardData?.stats?.overdue_callbacks || 0),
                  icon: '📞'
                }
              ].map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, rgba(248, 249, 250, 0.8) 0%, rgba(233, 236, 239, 0.4) 100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                      {item.icon}
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.dark }}>
                      {item.label}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: item.color || colors.primary,
                      fontSize: '1.1rem'
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;