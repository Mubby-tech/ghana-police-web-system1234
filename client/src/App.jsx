import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ============================================
// Authentication & Login (Vision Doc Section 4.2)
// Police ID Login System
// ============================================
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// ============================================
// Inmate Management Module (Vision Doc Section 4.3)
// Digital Inmate Records - 90% Paperless Goal
// ============================================
import InmateList from './pages/inmates/InmateList';
import RegisterInmate from './pages/inmates/RegisterInmate';
import ViewInmate from './pages/inmates/ViewInmate';
import EditInmate from './pages/inmates/EditInmate';
import TransferInmate from './pages/inmates/TransferInmate';
import ReleaseInmate from './pages/inmates/ReleaseInmate';

// ============================================
// CID Cases Module (Vision Doc Section 4.4)
// Electronic CID Documentation System
// ============================================
import CIDCasesList from './pages/cid/CIDCasesList';
import CreateCase from './pages/cid/CreateCase';
import ViewCase from './pages/cid/ViewCase';
import EditCase from './pages/cid/EditCase';
import AddStatement from './pages/cid/AddStatement';
import UploadEvidence from './pages/cid/UploadEvidence';

// ============================================
// Crime Reports Module (Vision Doc Section 4.1)
// Centralized Digital Database
// ============================================
import CrimeReportsList from './pages/crimeReports/CrimeReportsList';
import CreateCrimeReport from './pages/crimeReports/CreateCrimeReport';
import ViewCrimeReport from './pages/crimeReports/ViewCrimeReport';
import EditCrimeReport from './pages/crimeReports/EditCrimeReport';

// ============================================
// EDMS Module (Vision Doc Section 4.5)
// Electronic Document Management System
// E-Memos, E-Approvals, E-Signatures
// ============================================
import EDMSDocumentsList from './pages/edms/EDMSDocumentsList';
import CreateDocument from './pages/edms/CreateDocument';
import ViewDocument from './pages/edms/ViewDocument';
import ApproveDocument from './pages/edms/ApproveDocument';

// ============================================
// HR/Personnel Module (Vision Doc Section 4.1)
// Personnel Records Management System
// ============================================
import PersonnelList from './pages/personnel/PersonnelList';
import RegisterOfficer from './pages/personnel/RegisterOfficer';
import ViewOfficer from './pages/personnel/ViewOfficer';
import EditOfficer from './pages/personnel/EditOfficer';
import TransferOfficer from './pages/personnel/TransferOfficer';

// ============================================
// Settings Module (Vision Doc Section 4.2 & 5.2)
// System Configuration, User Management & Activity Logs
// ============================================
import SystemSettings from './pages/settings/SystemSettings';
import UserManagement from './pages/settings/UserManagement';
import ActivityLogs from './pages/settings/ActivityLogs';
import ProfileSettings from './pages/settings/ProfileSettings';

function App() {
  return (
    <Router>
      <Routes>
        {/* ============================================ */}
        {/* Authentication Routes (Vision Doc Section 4.2) */}
        {/* Police ID Login System */}
        {/* ============================================ */}
        <Route path="/" element={<Login />} />
        
        {/* ============================================ */}
        {/* Main Dashboard (Vision Doc Section 5.1) */}
        {/* Improved Efficiency & Analytics */}
        {/* ============================================ */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* ============================================ */}
        {/* Inmate Management Module (Vision Doc Section 4.3) */}
        {/* Digital Inmate Records - 90% Paperless Goal */}
        {/* ============================================ */}
        <Route path="/dashboard/inmates" element={<InmateList />} />
        <Route path="/dashboard/inmates/register" element={<RegisterInmate />} />
        <Route path="/dashboard/inmates/:id" element={<ViewInmate />} />
        <Route path="/dashboard/inmates/:id/edit" element={<EditInmate />} />
        <Route path="/dashboard/inmates/:id/transfer" element={<TransferInmate />} />
        <Route path="/dashboard/inmates/:id/release" element={<ReleaseInmate />} />
        
        {/* ============================================ */}
        {/* CID Cases Module (Vision Doc Section 4.4) */}
        {/* Electronic CID Documentation System */}
        {/* ============================================ */}
        <Route path="/dashboard/cid" element={<CIDCasesList />} />
        <Route path="/dashboard/cid/create" element={<CreateCase />} />
        <Route path="/dashboard/cid/:id" element={<ViewCase />} />
        <Route path="/dashboard/cid/:id/edit" element={<EditCase />} />
        <Route path="/dashboard/cid/:id/statement" element={<AddStatement />} />
        <Route path="/dashboard/cid/:id/evidence" element={<UploadEvidence />} />
        
        {/* ============================================ */}
        {/* Crime Reports Module (Vision Doc Section 4.1) */}
        {/* Centralized Digital Database */}
        {/* ============================================ */}
        <Route path="/dashboard/reports" element={<CrimeReportsList />} />
        <Route path="/dashboard/reports/create" element={<CreateCrimeReport />} />
        <Route path="/dashboard/reports/:id" element={<ViewCrimeReport />} />
        <Route path="/dashboard/reports/:id/edit" element={<EditCrimeReport />} />
        
        {/* ============================================ */}
        {/* EDMS Module (Vision Doc Section 4.5) */}
        {/* Electronic Document Management System */}
        {/* E-Memos, E-Approvals, E-Signatures */}
        {/* ============================================ */}
        <Route path="/dashboard/edms" element={<EDMSDocumentsList />} />
        <Route path="/dashboard/edms/create" element={<CreateDocument />} />
        <Route path="/dashboard/edms/:id" element={<ViewDocument />} />
        <Route path="/dashboard/edms/:id/approve" element={<ApproveDocument />} />
        <Route path="/dashboard/edms/:id/sign" element={<ApproveDocument />} />
        <Route path="/dashboard/edms/:id/send" element={<ApproveDocument />} />
        <Route path="/dashboard/edms/:id/attach" element={<ApproveDocument />} />
        
        {/* ============================================ */}
        {/* HR/Personnel Module (Vision Doc Section 4.1) */}
        {/* Personnel Records Management System */}
        {/* ============================================ */}
        <Route path="/dashboard/personnel" element={<PersonnelList />} />
        <Route path="/dashboard/personnel/register" element={<RegisterOfficer />} />
        <Route path="/dashboard/personnel/:id" element={<ViewOfficer />} />
        <Route path="/dashboard/personnel/:id/edit" element={<EditOfficer />} />
        <Route path="/dashboard/personnel/:id/transfer" element={<TransferOfficer />} />
        
        {/* ============================================ */}
        {/* Settings Module (Vision Doc Section 4.2 & 5.2) */}
        {/* System Configuration, User Management & Activity Logs */}
        {/* ============================================ */}
        <Route path="/dashboard/settings" element={<SystemSettings />} />
        <Route path="/dashboard/settings/users" element={<UserManagement />} />
        <Route path="/dashboard/settings/activity-logs" element={<ActivityLogs />} />
        <Route path="/dashboard/settings/profile" element={<ProfileSettings />} />
        
        {/* ============================================ */}
        {/* 404 Route - Handle Undefined Paths */}
        {/* ============================================ */}
        <Route path="*" element={
          <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-police-blue mb-4">404</h1>
              <p className="text-gray-600 mb-4">Page not found</p>
              <button 
                onClick={() => window.history.back()}
                className="bg-police-blue text-white px-6 py-2 rounded hover:bg-police-star transition"
              >
                ← Go Back
              </button>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;