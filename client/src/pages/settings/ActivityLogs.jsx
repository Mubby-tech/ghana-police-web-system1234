import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from "../../config";

function ActivityLogs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  // Available Modules (Vision Doc Section 5.2)
  const modules = [
    'All', 'Auth', 'Inmates', 'CID', 'Crime Reports', 'EDMS', 'Personnel', 'Settings', 'Other'
  ];

  // Available Actions
  const actions = [
    'All', 'Login', 'Logout', 'Create', 'Read', 'Update', 'Delete',
    'Transfer', 'Promote', 'Approve', 'Reject', 'Sign',
    'Upload', 'Download', 'Share', 'Export', 'Import'
  ];

  // Available Status Options
  const statuses = [
    'All', 'Success', 'Failed', 'Unauthorized', 'Forbidden'
  ];

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

  // Fetch activity logs
  useEffect(() => {
    if (user) {
      fetchLogs();
      fetchStats();
    }
  }, [user, page, module, action, status, startDate, endDate]);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(module !== 'All' && { module }),
        ...(action !== 'All' && { action }),
        ...(status !== 'All' && { status }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`${config.API_BASE_URL}/api/settings/activity-logs?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setLogs(data.data);
        setTotalPages(data.pages);
        setTotalLogs(data.total);
      } else {
        setError(data.message || 'Failed to load activity logs');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`${config.API_BASE_URL}/api/settings/activity-stats?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
    fetchStats();
  };

  const handleResetFilters = () => {
    setModule('');
    setAction('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    fetchLogs();
    fetchStats();
  };

  const handleExport = async (format = 'json') => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        format,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`${config.API_BASE_URL}/api/settings/activity-logs/export?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        if (format === 'csv') {
          // Download CSV file
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `activity-logs-${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          setSuccess('✅ Activity logs exported as CSV!');
        } else {
          const data = await response.json();
          setSuccess(`✅ Activity logs exported as JSON (${data.count} records)!`);
        }
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to export activity logs');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Export error:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Unauthorized': return 'bg-orange-100 text-orange-800';
      case 'Forbidden': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModuleColor = (module) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading Activity Logs...</p>
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

        {/* Activity Logs Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-police-blue">
              📜 Activity Logs
            </h2>
            <p className="text-gray-600 mt-1">
              Vision Doc Section 5.2 - Transparency & Accountability (Audit Trail)
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

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-police-blue">{stats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.byStatus?.find(s => s._id === 'Success')?.count || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.failedAttempts || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Logins (24h)</p>
                <p className="text-2xl font-bold text-blue-600">{stats.logins || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Security Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{stats.securityAlerts || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Recent (24h)</p>
                <p className="text-2xl font-bold text-purple-600">{stats.recent24Hours || 0}</p>
              </div>
            </div>
          )}

          {/* Search & Filter */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
              <select
                value={module}
                onChange={(e) => setModule(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              >
                {modules.map(m => (
                  <option key={m} value={m === 'All' ? '' : m}>{m}</option>
                ))}
              </select>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              >
                {actions.map(a => (
                  <option key={a} value={a === 'All' ? '' : a}>{a}</option>
                ))}
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              >
                {statuses.map(s => (
                  <option key={s} value={s === 'All' ? '' : s}>{s}</option>
                ))}
              </select>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                placeholder="End Date"
              />
              <button
                type="submit"
                className="bg-police-blue text-white px-6 py-2 rounded hover:bg-police-star transition"
              >
                🔍 Search
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition"
              >
                Reset
              </button>
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => handleExport('json')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  📥 Export JSON
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('csv')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  📥 Export CSV
                </button>
              </div>
            </form>
          </div>

          {/* Activity Logs Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-police-blue text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Police ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Module</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                        No activity logs found. Activities will appear as users interact with the system.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.userName || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-police-blue">
                          {log.userPoliceId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {log.userRole || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getModuleColor(log.module)}`}>
                            {log.module}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ipAddress || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {log.details || 'N/A'}
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
                Showing {logs.length} of {totalLogs} logs (Page {page} of {totalPages})
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

          {/* Vision Doc Alignment Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              📋 Vision Document Alignment (Section 5.2 & 5.4)
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ Every action is logged in the system (Section 5.2)</li>
              <li>✅ Reduced chances of file tampering</li>
              <li>✅ Easier auditing with comprehensive search & filters</li>
              <li>✅ Role-based access control (Admin/Command only - Section 4.2)</li>
              <li>✅ Enhanced data security (Section 5.4)</li>
              <li>✅ Export capability for external audit (JSON/CSV)</li>
              <li>✅ 90% paperless goal supported</li>
              <li>✅ Complete audit trail preserved</li>
            </ul>
          </div>

          {/* Activity Breakdown by Module */}
          {stats && stats.byModule && stats.byModule.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-police-blue mb-4">📊 Activity by Module</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.byModule.map((item) => (
                  <div key={item._id} className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600">{item._id}</p>
                    <p className="text-xl font-bold text-police-blue">{item.count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Breakdown by Action */}
          {stats && stats.byAction && stats.byAction.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-police-blue mb-4">📊 Activity by Action</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {stats.byAction.map((item) => (
                  <div key={item._id} className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-600">{item._id}</p>
                    <p className="text-xl font-bold text-police-blue">{item.count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ActivityLogs;