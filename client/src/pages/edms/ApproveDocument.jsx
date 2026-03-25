import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { config } from '../../config';

function ApproveDocument() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionType, setActionType] = useState('approve'); // 'approve' or 'sign'

  // Approval form state
  const [approvalData, setApprovalData] = useState({
    approvalStatus: 'Approved',
    approvalNotes: ''
  });

  // E-Signature form state
  const [signatureData, setSignatureData] = useState({
    signatureData: ''
  });

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Check role authorization (Command/Admin only) - Vision Doc Section 4.2
      if (!['command', 'admin'].includes(parsedUser.role)) {
        navigate('/dashboard/edms');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Fetch document details
  useEffect(() => {
    if (user && id) {
      fetchDocument();
    }
  }, [user, id]);

  const fetchDocument = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/edms/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setDocument(data.data);
      } else {
        setError(data.message || 'Failed to load document details');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch document error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalChange = (e) => {
    const { name, value } = e.target;
    setApprovalData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignatureChange = (e) => {
    const { name, value } = e.target;
    setSignatureData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Approval Submission
  const handleApprovalSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${config.API_BASE_URL}/api/edms/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(approvalData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ Document ${approvalData.approvalStatus.toLowerCase()} successfully!`);
        setTimeout(() => {
          navigate(`/dashboard/edms/${id}`);
        }, 2000);
      } else {
        setError(data.message || 'Failed to process approval');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Approval error:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Handle E-Signature Submission
  const handleSignatureSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      // Generate signature data with officer details
      const signatureText = `Electronically signed by ${user.name} (${user.policeId}) on ${new Date().toLocaleString()}. Authorized under the Ghana Police Service Digital Transformation Initiative.`;
      
      const response = await fetch(`${config.API_BASE_URL}/api/edms/${id}/sign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signatureData: signatureText
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Document signed electronically!');
        setTimeout(() => {
          navigate(`/dashboard/edms/${id}`);
        }, 2000);
      } else {
        setError(data.message || 'Failed to sign document');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Signature error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-police-blue mx-auto mb-4"></div>
          <p className="text-police-blue text-lg font-semibold">Loading Document Details...</p>
        </div>
      </div>
    );
  }

  if (!user || !document) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />

        {/* Approve/Sign Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-police-blue">
              {actionType === 'approve' ? '✅ Approve/Reject Document' : '✍️ E-Sign Document'}
            </h2>
            <p className="text-gray-600 mt-1">
              Vision Doc Section 4.5 - Electronic Document Management System
            </p>
          </div>

          {/* Document Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-police-blue mb-4">Document Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Document Number</p>
                <p className="font-semibold">{document.documentNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Document Title</p>
                <p className="font-semibold">{document.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Document Type</p>
                <p className="font-semibold">{document.documentType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sender</p>
                <p className="font-semibold">{document.sender?.policeId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <p className="font-semibold">{document.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Approval Status</p>
                <p className="font-semibold">{document.approvalStatus}</p>
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

          {/* Action Type Selector */}
          {actionType === 'approve' ? (
            /* Approval Form */
            <div className="bg-white rounded-lg shadow p-6 max-w-3xl">
              <h3 className="text-lg font-semibold text-police-blue mb-4">E-Approval Form</h3>
              <form onSubmit={handleApprovalSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approval Decision *
                  </label>
                  <select
                    name="approvalStatus"
                    value={approvalData.approvalStatus}
                    onChange={handleApprovalChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  >
                    <option value="Approved">✅ Approved</option>
                    <option value="Rejected">❌ Rejected</option>
                    <option value="Returned for Revision">🔄 Returned for Revision</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approval Notes
                  </label>
                  <textarea
                    name="approvalNotes"
                    value={approvalData.approvalNotes}
                    onChange={handleApprovalChange}
                    rows="4"
                    placeholder="Enter your approval decision notes (e.g., Approved for implementation. Budget code: GPS-2026-LOG-045)"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    These notes will be recorded in the document's activity log
                  </p>
                </div>

                {/* Approval Warning */}
                {approvalData.approvalStatus === 'Rejected' && (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-sm text-red-800">
                      ⚠️ <strong>Warning:</strong> Rejecting this document will end the workflow. The document cannot be approved after rejection.
                    </p>
                  </div>
                )}

                {/* Vision Doc Alignment Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    📋 Vision Document Alignment (Section 4.5)
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>✅ Electronic Approvals (E-Approvals)</li>
                    <li>✅ Automated Workflows (Sent → Delivered)</li>
                    <li>✅ Activity Logging for Accountability (Section 5.2)</li>
                    <li>✅ Role-Based Access Control (Section 4.2 - Command/Admin)</li>
                    <li>✅ 90% Paperless Goal (Replaces paper approval forms)</li>
                    <li>✅ Audit Trail Preserved</li>
                  </ul>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={processing}
                    className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400"
                  >
                    {processing ? 'Processing...' : '✅ Submit Approval'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/edms/${id}`)}
                    className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* E-Signature Form */
            <div className="bg-white rounded-lg shadow p-6 max-w-3xl">
              <h3 className="text-lg font-semibold text-police-blue mb-4">E-Signature Form</h3>
              <form onSubmit={handleSignatureSubmit} className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                  <h4 className="text-sm font-semibold text-green-800 mb-2">
                    ✍️ Electronic Signature Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Signing Officer</p>
                      <p className="font-semibold">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Police ID</p>
                      <p className="font-semibold">{user.policeId}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Rank</p>
                      <p className="font-semibold">{user.rank || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Station</p>
                      <p className="font-semibold">{user.station || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Signature Declaration *
                  </label>
                  <textarea
                    name="signatureData"
                    value={signatureData.signatureData}
                    onChange={handleSignatureChange}
                    rows="4"
                    placeholder="Enter your signature declaration (e.g., I hereby approve this document under my authority as [Rank])"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-police-blue"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This declaration will be permanently recorded with the document
                  </p>
                </div>

                {/* Signature Preview */}
                {signatureData.signatureData && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-4">
                    <p className="text-sm text-gray-600 mb-2">Signature Preview:</p>
                    <div className="text-sm text-gray-800 italic border-l-4 border-police-blue pl-4">
                      "{signatureData.signatureData}"
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      — {user.name} ({user.policeId}), {new Date().toLocaleString()}
                    </p>
                  </div>
                )}

                {/* E-Signature Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Important:</strong> Once signed, this document cannot be unsigned. The e-signature is legally binding under the Ghana Police Service Digital Transformation Initiative.
                  </p>
                </div>

                {/* Vision Doc Alignment Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    📋 Vision Document Alignment (Section 4.5)
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>✅ Electronic Signatures (E-Signatures)</li>
                    <li>✅ Legally Binding Digital Signatures</li>
                    <li>✅ Activity Logging for Accountability (Section 5.2)</li>
                    <li>✅ Role-Based Access Control (Section 4.2 - Command/Admin)</li>
                    <li>✅ 90% Paperless Goal (Replaces wet ink signatures)</li>
                    <li>✅ Audit Trail Preserved</li>
                  </ul>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={processing}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
                  >
                    {processing ? 'Signing...' : '✍️ Apply E-Signature'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/edms/${id}`)}
                    className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Action Type Toggle */}
          <div className="mt-8 bg-white rounded-lg shadow p-6 max-w-3xl">
            <h3 className="text-lg font-semibold text-police-blue mb-4">Available Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {document.approvalStatus === 'Pending' && (
                <button
                  onClick={() => setActionType('approve')}
                  className={`p-4 rounded-lg border-2 transition ${
                    actionType === 'approve'
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-gray-300 hover:border-orange-600'
                  }`}
                >
                  <div className="text-2xl mb-2">✅</div>
                  <h4 className="font-semibold text-gray-800">Approve/Reject</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Review and approve or reject this document
                  </p>
                  <p className="text-xs text-orange-600 mt-2">
                    Current Status: {document.approvalStatus}
                  </p>
                </button>
              )}
              {document.approvalStatus === 'Approved' && !document.isSigned && (
                <button
                  onClick={() => setActionType('sign')}
                  className={`p-4 rounded-lg border-2 transition ${
                    actionType === 'sign'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-600'
                  }`}
                >
                  <div className="text-2xl mb-2">✍️</div>
                  <h4 className="font-semibold text-gray-800">E-Sign Document</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Apply your electronic signature to this document
                  </p>
                  <p className="text-xs text-purple-600 mt-2">
                    Signature Status: Not Signed
                  </p>
                </button>
              )}
              {document.isSigned && (
                <div className="p-4 rounded-lg border-2 border-green-600 bg-green-50">
                  <div className="text-2xl mb-2">✅</div>
                  <h4 className="font-semibold text-green-800">Document E-Signed</h4>
                  <p className="text-sm text-green-600 mt-1">
                    This document has been electronically signed
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    Signed: {new Date(document.signedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ApproveDocument;