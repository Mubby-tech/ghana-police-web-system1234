import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

function ProfileSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'
  const navigate = useNavigate();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    station: '',
    region: ''
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Ghana Regions (All 16 Regions)
  const regions = [
    'Greater Accra', 'Ashanti', 'Central', 'Western', 'Eastern',
    'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono',
    'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti'
  ];

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

  // Fetch user profile
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('${`${config.API_BASE_URL}/api/settings/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.data);
        setProfileData({
          name: data.data.name || '',
          email: data.data.email || '',
          contactNumber: data.data.contactNumber || '',
          station: data.data.station || '',
          region: data.data.region || ''
        });
      } else {
        setError(data.message || 'Failed to load profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('${`${config.API_BASE_URL}/api/settings/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Profile updated successfully!');
        // Update localStorage with new profile data
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Update profile error:', err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('❌ New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('❌ Password must be at least 6 characters');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('${`${config.API_BASE_URL}/api/settings/profile/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Password changed successfully! Please login again with your new password.');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Clear token and redirect to login after 3 seconds
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/');
        }, 3000);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Change password error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
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

        {/* Profile Settings Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-police-blue">
              👤 Profile Settings
            </h2>
            <p className="text-gray-600 mt-1">
              Vision Doc Section 4.2 - Individual Officer Profile Management
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

          {/* Profile Overview Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-police-blue/10 rounded-full flex items-center justify-center text-4xl">
                👮
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-police-blue">
                  {profile.name}
                </h3>
                <p className="text-lg font-semibold text-gray-800">{profile.policeId}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span><strong>Role:</strong> {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</span>
                  <span><strong>Rank:</strong> {profile.rank || 'N/A'}</span>
                  <span><strong>Station:</strong> {profile.station || 'N/A'}</span>
                  <span><strong>Region:</strong> {profile.region || 'N/A'}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    profile.status === 'Active' ? 'bg-green-100 text-green-800' :
                    profile.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                    profile.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {profile.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex gap-2 px-4 pt-4">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                    activeTab === 'profile'
                      ? 'bg-police-blue text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📋 Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                    activeTab === 'password'
                      ? 'bg-police-blue text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🔐 Change Password
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              
              {/* Profile Information Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Police ID
                      </label>
                      <input
                        type="text"
                        value={profile.policeId || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        value={(profile.role || '').charAt(0).toUpperCase() + (profile.role || '').slice(1)}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Contact admin to change role</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={profileData.contactNumber}
                        onChange={handleProfileChange}
                        required
                        placeholder="0555123456"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rank
                      </label>
                      <input
                        type="text"
                        value={profile.rank || 'N/A'}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Use Personnel module for promotion</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Station *
                      </label>
                      <input
                        type="text"
                        name="station"
                        value={profileData.station}
                        onChange={handleProfileChange}
                        required
                        placeholder="e.g., Accra Central Police Station"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Region *
                      </label>
                      <select
                        name="region"
                        value={profileData.region}
                        onChange={handleProfileChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                      >
                        <option value="">Select Region</option>
                        {regions.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-police-blue text-white px-8 py-3 rounded-lg hover:bg-police-star transition"
                    >
                      💾 Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchProfile()}
                      className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>Important:</strong> After changing your password, you will be logged out and need to login again with your new password.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Enter your current password"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password *
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Enter new password (min 6 characters)"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 6 characters required
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-police-blue text-white px-8 py-3 rounded-lg hover:bg-police-star transition"
                    >
                      🔐 Change Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                      className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 transition"
                    >
                      Clear
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

          {/* Vision Doc Alignment Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              📋 Vision Document Alignment (Section 4.2 & 5.4)
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ Police ID Login System - Individual profile management</li>
              <li>✅ All officers can manage their own profile</li>
              <li>✅ All changes logged in Activity Log (Section 5.2)</li>
              <li>✅ Enhanced data security (Section 5.4)</li>
              <li>✅ Password change with encryption (bcrypt)</li>
              <li>✅ Automatic logout after password change for security</li>
              <li>✅ 90% paperless goal supported</li>
            </ul>
          </div>

          {/* Account Security Tips */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded p-4">
            <h4 className="text-sm font-semibold text-green-800 mb-2">
              🔒 Account Security Tips
            </h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Use a strong password with at least 6 characters</li>
              <li>• Never share your password with anyone</li>
              <li>• Change your password regularly (every 90 days)</li>
              <li>• Log out when using shared computers</li>
              <li>• Report any suspicious activity to your commander</li>
              <li>• Keep your contact information up to date</li>
            </ul>
          </div>

          {/* Last Activity */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-police-blue mb-4">📊 Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Account Created</p>
                <p className="font-semibold">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-semibold">
                  {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Password Last Changed</p>
                <p className="font-semibold">
                  {profile.passwordChangedAt ? new Date(profile.passwordChangedAt).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <p className="font-semibold">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    profile.status === 'Active' ? 'bg-green-100 text-green-800' :
                    profile.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                    profile.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {profile.status || 'Active'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProfileSettings;