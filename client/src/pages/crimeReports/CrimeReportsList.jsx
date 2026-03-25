import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function CrimeReportsList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [crimeType, setCrimeType] = useState('');
  const [region, setRegion] = useState('');
  const [severity, setSeverity] = useState('');
  const navigate = useNavigate();

  // Ghana Regions (Vision Doc Section 4.1 - Centralized Database)
  const regions = [
    'Greater Accra', 'Ashanti', 'Central', 'Western', 'Eastern',
    'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono',
    'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti'
  ];

  // Crime Categories (Vision Doc Section 4.1)
  const crimeTypes = [
    'Theft', 'Assault', 'Murder', 'Fraud', 'Cyber Crime',
    'Traffic Offense', 'Narcotics', 'Robbery', 'Burglary',
    'Kidnapping', 'Domestic Violence', 'Economic Crime',
    'Weapons Offense', 'Public Order', 'Other'
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

  // Fetch reports
  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        ...(search && { search }),
        ...(status && { status }),
        ...(crimeType && { crimeType }),
        ...(region && { region }),
        ...(severity && { severity })
      });

      const response = await fetch(`${config.API_BASE_URL}/api/crime-reports?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setReports(data.data);
      } else {
        console.error('Failed to fetch reports:', data.message);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReports();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading Reports...</p>
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

        {/* Crime Reports Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-police-blue">
                📊 Crime Reports Management
              </h2>
              <p className="text-gray-600 mt-1">
                Vision Doc Section 4.1 - Centralized Digital Database
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/reports/create')}
              className="bg-police-blue text-white px-6 py-3 rounded-lg hover:bg-police-star transition shadow-md"
            >
              + File New Report
            </button>
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search by report number, title, or suspect..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              >
                <option value="">All Status</option>
                <option value="Filed">Filed</option>
                <option value="Under Review">Under Review</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Referred to CID">Referred to CID</option>
                <option value="Pending Court">Pending Court</option>
                <option value="Closed">Closed</option>
                <option value="Archived">Archived</option>
              </select>
              <select
                value={crimeType}
                onChange={(e) => setCrimeType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              >
                <option value="">All Crime Types</option>
                {crimeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
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
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              >
                <option value="">All Severity</option>
                <option value="Minor">Minor</option>
                <option value="Moderate">Moderate</option>
                <option value="Serious">Serious</option>
                <option value="Critical">Critical</option>
              </select>
              <button
                type="submit"
                className="bg-police-blue text-white px-6 py-2 rounded hover:bg-police-star transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-police-blue text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Report Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Crime Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No crime reports found. File your first report.
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr key={report._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-police-blue">
                          {report.reportNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.crimeType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            report.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                            report.severity === 'Serious' ? 'bg-orange-100 text-orange-800' :
                            report.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {report.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            report.status === 'Filed' ? 'bg-blue-100 text-blue-800' :
                            report.status === 'Under Review' ? 'bg-purple-100 text-purple-800' :
                            report.status === 'Under Investigation' ? 'bg-indigo-100 text-indigo-800' :
                            report.status === 'Referred to CID' ? 'bg-orange-100 text-orange-800' :
                            report.status === 'Pending Court' ? 'bg-yellow-100 text-yellow-800' :
                            report.status === 'Closed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.region}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => navigate(`/dashboard/reports/${report._id}`)}
                            className="text-police-blue hover:text-police-star mr-3"
                          >
                            View
                          </button>
                          {['cid', 'command', 'admin'].includes(user.role) && (
                            <button
                              onClick={() => navigate(`/dashboard/reports/${report._id}/edit`)}
                              className="text-green-600 hover:text-green-800 mr-3"
                            >
                              Edit
                            </button>
                          )}
                          {['cid', 'command', 'admin'].includes(user.role) && report.linkedCase && (
                            <button
                              onClick={() => navigate(`/dashboard/cid/${report.linkedCase._id}`)}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              View CID Case
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

          {/* Stats Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-police-blue">{reports.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Filed</p>
              <p className="text-2xl font-bold text-blue-600">
                {reports.filter(r => r.status === 'Filed').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Under Investigation</p>
              <p className="text-2xl font-bold text-indigo-600">
                {reports.filter(r => r.status === 'Under Investigation').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Referred to CID</p>
              <p className="text-2xl font-bold text-orange-600">
                {reports.filter(r => r.status === 'Referred to CID').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Closed</p>
              <p className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'Closed').length}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CrimeReportsList;