import { config } from '../config';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [policeId, setPoliceId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Connect to backend authentication API
      const response = await fetch(`${config.API_ENDPOINTS.AUTH}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ policeId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data in localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-police-light flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Header - Police Blue Background */}
        <div className="bg-police-blue py-8 px-6 text-center">
          <img 
            src="/gps-logo.png" 
            alt="GPS Logo" 
            className="w-24 h-24 mx-auto bg-white rounded-full p-2 mb-4"
          />
          <h1 className="text-2xl font-bold text-white">
            Ghana Police Service
          </h1>
          <p className="text-police-gold text-sm mt-1 font-medium">
            Digital Transformation System
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <h2 className="text-xl font-semibold text-police-blue mb-6 text-center">
            Officer Login
          </h2>

          {error && (
            <div className="bg-police-red/10 text-police-red p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Police ID */}
            <div>
              <label className="block text-police-blue font-medium mb-1">
                Police ID Number
              </label>
              <input
                type="text"
                value={policeId}
                onChange={(e) => setPoliceId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-star transition"
                placeholder="e.g., GPS-12345"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your official Service ID
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-police-blue font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-star transition"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <a href="#" className="text-sm text-police-star hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-police-blue text-white py-3 rounded font-semibold hover:bg-police-star transition disabled:bg-gray-400"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>

          {/* 2FA Notice */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
              🔒 This system is secured. Two-Factor Authentication (2FA) may be required.
            </p>
          </div>
        </div>

        {/* Footer - Motto */}
        <div className="bg-gray-50 py-4 text-center">
          <p className="text-xs text-police-blue font-semibold">
            SERVICE WITH INTEGRITY
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;