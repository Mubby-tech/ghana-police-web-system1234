import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function EditCase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Check role authorization (CID, Command, Admin only) - Vision Doc Section 4.2
      if (!['cid', 'command', 'admin'].includes(parsedUser.role)) {
        navigate('/dashboard/cid');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Fetch case details
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
        setFormData({
          status: data.data.status,
          priority: data.data.priority,
          assignedDetective: data.data.assignedDetective?._id || '',
          title: data.data.title,
          description: data.data.description,
          category: data.data.category,
          station: data.data.station
        });
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
    status: '',
    priority: '',
    assignedDetective: '',
    title: '',
    description: '',
    category: '',
    station: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        status: formData.status,
        priority: formData.priority,
        assignedDetective: formData.assignedDetective || null,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        station: formData.station
      };

      const response = await fetch(`${config.API_BASE_URL}/api/cases/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Case updated successfully!');
        setTimeout(() => {
          navigate(`/dashboard/cid/${id}`);
        }, 2000);
      } else {
        setError(data.message || 'Failed to update case');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Update case error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading Case Details...</p>
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
            <h2 className="text-2xl font-bold text-police-blue">✏️ Edit CID Case</h2>
            <p className="text-gray-600 mt-1">Vision Doc Section 4.4 - Electronic CID Documentation</p>
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Case Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">📋 Case Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
                  <input type="text" value={caseData.caseNumber} disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue">
                    <option value="Theft">Theft</option>
                    <option value="Assault">Assault</option>
                    <option value="Murder">Murder</option>
                    <option value="Fraud">Fraud</option>
                    <option value="Cyber Crime">Cyber Crime</option>
                    <option value="Traffic">Traffic</option>
                    <option value="Narcotics">Narcotics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Investigation Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">🔍 Investigation Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Status *</label>
                  <select name="status" value={formData.status} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue">
                    <option value="Open">Open</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Pending Court">Pending Court</option>
                    <option value="Closed">Closed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
                  <input type="text" name="station" value={formData.station} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
              </div>
            </div>

            {/* Vision Doc Alignment Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                📋 Vision Document Alignment (Section 4.4 & 5.2)
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ Electronic CID Documentation</li>
                <li>✅ Investigation Progress Tracking</li>
                <li>✅ Activity Logging for Accountability (Section 5.2)</li>
                <li>✅ Role-Based Access Control (Section 4.2 - CID/Command/Admin)</li>
                <li>✅ Centralized Database Update (Section 4.1)</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={saving}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400">
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
              <button type="button" onClick={() => navigate(`/dashboard/cid/${id}`)}
                className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 transition">
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default EditCase;