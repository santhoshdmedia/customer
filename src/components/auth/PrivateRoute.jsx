// src/components/auth/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, getUserRole, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" />;
  // }

  // Check role-based access
  if (roles.length > 0) {
    const userRole = getUserRole();
    if (!roles.includes(userRole)) {
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
};

export default PrivateRoute;