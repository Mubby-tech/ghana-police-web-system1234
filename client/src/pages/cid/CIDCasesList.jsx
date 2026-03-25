import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function CIDCasesList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
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

  // Fetch cases
  useEffect(() => {
    if (user) {
      fetchCases();
    }
  }, [user]);

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        ...(search && { search }),
        ...(status && { status }),
        ...(category && { category })
      });

      const response = await fetch(`${config.API_BASE_URL}/api/cases?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCases(data.data);
      } else {
        console.error('Failed to fetch cases:', data.message);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCases();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading Cases...</p>
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

        {/* CID Cases Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-police-blue">
                🔍 CID Cases Management
              </h2>
              <p className="text-gray-600 mt-1">
                Electronic CID Documentation System (Vision Doc Section 4.4)
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/cid/create')}
              className="bg-police-blue text-white px-6 py-3 rounded-lg hover:bg-police-star transition shadow-md"
            >
              + Open New Case
            </button>
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search by case number, title, or suspect..."
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
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Pending Court">Pending Court</option>
                <option value="Closed">Closed</option>
                <option value="Archived">Archived</option>
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              >
                <option value="">All Categories</option>
                <option value="Theft">Theft</option>
                <option value="Assault">Assault</option>
                <option value="Murder">Murder</option>
                <option value="Fraud">Fraud</option>
                <option value="Cyber Crime">Cyber Crime</option>
                <option value="Traffic">Traffic</option>
                <option value="Narcotics">Narcotics</option>
                <option value="Other">Other</option>
              </select>
              <button
                type="submit"
                className="bg-police-blue text-white px-6 py-2 rounded hover:bg-police-star transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* Cases Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-police-blue text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Case Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Station</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cases.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No cases found. Open your first CID case.
                      </td>
                    </tr>
                  ) : (
                    cases.map((caseItem) => (
                      <tr key={caseItem._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-police-blue">
                          {caseItem.caseNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {caseItem.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {caseItem.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            caseItem.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                            caseItem.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                            caseItem.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {caseItem.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            caseItem.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                            caseItem.status === 'Under Investigation' ? 'bg-purple-100 text-purple-800' :
                            caseItem.status === 'Pending Court' ? 'bg-orange-100 text-orange-800' :
                            caseItem.status === 'Closed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {caseItem.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {caseItem.station}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => navigate(`/dashboard/cid/${caseItem._id}`)}
                            className="text-police-blue hover:text-police-star mr-3"
                          >
                            View
                          </button>
                          {['cid', 'command', 'admin'].includes(user.role) && (
                            <button
                              onClick={() => navigate(`/dashboard/cid/${caseItem._id}/edit`)}
                              className="text-green-600 hover:text-green-800 mr-3"
                            >
                              Edit
                            </button>
                          )}
                          {['cid', 'officer', 'command', 'admin'].includes(user.role) && (
                            <>
                              <button
                                onClick={() => navigate(`/dashboard/cid/${caseItem._id}/statement`)}
                                className="text-blue-600 hover:text-blue-800 mr-3"
                              >
                                Statement
                              </button>
                              <button
                                onClick={() => navigate(`/dashboard/cid/${caseItem._id}/evidence`)}
                                className="text-purple-600 hover:text-purple-800"
                              >
                                Evidence
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
          <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Cases</p>
              <p className="text-2xl font-bold text-police-blue">{cases.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Open</p>
              <p className="text-2xl font-bold text-blue-600">
                {cases.filter(c => c.status === 'Open').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Under Investigation</p>
              <p className="text-2xl font-bold text-purple-600">
                {cases.filter(c => c.status === 'Under Investigation').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Pending Court</p>
              <p className="text-2xl font-bold text-orange-600">
                {cases.filter(c => c.status === 'Pending Court').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Closed</p>
              <p className="text-2xl font-bold text-green-600">
                {cases.filter(c => c.status === 'Closed').length}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CIDCasesList;