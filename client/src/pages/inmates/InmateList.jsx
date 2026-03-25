import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function InmateList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [inmates, setInmates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
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

  // Fetch inmates
  useEffect(() => {
    if (user) {
      fetchInmates();
    }
  }, [user, pagination.page]);

  const fetchInmates = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: 20,
        ...(search && { search }),
        ...(status && { status })
      });

      const response = await fetch(`${config.API_BASE_URL}/api/inmates?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setInmates(data.data.inmates);
        setPagination({
          page: data.data.pagination.page,
          total: data.data.pagination.total,
          pages: data.data.pagination.pages
        });
      } else {
        console.error('Failed to fetch inmates:', data.message);
      }
    } catch (error) {
      console.error('Error fetching inmates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchInmates();
  };

  const handleStatusFilter = (e) => {
    setStatus(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading Inmates...</p>
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

        {/* Inmate Management Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-police-blue">
                👤 Inmate Management
              </h2>
              <p className="text-gray-600 mt-1">
                Manage inmate records, transfers, and releases
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/inmates/register')}
              className="bg-police-blue text-white px-6 py-3 rounded-lg hover:bg-police-star transition shadow-md"
            >
              + Register New Inmate
            </button>
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search by name, ID, or case number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              />
              <select
                value={status}
                onChange={handleStatusFilter}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              >
                <option value="">All Status</option>
                <option value="Remand">Remand</option>
                <option value="Awaiting Trial">Awaiting Trial</option>
                <option value="Convicted">Convicted</option>
                <option value="Released">Released</option>
                <option value="Transferred">Transferred</option>
              </select>
              <button
                type="submit"
                className="bg-police-blue text-white px-6 py-2 rounded hover:bg-police-star transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* Inmates Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-police-blue text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Inmate ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Case Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Station</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inmates.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No inmates found. Register your first inmate.
                      </td>
                    </tr>
                  ) : (
                    inmates.map((inmate) => (
                      <tr key={inmate._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-police-blue">
                          {inmate.inmateId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {inmate.firstName} {inmate.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {inmate.caseNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            inmate.custodyStatus === 'Remand' ? 'bg-yellow-100 text-yellow-800' :
                            inmate.custodyStatus === 'Awaiting Trial' ? 'bg-blue-100 text-blue-800' :
                            inmate.custodyStatus === 'Convicted' ? 'bg-red-100 text-red-800' :
                            inmate.custodyStatus === 'Released' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inmate.custodyStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {inmate.station}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => navigate(`/dashboard/inmates/${inmate._id}`)}
                            className="text-police-blue hover:text-police-star mr-3"
                          >
                            View
                          </button>
                          {['cid', 'command', 'admin'].includes(user.role) && (
                            <button
                              onClick={() => navigate(`/dashboard/inmates/${inmate._id}/edit`)}
                              className="text-green-600 hover:text-green-800 mr-3"
                            >
                              Edit
                            </button>
                          )}
                          {['command', 'admin'].includes(user.role) && (
                            <>
                              <button
                                onClick={() => navigate(`/dashboard/inmates/${inmate._id}/transfer`)}
                                className="text-blue-600 hover:text-blue-800 mr-3"
                              >
                                Transfer
                              </button>
                              <button
                                onClick={() => navigate(`/dashboard/inmates/${inmate._id}/release`)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Release
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

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 bg-white border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Stats Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Inmates</p>
              <p className="text-2xl font-bold text-police-blue">{pagination.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">On Remand</p>
              <p className="text-2xl font-bold text-yellow-600">
                {inmates.filter(i => i.custodyStatus === 'Remand').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Awaiting Trial</p>
              <p className="text-2xl font-bold text-blue-600">
                {inmates.filter(i => i.custodyStatus === 'Awaiting Trial').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Convicted</p>
              <p className="text-2xl font-bold text-red-600">
                {inmates.filter(i => i.custodyStatus === 'Convicted').length}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default InmateList;