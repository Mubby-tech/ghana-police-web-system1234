import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

function CreateDocument() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);
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

  // Fetch users for recipient selection
  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('${`${config.API_BASE_URL}/api/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Form state (Vision Doc Section 4.5 - EDMS)
  const [formData, setFormData] = useState({
    documentType: 'Memo',
    title: '',
    content: '',
    senderDepartment: '',
    recipient: '',
    recipientDepartment: '',
    priority: 'Normal',
    classification: 'Internal',
    requiresApproval: false
  });

  // Document Types (Vision Doc Section 4.5)
  const documentTypes = [
    'Memo', 'Circular', 'Directive', 'Report', 'Form', 'Letter', 'Other'
  ];

  // Ghana Police Departments
  const departments = [
    'Police Headquarters',
    'CID Headquarters',
    'Accra Central Police Station',
    'Accra North Police Station',
    'Kumasi Central Police Station',
    'Operations Department',
    'Logistics Department',
    'HR Department',
    'Finance Department',
    'Training School',
    'Forensic Laboratory',
    'Traffic Department',
    'Anti-Narcotics Unit',
    'Cyber Crime Unit',
    'Public Affairs'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('${`${config.API_BASE_URL}/api/edms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ Document created successfully! Document Number: ${data.data.documentNumber}`);
        setTimeout(() => {
          navigate('/dashboard/edms');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create document');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Create document error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading...</p>
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

        {/* Create Document Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-police-blue">
              📄 Create New Document
            </h2>
            <p className="text-gray-600 mt-1">
              Vision Doc Section 4.5 - Electronic Document Management System
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Document Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                📋 Document Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type *
                  </label>
                  <select
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="">Select Type</option>
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority Level *
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classification *
                  </label>
                  <select
                    name="classification"
                    value={formData.classification}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="Public">Public</option>
                    <option value="Internal">Internal</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Secret">Secret</option>
                  </select>
                </div>
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    name="requiresApproval"
                    id="requiresApproval"
                    checked={formData.requiresApproval}
                    onChange={handleChange}
                    className="w-4 h-4 text-police-blue"
                  />
                  <label htmlFor="requiresApproval" className="ml-2 text-sm text-gray-700">
                    Requires Approval (E-Approval Workflow)
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Request for Additional Patrol Vehicles"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Content *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows="8"
                    placeholder="Write the full content of your memo/document here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Sender & Recipient */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                📤 Sender & Recipient
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Department (Sender) *
                  </label>
                  <select
                    name="senderDepartment"
                    value={formData.senderDepartment}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Officer *
                  </label>
                  <select
                    name="recipient"
                    value={formData.recipient}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="">Select Recipient</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>
                        {u.policeId} - {u.name} ({u.rank})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Department *
                  </label>
                  <select
                    name="recipientDepartment"
                    value={formData.recipientDepartment}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Vision Doc Alignment Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                📋 Vision Document Alignment (Section 4.5)
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ Digital memos and documents</li>
                <li>✅ Electronic approvals (E-Approvals)</li>
                <li>✅ Electronic signatures (E-Signatures)</li>
                <li>✅ Automated workflows (Draft → Sent → Delivered)</li>
                <li>✅ Activity logging for accountability (Section 5.2)</li>
                <li>✅ Role-based access control (Section 4.2)</li>
                <li>✅ 90% paperless goal supported</li>
                <li>✅ Classification levels (Public/Internal/Confidential/Secret)</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-police-blue text-white px-8 py-3 rounded-lg hover:bg-police-star transition disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : '📄 Create Document'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/edms')}
                className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default CreateDocument;