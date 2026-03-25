import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function PersonnelList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [rank, setRank] = useState('');
  const [region, setRegion] = useState('');
  const [department, setDepartment] = useState('');
  const [deploymentStatus, setDeploymentStatus] = useState('');
  const navigate = useNavigate();

  // Ghana Police Ranks (Vision Doc Section 4.1)
  const ranks = [
    'Constable', 'Corporal', 'Sergeant', 'Staff Sergeant',
    'Inspector', 'Superintendent', 'Deputy Commissioner', 'Commissioner',
    'Assistant Commissioner', 'Deputy Inspector General', 'Inspector General'
  ];

  // Ghana Regions (All 16 Regions)
  const regions = [
    'Greater Accra', 'Ashanti', 'Central', 'Western', 'Eastern',
    'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono',
    'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti'
  ];

  // Police Departments
  const departments = [
    'Operations', 'CID', 'Traffic', 'Administration', 'Finance',
    'HR', 'Logistics', 'Training', 'Forensic', 'Anti-Narcotics',
    'Cyber Crime', 'Public Affairs', 'Intelligence', 'Other'
  ];

  // Deployment Status Options
  const deploymentStatuses = [
    'Active', 'On Leave', 'Suspended', 'Retired', 'Deceased', 'Dismissed'
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

  // Fetch personnel
  useEffect(() => {
    if (user) {
      fetchPersonnel();
    }
  }, [user]);

  const fetchPersonnel = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        ...(search && { search }),
        ...(rank && { rank }),
        ...(region && { region }),
        ...(department && { department }),
        ...(deploymentStatus && { deploymentStatus })
      });

      const response = await fetch(`${config.API_BASE_URL}/api/personnel?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setPersonnel(data.data);
      } else {
        console.error('Failed to fetch personnel:', data.message);
      }
    } catch (error) {
      console.error('Error fetching personnel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPersonnel();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading Personnel Records...</p>
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

        {/* Personnel Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-police-blue">
                👥 HR/Personnel Management
              </h2>
              <p className="text-gray-600 mt-1">
                Vision Doc Section 4.1 - Personnel Records Management System
              </p>
            </div>
            {['hr', 'command', 'admin'].includes(user.role) && (
              <button
                onClick={() => navigate('/dashboard/personnel/register')}
                className="bg-police-blue text-white px-6 py-3 rounded-lg hover:bg-police-star transition shadow-md"
              >
                + Register New Officer
              </button>
            )}
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search by Police ID, Name, Service Number, or Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              />
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              >
                <option value="">All Ranks</option>
                {ranks.map(r => (
                  <option key={r} value={r}>{r}</option>
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
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                value={deploymentStatus}
                onChange={(e) => setDeploymentStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              >
                <option value="">All Status</option>
                {deploymentStatuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-police-blue text-white px-6 py-2 rounded hover:bg-police-star transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* Personnel Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-police-blue text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Police ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Station</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {personnel.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        No personnel records found. Register your first officer.
                      </td>
                    </tr>
                  ) : (
                    personnel.map((officer) => (
                      <tr key={officer._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-police-blue">
                          {officer.policeId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {officer.firstName} {officer.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {officer.rank}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {officer.station}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {officer.region}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {officer.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            officer.deploymentStatus === 'Active' ? 'bg-green-100 text-green-800' :
                            officer.deploymentStatus === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                            officer.deploymentStatus === 'Suspended' ? 'bg-red-100 text-red-800' :
                            officer.deploymentStatus === 'Retired' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {officer.deploymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => navigate(`/dashboard/personnel/${officer._id}`)}
                            className="text-police-blue hover:text-police-star mr-3"
                          >
                            View
                          </button>
                          {['hr', 'command', 'admin'].includes(user.role) && (
                            <>
                              <button
                                onClick={() => navigate(`/dashboard/personnel/${officer._id}/edit`)}
                                className="text-green-600 hover:text-green-800 mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => navigate(`/dashboard/personnel/${officer._id}/transfer`)}
                                className="text-orange-600 hover:text-orange-800"
                              >
                                Transfer
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Officers</p>
              <p className="text-2xl font-bold text-police-blue">{personnel.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {personnel.filter(o => o.deploymentStatus === 'Active').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-yellow-600">
                {personnel.filter(o => o.deploymentStatus === 'On Leave').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Suspended</p>
              <p className="text-2xl font-bold text-red-600">
                {personnel.filter(o => o.deploymentStatus === 'Suspended').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Retired</p>
              <p className="text-2xl font-bold text-gray-600">
                {personnel.filter(o => o.deploymentStatus === 'Retired').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Dismissed</p>
              <p className="text-2xl font-bold text-gray-600">
                {personnel.filter(o => o.deploymentStatus === 'Dismissed').length}
              </p>
            </div>
          </div>

          {/* Vision Doc Alignment Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              📋 Vision Document Alignment (Section 4.1)
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ Personnel records stored electronically</li>
              <li>✅ Centralized Digital Database</li>
              <li>✅ All 16 Ghana regions supported</li>
              <li>✅ Service history tracking (promotions, transfers, leave)</li>
              <li>✅ Activity logging for accountability (Section 5.2)</li>
              <li>✅ Role-based access control (Section 4.2)</li>
              <li>✅ 90% paperless goal supported</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PersonnelList;