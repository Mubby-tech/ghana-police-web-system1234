import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function UploadEvidence() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/');
    }
  }, [navigate]);

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

  const [formData, setFormData] = useState({
    type: 'Photo',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    setSuccess('');

    if (!selectedFile) {
      setError('Please select a file to upload');
      setProcessing(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('description', formData.description);

      const response = await fetch(`${config.API_BASE_URL}/api/cases/${id}/evidence`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - browser sets it automatically for FormData
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ Evidence uploaded successfully! File: ${data.data.evidence[data.data.evidence.length - 1].fileName}`);
        setTimeout(() => {
          navigate(`/dashboard/cid/${id}`);
        }, 2000);
      } else {
        setError(data.message || 'Failed to upload evidence');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Upload evidence error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !caseData) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-police-blue">📎 Upload Evidence</h2>
            <p className="text-gray-600 mt-1">Vision Doc Section 4.4 - Electronic CID Documentation</p>
          </div>

          {/* Case Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-police-blue mb-4">Case Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Case Number</p>
                <p className="font-semibold">{caseData.caseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Case Title</p>
                <p className="font-semibold">{caseData.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold">{caseData.status}</p>
              </div>
            </div>
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

          {/* Upload Form */}
          <div className="bg-white rounded-lg shadow p-6 max-w-3xl">
            <h3 className="text-lg font-semibold text-police-blue mb-4">Evidence Details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select File *
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  required
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported: Images (JPEG, PNG), Videos (MP4, AVI), Documents (PDF, DOC), Audio (MP3)
                </p>
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✅ Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evidence Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                >
                  <option value="Photo">Photo</option>
                  <option value="Video">Video</option>
                  <option value="Document">Document</option>
                  <option value="Audio">Audio Recording</option>
                  <option value="Physical">Physical Evidence (Scan)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="e.g., CCTV footage from bank entrance showing suspect"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                />
              </div>

              {/* Chain of Custody Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  ⛓️ Chain of Custody (Vision Doc Section 4.4)
                </h4>
                <p className="text-sm text-blue-700">
                  This upload will be automatically logged in the evidence chain of custody, including:
                </p>
                <ul className="text-sm text-blue-700 space-y-1 mt-2">
                  <li>• Upload timestamp</li>
                  <li>• Uploading officer ({user.policeId})</li>
                  <li>• File details and description</li>
                  <li>• Full audit trail for court admissibility</li>
                </ul>
              </div>

              {/* Vision Doc Alignment Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  📋 Vision Document Alignment (Section 4.4)
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✅ Upload evidence (photos, videos, documents)</li>
                  <li>✅ Secure file storage</li>
                  <li>✅ Chain of custody tracking</li>
                  <li>✅ Activity logging for accountability (Section 5.2)</li>
                  <li>✅ Reduces physical evidence storage</li>
                </ul>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
                >
                  {processing ? 'Uploading...' : '📎 Upload Evidence'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/cid/${id}`)}
                  className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UploadEvidence;