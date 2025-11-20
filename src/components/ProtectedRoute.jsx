import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth';
import { getDefaultRouteForUserType } from '../lib/routeUtils';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredUserType = null }) => {
  const { isAuthenticated: isAuth, userType, user } = useSelector((state) => state.auth);
  const location = useLocation();
  
  // Show loading spinner while authentication state is being determined
  if (user === null && !isAuth) {
    return <LoadingSpinner />;
  }
  
  // Check if user is authenticated
  if (!isAuth || !isAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  
  // If a specific user type is required, check it
  if (requiredUserType && userType !== requiredUserType) {
    // Redirect to appropriate dashboard based on user type
    const redirectPath = getDefaultRouteForUserType(userType);
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

export default ProtectedRoute;
