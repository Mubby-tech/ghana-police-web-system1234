import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function EditCrimeReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Check role authorization (CID, Command, Admin only) - Vision Doc Section 4.2
      if (!['cid', 'command', 'admin'].includes(parsedUser.role)) {
        navigate('/dashboard/reports');
      }
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
        setFormData({
          title: data.data.title,
          description: data.data.description,
          crimeType: data.data.crimeType,
          severity: data.data.severity,
          category: data.data.category,
          status: data.data.status,
          assignedTo: data.data.assignedTo?._id || '',
          incidentDate: data.data.incidentDate?.split('T')[0] || '',
          incidentTime: data.data.incidentTime || '',
          incidentLocation: data.data.incidentLocation,
          region: data.data.region,
          district: data.data.district,
          station: data.data.station
        });
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    crimeType: '',
    severity: 'Moderate',
    category: 'Misdemeanor',
    status: 'Filed',
    assignedTo: '',
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    region: '',
    district: '',
    station: ''
  });

  // Ghana Regions (Vision Doc Section 4.1)
  const regions = [
    'Greater Accra', 'Ashanti', 'Central', 'Western', 'Eastern',
    'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono',
    'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti'
  ];

  // Crime Categories (Vision Doc Section 4.1)
  const crimeTypes = [
    'Theft', 'Assault', 'Murder', 'Fraud', 'Cyber Crime',
    'Traffic Offense', 'Narcotics', 'Robbery', 'Burglary',
    'Kidnapping', 'Domestic Violence', 'Economic Crime',
    'Weapons Offense', 'Public Order', 'Other'
  ];

  // Ghana Police Stations
  const stations = [
    'Accra Central Police Station',
    'Accra North Police Station',
    'Kumasi Central Police Station',
    'Kumasi North Police Station',
    'Cape Coast Police Station',
    'Takoradi Police Station',
    'Tamale Police Station',
    'Ho Police Station',
    'Sunyani Police Station',
    'Koforidua Police Station',
    'Wa Police Station',
    'Bolgatanga Police Station',
    'CID Headquarters'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        title: formData.title,
        description: formData.description,
        crimeType: formData.crimeType,
        severity: formData.severity,
        category: formData.category,
        status: formData.status,
        assignedTo: formData.assignedTo || null,
        incidentDate: formData.incidentDate,
        incidentTime: formData.incidentTime,
        incidentLocation: formData.incidentLocation,
        region: formData.region,
        district: formData.district,
        station: formData.station
      };

      const response = await fetch(`${config.API_BASE_URL}/api/crime-reports/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Crime report updated successfully!');
        setTimeout(() => {
          navigate(`/dashboard/reports/${id}`);
        }, 2000);
      } else {
        setError(data.message || 'Failed to update report');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Update report error:', err);
    } finally {
      setSaving(false);
    }
  };

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

  if (!user || !report) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-police-blue">✏️ Edit Crime Report</h2>
            <p className="text-gray-600 mt-1">Vision Doc Section 4.1 - Centralized Digital Database</p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Crime Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">📋 Crime Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Number</label>
                  <input type="text" value={report.reportNumber} disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crime Type *</label>
                  <select name="crimeType" value={formData.crimeType} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue">
                    <option value="">Select Crime Type</option>
                    {crimeTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
                  <select name="severity" value={formData.severity} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue">
                    <option value="Minor">Minor</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Serious">Serious</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue">
                    <option value="Felony">Felony</option>
                    <option value="Misdemeanor">Misdemeanor</option>
                    <option value="Infraction">Infraction</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Investigation Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">🔍 Investigation Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Status *</label>
                  <select name="status" value={formData.status} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue">
                    <option value="Filed">Filed</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Referred to CID">Referred to CID</option>
                    <option value="Pending Court">Pending Court</option>
                    <option value="Closed">Closed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input type="text" name="assignedTo" value={formData.assignedTo} onChange={handleChange}
                    placeholder="User ID (for CID assignment)"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                  <p className="text-xs text-gray-500 mt-1">Leave blank if not assigned</p>
                </div>
              </div>
            </div>

            {/* Section 3: Incident Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">📍 Incident Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date *</label>
                  <input type="date" name="incidentDate" value={formData.incidentDate} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Incident Time *</label>
                  <input type="time" name="incidentTime" value={formData.incidentTime} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
                  <select name="region" value={formData.region} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue">
                    <option value="">Select Region</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                  <input type="text" name="district" value={formData.district} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Incident Location *</label>
                  <input type="text" name="incidentLocation" value={formData.incidentLocation} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Station *</label>
                  <select name="station" value={formData.station} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue">
                    <option value="">Select Station</option>
                    {stations.map(station => (
                      <option key={station} value={station}>{station}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Linked CID Case */}
            {report.linkedCase && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">🔗 Linked CID Case</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">CID Case Number</p>
                    <p className="font-semibold text-police-blue">{report.linkedCase.caseNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Case Title</p>
                    <p className="font-semibold">{report.linkedCase.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Case Status</p>
                    <p className="font-semibold">{report.linkedCase.status}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/cid/${report.linkedCase._id}`)}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  🔍 View CID Case
                </button>
              </div>
            )}

            {/* Section 5: Vision Doc Alignment Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                📋 Vision Document Alignment (Section 4.1 & 4.2)
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ Centralized Digital Database Update</li>
                <li>✅ Electronic Crime Report Management</li>
                <li>✅ Activity Logging for Accountability (Section 5.2)</li>
                <li>✅ Role-Based Access Control (Section 4.2 - CID/Command/Admin)</li>
                <li>✅ CID Integration (Section 4.4)</li>
                <li>✅ Audit Trail Preserved</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={saving}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400">
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
              <button type="button" onClick={() => navigate(`/dashboard/reports/${id}`)}
                className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 transition">
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default EditCrimeReport;