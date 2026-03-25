import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function EDMSDocumentsList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [priority, setPriority] = useState('');
  const navigate = useNavigate();

  // Document Types (Vision Doc Section 4.5)
  const documentTypes = [
    'Memo', 'Circular', 'Directive', 'Report', 'Form', 'Letter', 'Other'
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

  // Fetch documents
  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        ...(search && { search }),
        ...(status && { status }),
        ...(documentType && { documentType }),
        ...(priority && { priority })
      });

      const response = await fetch(`${config.API_BASE_URL}/api/edms?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setDocuments(data.data);
      } else {
        console.error('Failed to fetch documents:', data.message);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDocuments();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading Documents...</p>
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

        {/* EDMS Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-police-blue">
                📄 EDMS - Electronic Document Management
              </h2>
              <p className="text-gray-600 mt-1">
                Vision Doc Section 4.5 - 90% Paperless System
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/edms/create')}
              className="bg-police-blue text-white px-6 py-3 rounded-lg hover:bg-police-star transition shadow-md"
            >
              + Create New Document
            </button>
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search by document number, title, or content..."
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
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Delivered">Delivered</option>
                <option value="Read">Read</option>
                <option value="Archived">Archived</option>
              </select>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              >
                <option value="">All Document Types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
              >
                <option value="">All Priority</option>
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
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

          {/* Documents Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-police-blue text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Document Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Approval</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No documents found. Create your first document.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-police-blue">
                          {doc.documentNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doc.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doc.documentType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            doc.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                            doc.priority === 'Urgent' ? 'bg-orange-100 text-orange-800' :
                            doc.priority === 'Normal' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {doc.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            doc.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                            doc.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                            doc.status === 'Delivered' ? 'bg-purple-100 text-purple-800' :
                            doc.status === 'Read' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {doc.requiresApproval ? (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              doc.approvalStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                              doc.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                              doc.approvalStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {doc.approvalStatus}
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Not Required
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => navigate(`/dashboard/edms/${doc._id}`)}
                            className="text-police-blue hover:text-police-star mr-3"
                          >
                            View
                          </button>
                          {doc.sender?._id === user.id && doc.status === 'Draft' && (
                            <button
                              onClick={() => navigate(`/dashboard/edms/${doc._id}/send`)}
                              className="text-green-600 hover:text-green-800 mr-3"
                            >
                              Send
                            </button>
                          )}
                          {['command', 'admin'].includes(user.role) && doc.approvalStatus === 'Pending' && (
                            <button
                              onClick={() => navigate(`/dashboard/edms/${doc._id}/approve`)}
                              className="text-orange-600 hover:text-orange-800 mr-3"
                            >
                              Approve
                            </button>
                          )}
                          {['command', 'admin'].includes(user.role) && !doc.isSigned && (
                            <button
                              onClick={() => navigate(`/dashboard/edms/${doc._id}/sign`)}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              E-Sign
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
          <div className="mt-8 grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-police-blue">{documents.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-600">
                {documents.filter(d => d.status === 'Draft').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-blue-600">
                {documents.filter(d => d.status === 'Sent').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-purple-600">
                {documents.filter(d => d.status === 'Delivered').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-orange-600">
                {documents.filter(d => d.approvalStatus === 'Pending').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">E-Signed</p>
              <p className="text-2xl font-bold text-green-600">
                {documents.filter(d => d.isSigned === true).length}
              </p>
            </div>
          </div>

          {/* Vision Doc Alignment Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              📋 Vision Document Alignment (Section 4.5)
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ Digital memos and documents</li>
              <li>✅ Electronic approvals (E-Approvals)</li>
              <li>✅ Electronic signatures (E-Signatures)</li>
              <li>✅ Automated workflows (Draft → Sent → Delivered → Read)</li>
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

export default EDMSDocumentsList;