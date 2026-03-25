import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Check if user is logged in (token + user data)
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  console.log('ProtectedRoute - Token:', token ? 'Exists' : 'Missing');
  console.log('ProtectedRoute - User:', user ? 'Exists' : 'Missing');

  if (!token || !user) {
    // Not logged in, redirect to login page
    return <Navigate to="/" replace />;
  }

  // Logged in, show the protected page
  return children;
}

export default ProtectedRoute;