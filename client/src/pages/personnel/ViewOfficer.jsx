import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function ViewOfficer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [officer, setOfficer] = useState(null);
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

  // Fetch officer details
  useEffect(() => {
    if (user && id) {
      fetchOfficer();
    }
  }, [user, id]);

  const fetchOfficer = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/personnel/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setOfficer(data.data);
      } else {
        setError(data.message || 'Failed to load officer details');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch officer error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tab configuration based on Vision Doc Section 4.1
  const getTabs = () => {
    const tabs = [
      { id: 'overview', label: '📋 Overview', icon: '📋' },
      { id: 'personal', label: '👤 Personal Info', icon: '👤' },
      { id: 'service', label: '🎖️ Service', icon: '🎖️' },
      { id: 'promotions', label: '📈 Promotions', icon: '📈' },
      { id: 'transfers', label: '🔄 Transfers', icon: '🔄' },
      { id: 'leave', label: '🏖️ Leave Records', icon: '🏖️' },
      { id: 'contacts', label: '📞 Contacts', icon: '📞' }
    ];
    return tabs;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading Officer Profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error || !officer) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-4">❌ {error || 'Officer not found'}</p>
          <button
            onClick={() => navigate('/dashboard/personnel')}
            className="bg-police-blue text-white px-6 py-2 rounded hover:bg-police-star transition"
          >
            Back to Personnel
          </button>
        </div>
      </div>
    );
  }

  const tabs = getTabs();

  // Calculate years of service
  const calculateYearsOfService = () => {
    if (!officer.dateOfEnlistment) return 'N/A';
    const enlistmentDate = new Date(officer.dateOfEnlistment);
    const today = new Date();
    const years = today.getFullYear() - enlistmentDate.getFullYear();
    return years;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />

        {/* View Officer Content */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={() => navigate('/dashboard/personnel')}
                    className="text-gray-600 hover:text-police-blue"
                  >
                    ← Back
                  </button>
                  <h2 className="text-2xl font-bold text-police-blue">
                    👥 Officer Profile
                  </h2>
                </div>
                <p className="text-gray-600">
                  Vision Doc Section 4.1 - Personnel Records Management System
                </p>
              </div>
              <div className="flex gap-2">
                {['hr', 'command', 'admin'].includes(user.role) && (
                  <>
                    <button
                      onClick={() => navigate(`/dashboard/personnel/${id}/edit`)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/personnel/${id}/transfer`)}
                      className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
                    >
                      🔄 Transfer
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Officer Quick Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-police-blue/10 rounded-full flex items-center justify-center text-4xl">
                👮
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-police-blue">
                  {officer.firstName} {officer.otherNames ? officer.otherNames + ' ' : ''}{officer.lastName}
                </h3>
                <p className="text-lg font-semibold text-gray-800">{officer.policeId}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span><strong>Rank:</strong> {officer.rank}</span>
                  <span><strong>Station:</strong> {officer.station}</span>
                  <span><strong>Region:</strong> {officer.region}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    officer.deploymentStatus === 'Active' ? 'bg-green-100 text-green-800' :
                    officer.deploymentStatus === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                    officer.deploymentStatus === 'Suspended' ? 'bg-red-100 text-red-800' :
                    officer.deploymentStatus === 'Retired' ? 'bg-gray-100 text-gray-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {officer.deploymentStatus}
                  </span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {officer.department}
                  </span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {calculateYearsOfService()} Years Service
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Service Number</p>
                <p className="font-semibold">{officer.serviceNumber || 'N/A'}</p>
                <p className="text-sm text-gray-600 mt-2">Email</p>
                <p className="font-semibold text-police-blue">{officer.email}</p>
                <p className="text-sm text-gray-600 mt-2">Contact</p>
                <p className="font-semibold">{officer.contactNumber}</p>
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
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📋 Officer Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Police ID</p>
                      <p className="text-lg font-semibold text-police-blue">{officer.policeId}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Service Number</p>
                      <p className="text-lg font-semibold">{officer.serviceNumber || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Rank</p>
                      <p className="text-lg font-semibold">{officer.rank}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Deployment Status</p>
                      <p className="text-lg font-semibold">{officer.deploymentStatus}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Station</p>
                      <p className="text-lg font-semibold">{officer.station}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Region</p>
                      <p className="text-lg font-semibold">{officer.region}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="text-lg font-semibold">{officer.department}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Years of Service</p>
                      <p className="text-lg font-semibold">{calculateYearsOfService()} Years</p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                      <p className="text-sm text-blue-600">Total Promotions</p>
                      <p className="text-2xl font-bold text-blue-800">{officer.promotions?.length || 0}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded p-4">
                      <p className="text-sm text-green-600">Total Transfers</p>
                      <p className="text-2xl font-bold text-green-800">{officer.transfers?.length || 0}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded p-4">
                      <p className="text-sm text-purple-600">Leave Records</p>
                      <p className="text-2xl font-bold text-purple-800">{officer.leaveRecords?.length || 0}</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded p-4">
                      <p className="text-sm text-orange-600">Training Records</p>
                      <p className="text-2xl font-bold text-orange-800">{officer.training?.length || 0}</p>
                    </div>
                  </div>

                  {/* Vision Doc Alignment Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-6">
                    <h5 className="text-sm font-semibold text-blue-800 mb-2">
                      📋 Vision Document Alignment (Section 4.1)
                    </h5>
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
                </div>
              )}

              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">👤 Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-semibold text-lg">
                        {officer.firstName} {officer.otherNames ? officer.otherNames + ' ' : ''}{officer.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-semibold">{officer.dateOfBirth ? new Date(officer.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Place of Birth</p>
                      <p className="font-semibold">{officer.placeOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-semibold">{officer.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nationality</p>
                      <p className="font-semibold">{officer.nationality}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact Number</p>
                      <p className="font-semibold">{officer.contactNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email Address</p>
                      <p className="font-semibold text-police-blue">{officer.email}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Residential Address</p>
                      <p className="font-semibold">{officer.residentialAddress}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Tab */}
              {activeTab === 'service' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">🎖️ Service Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Current Rank</p>
                      <p className="font-semibold text-lg">{officer.rank}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Service Number</p>
                      <p className="font-semibold">{officer.serviceNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Enlistment</p>
                      <p className="font-semibold">{officer.dateOfEnlistment ? new Date(officer.dateOfEnlistment).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Confirmation</p>
                      <p className="font-semibold">{officer.dateOfConfirmation ? new Date(officer.dateOfConfirmation).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current Station</p>
                      <p className="font-semibold">{officer.station}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Region</p>
                      <p className="font-semibold">{officer.region}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-semibold">{officer.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deployment Status</p>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        officer.deploymentStatus === 'Active' ? 'bg-green-100 text-green-800' :
                        officer.deploymentStatus === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                        officer.deploymentStatus === 'Suspended' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {officer.deploymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Promotions Tab */}
              {activeTab === 'promotions' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📈 Promotion History</h4>
                  {officer.promotions && officer.promotions.length > 0 ? (
                    <div className="space-y-4">
                      {officer.promotions.map((promo, index) => (
                        <div key={index} className="p-4 bg-green-50 rounded border border-green-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-green-800">Promoted to {promo.rank}</p>
                              <p className="text-sm text-green-600 mt-1">
                                Reference: {promo.referenceNumber || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-800">
                                {promo.date ? new Date(promo.date).toLocaleDateString() : 'N/A'}
                              </p>
                              <p className="text-xs text-green-600">
                                By: {promo.issuedBy || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No promotion records</p>
                  )}
                </div>
              )}

              {/* Transfers Tab */}
              {activeTab === 'transfers' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">🔄 Transfer History</h4>
                  {officer.transfers && officer.transfers.length > 0 ? (
                    <div className="space-y-4">
                      {officer.transfers.map((transfer, index) => (
                        <div key={index} className="p-4 bg-blue-50 rounded border border-blue-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-blue-800">
                                {transfer.fromStation} → {transfer.toStation}
                              </p>
                              <p className="text-sm text-blue-600 mt-1">
                                {transfer.fromRegion} → {transfer.toRegion}
                              </p>
                              <p className="text-sm text-blue-600 mt-1">
                                Reason: {transfer.reason || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-blue-800">
                                {transfer.date ? new Date(transfer.date).toLocaleDateString() : 'N/A'}
                              </p>
                              <p className="text-xs text-blue-600">
                                By: {transfer.approvedBy || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No transfer records</p>
                  )}
                </div>
              )}

              {/* Leave Tab */}
              {activeTab === 'leave' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">🏖️ Leave Records</h4>
                  {officer.leaveRecords && officer.leaveRecords.length > 0 ? (
                    <div className="space-y-4">
                      {officer.leaveRecords.map((leave, index) => (
                        <div key={index} className="p-4 bg-purple-50 rounded border border-purple-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-purple-800">{leave.type} Leave</p>
                              <p className="text-sm text-purple-600 mt-1">
                                {leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'} 
                                {' → '} 
                                {leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}
                              </p>
                              <p className="text-sm text-purple-600 mt-1">
                                Remarks: {leave.remarks || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {leave.status}
                              </span>
                              <p className="text-xs text-purple-600 mt-2">
                                By: {leave.approvedBy || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No leave records</p>
                  )}
                </div>
              )}

              {/* Contacts Tab */}
              {activeTab === 'contacts' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-police-blue mb-4">📞 Emergency Contact & Next of Kin</h4>
                  
                  {/* Emergency Contact */}
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <h5 className="text-sm font-semibold text-red-800 mb-3">🚨 Emergency Contact</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-semibold">{officer.emergencyContact?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Relationship</p>
                        <p className="font-semibold">{officer.emergencyContact?.relationship || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Contact Number</p>
                        <p className="font-semibold">{officer.emergencyContact?.contactNumber || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-semibold">{officer.emergencyContact?.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Next of Kin */}
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <h5 className="text-sm font-semibold text-green-800 mb-3">👨‍👩‍👧 Next of Kin</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-semibold">{officer.nextOfKin?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Relationship</p>
                        <p className="font-semibold">{officer.nextOfKin?.relationship || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Contact Number</p>
                        <p className="font-semibold">{officer.nextOfKin?.contactNumber || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-semibold">{officer.nextOfKin?.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap">
            {['hr', 'command', 'admin'].includes(user.role) && (
              <>
                <button
                  onClick={() => navigate(`/dashboard/personnel/${id}/edit`)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                >
                  ✏️ Edit Officer
                </button>
                <button
                  onClick={() => navigate(`/dashboard/personnel/${id}/transfer`)}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
                >
                  🔄 Transfer Officer
                </button>
              </>
            )}
            <button
              onClick={() => navigate('/dashboard/personnel')}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
            >
              ← Back to Personnel
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ViewOfficer;