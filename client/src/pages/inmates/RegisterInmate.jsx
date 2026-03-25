import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';


function RegisterInmate() {
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

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    otherNames: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Ghanaian',
    hometown: '',
    region: '',
    phone: '',
    email: '',
    height: '',
    weight: '',
    complexion: '',
    distinguishingMarks: '',
    
    // Case Information
    caseNumber: '',
    charges: [{ charge: '', status: 'Pending' }],
    arrestDate: '',
    arrestLocation: '',
    
    // Court Information
    courtName: '',
    courtLocation: '',
    nextCourtDate: '',
    presidingJudge: '',
    
    // Bail Information
    bailStatus: 'Not Applicable',
    bailAmount: 0,
    bailConditions: '',
    bailDate: '',
    
    // Custody Information
    station: '',
    cellNumber: '',
    custodyStatus: 'Remand',
    
    // Medical Information
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    medications: '',
    
    // Next of Kin
    nextOfKinName: '',
    nextOfKinRelationship: '',
    nextOfKinPhone: '',
    nextOfKinAddress: ''
  });

  // Ghana Regions
  const regions = [
    'Greater Accra', 'Ashanti', 'Central', 'Western', 'Eastern',
    'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono',
    'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti'
  ];

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle charge input change
  const handleChargeChange = (index, field, value) => {
    const updatedCharges = [...formData.charges];
    updatedCharges[index][field] = value;
    setFormData(prev => ({
      ...prev,
      charges: updatedCharges
    }));
  };

  // Add new charge
  const addCharge = () => {
    setFormData(prev => ({
      ...prev,
      charges: [...prev.charges, { charge: '', status: 'Pending' }]
    }));
  };

  // Remove charge
  const removeCharge = (index) => {
    if (formData.charges.length > 1) {
      const updatedCharges = formData.charges.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        charges: updatedCharges
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
      
      // Prepare payload
      const payload = {
        // Personal Information
        firstName: formData.firstName,
        lastName: formData.lastName,
        otherNames: formData.otherNames,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        nationality: formData.nationality,
        hometown: formData.hometown,
        region: formData.region,
        phone: formData.phone,
        email: formData.email,
        height: formData.height,
        weight: formData.weight,
        complexion: formData.complexion,
        distinguishingMarks: formData.distinguishingMarks,
        
        // Case Information
        caseNumber: formData.caseNumber,
        charges: formData.charges,
        arrestDate: formData.arrestDate,
        arrestLocation: formData.arrestLocation,
        
        // Court Information
        courtName: formData.courtName,
        courtLocation: formData.courtLocation,
        nextCourtDate: formData.nextCourtDate,
        presidingJudge: formData.presidingJudge,
        
        // Bail Information
        bailStatus: formData.bailStatus,
        bailAmount: parseFloat(formData.bailAmount) || 0,
        bailConditions: formData.bailConditions,
        bailDate: formData.bailDate || null,
        
        // Custody Information
        station: formData.station,
        cellNumber: formData.cellNumber,
        custodyStatus: formData.custodyStatus,
        
        // Medical Information
        bloodGroup: formData.bloodGroup || null,
        allergies: formData.allergies || 'None',
        chronicConditions: formData.chronicConditions || 'None',
        medications: formData.medications || 'None',
        
        // Next of Kin
        nextOfKin: {
          name: formData.nextOfKinName,
          relationship: formData.nextOfKinRelationship,
          phone: formData.nextOfKinPhone,
          address: formData.nextOfKinAddress
        }
      };

      const response = await fetch('${`${config.API_BASE_URL}/api/inmates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Inmate registered successfully! Inmate ID: ' + data.data.inmate.inmateId);
        setTimeout(() => {
          navigate('/dashboard/inmates');
        }, 2000);
      } else {
        setError(data.message || 'Failed to register inmate');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Register inmate error:', err);
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

        {/* Register Inmate Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-police-blue">
              📝 Register New Inmate
            </h2>
            <p className="text-gray-600 mt-1">
              Enter complete inmate information for digital record management
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              ✅ {success}
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              ❌ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                👤 Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Names</label>
                  <input
                    type="text"
                    name="otherNames"
                    value={formData.otherNames}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality *</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hometown *</label>
                  <input
                    type="text"
                    name="hometown"
                    value={formData.hometown}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                  <input
                    type="text"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="e.g., 5'10&quot;"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g., 75kg"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complexion</label>
                  <select
                    name="complexion"
                    value={formData.complexion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="">Select Complexion</option>
                    <option value="Light">Light</option>
                    <option value="Medium">Medium</option>
                    <option value="Dark">Dark</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distinguishing Marks</label>
                  <input
                    type="text"
                    name="distinguishingMarks"
                    value={formData.distinguishingMarks}
                    onChange={handleChange}
                    placeholder="e.g., Scar on left eyebrow"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Case Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                📋 Case Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Number *</label>
                  <input
                    type="text"
                    name="caseNumber"
                    value={formData.caseNumber}
                    onChange={handleChange}
                    required
                    placeholder="e.g., CASE-2026-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrest Date *</label>
                  <input
                    type="date"
                    name="arrestDate"
                    value={formData.arrestDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrest Location *</label>
                  <input
                    type="text"
                    name="arrestLocation"
                    value={formData.arrestLocation}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
              </div>

              {/* Charges */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Charges *</label>
                {formData.charges.map((charge, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={charge.charge}
                      onChange={(e) => handleChargeChange(index, 'charge', e.target.value)}
                      placeholder="Enter charge"
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    />
                    <select
                      value={charge.status}
                      onChange={(e) => handleChargeChange(index, 'status', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Court">In Court</option>
                      <option value="Convicted">Convicted</option>
                      <option value="Acquitted">Acquitted</option>
                      <option value="Discharged">Discharged</option>
                    </select>
                    {formData.charges.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCharge(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCharge}
                  className="mt-2 text-police-blue hover:underline text-sm"
                >
                  + Add Another Charge
                </button>
              </div>
            </div>

            {/* Section 3: Court Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                ⚖️ Court Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Court Name *</label>
                  <input
                    type="text"
                    name="courtName"
                    value={formData.courtName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Court Location *</label>
                  <input
                    type="text"
                    name="courtLocation"
                    value={formData.courtLocation}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Court Date</label>
                  <input
                    type="date"
                    name="nextCourtDate"
                    value={formData.nextCourtDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Presiding Judge</label>
                  <input
                    type="text"
                    name="presidingJudge"
                    value={formData.presidingJudge}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Bail Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                💰 Bail Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bail Status *</label>
                  <select
                    name="bailStatus"
                    value={formData.bailStatus}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="Not Applicable">Not Applicable</option>
                    <option value="Granted">Granted</option>
                    <option value="Pending">Pending</option>
                    <option value="Denied">Denied</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bail Amount (GHS)</label>
                  <input
                    type="number"
                    name="bailAmount"
                    value={formData.bailAmount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bail Date</label>
                  <input
                    type="date"
                    name="bailDate"
                    value={formData.bailDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bail Conditions</label>
                  <textarea
                    name="bailConditions"
                    value={formData.bailConditions}
                    onChange={handleChange}
                    rows="2"
                    placeholder="e.g., Two sureties with valid ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Custody Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                🔒 Custody Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Station *</label>
                  <input
                    type="text"
                    name="station"
                    value={formData.station}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cell Number</label>
                  <input
                    type="text"
                    name="cellNumber"
                    value={formData.cellNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custody Status *</label>
                  <select
                    name="custodyStatus"
                    value={formData.custodyStatus}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="Remand">Remand</option>
                    <option value="Awaiting Trial">Awaiting Trial</option>
                    <option value="Convicted">Convicted</option>
                    <option value="Released">Released</option>
                    <option value="Transferred">Transferred</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 6: Medical Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                🏥 Medical Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <input
                    type="text"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="e.g., None"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Conditions</label>
                  <input
                    type="text"
                    name="chronicConditions"
                    value={formData.chronicConditions}
                    onChange={handleChange}
                    placeholder="e.g., None"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medications</label>
                  <input
                    type="text"
                    name="medications"
                    value={formData.medications}
                    onChange={handleChange}
                    placeholder="e.g., None"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
              </div>
            </div>

            {/* Section 7: Next of Kin */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">
                👨‍👩‍ Next of Kin
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                  <input
                    type="text"
                    name="nextOfKinRelationship"
                    value={formData.nextOfKinRelationship}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="nextOfKinPhone"
                    value={formData.nextOfKinPhone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="nextOfKinAddress"
                    value={formData.nextOfKinAddress}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-police-blue text-white px-8 py-3 rounded-lg hover:bg-police-star transition disabled:bg-gray-400"
              >
                {loading ? 'Registering...' : '📝 Register Inmate'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/inmates')}
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

export default RegisterInmate;