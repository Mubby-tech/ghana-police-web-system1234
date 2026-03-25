import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function ViewDocument() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

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

  // Fetch document details
  useEffect(() => {
    if (user && id) {
      fetchDocument();
    }
  }, [user, id]);

  const fetchDocument = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/edms/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setDocument(data.data);
      } else {
        setError(data.message || 'Failed to load document details');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch document error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tab configuration based on Vision Doc Section 4.5
  const getTabs = () => {
    const tabs = [
      { id: 'overview', label: '📋 Overview', icon: '📋' },
      { id: 'content', label: '📝 Content', icon: '📝' },
      { id: 'workflow', label: '🔄 Workflow', icon: '🔄' },
      { id: 'attachments', label: '📎 Attachments', icon: '📎' },
      { id: 'activity', label: '📜 Activity Log', icon: '📜' }
    ];
    return tabs;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading Document Details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error || !document) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-4">❌ {error || 'Document not found'}</p>
          <button
            onClick={() => navigate('/dashboard/edms')}
            className="bg-police-blue text-white px-6 py-2 rounded hover:bg-police-star transition"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  const tabs = getTabs();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />

        {/* View Document Content */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={() => navigate('/dashboard/edms')}
                    className="text-gray-600 hover:text-police-blue"
                  >
                    ← Back
                  </button>
                  <h2 className="text-2xl font-bold text-police-blue">
                    📄 EDMS Document Profile
                  </h2>
                </div>
                <p className="text-gray-600">
                  Vision Doc Section 4.5 - Electronic Document Management System
                </p>
              </div>
              <div className="flex gap-2">
                {/* Send Button (Sender only, Draft status) */}
                {document.sender?._id === user.id && document.status === 'Draft' && (
                  <button
                    onClick={() => navigate(`/dashboard/edms/${id}/send`)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    📤 Send
                  </button>
                )}
                {/* Approve Button (Command/Admin, Pending approval) */}
                {['command', 'admin'].includes(user.role) && document.approvalStatus === 'Pending' && (
                  <button
                    onClick={() => navigate(`/dashboard/edms/${id}/approve`)}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
                  >
                    ✅ Approve
                  </button>
                )}
                {/* E-Sign Button (Command/Admin, Not yet signed) */}
                {['command', 'admin'].includes(user.role) && !document.isSigned && document.approvalStatus === 'Approved' && (
                  <button
                    onClick={() => navigate(`/dashboard/edms/${id}/sign`)}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                  >
                    ✍️ E-Sign
                  </button>
                )}
                {/* Upload Attachment Button */}
                {['officer', 'cid', 'command', 'admin'].includes(user.role) && (
                  <button
                    onClick={() => navigate(`/dashboard/edms/${id}/attach`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    📎 Attach File
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Document Quick Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-police-blue/10 rounded-full flex items-center justify-center text-3xl">
                  📁
                </div>
                <div>
                  <h3 className="text-xl font-bold text-police-blue">
                    {document.documentNumber}
                  </h3>
                  <p className="text-lg font-semibold text-gray-800">{document.title}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span><strong>Type:</strong> {document.documentType}</span>
                    <span><strong>Classification:</strong> {document.classification}</span>
                    <span><strong>Created:</strong> {new Date(document.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      document.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                      document.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                      document.status === 'Delivered' ? 'bg-purple-100 text-purple-800' :
                      document.status === 'Read' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {document.status}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      document.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      document.priority === 'Urgent' ? 'bg-orange-100 text-orange-800' :
                      document.priority === 'Normal' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {document.priority} Priority
                    </span>
                    {document.requiresApproval && (
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        document.approvalStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                        document.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                        document.approvalStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {document.approvalStatus}
                      </span>
                    )}
                    {document.isSigned && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        ✅ E-Signed
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Sender</p>
                <p className="font-semibold">
                  {document.sender?.policeId || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">{document.senderDepartment}</p>
                <p className="text-sm text-gray-600 mt-2">Recipient</p>
                <p className="font-semibold">
                  {document.recipient?.policeId || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">{document.recipientDepartment}</p>
                {document.isSigned && (
                  <>
                    <p className="text-sm text-gray-600 mt-2">Signed By</p>
                    <p className="font-semibold text-police-blue">
                      {document.signedBy?.policeId || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(document.signedAt).toLocaleString()}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex gap-2 px-4 pt-4 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-police-blue text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📋 Document Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Document Number</p>
                      <p className="text-lg font-semibold text-police-blue">{document.documentNumber}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Document Type</p>
                      <p className="text-lg font-semibold">{document.documentType}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="text-lg font-semibold">{document.status}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Priority</p>
                      <p className="text-lg font-semibold">{document.priority}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Classification</p>
                      <p className="text-lg font-semibold">{document.classification}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Requires Approval</p>
                      <p className="text-lg font-semibold">{document.requiresApproval ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Approval Status</p>
                      <p className="text-lg font-semibold">{document.approvalStatus || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">E-Signed</p>
                      <p className="text-lg font-semibold">{document.isSigned ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  {/* Vision Doc Alignment Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-6">
                    <h5 className="text-sm font-semibold text-blue-800 mb-2">
                      📋 Vision Document Alignment (Section 4.5)
                    </h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>✅ Digital memos and documents</li>
                      <li>✅ Electronic approvals (E-Approvals)</li>
                      <li>✅ Electronic signatures (E-Signatures)</li>
                      <li>✅ Automated workflows (Draft → Sent → Delivered → Read)</li>
                      <li>✅ Activity logging (Section 5.2 - Accountability)</li>
                      <li>✅ Role-based access control (Section 4.2)</li>
                      <li>✅ 90% paperless goal supported</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📝 Document Content</h4>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Title</p>
                    <p className="font-semibold text-lg">{document.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Full Content</p>
                    <div className="bg-gray-50 p-4 rounded border whitespace-pre-line">
                      {document.content}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Sender Department</p>
                      <p className="font-semibold">{document.senderDepartment}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Recipient Department</p>
                      <p className="font-semibold">{document.recipientDepartment}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Workflow Tab */}
              {activeTab === 'workflow' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">🔄 Workflow Status</h4>
                  
                  {/* Workflow Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`flex flex-col items-center ${document.status !== 'Draft' ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          document.status !== 'Draft' ? 'border-green-600 bg-green-100' : 'border-gray-300 bg-gray-100'
                        }`}>
                          📝
                        </div>
                        <p className="text-xs mt-1 font-semibold">Draft</p>
                      </div>
                      <div className={`flex-1 h-1 mx-2 ${document.status !== 'Draft' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                      <div className={`flex flex-col items-center ${['Sent', 'Delivered', 'Read'].includes(document.status) ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          ['Sent', 'Delivered', 'Read'].includes(document.status) ? 'border-green-600 bg-green-100' : 'border-gray-300 bg-gray-100'
                        }`}>
                          📤
                        </div>
                        <p className="text-xs mt-1 font-semibold">Sent</p>
                      </div>
                      <div className={`flex-1 h-1 mx-2 ${['Delivered', 'Read'].includes(document.status) ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                      <div className={`flex flex-col items-center ${['Delivered', 'Read'].includes(document.status) ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          ['Delivered', 'Read'].includes(document.status) ? 'border-green-600 bg-green-100' : 'border-gray-300 bg-gray-100'
                        }`}>
                          ✅
                        </div>
                        <p className="text-xs mt-1 font-semibold">Delivered</p>
                      </div>
                      <div className={`flex-1 h-1 mx-2 ${document.status === 'Read' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                      <div className={`flex flex-col items-center ${document.status === 'Read' ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          document.status === 'Read' ? 'border-green-600 bg-green-100' : 'border-gray-300 bg-gray-100'
                        }`}>
                          👁️
                        </div>
                        <p className="text-xs mt-1 font-semibold">Read</p>
                      </div>
                    </div>
                  </div>

                  {/* Approval Workflow */}
                  {document.requiresApproval && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                      <h5 className="text-sm font-semibold text-yellow-800 mb-2">
                        🔐 Approval Workflow
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Approval Status</p>
                          <p className="font-semibold">{document.approvalStatus}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Approver</p>
                          <p className="font-semibold">{document.approver?.policeId || 'Pending'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Approved At</p>
                          <p className="font-semibold">{document.approvedAt ? new Date(document.approvedAt).toLocaleString() : 'Pending'}</p>
                        </div>
                      </div>
                      {document.approvalNotes && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600">Approval Notes</p>
                          <p className="text-sm text-gray-800">{document.approvalNotes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* E-Signature Status */}
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <h5 className="text-sm font-semibold text-green-800 mb-2">
                      ✍️ E-Signature Status
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Signed</p>
                        <p className="font-semibold">{document.isSigned ? 'Yes ✅' : 'No ❌'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Signed By</p>
                        <p className="font-semibold">{document.signedBy?.policeId || 'Not Signed'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Signed At</p>
                        <p className="font-semibold">{document.signedAt ? new Date(document.signedAt).toLocaleString() : 'Not Signed'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments Tab */}
              {activeTab === 'attachments' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📎 Attachments</h4>
                  {document.attachments && document.attachments.length > 0 ? (
                    <div className="space-y-4">
                      {document.attachments.map((item, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded border">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {item.fileType?.includes('image') ? '🖼️' :
                                 item.fileType?.includes('pdf') ? '📄' :
                                 item.fileType?.includes('video') ? '🎥' :
                                 '📦'}
                              </span>
                              <div>
                                <p className="font-semibold">{item.fileName}</p>
                                <p className="text-sm text-gray-600">
                                  Type: {item.fileType} | Size: {(item.fileSize / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                {new Date(item.uploadedAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                By: {item.uploadedBy?.policeId || 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No attachments uploaded</p>
                  )}
                </div>
              )}

              {/* Activity Log Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📜 Activity Log</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Vision Doc Section 5.2 - Transparency & Accountability
                  </p>
                  {document.activityLog && document.activityLog.length > 0 ? (
                    <div className="space-y-3">
                      {document.activityLog.map((log, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded border-l-4 border-police-blue">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-police-blue">{log.action}</p>
                              <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">
                                {new Date(log.timestamp).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                By: {log.performedBy?.policeId || 'Unknown'}
                              </p>
                              {log.ipAddress && (
                                <p className="text-xs text-gray-500">IP: {log.ipAddress}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No activity recorded</p>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap">
            {document.sender?._id === user.id && document.status === 'Draft' && (
              <button
                onClick={() => navigate(`/dashboard/edms/${id}/send`)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                📤 Send Document
              </button>
            )}
            {['command', 'admin'].includes(user.role) && document.approvalStatus === 'Pending' && (
              <button
                onClick={() => navigate(`/dashboard/edms/${id}/approve`)}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
              >
                ✅ Approve/Reject
              </button>
            )}
            {['command', 'admin'].includes(user.role) && !document.isSigned && document.approvalStatus === 'Approved' && (
              <button
                onClick={() => navigate(`/dashboard/edms/${id}/sign`)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
              >
                ✍️ E-Sign Document
              </button>
            )}
            {['officer', 'cid', 'command', 'admin'].includes(user.role) && (
              <button
                onClick={() => navigate(`/dashboard/edms/${id}/attach`)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                📎 Upload Attachment
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard/edms')}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
            >
              ← Back to Documents
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ViewDocument;