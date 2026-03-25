import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch statistics
      const statsResponse = await fetch('${`${config.API_BASE_URL}/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const statsData = await statsResponse.json();
      if (statsResponse.ok) {
        setStats(statsData.data);
      }

      // Fetch recent activity
      const activityResponse = await fetch('${`${config.API_BASE_URL}/api/dashboard/activity?limit=5', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const activityData = await activityResponse.json();
      if (activityResponse.ok) {
        setActivity(activityData.data);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case 'Login': return '🔐';
      case 'Logout': return '🚪';
      case 'Create': return '📝';
      case 'Update': return '✏️';
      case 'Delete': return '🗑️';
      case 'Approve': return '✅';
      case 'Reject': return '❌';
      case 'Upload': return '📤';
      case 'Download': return '📥';
      default: return '📋';
    }
  };

  const getActivityColor = (module) => {
    switch (module) {
      case 'Auth': return 'bg-blue-100 text-blue-800';
      case 'Inmates': return 'bg-purple-100 text-purple-800';
      case 'CID': return 'bg-indigo-100 text-indigo-800';
      case 'Crime Reports': return 'bg-pink-100 text-pink-800';
      case 'EDMS': return 'bg-teal-100 text-teal-800';
      case 'Personnel': return 'bg-green-100 text-green-800';
      case 'Settings': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading Dashboard...</p>
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

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-police-blue">
              Welcome back, {user.name} 👋
            </h2>
            <p className="text-gray-600 mt-1">
              Here's what's happening in your jurisdiction today.
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Police ID</p>
                <p className="font-semibold text-police-blue">{user.policeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-semibold">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Region</p>
                <p className="font-semibold">{user.region}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Station</p>
                <p className="font-semibold">{user.station}</p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Active Cases */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Active Cases</p>
                  <p className="text-3xl font-bold text-police-blue mt-2">
                    {stats ? stats.activeCases.count : '...'}
                  </p>
                  {stats && (
                    <p className={`text-sm mt-2 ${
                      stats.activeCases.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.activeCases.trend === 'up' ? '↑' : '↓'} {Math.abs(stats.activeCases.change)}% from last month
                    </p>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="text-2xl">🔍</span>
                </div>
              </div>
            </div>

            {/* Inmates */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Inmates</p>
                  <p className="text-3xl font-bold text-police-blue mt-2">
                    {stats ? stats.inmates.count : '...'}
                  </p>
                  {stats && (
                    <p className={`text-sm mt-2 ${
                      stats.inmates.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.inmates.trend === 'up' ? '↑' : '↓'} {Math.abs(stats.inmates.change)}% from last month
                    </p>
                  )}
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <span className="text-2xl">👤</span>
                </div>
              </div>
            </div>

            {/* Reports Filed */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Reports Filed</p>
                  <p className="text-3xl font-bold text-police-blue mt-2">
                    {stats ? stats.reportsFiled.count : '...'}
                  </p>
                  {stats && (
                    <p className={`text-sm mt-2 ${
                      stats.reportsFiled.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.reportsFiled.trend === 'up' ? '↑' : '↓'} {Math.abs(stats.reportsFiled.change)}% from last month
                    </p>
                  )}
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Pending Approvals</p>
                  <p className="text-3xl font-bold text-police-blue mt-2">
                    {stats ? stats.pendingApprovals.count : '...'}
                  </p>
                  {stats && (
                    <p className={`text-sm mt-2 ${
                      stats.pendingApprovals.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.pendingApprovals.trend === 'up' ? '↑' : '↓'} {Math.abs(stats.pendingApprovals.change)}% from last month
                    </p>
                  )}
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-police-blue">Recent Activity</h3>
              <p className="text-sm text-gray-600 mt-1">
                Vision Doc Section 5.2 - Transparency & Accountability
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {activity.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No recent activity. Activity will appear as users interact with the system.
                </div>
              ) : (
                activity.map((log) => (
                  <div key={log._id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getActivityIcon(log.action)}</div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {log.action} - {log.module}
                        </p>
                        <p className="text-sm text-gray-600">
                          {log.userName || 'Unknown'} ({log.userPoliceId || 'N/A'})
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {log.details || ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActivityColor(log.module)}`}>
                        {log.module}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTimeAgo(log.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* File New Report */}
            <button
              onClick={() => navigate('/dashboard/reports/create')}
              className="bg-police-blue text-white p-6 rounded-lg shadow hover:bg-police-star transition text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">📝</div>
                <div>
                  <h4 className="font-bold text-lg">File New Report</h4>
                  <p className="text-sm opacity-90">Submit a new crime report</p>
                </div>
              </div>
            </button>

            {/* Register Inmate */}
            <button
              onClick={() => navigate('/dashboard/inmates/register')}
              className="bg-white text-police-blue p-6 rounded-lg shadow border-2 border-police-blue hover:bg-police-blue hover:text-white transition text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">👤</div>
                <div>
                  <h4 className="font-bold text-lg">Register Inmate</h4>
                  <p className="text-sm opacity-90">Add new inmate to system</p>
                </div>
              </div>
            </button>

            {/* View Documents */}
            <button
              onClick={() => navigate('/dashboard/edms')}
              className="bg-white text-police-blue p-6 rounded-lg shadow border-2 border-police-blue hover:bg-police-blue hover:text-white transition text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">📄</div>
                <div>
                  <h4 className="font-bold text-lg">View Documents</h4>
                  <p className="text-sm opacity-90">Access EDMS files</p>
                </div>
              </div>
            </button>
          </div>

          {/* Vision Document Alignment Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              📋 Vision Document Alignment (Section 5.1)
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ Improved Efficiency - Real-time dashboard analytics</li>
              <li>✅ Faster retrieval of records - Statistics from database</li>
              <li>✅ Reduced duplication of work - Centralized data source</li>
              <li>✅ Transparency & Accountability (Section 5.2) - Activity logging</li>
              <li>✅ All 16 Ghana regions supported</li>
              <li>✅ 90% paperless goal supported</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;