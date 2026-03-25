import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function ViewCase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [caseData, setCaseData] = useState(null);
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

  // Fetch case details
  useEffect(() => {
    if (user && id) {
      fetchCase();
    }
  }, [user, id]);

  const fetchCase = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/cases/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCaseData(data.data);
      } else {
        setError(data.message || 'Failed to load case details');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch case error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tab configuration based on Vision Doc Section 4.4
  const getTabs = () => {
    const tabs = [
      { id: 'overview', label: '📋 Overview', icon: '📋' },
      { id: 'details', label: '📝 Case Details', icon: '📝' },
      { id: 'suspects', label: '👤 Suspects', icon: '👤' },
      { id: 'statements', label: '🗣️ Statements', icon: '🗣️' },
      { id: 'evidence', label: '📎 Evidence', icon: '📎' },
      { id: 'activity', label: '📜 Activity Log', icon: '📜' },
      { id: 'prosecutor', label: '⚖️ Prosecutor', icon: '⚖️' }
    ];
    return tabs;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading Case Details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error || !caseData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-4">❌ {error || 'Case not found'}</p>
          <button
            onClick={() => navigate('/dashboard/cid')}
            className="bg-police-blue text-white px-6 py-2 rounded hover:bg-police-star transition"
          >
            Back to CID Cases
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

        {/* View Case Content */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={() => navigate('/dashboard/cid')}
                    className="text-gray-600 hover:text-police-blue"
                  >
                    ← Back
                  </button>
                  <h2 className="text-2xl font-bold text-police-blue">
                    🔍 CID Case Profile
                  </h2>
                </div>
                <p className="text-gray-600">
                  Vision Doc Section 4.4 - Electronic CID Documentation
                </p>
              </div>
              <div className="flex gap-2">
                {['cid', 'command', 'admin'].includes(user.role) && (
                  <button
                    onClick={() => navigate(`/dashboard/cid/${id}/edit`)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    ✏️ Edit
                  </button>
                )}
                {['cid', 'officer', 'command', 'admin'].includes(user.role) && (
                  <>
                    <button
                      onClick={() => navigate(`/dashboard/cid/${id}/statement`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      🗣️ Add Statement
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/cid/${id}/evidence`)}
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                    >
                      📎 Upload Evidence
                    </button>
                  </>
                )}
                {['command', 'admin'].includes(user.role) && (
                  <button
                    onClick={() => navigate(`/dashboard/cid/${id}/share-prosecutor`)}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
                  >
                    ⚖️ Share with Prosecutor
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Case Quick Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-police-blue/10 rounded-full flex items-center justify-center text-3xl">
                  📁
                </div>
                <div>
                  <h3 className="text-xl font-bold text-police-blue">
                    {caseData.caseNumber}
                  </h3>
                  <p className="text-lg font-semibold text-gray-800">{caseData.title}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span><strong>Category:</strong> {caseData.category}</span>
                    <span><strong>Station:</strong> {caseData.station}</span>
                    <span><strong>Reported:</strong> {new Date(caseData.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      caseData.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                      caseData.status === 'Under Investigation' ? 'bg-purple-100 text-purple-800' :
                      caseData.status === 'Pending Court' ? 'bg-orange-100 text-orange-800' :
                      caseData.status === 'Closed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {caseData.status}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      caseData.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      caseData.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      caseData.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {caseData.priority} Priority
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Reporting Officer</p>
                <p className="font-semibold">
                  {caseData.reportingOfficer?.policeId || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 mt-2">Assigned Detective</p>
                <p className="font-semibold">
                  {caseData.assignedDetective?.policeId || 'Not Assigned'}
                </p>
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
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📋 Case Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Case Number</p>
                      <p className="text-lg font-semibold text-police-blue">{caseData.caseNumber}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="text-lg font-semibold">{caseData.status}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Priority</p>
                      <p className="text-lg font-semibold">{caseData.priority}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="text-lg font-semibold">{caseData.category}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Station</p>
                      <p className="text-lg font-semibold">{caseData.station}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Created Date</p>
                      <p className="text-lg font-semibold">{new Date(caseData.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="text-lg font-semibold">{new Date(caseData.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Suspects</p>
                      <p className="text-lg font-semibold">{caseData.suspects?.length || 0}</p>
                    </div>
                  </div>

                  {/* Vision Doc Alignment Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-6">
                    <h5 className="text-sm font-semibold text-blue-800 mb-2">
                      📋 Vision Document Alignment (Section 4.4)
                    </h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>✅ Electronic CID Documentation</li>
                      <li>✅ Digital Case File Management</li>
                      <li>✅ Investigation Progress Tracking</li>
                      <li>✅ Activity Logging (Section 5.2 - Accountability)</li>
                      <li>✅ Role-Based Access Control (Section 4.2)</li>
                      <li>✅ Centralized Database (Section 4.1)</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Case Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📝 Case Details</h4>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Title</p>
                    <p className="font-semibold text-lg">{caseData.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Description</p>
                    <p className="text-gray-800 whitespace-pre-line">{caseData.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-semibold">{caseData.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Priority</p>
                      <p className="font-semibold">{caseData.priority}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold">{caseData.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Station</p>
                      <p className="font-semibold">{caseData.station}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Suspects Tab */}
              {activeTab === 'suspects' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">👤 Suspects Information</h4>
                  {caseData.suspects && caseData.suspects.length > 0 ? (
                    <div className="space-y-3">
                      {caseData.suspects.map((suspect, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded border-l-4 border-police-blue">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-lg">Suspect {index + 1}</p>
                              <p className="text-gray-800 mt-1">{suspect.name}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              suspect.status === 'At Large' ? 'bg-red-100 text-red-800' :
                              suspect.status === 'Detained' ? 'bg-orange-100 text-orange-800' :
                              suspect.status === 'Released' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {suspect.status}
                            </span>
                          </div>
                          {suspect.inmateRef && (
                            <div className="mt-2 text-sm text-gray-600">
                              <p><strong>Linked Inmate:</strong> {suspect.inmateRef.inmateId}</p>
                              <p><strong>Charges:</strong> {suspect.inmateRef.charges?.[0]?.charge || 'N/A'}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No suspects recorded</p>
                  )}
                </div>
              )}

              {/* Statements Tab */}
              {activeTab === 'statements' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">🗣️ Digital Statements</h4>
                  {caseData.statements && caseData.statements.length > 0 ? (
                    <div className="space-y-4">
                      {caseData.statements.map((statement, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">{statement.personName}</p>
                              <p className="text-sm text-gray-600">
                                Role: <span className="font-semibold">{statement.role}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                statement.isSigned ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {statement.isSigned ? '✅ Signed' : '⏳ Pending Signature'}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(statement.dateRecorded).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-800 whitespace-pre-line">{statement.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Recorded by: {statement.recordedBy?.policeId || 'Unknown'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No statements recorded</p>
                  )}
                </div>
              )}

              {/* Evidence Tab */}
              {activeTab === 'evidence' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📎 Evidence Files</h4>
                  {caseData.evidence && caseData.evidence.length > 0 ? (
                    <div className="space-y-4">
                      {caseData.evidence.map((item, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded border">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {item.type === 'Photo' ? '📷' :
                                 item.type === 'Video' ? '🎥' :
                                 item.type === 'Document' ? '📄' :
                                 item.type === 'Audio' ? '🎵' : '📦'}
                              </span>
                              <div>
                                <p className="font-semibold">{item.fileName}</p>
                                <p className="text-sm text-gray-600">Type: {item.type}</p>
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
                          {item.description && (
                            <p className="text-gray-800 text-sm mb-2">{item.description}</p>
                          )}
                          {/* Chain of Custody */}
                          {item.chainOfCustody && item.chainOfCustody.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs font-semibold text-gray-600 mb-2">Chain of Custody:</p>
                              <div className="space-y-1">
                                {item.chainOfCustody.map((custody, cIndex) => (
                                  <p key={cIndex} className="text-xs text-gray-500">
                                    • {custody.action} by {custody.officer?.policeId || 'Unknown'} on {new Date(custody.date).toLocaleDateString()}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No evidence uploaded</p>
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
                  {caseData.activityLog && caseData.activityLog.length > 0 ? (
                    <div className="space-y-3">
                      {caseData.activityLog.map((log, index) => (
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

              {/* Prosecutor Tab */}
              {activeTab === 'prosecutor' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">⚖️ Prosecutor Sharing</h4>
                  {caseData.prosecutorShared && caseData.prosecutorShared.status ? (
                    <div className="p-6 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">✅</span>
                        <div>
                          <p className="font-semibold text-green-800 text-lg">Shared with Prosecutor</p>
                          <p className="text-sm text-green-600">
                            {new Date(caseData.prosecutorShared.sharedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Shared By</p>
                          <p className="font-semibold">
                            {caseData.prosecutorShared.sharedBy?.policeId || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Case Status</p>
                          <p className="font-semibold">{caseData.status}</p>
                        </div>
                      </div>
                      {caseData.prosecutorShared.notes && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-1">Notes</p>
                          <p className="text-gray-800">{caseData.prosecutorShared.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 rounded border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">⏳</span>
                        <div>
                          <p className="font-semibold text-gray-800 text-lg">Not Shared with Prosecutor</p>
                          <p className="text-sm text-gray-600">
                            Case has not been shared with the prosecutor's office
                          </p>
                        </div>
                      </div>
                      {['command', 'admin'].includes(user.role) && (
                        <button
                          onClick={() => navigate(`/dashboard/cid/${id}/share-prosecutor`)}
                          className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition"
                        >
                          ⚖️ Share with Prosecutor
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap">
            {['cid', 'command', 'admin'].includes(user.role) && (
              <button
                onClick={() => navigate(`/dashboard/cid/${id}/edit`)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                ✏️ Edit Case
              </button>
            )}
            {['cid', 'officer', 'command', 'admin'].includes(user.role) && (
              <>
                <button
                  onClick={() => navigate(`/dashboard/cid/${id}/statement`)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  🗣️ Add Statement
                </button>
                <button
                  onClick={() => navigate(`/dashboard/cid/${id}/evidence`)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
                >
                  📎 Upload Evidence
                </button>
              </>
            )}
            {['command', 'admin'].includes(user.role) && (
              <button
                onClick={() => navigate(`/dashboard/cid/${id}/share-prosecutor`)}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
              >
                ⚖️ Share with Prosecutor
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard/cid')}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
            >
              ← Back to CID Cases
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ViewCase;