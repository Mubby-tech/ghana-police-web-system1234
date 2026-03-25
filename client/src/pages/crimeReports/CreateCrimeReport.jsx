import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

function CreateCrimeReport() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  // Form state (Vision Doc Section 4.1 - Centralized Digital Database)
  const [formData, setFormData] = useState({
    // Case Information
    title: '',
    description: '',
    crimeType: '',
    severity: 'Moderate',
    category: 'Misdemeanor',
    
    // Incident Details
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    region: '',
    district: '',
    station: '',
    
    // Victims
    victims: [{
      name: '',
      age: '',
      gender: '',
      contact: '',
      address: '',
      injuryStatus: 'None'
    }],
    
    // Suspects
    suspects: [{
      name: '',
      status: 'Unknown'
    }]
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

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle victim input change
  const handleVictimChange = (index, field, value) => {
    const updatedVictims = [...formData.victims];
    updatedVictims[index][field] = value;
    setFormData(prev => ({
      ...prev,
      victims: updatedVictims
    }));
  };

  // Handle suspect input change
  const handleSuspectChange = (index, field, value) => {
    const updatedSuspects = [...formData.suspects];
    updatedSuspects[index][field] = value;
    setFormData(prev => ({
      ...prev,
      suspects: updatedSuspects
    }));
  };

  // Add new victim
  const addVictim = () => {
    setFormData(prev => ({
      ...prev,
      victims: [...prev.victims, {
        name: '',
        age: '',
        gender: '',
        contact: '',
        address: '',
        injuryStatus: 'None'
      }]
    }));
  };

  // Remove victim
  const removeVictim = (index) => {
    if (formData.victims.length > 1) {
      const updatedVictims = formData.victims.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        victims: updatedVictims
      }));
    }
  };

  // Add new suspect
  const addSuspect = () => {
    setFormData(prev => ({
      ...prev,
      suspects: [...prev.suspects, { name: '', status: 'Unknown' }]
    }));
  };

  // Remove suspect
  const removeSuspect = (index) => {
    if (formData.suspects.length > 1) {
      const updatedSuspects = formData.suspects.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        suspects: updatedSuspects
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('${`${config.API_BASE_URL}/api/crime-reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ Crime report filed successfully! Report Number: ${data.data.reportNumber}`);
        setTimeout(() => {
          navigate('/dashboard/reports');
        }, 2000);
      } else {
        setError(data.message || 'Failed to file crime report');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Create report error:', err);
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

        {/* Create Crime Report Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-police-blue">
              📝 File New Crime Report
            </h2>
            <p className="text-gray-600 mt-1">
              Vision Doc Section 4.1 - Centralized Digital Database
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
            
            {/* Section 1: Crime Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                📋 Crime Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Armed Robbery at Accra Mall"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Case Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    placeholder="Provide detailed description of the incident..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Crime Type *
                  </label>
                  <select
                    name="crimeType"
                    value={formData.crimeType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="">Select Crime Type</option>
                    {crimeTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity Level *
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="Minor">Minor</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Serious">Serious</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="Felony">Felony</option>
                    <option value="Misdemeanor">Misdemeanor</option>
                    <option value="Infraction">Infraction</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Incident Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                📍 Incident Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Incident Date *
                  </label>
                  <input
                    type="date"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Incident Time *
                  </label>
                  <input
                    type="time"
                    name="incidentTime"
                    value={formData.incidentTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
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
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    placeholder="e.g., La Nkwantanang Madina"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Incident Location *
                  </label>
                  <input
                    type="text"
                    name="incidentLocation"
                    value={formData.incidentLocation}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Accra Mall, Spintex Road"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reporting Station *
                  </label>
                  <select
                    name="station"
                    value={formData.station}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="">Select Station</option>
                    {stations.map(station => (
                      <option key={station} value={station}>{station}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Victims Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                👥 Victims Information
              </h3>
              {formData.victims.map((victim, index) => (
                <div key={index} className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded">
                  <div className="flex-1 min-w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Victim Name {index + 1}
                    </label>
                    <input
                      type="text"
                      value={victim.name}
                      onChange={(e) => handleVictimChange(index, 'name', e.target.value)}
                      placeholder="e.g., Kwame Mensah"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={victim.age}
                      onChange={(e) => handleVictimChange(index, 'age', e.target.value)}
                      placeholder="35"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={victim.gender}
                      onChange={(e) => handleVictimChange(index, 'gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact
                    </label>
                    <input
                      type="tel"
                      value={victim.contact}
                      onChange={(e) => handleVictimChange(index, 'contact', e.target.value)}
                      placeholder="0555123456"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    />
                  </div>
                  <div className="w-40">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Injury Status
                    </label>
                    <select
                      value={victim.injuryStatus}
                      onChange={(e) => handleVictimChange(index, 'injuryStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    >
                      <option value="None">None</option>
                      <option value="Minor">Minor</option>
                      <option value="Serious">Serious</option>
                      <option value="Fatal">Fatal</option>
                    </select>
                  </div>
                  {formData.victims.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVictim(index)}
                      className="mt-6 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addVictim}
                className="mt-2 text-police-blue hover:underline text-sm"
              >
                + Add Another Victim
              </button>
            </div>

            {/* Section 4: Suspects Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                👤 Suspects Information
              </h3>
              {formData.suspects.map((suspect, index) => (
                <div key={index} className="flex gap-4 mb-4 p-4 bg-gray-50 rounded">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Suspect Name {index + 1}
                    </label>
                    <input
                      type="text"
                      value={suspect.name}
                      onChange={(e) => handleSuspectChange(index, 'name', e.target.value)}
                      placeholder="e.g., Unknown Male 1 or John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={suspect.status}
                      onChange={(e) => handleSuspectChange(index, 'status', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    >
                      <option value="Unknown">Unknown</option>
                      <option value="Identified">Identified</option>
                      <option value="At Large">At Large</option>
                      <option value="Arrested">Arrested</option>
                      <option value="Released">Released</option>
                    </select>
                  </div>
                  {formData.suspects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSuspect(index)}
                      className="mt-6 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSuspect}
                className="mt-2 text-police-blue hover:underline text-sm"
              >
                + Add Another Suspect
              </button>
            </div>

            {/* Section 5: Vision Doc Alignment Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                📋 Vision Document Alignment (Section 4.1)
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ Centralized Digital Database</li>
                <li>✅ Crime reports stored electronically</li>
                <li>✅ Auto-generated report number (CR-YYYYMMDD-XXX)</li>
                <li>✅ Activity logging for accountability (Section 5.2)</li>
                <li>✅ Role-based access control (Section 4.2)</li>
                <li>✅ Reduces paper filing (90% paperless goal)</li>
                <li>✅ Quick retrieval and search capability</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-police-blue text-white px-8 py-3 rounded-lg hover:bg-police-star transition disabled:bg-gray-400"
              >
                {loading ? 'Filing Report...' : '📝 File Crime Report'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/reports')}
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

export default CreateCrimeReport;