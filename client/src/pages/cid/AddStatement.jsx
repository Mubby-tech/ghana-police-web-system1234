import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function AddStatement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (user && id) {
      fetchCase();
    }
  }, [user, id]);

  const fetchCase = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/cases/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCaseData(data.data);
      } else {
        setError(data.message || 'Failed to load case details');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch case error:', err);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    personName: '',
    role: 'Witness',
    content: '',
    isSigned: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/cases/${id}/statements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ Statement recorded successfully for ${formData.personName}!`);
        setTimeout(() => {
          navigate(`/dashboard/cid/${id}`);
        }, 2000);
      } else {
        setError(data.message || 'Failed to add statement');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Add statement error:', err);
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

  if (!user || !caseData) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-police-blue">🗣️ Add Digital Statement</h2>
            <p className="text-gray-600 mt-1">Vision Doc Section 4.4 - Electronic CID Documentation</p>
          </div>

          {/* Case Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-police-blue mb-4">Case Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Case Number</p>
                <p className="font-semibold">{caseData.caseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Case Title</p>
                <p className="font-semibold">{caseData.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold">{caseData.status}</p>
              </div>
            </div>
          </div>

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              ❌ {error}
            </div>
          )}

          {/* Statement Form */}
          <div className="bg-white rounded-lg shadow p-6 max-w-3xl">
            <h3 className="text-lg font-semibold text-police-blue mb-4">Statement Details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Person's Name *
                </label>
                <input
                  type="text"
                  name="personName"
                  value={formData.personName}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Kwame Mensah"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                >
                  <option value="Witness">Witness</option>
                  <option value="Suspect">Suspect</option>
                  <option value="Victim">Victim</option>
                  <option value="Expert">Expert (Forensic/Medical)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statement Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows="8"
                  placeholder="Record the full statement here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isSigned"
                  id="isSigned"
                  checked={formData.isSigned}
                  onChange={handleChange}
                  className="w-4 h-4 text-police-blue"
                />
                <label htmlFor="isSigned" className="text-sm text-gray-700">
                  Statement has been signed by the person (E-Signature - Vision Doc Section 4.5)
                </label>
              </div>

              {/* Vision Doc Alignment Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  📋 Vision Document Alignment (Section 4.4)
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✅ Record statements digitally</li>
                  <li>✅ Witness/Suspect/Victim/Expert roles supported</li>
                  <li>✅ E-Signature status tracking (Section 4.5)</li>
                  <li>✅ Activity logging for accountability (Section 5.2)</li>
                  <li>✅ Reduces paper statements</li>
                </ul>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-police-blue text-white px-8 py-3 rounded-lg hover:bg-police-star transition disabled:bg-gray-400"
                >
                  {processing ? 'Recording...' : '🗣️ Record Statement'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/cid/${id}`)}
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

export default AddStatement;