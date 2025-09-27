import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import type { RootState } from '../store/store';

// Define the expected structure of the JWT payload
interface JwtPayload {
  role: string;
  [key: string]: any;
}

interface ProtectedRouteProps {
  allowedRoles: string[]; // This is now a required prop
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { token } = useSelector((state: RootState) => state.auth);

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode<JwtPayload>(token);
    const userRole = decodedToken.role;

    // Check if the user's role is in the list of allowed roles
    if (allowedRoles.includes(userRole)) {
      return <Outlet />; // Render the child routes
    } else {
      // If role is not allowed, redirect to the home page
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    // If token is invalid or expired, redirect to login
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;