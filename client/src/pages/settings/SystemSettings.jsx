import { config } from '../../config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

function SystemSettings() {
    const [activeTab, setActiveTab] = useState('system');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingSetting, setEditingSetting] = useState(null);
  const [editValue, setEditValue] = useState('');
  const navigate = useNavigate();

  // Setting Categories
  const categories = [
    'All', 'General', 'Security', 'Email', 'SMS', 'Storage', 'Backup', 'Other'
  ];
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Check role authorization (Admin/Command only) - Vision Doc Section 4.2
      if (!['command', 'admin'].includes(parsedUser.role)) {
        navigate('/dashboard');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Fetch system settings
  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user, selectedCategory]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = selectedCategory !== 'All' 
        ? `?category=${selectedCategory}` 
        : '';

      const response = await fetch(`${config.API_BASE_URL}/api/settings/system${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSettings(data.data);
      } else {
        setError(data.message || 'Failed to load system settings');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting) => {
    setEditingSetting(setting._id);
    setEditValue(setting.value);
  };

  const handleCancel = () => {
    setEditingSetting(null);
    setEditValue('');
  };

  const handleSave = async (setting) => {
    try {
      const token = localStorage.getItem('token');
      
     const response = await fetch(`${config.API_BASE_URL}/api/settings/system/${setting.key}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value: editValue,
          description: setting.description
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ Setting ${setting.key} updated successfully!`);
        setEditingSetting(null);
        setEditValue('');
        fetchSettings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update setting');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Update setting error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading System Settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />

        {/* System Settings Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-police-blue">
              ⚙️ System Settings
            </h2>
            <p className="text-gray-600 mt-1">
              Vision Doc Section 4.2 - System Configuration & Security
            </p>
          </div>

         {/* Settings Navigation Tabs */}
<div className="bg-white rounded-lg shadow mb-6">
  <div className="border-b border-gray-200">
    <nav className="flex gap-2 px-4 pt-4">
      <button
        onClick={() => setActiveTab('system')}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
          activeTab === 'system'
            ? 'bg-police-blue text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        ⚙️ System Settings
      </button>
      <button
        onClick={() => navigate('/dashboard/settings/users')}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
          activeTab === 'users'
            ? 'bg-police-blue text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        👥 User Management
      </button>
      <button
        onClick={() => navigate('/dashboard/settings/activity-logs')}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
          activeTab === 'logs'
            ? 'bg-police-blue text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        📜 Activity Logs
      </button>
      <button
        onClick={() => navigate('/dashboard/settings/profile')}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
          activeTab === 'profile'
            ? 'bg-police-blue text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        👤 Profile Settings
      </button>
    </nav>
  </div>
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

          {/* Category Filter */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedCategory === category
                      ? 'bg-police-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-police-blue text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Last Modified</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {settings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No system settings found. Settings will appear as the system is configured.
                      </td>
                    </tr>
                  ) : (
                    settings.map((setting) => (
                      <tr key={setting._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-police-blue">
                          {setting.key}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {editingSetting === setting._id ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                            />
                          ) : (
                            setting.value
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {setting.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {setting.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {setting.lastModifiedAt 
                            ? new Date(setting.lastModifiedAt).toLocaleDateString()
                            : 'N/A'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingSetting === setting._id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSave(setting)}
                                className="text-green-600 hover:text-green-800"
                              >
                                💾 Save
                              </button>
                              <button
                                onClick={handleCancel}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                ❌ Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEdit(setting)}
                              className="text-police-blue hover:text-police-star"
                            >
                              ✏️ Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vision Doc Alignment Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              📋 Vision Document Alignment (Section 4.2 & 5.4)
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ System configuration managed electronically</li>
              <li>✅ Role-based access control (Admin/Command only)</li>
              <li>✅ All changes logged in Activity Log (Section 5.2)</li>
              <li>✅ Enhanced data security (Section 5.4)</li>
              <li>✅ Audit trail preserved for all setting changes</li>
              <li>✅ 90% paperless goal supported</li>
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Settings</p>
              <p className="text-2xl font-bold text-police-blue">{settings.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Security Settings</p>
              <p className="text-2xl font-bold text-red-600">
                {settings.filter(s => s.category === 'Security').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">General Settings</p>
              <p className="text-2xl font-bold text-green-600">
                {settings.filter(s => s.category === 'General').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Other Categories</p>
              <p className="text-2xl font-bold text-purple-600">
                {settings.filter(s => !['Security', 'General'].includes(s.category)).length}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default SystemSettings;