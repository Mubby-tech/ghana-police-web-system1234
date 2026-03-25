import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function EditInmate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [inmate, setInmate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      setUser(JSON.parse(userData));
      // Check role authorization (CID, Command, Admin only)
      if (!['cid', 'command', 'admin'].includes(JSON.parse(userData).role)) {
        navigate('/dashboard/inmates');
      }
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
        // Initialize form data
        setFormData({
          firstName: data.data.inmate.firstName,
          lastName: data.data.inmate.lastName,
          otherNames: data.data.inmate.otherNames || '',
          phone: data.data.inmate.phone || '',
          email: data.data.inmate.email || '',
          caseNumber: data.data.inmate.caseNumber,
          charges: data.data.inmate.charges || [],
          courtName: data.data.inmate.courtName,
          courtLocation: data.data.inmate.courtLocation,
          nextCourtDate: data.data.inmate.nextCourtDate ? 
            new Date(data.data.inmate.nextCourtDate).toISOString().split('T')[0] : '',
          presidingJudge: data.data.inmate.presidingJudge || '',
          bailStatus: data.data.inmate.bailStatus,
          bailAmount: data.data.inmate.bailAmount || 0,
          bailConditions: data.data.inmate.bailConditions || '',
          bailDate: data.data.inmate.bailDate ? 
            new Date(data.data.inmate.bailDate).toISOString().split('T')[0] : '',
          cellNumber: data.data.inmate.cellNumber || '',
          custodyStatus: data.data.inmate.custodyStatus,
          bloodGroup: data.data.inmate.medicalInfo?.bloodGroup || '',
          allergies: data.data.inmate.medicalInfo?.allergies || '',
          chronicConditions: data.data.inmate.medicalInfo?.chronicConditions || '',
          medications: data.data.inmate.medicalInfo?.medications || '',
          nextOfKinName: data.data.inmate.nextOfKin?.name || '',
          nextOfKinRelationship: data.data.inmate.nextOfKin?.relationship || '',
          nextOfKinPhone: data.data.inmate.nextOfKin?.phone || '',
          nextOfKinAddress: data.data.inmate.nextOfKin?.address || ''
        });
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

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    otherNames: '',
    phone: '',
    email: '',
    caseNumber: '',
    charges: [],
    courtName: '',
    courtLocation: '',
    nextCourtDate: '',
    presidingJudge: '',
    bailStatus: '',
    bailAmount: 0,
    bailConditions: '',
    bailDate: '',
    cellNumber: '',
    custodyStatus: '',
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    medications: '',
    nextOfKinName: '',
    nextOfKinRelationship: '',
    nextOfKinPhone: '',
    nextOfKinAddress: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        otherNames: formData.otherNames,
        phone: formData.phone,
        email: formData.email,
        caseNumber: formData.caseNumber,
        charges: formData.charges,
        courtName: formData.courtName,
        courtLocation: formData.courtLocation,
        nextCourtDate: formData.nextCourtDate,
        presidingJudge: formData.presidingJudge,
        bailStatus: formData.bailStatus,
        bailAmount: parseFloat(formData.bailAmount) || 0,
        bailConditions: formData.bailConditions,
        bailDate: formData.bailDate,
        cellNumber: formData.cellNumber,
        custodyStatus: formData.custodyStatus,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies,
        chronicConditions: formData.chronicConditions,
        medications: formData.medications,
        nextOfKin: {
          name: formData.nextOfKinName,
          relationship: formData.nextOfKinRelationship,
          phone: formData.nextOfKinPhone,
          address: formData.nextOfKinAddress
        }
      };

      const response = await fetch(`${config.API_BASE_URL}/api/inmates/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Inmate information updated successfully!');
        setTimeout(() => {
          navigate(`/dashboard/inmates/${id}`);
        }, 2000);
      } else {
        setError(data.message || 'Failed to update inmate');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Update inmate error:', err);
    } finally {
      setSaving(false);
    }
  };

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

  if (!user || !inmate) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-police-blue">✏️ Edit Inmate Information</h2>
            <p className="text-gray-600 mt-1">Update inmate records (Vision Doc Section 4.3)</p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Case Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">📋 Case Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Number *</label>
                  <input type="text" name="caseNumber" value={formData.caseNumber} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custody Status *</label>
                  <select name="custodyStatus" value={formData.custodyStatus} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue">
                    <option value="Remand">Remand</option>
                    <option value="Awaiting Trial">Awaiting Trial</option>
                    <option value="Convicted">Convicted</option>
                    <option value="Released">Released</option>
                    <option value="Transferred">Transferred</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Court Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">⚖️ Court Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Court Name</label>
                  <input type="text" name="courtName" value={formData.courtName} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Court Location</label>
                  <input type="text" name="courtLocation" value={formData.courtLocation} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Court Date</label>
                  <input type="date" name="nextCourtDate" value={formData.nextCourtDate} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Presiding Judge</label>
                  <input type="text" name="presidingJudge" value={formData.presidingJudge} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
              </div>
            </div>

            {/* Bail Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">💰 Bail Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bail Status</label>
                  <select name="bailStatus" value={formData.bailStatus} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue">
                    <option value="Not Applicable">Not Applicable</option>
                    <option value="Granted">Granted</option>
                    <option value="Pending">Pending</option>
                    <option value="Denied">Denied</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bail Amount (GHS)</label>
                  <input type="number" name="bailAmount" value={formData.bailAmount} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bail Date</label>
                  <input type="date" name="bailDate" value={formData.bailDate} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bail Conditions</label>
                  <textarea name="bailConditions" value={formData.bailConditions} onChange={handleChange} rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">🏥 Medical Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue">
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
                  <input type="text" name="allergies" value={formData.allergies} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Conditions</label>
                  <input type="text" name="chronicConditions" value={formData.chronicConditions} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medications</label>
                  <input type="text" name="medications" value={formData.medications} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
              </div>
            </div>

            {/* Next of Kin */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-police-blue mb-4 border-b pb-2">👨‍‍ Next of Kin</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" name="nextOfKinName" value={formData.nextOfKinName} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <input type="text" name="nextOfKinRelationship" value={formData.nextOfKinRelationship} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" name="nextOfKinPhone" value={formData.nextOfKinPhone} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea name="nextOfKinAddress" value={formData.nextOfKinAddress} onChange={handleChange} rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue" />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={saving}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400">
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
              <button type="button" onClick={() => navigate(`/dashboard/inmates/${id}`)}
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

export default EditInmate;