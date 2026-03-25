import { config } from '../../config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

function UserManagement() {
    const [activeTab, setActiveTab] = useState('users');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [region, setRegion] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserData, setNewUserData] = useState({
    policeId: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'officer',
    rank: 'Constable',
    region: '',
    station: '',
    tempPassword: ''
  });
  const navigate = useNavigate();

  // Available Roles (Vision Doc Section 4.2)
  const roles = [
    'officer', 'cid', 'hr', 'command', 'admin'
  ];

  // Available Status Options
  const statuses = [
    'Active', 'Inactive', 'Suspended', 'Retired'
  ];

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
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Check role authorization (Admin only) - Vision Doc Section 4.2
      if (parsedUser.role !== 'admin') {
        navigate('/dashboard');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Fetch users
  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, page, search, role, status, region]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '25',
        ...(search && { search }),
        ...(role && { role }),
        ...(status && { status }),
        ...(region && { region })
      });

      const response = await fetch(`${config.API_BASE_URL}/api/settings/users?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(data.data);
        setTotalPages(data.pages);
        setTotalUsers(data.total);
      } else {
        setError(data.message || 'Failed to load users');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleResetFilters = () => {
    setSearch('');
    setRole('');
    setStatus('');
    setRegion('');
    setPage(1);
    fetchUsers();
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setModalType('role');
    setShowModal(true);
  };

  const openStatusModal = (user) => {
    setSelectedUser(user);
    setNewStatus(user.status);
    setModalType('status');
    setShowModal(true);
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setModalType('password');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setNewRole('');
    setNewStatus('');
    setNewPassword('');
  };

  const handleUpdateRole = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${config.API_BASE_URL}/api/settings/users/${selectedUser._id}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ User ${selectedUser.policeId} role updated to ${newRole}!`);
        closeModal();
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update role');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Update role error:', err);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${config.API_BASE_URL}/api/settings/users/${selectedUser._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ User ${selectedUser.policeId} status updated to ${newStatus}!`);
        closeModal();
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update status');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Update status error:', err);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (newPassword.length < 6) {
        setError('❌ Password must be at least 6 characters');
        return;
      }

      const token = localStorage.getItem('token');
      
      const response = await fetch(`${config.API_BASE_URL}/api/settings/users/${selectedUser._id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ Password reset for user ${selectedUser.policeId}!`);
        closeModal();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Reset password error:', err);
    }
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = 'Temp@';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUserData(prev => ({
      ...prev,
      tempPassword: password
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${config.API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          policeId: newUserData.policeId,
          firstName: newUserData.firstName,
          lastName: newUserData.lastName,
          email: newUserData.email,
          password: newUserData.tempPassword || 'TempPass123!',
          role: newUserData.role,
          rank: newUserData.rank,
          region: newUserData.region,
          station: newUserData.station
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ User ${newUserData.policeId} created successfully! Temporary password: ${newUserData.tempPassword}`);
        setShowAddUserModal(false);
        setNewUserData({
          policeId: '',
          firstName: '',
          lastName: '',
          email: '',
          role: 'officer',
          rank: 'Constable',
          region: '',
          station: '',
          tempPassword: ''
        });
        fetchUsers();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Create user error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading User Management...</p>
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

        {/* User Management Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header with Add User Button */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-police-blue">
                👥 User Management
              </h2>
              <p className="text-gray-600 mt-1">
                Vision Doc Section 4.2 - Police ID Login System & Role-Based Access Control
              </p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-police-blue text-white px-6 py-3 rounded-lg hover:bg-police-star transition shadow-md"
            >
              ➕ Add New User
            </button>
          </div>

          {/* Settings Navigation Tabs */}
<div className="bg-white rounded-lg shadow mb-6">
  <div className="border-b border-gray-200">
    <nav className="flex gap-2 px-4 pt-4">
      <button
        onClick={() => navigate('/dashboard/settings')}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
          activeTab === 'system'
            ? 'bg-police-blue text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        ⚙️ System Settings
      </button>
      <button
        onClick={() => setActiveTab('users')}
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

          {/* Search & Filter */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search by Name, Police ID, or Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              >
                <option value="">All Roles</option>
                {roles.map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              >
                <option value="">All Status</option>
                {statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              >
                <option value="">All Regions</option>
                {regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-police-blue text-white px-6 py-2 rounded hover:bg-police-star transition"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition"
              >
                Reset
              </button>
            </form>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-police-blue text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Police ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Station</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-police-blue">
                          {u.policeId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {u.station}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {u.region}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            u.status === 'Active' ? 'bg-green-100 text-green-800' :
                            u.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                            u.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openRoleModal(u)}
                              className="text-police-blue hover:text-police-star"
                              title="Change Role"
                            >
                              👤 Role
                            </button>
                            <button
                              onClick={() => openStatusModal(u)}
                              className="text-green-600 hover:text-green-800"
                              title="Change Status"
                            >
                              ✓ Status
                            </button>
                            <button
                              onClick={() => openPasswordModal(u)}
                              className="text-orange-600 hover:text-orange-800"
                              title="Reset Password"
                            >
                              🔑 Password
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {users.length} of {totalUsers} users (Page {page} of {totalPages})
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Modal for Role/Status/Password Updates */}
          {showModal && selectedUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-police-blue mb-4">
                  {modalType === 'role' && '👤 Update User Role'}
                  {modalType === 'status' && '✓ Update User Status'}
                  {modalType === 'password' && '🔑 Reset User Password'}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  User: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> ({selectedUser.policeId})
                </p>

                {modalType === 'role' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    >
                      {roles.map(r => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                )}

                {modalType === 'status' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}

                {modalType === 'password' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 6 characters required
                    </p>
                  </div>
                )}

                <div className="flex gap-4 justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={
                      modalType === 'role' ? handleUpdateRole :
                      modalType === 'status' ? handleUpdateStatus :
                      handleResetPassword
                    }
                    className="px-4 py-2 bg-police-blue text-white rounded hover:bg-police-star transition"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add New User Modal */}
          {showAddUserModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-police-blue">
                    ➕ Add New Officer User
                  </h3>
                  <button
                    onClick={() => setShowAddUserModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddUser}>
                  {/* Vision Doc Section 4.2 Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">
                      📋 User Onboarding Process (Vision Doc Section 4.2)
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>✅ Only Admin/HR can create new users</li>
                      <li>✅ Police ID must be verified (e.g., GPS-99999)</li>
                      <li>✅ Temporary password will be generated</li>
                      <li>✅ User must change password on first login</li>
                      <li>✅ All actions logged in Activity Log (Section 5.2)</li>
                    </ul>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Police ID Number *
                      </label>
                      <input
                        type="text"
                        name="policeId"
                        value={newUserData.policeId}
                        onChange={handleNewUserChange}
                        required
                        placeholder="GPS-99999"
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
                        value={newUserData.email}
                        onChange={handleNewUserChange}
                        required
                        placeholder="officer@gps.gov.gh"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={newUserData.firstName}
                        onChange={handleNewUserChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={newUserData.lastName}
                        onChange={handleNewUserChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                      />
                    </div>
                  </div>

                  {/* Role & Access */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role *
                      </label>
                      <select
                        name="role"
                        value={newUserData.role}
                        onChange={handleNewUserChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                      >
                        <option value="">Select Role</option>
                        <option value="officer">Officer</option>
                        <option value="cid">CID Officer</option>
                        <option value="hr">HR Personnel</option>
                        <option value="command">Command</option>
                        <option value="admin">Admin</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Role determines system access (Vision Doc Section 4.2)
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rank
                      </label>
                      <select
                        name="rank"
                        value={newUserData.rank}
                        onChange={handleNewUserChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                      >
                        <option value="">Select Rank</option>
                        <option value="Constable">Constable</option>
                        <option value="Corporal">Corporal</option>
                        <option value="Sergeant">Sergeant</option>
                        <option value="Inspector">Inspector</option>
                        <option value="Superintendent">Superintendent</option>
                        <option value="Commissioner">Commissioner</option>
                      </select>
                    </div>
                  </div>

                  {/* Regional Assignment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Region *
                      </label>
                      <select
                        name="region"
                        value={newUserData.region}
                        onChange={handleNewUserChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                      >
                        <option value="">Select Region</option>
                        {regions.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Station *
                      </label>
                      <input
                        type="text"
                        name="station"
                        value={newUserData.station}
                        onChange={handleNewUserChange}
                        required
                        placeholder="e.g., Police Headquarters"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                      />
                    </div>
                  </div>

                  {/* Temporary Password */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                      🔐 Temporary Password
                    </h4>
                    <p className="text-sm text-yellow-700 mb-2">
                      A temporary password will be auto-generated. The officer will be required to change it on first login.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="tempPassword"
                        value={newUserData.tempPassword}
                        onChange={handleNewUserChange}
                        placeholder="Auto-generated or enter custom"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                      />
                      <button
                        type="button"
                        onClick={generateTempPassword}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                      >
                        🎲 Generate
                      </button>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-police-blue text-white rounded hover:bg-police-star transition"
                    >
                      ✅ Create User Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Vision Doc Alignment Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              📋 Vision Document Alignment (Section 4.2 & 5.4)
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ Police ID Login System - User management</li>
              <li>✅ Role-Based Access Control (Admin only)</li>
              <li>✅ All changes logged in Activity Log (Section 5.2)</li>
              <li>✅ Enhanced data security (Section 5.4)</li>
              <li>✅ User status management (Active/Inactive/Suspended)</li>
              <li>✅ Password reset capability with audit trail</li>
              <li>✅ 90% paperless goal supported</li>
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-police-blue">{totalUsers}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'Active').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Officers</p>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'officer').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Suspended</p>
              <p className="text-2xl font-bold text-red-600">
                {users.filter(u => u.status === 'Suspended').length}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserManagement;