import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function ViewInmate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [inmate, setInmate] = useState(null);
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

  // Fetch inmate details
  useEffect(() => {
    if (user && id) {
      fetchInmate();
    }
  }, [user, id]);

  const fetchInmate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/inmates/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setInmate(data.data.inmate);
      } else {
        setError(data.message || 'Failed to load inmate details');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch inmate error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tab configuration based on user role
  const getTabs = () => {
    const tabs = [
      { id: 'overview', label: '📋 Overview', icon: '📋' },
      { id: 'personal', label: '👤 Personal Info', icon: '👤' },
      { id: 'case', label: '📁 Case Details', icon: '📁' },
      { id: 'court', label: '⚖️ Court Info', icon: '⚖️' },
      { id: 'bail', label: '💰 Bail', icon: '💰' },
      { id: 'medical', label: '🏥 Medical', icon: '🏥' },
      { id: 'kin', label: '👨‍👩‍ Next of Kin', icon: '👨‍‍' },
      { id: 'history', label: '📜 Transfer History', icon: '📜' }
    ];
    return tabs;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading Inmate Details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error || !inmate) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-4">❌ {error || 'Inmate not found'}</p>
          <button
            onClick={() => navigate('/dashboard/inmates')}
            className="bg-police-blue text-white px-6 py-2 rounded hover:bg-police-star transition"
          >
            Back to Inmate List
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

        {/* View Inmate Content */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={() => navigate('/dashboard/inmates')}
                    className="text-gray-600 hover:text-police-blue"
                  >
                    ← Back
                  </button>
                  <h2 className="text-2xl font-bold text-police-blue">
                    👤 Inmate Profile
                  </h2>
                </div>
                <p className="text-gray-600">
                  Complete inmate record and case information
                </p>
              </div>
              <div className="flex gap-2">
                {['cid', 'command', 'admin'].includes(user.role) && (
                  <button
                    onClick={() => navigate(`/dashboard/inmates/${id}/edit`)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    ✏️ Edit
                  </button>
                )}
                {['command', 'admin'].includes(user.role) && (
                  <>
                    <button
                      onClick={() => navigate(`/dashboard/inmates/${id}/transfer`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      🔄 Transfer
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/inmates/${id}/release`)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      🚪 Release
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Inmate Quick Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-police-blue/10 rounded-full flex items-center justify-center text-4xl">
                {inmate.gender === 'Male' ? '👨' : '👩'}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-police-blue">
                  {inmate.firstName} {inmate.lastName} {inmate.otherNames}
                </h3>
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span><strong>Inmate ID:</strong> {inmate.inmateId}</span>
                  <span><strong>Case No:</strong> {inmate.caseNumber}</span>
                  <span><strong>Gender:</strong> {inmate.gender}</span>
                  <span><strong>Age:</strong> {new Date().getFullYear() - new Date(inmate.dateOfBirth).getFullYear()} yrs</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    inmate.custodyStatus === 'Remand' ? 'bg-yellow-100 text-yellow-800' :
                    inmate.custodyStatus === 'Awaiting Trial' ? 'bg-blue-100 text-blue-800' :
                    inmate.custodyStatus === 'Convicted' ? 'bg-red-100 text-red-800' :
                    inmate.custodyStatus === 'Released' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {inmate.custodyStatus}
                  </span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-police-blue/10 text-police-blue">
                    {inmate.station}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex gap-2 px-4 pt-4">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
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
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📋 Inmate Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Inmate ID</p>
                      <p className="text-lg font-semibold text-police-blue">{inmate.inmateId}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Case Number</p>
                      <p className="text-lg font-semibold text-police-blue">{inmate.caseNumber}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Custody Status</p>
                      <p className="text-lg font-semibold">{inmate.custodyStatus}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Station</p>
                      <p className="text-lg font-semibold">{inmate.station}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Cell Number</p>
                      <p className="text-lg font-semibold">{inmate.cellNumber || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Admission Date</p>
                      <p className="text-lg font-semibold">{new Date(inmate.admissionDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Arrest Date</p>
                      <p className="text-lg font-semibold">{new Date(inmate.arrestDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Bail Status</p>
                      <p className="text-lg font-semibold">{inmate.bailStatus}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Next Court Date</p>
                      <p className="text-lg font-semibold">
                        {inmate.nextCourtDate ? new Date(inmate.nextCourtDate).toLocaleDateString() : 'Not scheduled'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">👤 Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-semibold">{inmate.firstName} {inmate.lastName} {inmate.otherNames}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-semibold">{new Date(inmate.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-semibold">{inmate.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nationality</p>
                      <p className="font-semibold">{inmate.nationality}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hometown</p>
                      <p className="font-semibold">{inmate.hometown}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Region</p>
                      <p className="font-semibold">{inmate.region}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold">{inmate.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{inmate.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Height</p>
                      <p className="font-semibold">{inmate.height || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="font-semibold">{inmate.weight || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Complexion</p>
                      <p className="font-semibold">{inmate.complexion || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Distinguishing Marks</p>
                      <p className="font-semibold">{inmate.distinguishingMarks || 'None'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Case Details Tab */}
              {activeTab === 'case' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📁 Case Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Case Number</p>
                      <p className="font-semibold">{inmate.caseNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Arrest Date</p>
                      <p className="font-semibold">{new Date(inmate.arrestDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Arrest Location</p>
                      <p className="font-semibold">{inmate.arrestLocation}</p>
                    </div>
                    {inmate.arrestingOfficer && (
                      <div>
                        <p className="text-sm text-gray-600">Arresting Officer</p>
                        <p className="font-semibold">
                          {inmate.arrestingOfficer.firstName} {inmate.arrestingOfficer.lastName} 
                          ({inmate.arrestingOfficer.policeId})
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-sm text-gray-600 mb-2">Charges</p>
                    <div className="space-y-2">
                      {inmate.charges && inmate.charges.map((charge, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-700">Charge {index + 1}:</span>
                          <span className="flex-1">{charge.charge}</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            charge.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            charge.status === 'In Court' ? 'bg-blue-100 text-blue-800' :
                            charge.status === 'Convicted' ? 'bg-red-100 text-red-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {charge.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(charge.dateFiled).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Court Info Tab */}
              {activeTab === 'court' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">⚖️ Court Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Court Name</p>
                      <p className="font-semibold">{inmate.courtName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Court Location</p>
                      <p className="font-semibold">{inmate.courtLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Court Date</p>
                      <p className="font-semibold">
                        {inmate.nextCourtDate ? new Date(inmate.nextCourtDate).toLocaleDateString() : 'Not scheduled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Presiding Judge</p>
                      <p className="font-semibold">{inmate.presidingJudge || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bail Tab */}
              {activeTab === 'bail' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">💰 Bail Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Bail Status</p>
                      <p className="font-semibold">{inmate.bailStatus}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bail Amount (GHS)</p>
                      <p className="font-semibold">₵{inmate.bailAmount?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bail Date</p>
                      <p className="font-semibold">
                        {inmate.bailDate ? new Date(inmate.bailDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="md:col-span-3">
                      <p className="text-sm text-gray-600 mb-1">Bail Conditions</p>
                      <p className="font-semibold">{inmate.bailConditions || 'None specified'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Tab */}
              {activeTab === 'medical' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">🏥 Medical Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Blood Group</p>
                      <p className="font-semibold">{inmate.medicalInfo?.bloodGroup || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Allergies</p>
                      <p className="font-semibold">{inmate.medicalInfo?.allergies || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Chronic Conditions</p>
                      <p className="font-semibold">{inmate.medicalInfo?.chronicConditions || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Medications</p>
                      <p className="font-semibold">{inmate.medicalInfo?.medications || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Medical Checkup</p>
                      <p className="font-semibold">
                        {inmate.medicalInfo?.lastMedicalCheckup 
                          ? new Date(inmate.medicalInfo.lastMedicalCheckup).toLocaleDateString() 
                          : 'Not recorded'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Next of Kin Tab */}
              {activeTab === 'kin' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">👨‍👩‍ Next of Kin</h4>
                  {inmate.nextOfKin ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-semibold">{inmate.nextOfKin.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Relationship</p>
                        <p className="font-semibold">{inmate.nextOfKin.relationship}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold">{inmate.nextOfKin.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-semibold">{inmate.nextOfKin.address || 'N/A'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No next of kin information recorded</p>
                  )}
                </div>
              )}

              {/* Transfer History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📜 Transfer History</h4>
                  {inmate.transferHistory && inmate.transferHistory.length > 0 ? (
                    <div className="space-y-3">
                      {inmate.transferHistory.map((transfer, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded border-l-4 border-police-blue">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-police-blue">
                                {transfer.fromStation} → {transfer.toStation}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">{transfer.reason}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">
                                {new Date(transfer.transferDate).toLocaleDateString()}
                              </p>
                              {transfer.authorizedBy && (
                                <p className="text-xs text-gray-500">
                                  By: {transfer.authorizedBy.policeId}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No transfer history recorded</p>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {['cid', 'command', 'admin'].includes(user.role) && (
              <button
                onClick={() => navigate(`/dashboard/inmates/${id}/edit`)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                ✏️ Edit Inmate
              </button>
            )}
            {['command', 'admin'].includes(user.role) && (
              <>
                <button
                  onClick={() => navigate(`/dashboard/inmates/${id}/transfer`)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  🔄 Transfer Inmate
                </button>
                <button
                  onClick={() => navigate(`/dashboard/inmates/${id}/release`)}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
                >
                  🚪 Release Inmate
                </button>
              </>
            )}
            <button
              onClick={() => navigate('/dashboard/inmates')}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
            >
              ← Back to List
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ViewInmate;