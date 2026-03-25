import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function TransferInmate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [inmate, setInmate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Check role authorization (Command, Admin only) - Vision Doc Section 4.2
      if (!['command', 'admin'].includes(parsedUser.role)) {
        navigate('/dashboard/inmates');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (user && id) {
      fetchInmate();
    }
  }, [user, id]);

  const fetchInmate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/inmates/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setInmate(data.data.inmate);
      } else {
        setError(data.message || 'Failed to load inmate details');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch inmate error:', err);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    toStation: '',
    reason: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/inmates/${id}/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Inmate transferred successfully to ${formData.toStation}!`);
        setTimeout(() => {
          navigate(`/dashboard/inmates/${id}`);
        }, 2000);
      } else {
        setError(data.message || 'Failed to transfer inmate');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Transfer inmate error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !inmate) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-police-blue">🔄 Transfer Inmate</h2>
            <p className="text-gray-600 mt-1">Vision Doc Section 4.3 - Transfer Records</p>
          </div>

          {/* Inmate Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-police-blue mb-4">Inmate Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{inmate.firstName} {inmate.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Inmate ID</p>
                <p className="font-semibold">{inmate.inmateId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Station</p>
                <p className="font-semibold">{inmate.station}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Case Number</p>
                <p className="font-semibold">{inmate.caseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Custody Status</p>
                <p className="font-semibold">{inmate.custodyStatus}</p>
              </div>
            </div>
          </div>

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              ✅ {success}
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              ❌ {error}
            </div>
          )}

          {/* Transfer Form */}
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
            <h3 className="text-lg font-semibold text-police-blue mb-4">Transfer Details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination Station *
                </label>
                <input
                  type="text"
                  name="toStation"
                  value={formData.toStation}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Kumasi CID Office"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transfer Reason *
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="e.g., Case transferred to Kumasi High Court for trial"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                />
              </div>

              {/* Authorization Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-sm text-blue-800">
                  <strong>⚠️ Authorization Required:</strong> This action requires Command or Admin 
                  privileges (Vision Doc Section 4.2 - Role-Based Access). Your action will be logged 
                  for accountability (Vision Doc Section 5.2).
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-police-blue text-white px-8 py-3 rounded-lg hover:bg-police-star transition disabled:bg-gray-400"
                >
                  {processing ? 'Processing...' : '🔄 Confirm Transfer'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/inmates/${id}`)}
                  className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default TransferInmate;