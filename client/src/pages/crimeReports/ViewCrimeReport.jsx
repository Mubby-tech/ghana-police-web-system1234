import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function ViewCrimeReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [report, setReport] = useState(null);
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

  // Fetch report details
  useEffect(() => {
    if (user && id) {
      fetchReport();
    }
  }, [user, id]);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/crime-reports/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setReport(data.data);
      } else {
        setError(data.message || 'Failed to load report details');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch report error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tab configuration based on Vision Doc Section 4.1
  const getTabs = () => {
    const tabs = [
      { id: 'overview', label: '📋 Overview', icon: '📋' },
      { id: 'incident', label: '📍 Incident', icon: '📍' },
      { id: 'victims', label: '👥 Victims', icon: '👥' },
      { id: 'suspects', label: '👤 Suspects', icon: '👤' },
      { id: 'evidence', label: '📎 Evidence', icon: '📎' },
      { id: 'notes', label: '📝 Notes', icon: '📝' },
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
          <p className="text-police-blue text-lg font-semibold">Loading Report Details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-4">❌ {error || 'Report not found'}</p>
          <button
            onClick={() => navigate('/dashboard/reports')}
            className="bg-police-blue text-white px-6 py-2 rounded hover:bg-police-star transition"
          >
            Back to Reports
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

        {/* View Report Content */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={() => navigate('/dashboard/reports')}
                    className="text-gray-600 hover:text-police-blue"
                  >
                    ← Back
                  </button>
                  <h2 className="text-2xl font-bold text-police-blue">
                    📊 Crime Report Profile
                  </h2>
                </div>
                <p className="text-gray-600">
                  Vision Doc Section 4.1 - Centralized Digital Database
                </p>
              </div>
              <div className="flex gap-2">
                {['cid', 'command', 'admin'].includes(user.role) && (
                  <button
                    onClick={() => navigate(`/dashboard/reports/${id}/edit`)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    ✏️ Edit
                  </button>
                )}
                {['cid', 'command', 'admin'].includes(user.role) && (
                  <button
                    onClick={() => navigate(`/dashboard/reports/${id}/notes`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    📝 Add Notes
                  </button>
                )}
                {['cid', 'command', 'admin'].includes(user.role) && !report.linkedCase && (
                  <button
                    onClick={() => navigate(`/dashboard/reports/${id}/link-case`)}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                  >
                    🔗 Link CID Case
                  </button>
                )}
                {report.linkedCase && (
                  <button
                    onClick={() => navigate(`/dashboard/cid/${report.linkedCase._id}`)}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
                  >
                    🔍 View CID Case
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Report Quick Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-police-blue/10 rounded-full flex items-center justify-center text-3xl">
                  📁
                </div>
                <div>
                  <h3 className="text-xl font-bold text-police-blue">
                    {report.reportNumber}
                  </h3>
                  <p className="text-lg font-semibold text-gray-800">{report.title}</p>
                 <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span><strong>Crime Type:</strong> {report.crimeType}</span>
                    <span><strong>Region:</strong> {report.region}</span>
                    <span><strong>Filed:</strong> {new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
                  <div className="flex gap-2 mt-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
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
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      report.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                      report.severity === 'Serious' ? 'bg-orange-100 text-orange-800' :
                      report.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {report.severity} Severity
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-police-blue/10 text-police-blue">
                      {report.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Reporting Officer</p>
                <p className="font-semibold">
                  {report.reportingOfficer?.policeId || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 mt-2">Assigned To</p>
                <p className="font-semibold">
                  {report.assignedTo?.policeId || 'Not Assigned'}
                </p>
                {report.linkedCase && (
                  <>
                    <p className="text-sm text-gray-600 mt-2">Linked CID Case</p>
                    <p className="font-semibold text-police-blue">
                      {report.linkedCase.caseNumber}
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
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📋 Report Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Report Number</p>
                      <p className="text-lg font-semibold text-police-blue">{report.reportNumber}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="text-lg font-semibold">{report.status}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Severity</p>
                      <p className="text-lg font-semibold">{report.severity}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="text-lg font-semibold">{report.category}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Crime Type</p>
                      <p className="text-lg font-semibold">{report.crimeType}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Region</p>
                      <p className="text-lg font-semibold">{report.region}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Filed Date</p>
                      <p className="text-lg font-semibold">{new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="text-lg font-semibold">{new Date(report.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Vision Doc Alignment Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-6">
                    <h5 className="text-sm font-semibold text-blue-800 mb-2">
                      📋 Vision Document Alignment (Section 4.1)
                    </h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>✅ Centralized Digital Database</li>
                      <li>✅ Electronic Crime Reporting</li>
                      <li>✅ Quick Retrieval & Search</li>
                      <li>✅ Activity Logging (Section 5.2 - Accountability)</li>
                      <li>✅ Role-Based Access Control (Section 4.2)</li>
                      <li>✅ CID Integration (Section 4.4)</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Incident Details Tab */}
              {activeTab === 'incident' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📍 Incident Details</h4>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Title</p>
                    <p className="font-semibold text-lg">{report.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Description</p>
                    <p className="text-gray-800 whitespace-pre-line">{report.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Incident Date</p>
                      <p className="font-semibold">{new Date(report.incidentDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Incident Time</p>
                      <p className="font-semibold">{report.incidentTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Region</p>
                      <p className="font-semibold">{report.region}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">District</p>
                      <p className="font-semibold">{report.district}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Incident Location</p>
                      <p className="font-semibold">{report.incidentLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reporting Station</p>
                      <p className="font-semibold">{report.station}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Victims Tab */}
              {activeTab === 'victims' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">👥 Victims Information</h4>
                  {report.victims && report.victims.length > 0 ? (
                    <div className="space-y-3">
                      {report.victims.map((victim, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded border-l-4 border-police-blue">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-lg">Victim {index + 1}</p>
                              <p className="text-gray-800 mt-1">{victim.name}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              victim.injuryStatus === 'Fatal' ? 'bg-red-100 text-red-800' :
                              victim.injuryStatus === 'Serious' ? 'bg-orange-100 text-orange-800' :
                              victim.injuryStatus === 'Minor' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {victim.injuryStatus} Injury
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                            <div>
                              <p className="text-gray-600">Age</p>
                              <p className="font-semibold">{victim.age || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Gender</p>
                              <p className="font-semibold">{victim.gender || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Contact</p>
                              <p className="font-semibold">{victim.contact || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Address</p>
                              <p className="font-semibold">{victim.address || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No victims recorded</p>
                  )}
                </div>
              )}

              {/* Suspects Tab */}
              {activeTab === 'suspects' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">👤 Suspects Information</h4>
                  {report.suspects && report.suspects.length > 0 ? (
                    <div className="space-y-3">
                      {report.suspects.map((suspect, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded border-l-4 border-police-blue">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-lg">Suspect {index + 1}</p>
                              <p className="text-gray-800 mt-1">{suspect.name || 'Unknown'}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              suspect.status === 'At Large' ? 'bg-red-100 text-red-800' :
                              suspect.status === 'Arrested' ? 'bg-orange-100 text-orange-800' :
                              suspect.status === 'Released' ? 'bg-green-100 text-green-800' :
                              suspect.status === 'Identified' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {suspect.status}
                            </span>
                          </div>
                          {suspect.inmateRef && (
                            <div className="mt-2 text-sm text-gray-600">
                              <p><strong>Linked Inmate:</strong> {suspect.inmateRef.inmateId}</p>
                              <p><strong>Case Number:</strong> {suspect.inmateRef.caseNumber}</p>
                              <p><strong>Custody Status:</strong> {suspect.inmateRef.custodyStatus}</p>
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

              {/* Evidence Tab */}
              {activeTab === 'evidence' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📎 Evidence Files</h4>
                  {report.evidence && report.evidence.length > 0 ? (
                    <div className="space-y-4">
                      {report.evidence.map((item, index) => (
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
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No evidence uploaded</p>
                  )}
                </div>
              )}

              {/* Investigation Notes Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📝 Investigation Notes</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Vision Doc Section 4.4 - Electronic CID Documentation
                  </p>
                  {report.investigationNotes && report.investigationNotes.length > 0 ? (
                    <div className="space-y-3">
                      {report.investigationNotes.map((note, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded border-l-4 border-police-blue">
                          <div className="flex justify-between items-start">
                            <p className="text-gray-800 whitespace-pre-line">{note.note}</p>
                            <div className="text-right">
                              <p className="text-sm font-semibold">
                                {new Date(note.addedAt).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                By: {note.addedBy?.policeId || 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No investigation notes recorded</p>
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
                  {report.activityLog && report.activityLog.length > 0 ? (
                    <div className="space-y-3">
                      {report.activityLog.map((log, index) => (
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
            {['cid', 'command', 'admin'].includes(user.role) && (
              <button
                onClick={() => navigate(`/dashboard/reports/${id}/edit`)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                ✏️ Edit Report
              </button>
            )}
            {['cid', 'command', 'admin'].includes(user.role) && (
              <button
                onClick={() => navigate(`/dashboard/reports/${id}/notes`)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                📝 Add Notes
              </button>
            )}
            {['cid', 'command', 'admin'].includes(user.role) && !report.linkedCase && (
              <button
                onClick={() => navigate(`/dashboard/reports/${id}/link-case`)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
              >
                🔗 Link CID Case
              </button>
            )}
            {report.linkedCase && (
              <button
                onClick={() => navigate(`/dashboard/cid/${report.linkedCase._id}`)}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
              >
                🔍 View CID Case
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard/reports')}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
            >
              ← Back to Reports
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ViewCrimeReport;