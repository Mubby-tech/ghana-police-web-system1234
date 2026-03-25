import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function TransferOfficer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Check role authorization (HR/Command/Admin only) - Vision Doc Section 4.2
      if (!['hr', 'command', 'admin'].includes(parsedUser.role)) {
        navigate('/dashboard/personnel');
      }
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
        // Pre-populate form with current station/region
        setFormData({
          fromStation: data.data.station || '',
          fromRegion: data.data.region || '',
          toStation: '',
          toRegion: '',
          reason: '',
          approvedBy: user.policeId || ''
        });
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

  // Form state (Vision Doc Section 4.1 - Personnel Transfer Records)
  const [formData, setFormData] = useState({
    fromStation: '',
    fromRegion: '',
    toStation: '',
    toRegion: '',
    reason: '',
    approvedBy: ''
  });

  // Ghana Regions (All 16 Regions)
  const regions = [
    'Greater Accra', 'Ashanti', 'Central', 'Western', 'Eastern',
    'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono',
    'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti'
  ];

  // Common Police Stations in Ghana
  const stations = [
    'Police Headquarters',
    'CID Headquarters',
    'Accra Central Police Station',
    'Accra North Police Station',
    'Accra South Police Station',
    'Tema Police Station',
    'Kumasi Central Police Station',
    'Kumasi North Police Station',
    'Kumasi South Police Station',
    'Cape Coast Police Station',
    'Sekondi-Takoradi Police Station',
    'Koforidua Police Station',
    'Ho Police Station',
    'Tamale Police Station',
    'Bolgatanga Police Station',
    'Wa Police Station',
    'Sunyani Police Station',
    'Techiman Police Station',
    'Goaso Police Station',
    'Damongo Police Station',
    'Nalerigu Police Station',
    'Dambai Police Station'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    setSuccess('');

    // Validate transfer
    if (formData.toStation === formData.fromStation && formData.toRegion === formData.fromRegion) {
      setError('❌ Transfer destination must be different from current station');
      setProcessing(false);
      return;
    }

    // Prepare data for API
    const transferData = {
      toStation: formData.toStation,
      toRegion: formData.toRegion,
      reason: formData.reason,
      approvedBy: formData.approvedBy
    };

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${config.API_BASE_URL}/api/personnel/${id}/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transferData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ Officer transferred successfully from ${formData.fromStation} to ${formData.toStation}!`);
        setTimeout(() => {
          navigate(`/dashboard/personnel/${id}`);
        }, 2000);
      } else {
        setError(data.message || 'Failed to transfer officer');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Transfer officer error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading Officer Details...</p>
        </div>
      </div>
    );
  }

  if (!user || !officer) {
    return null;
  }

  if (error && !officer) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-4">❌ {error}</p>
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />

        {/* Transfer Officer Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => navigate(`/dashboard/personnel/${id}`)}
                className="text-gray-600 hover:text-police-blue"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-police-blue">
                🔄 Transfer Officer
              </h2>
            </div>
            <p className="text-gray-600 mt-1">
              Vision Doc Section 4.1 - Personnel Service History (Transfer Records)
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Transferring: <strong>{officer.firstName} {officer.lastName}</strong> ({officer.policeId})
            </p>
          </div>

          {/* Officer Current Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-police-blue mb-4">Officer Current Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Police ID</p>
                <p className="font-semibold">{officer.policeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{officer.firstName} {officer.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rank</p>
                <p className="font-semibold">{officer.rank}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Station</p>
                <p className="font-semibold text-police-blue">{officer.station}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Region</p>
                <p className="font-semibold text-police-blue">{officer.region}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-semibold">{officer.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Deployment Status</p>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  officer.deploymentStatus === 'Active' ? 'bg-green-100 text-green-800' :
                  officer.deploymentStatus === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {officer.deploymentStatus}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Previous Transfers</p>
                <p className="font-semibold">{officer.transfers?.length || 0}</p>
              </div>
            </div>
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

          {/* Transfer Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Transfer Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                🔄 Transfer Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* From (Current) */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">📍 Current Station (From)</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Station</label>
                      <input
                        type="text"
                        name="fromStation"
                        value={formData.fromStation}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Region</label>
                      <input
                        type="text"
                        name="fromRegion"
                        value={formData.fromRegion}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* To (New) */}
                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-700 mb-3">📍 New Station (To)</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Station *
                      </label>
                      <select
                        name="toStation"
                        value={formData.toStation}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                      >
                        <option value="">Select New Station</option>
                        {stations.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Region *
                      </label>
                      <select
                        name="toRegion"
                        value={formData.toRegion}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                      >
                        <option value="">Select New Region</option>
                        {regions.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Transfer Reason & Approval */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                📋 Transfer Reason & Approval
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Transfer *
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    rows="4"
                    placeholder="e.g., Operational Requirements, Staff Rotation, Promotion Posting, Request by Officer, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approved By *
                  </label>
                  <input
                    type="text"
                    name="approvedBy"
                    value={formData.approvedBy}
                    onChange={handleChange}
                    required
                    placeholder="Police ID of approving officer"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current user: {user.policeId}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transfer Date
                  </label>
                  <input
                    type="date"
                    value={new Date().toISOString().split('T')[0]}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-set to today
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Transfer History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                📜 Previous Transfer History
              </h3>
              {officer.transfers && officer.transfers.length > 0 ? (
                <div className="space-y-3">
                  {officer.transfers.map((transfer, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {transfer.fromStation} → {transfer.toStation}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {transfer.fromRegion} → {transfer.toRegion}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Reason: {transfer.reason || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-800">
                            {transfer.date ? new Date(transfer.date).toLocaleDateString() : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            By: {transfer.approvedBy || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No previous transfer records</p>
              )}
            </div>

            {/* Section 4: Vision Doc Alignment Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                📋 Vision Document Alignment (Section 4.1)
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ Personnel records stored electronically</li>
                <li>✅ Service history tracking (transfer records)</li>
                <li>✅ All 16 Ghana regions supported</li>
                <li>✅ Inter-regional communication digital</li>
                <li>✅ Activity logging for accountability (Section 5.2)</li>
                <li>✅ Role-based access control (Section 4.2 - HR/Command/Admin)</li>
                <li>✅ 90% paperless goal supported (replaces paper transfer forms)</li>
                <li>✅ Complete audit trail preserved</li>
              </ul>
            </div>

            {/* Section 5: Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                ⚠️ Important Notice
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• This transfer will be permanently recorded in the officer's service history</li>
                <li>• The officer's station and region will be updated immediately</li>
                <li>• All previous transfer records will be preserved for audit purposes</li>
                <li>• Ensure proper handover procedures are followed before transfer</li>
                <li>• Notify relevant departments (HR, Finance, Logistics) of the transfer</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={processing}
                className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400"
              >
                {processing ? 'Processing Transfer...' : '🔄 Confirm Transfer'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/dashboard/personnel/${id}`)}
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

export default TransferOfficer;