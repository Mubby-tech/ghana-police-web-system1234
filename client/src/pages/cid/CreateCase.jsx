import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

function CreateCase() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Form state (Vision Doc Section 4.4 - Electronic CID Documentation)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    station: '',
    suspects: [{ name: '', status: 'At Large' }]
  });

  // Ghana Police Stations (for dropdown)
  const stations = [
    'Accra Central Police Station',
    'Accra North Police Station',
    'Kumasi Central Police Station',
    'Kumasi North Police Station',
    'Cape Coast Police Station',
    'Takoradi Police Station',
    'Tamale Police Station',
    'Ho Police Station',
    'Sunyani Police Station',
    'Koforidua Police Station',
    'Wa Police Station',
    'Bolgatanga Police Station',
    'CID Headquarters'
  ];

  // Crime Categories (Vision Doc Section 4.1 - Centralized Database)
  const categories = [
    'Theft',
    'Assault',
    'Murder',
    'Fraud',
    'Cyber Crime',
    'Traffic',
    'Narcotics',
    'Robbery',
    'Burglary',
    'Kidnapping',
    'Domestic Violence',
    'Economic Crime',
    'Other'
  ];

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle suspect input change
  const handleSuspectChange = (index, field, value) => {
    const updatedSuspects = [...formData.suspects];
    updatedSuspects[index][field] = value;
    setFormData(prev => ({
      ...prev,
      suspects: updatedSuspects
    }));
  };

  // Add new suspect
  const addSuspect = () => {
    setFormData(prev => ({
      ...prev,
      suspects: [...prev.suspects, { name: '', status: 'At Large' }]
    }));
  };

  // Remove suspect
  const removeSuspect = (index) => {
    if (formData.suspects.length > 1) {
      const updatedSuspects = formData.suspects.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        suspects: updatedSuspects
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('${`${config.API_BASE_URL}/api/cases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ Case created successfully! Case Number: ${data.data.caseNumber}`);
        setTimeout(() => {
          navigate('/dashboard/cid');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create case');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Create case error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />

        {/* Create Case Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-police-blue">
              📝 Open New CID Case
            </h2>
            <p className="text-gray-600 mt-1">
              Vision Doc Section 4.4 - Electronic CID Documentation System
            </p>
          </div>

          {/* Success/Error Messages */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Case Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                📋 Case Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Case Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Armed Robbery at Accra Central"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Case Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    placeholder="Provide detailed description of the incident..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Crime Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority Level *
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Station *
                  </label>
                  <select
                    name="station"
                    value={formData.station}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="">Select Station</option>
                    {stations.map(station => (
                      <option key={station} value={station}>{station}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Suspects Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                👤 Suspects Information
              </h3>
              {formData.suspects.map((suspect, index) => (
                <div key={index} className="flex gap-4 mb-4 p-4 bg-gray-50 rounded">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Suspect Name {index + 1}
                    </label>
                    <input
                      type="text"
                      value={suspect.name}
                      onChange={(e) => handleSuspectChange(index, 'name', e.target.value)}
                      placeholder="e.g., Unknown Male 1 or John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={suspect.status}
                      onChange={(e) => handleSuspectChange(index, 'status', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    >
                      <option value="At Large">At Large</option>
                      <option value="Detained">Detained</option>
                      <option value="Released">Released</option>
                      <option value="Deceased">Deceased</option>
                    </select>
                  </div>
                  {formData.suspects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSuspect(index)}
                      className="mt-6 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSuspect}
                className="mt-2 text-police-blue hover:underline text-sm"
              >
                + Add Another Suspect
              </button>
            </div>

            {/* Section 3: Vision Doc Alignment Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                📋 Vision Document Alignment (Section 4.4)
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ Electronic CID Documentation</li>
                <li>✅ Digital Case File Creation</li>
                <li>✅ Auto-Generated Case Number (CID-YYYYMMDD-XXX)</li>
                <li>✅ Activity Logging for Accountability (Section 5.2)</li>
                <li>✅ Role-Based Access Control (Section 4.2)</li>
                <li>✅ Centralized Database Storage (Section 4.1)</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-police-blue text-white px-8 py-3 rounded-lg hover:bg-police-star transition disabled:bg-gray-400"
              >
                {loading ? 'Creating Case...' : '📝 Open CID Case'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/cid')}
                className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default CreateCase;