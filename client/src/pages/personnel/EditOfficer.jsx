import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function EditOfficer() {
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
        // Populate form with existing data
        setFormData({
          contactNumber: data.data.contactNumber || '',
          email: data.data.email || '',
          residentialAddress: data.data.residentialAddress || '',
          station: data.data.station || '',
          region: data.data.region || '',
          department: data.data.department || '',
          emergencyContactName: data.data.emergencyContact?.name || '',
          emergencyContactRelationship: data.data.emergencyContact?.relationship || '',
          emergencyContactNumber: data.data.emergencyContact?.contactNumber || '',
          emergencyContactAddress: data.data.emergencyContact?.address || '',
          nextOfKinName: data.data.nextOfKin?.name || '',
          nextOfKinRelationship: data.data.nextOfKin?.relationship || '',
          nextOfKinNumber: data.data.nextOfKin?.contactNumber || '',
          nextOfKinAddress: data.data.nextOfKin?.address || ''
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

  // Form state (Vision Doc Section 4.1 - Personnel Records)
  const [formData, setFormData] = useState({
    contactNumber: '',
    email: '',
    residentialAddress: '',
    station: '',
    region: '',
    department: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactNumber: '',
    emergencyContactAddress: '',
    nextOfKinName: '',
    nextOfKinRelationship: '',
    nextOfKinNumber: '',
    nextOfKinAddress: ''
  });

  // Ghana Regions (All 16 Regions)
  const regions = [
    'Greater Accra', 'Ashanti', 'Central', 'Western', 'Eastern',
    'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono',
    'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti'
  ];

  // Police Departments
  const departments = [
    'Operations', 'CID', 'Traffic', 'Administration', 'Finance',
    'HR', 'Logistics', 'Training', 'Forensic', 'Anti-Narcotics',
    'Cyber Crime', 'Public Affairs', 'Intelligence', 'Other'
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

    // Prepare data for API (only updatable fields)
    const updateData = {
      contactNumber: formData.contactNumber,
      email: formData.email,
      residentialAddress: formData.residentialAddress,
      station: formData.station,
      region: formData.region,
      department: formData.department,
      emergencyContact: {
        name: formData.emergencyContactName,
        relationship: formData.emergencyContactRelationship,
        contactNumber: formData.emergencyContactNumber,
        address: formData.emergencyContactAddress
      },
      nextOfKin: {
        name: formData.nextOfKinName,
        relationship: formData.nextOfKinRelationship,
        contactNumber: formData.nextOfKinNumber,
        address: formData.nextOfKinAddress
      }
    };

    try {
      const token = localStorage.getItem('token');
      
     const response = await fetch(`${config.API_BASE_URL}/api/personnel/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Officer record updated successfully!');
        setTimeout(() => {
          navigate(`/dashboard/personnel/${id}`);
        }, 2000);
      } else {
        setError(data.message || 'Failed to update officer record');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Update officer error:', err);
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

        {/* Edit Officer Content */}
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
                ✏️ Edit Officer Information
              </h2>
            </div>
            <p className="text-gray-600 mt-1">
              Vision Doc Section 4.1 - Personnel Records Management System
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Editing: <strong>{officer.firstName} {officer.lastName}</strong> ({officer.policeId})
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
            
            {/* Section 1: Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                📞 Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    placeholder="0555123456"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="officer@gps.gov.gh"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Residential Address *
                  </label>
                  <input
                    type="text"
                    name="residentialAddress"
                    value={formData.residentialAddress}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Service Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                🎖️ Service Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region *
                  </label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="">Select Region</option>
                    {regions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Station *
                  </label>
                  <input
                    type="text"
                    name="station"
                    value={formData.station}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Accra Central Police Station"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Note:</strong> To change an officer's rank, use the Promotion feature. To change station/region permanently, use the Transfer feature.
                </p>
              </div>
            </div>

            {/* Section 3: Emergency Contact */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                🚨 Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship *
                  </label>
                  <input
                    type="text"
                    name="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Wife, Husband, Brother"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactNumber"
                    value={formData.emergencyContactNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="emergencyContactAddress"
                    value={formData.emergencyContactAddress}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Next of Kin */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                👨‍👩‍👧 Next of Kin
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="nextOfKinName"
                    value={formData.nextOfKinName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship *
                  </label>
                  <input
                    type="text"
                    name="nextOfKinRelationship"
                    value={formData.nextOfKinRelationship}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Father, Mother, Spouse"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="nextOfKinNumber"
                    value={formData.nextOfKinNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="nextOfKinAddress"
                    value={formData.nextOfKinAddress}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Read-Only Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                🔒 Read-Only Information
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                The following fields cannot be edited directly. Use specific features for changes:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Police ID</p>
                  <p className="font-semibold text-gray-800">{officer.policeId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Number</p>
                  <p className="font-semibold text-gray-800">{officer.serviceNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-semibold text-gray-800">
                    {officer.firstName} {officer.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rank</p>
                  <p className="font-semibold text-gray-800">{officer.rank}</p>
                  <p className="text-xs text-blue-600 mt-1">Use Promotion feature to change</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-semibold text-gray-800">
                    {officer.dateOfBirth ? new Date(officer.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Enlistment</p>
                  <p className="font-semibold text-gray-800">
                    {officer.dateOfEnlistment ? new Date(officer.dateOfEnlistment).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 6: Vision Doc Alignment Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                📋 Vision Document Alignment (Section 4.1)
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ Personnel records stored electronically</li>
                <li>✅ Centralized Digital Database</li>
                <li>✅ All 16 Ghana regions supported</li>
                <li>✅ Service history tracking (promotions, transfers, leave)</li>
                <li>✅ Activity logging for accountability (Section 5.2)</li>
                <li>✅ Role-based access control (Section 4.2 - HR/Command/Admin)</li>
                <li>✅ 90% paperless goal supported</li>
                <li>✅ Emergency contact & next of kin records</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={processing}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {processing ? 'Updating...' : '💾 Save Changes'}
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

export default EditOfficer;