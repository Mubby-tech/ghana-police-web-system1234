/* eslint-disable no-undef */
import { NavLink, useNavigate } from 'react-router-dom';

function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();

  // Navigation menu items based on Vision Document Sections
  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: '📊',
      section: 'Overview'
    },
    { 
      name: 'CID Cases', 
      path: '/dashboard/cid', 
      icon: '🔍',
      section: 'Investigation',
      roleRequired: ['cid', 'command', 'admin'] // Vision Doc Section 4.4
    },
    { 
      name: 'Inmate Management', 
      path: '/dashboard/inmates', 
      icon: '👤',
      section: 'Operations',
      roleRequired: ['officer', 'cid', 'command', 'admin'] // Vision Doc Section 4.3
    },
    { 
      name: 'Crime Reports', 
      path: '/dashboard/reports', 
      icon: '📋',
      section: 'Operations',
      roleRequired: ['officer', 'cid', 'command', 'admin'] // Vision Doc Section 4.1
    },
    { 
      name: 'Personnel (HR)', 
      path: '/dashboard/personnel' , 
      icon: '👥',
      section: 'Administration',
      roleRequired: ['hr', 'command', 'admin'] // Vision Doc Section 4.1
    },
      { 
        name: 'Documents (EDMS)', 
        path: '/dashboard/edms',  // ✅ Correct
        icon: '📄',
        section: 'Administration',
        roleRequired: ['officer', 'cid', 'hr', 'command', 'admin']
},
    { 
      name: 'Settings', 
      path: '/dashboard/settings', 
      icon: '⚙️',
      section: 'System',
      roleRequired: ['command', 'admin']
    },
  ];

  // Get current user from localStorage
  const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const user = getUser();

  // Filter menu items based on user role (Vision Doc Section 4.2 - Role-Based Access)
  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roleRequired) return true;
    if (!user) return false;
    return item.roleRequired.includes(user.role);
  });

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-police-blue text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-center border-b border-police-star/30 bg-police-dark">
          <div className="flex items-center gap-3">
            <img 
              src="/gps-logo.png" 
              alt="Ghana Police Service" 
              className="w-10 h-10 bg-white rounded-full p-1"
            />
            <span className="text-lg font-bold text-white">GPS System</span>
          </div>
        </div>

        {/* User Info Section */}
        {user && (
          <div className="p-4 border-b border-police-star/30 bg-police-dark/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-police-star rounded-full flex items-center justify-center text-white font-bold">
                {user.name?.charAt(0) || 'O'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.name || 'Officer'}
                </p>
                <p className="text-xs text-gray-300 truncate">
                  {user.policeId || 'GPS-XXXXX'}
                </p>
                <p className="text-xs text-police-gold capitalize">
                  {user.role || 'Officer'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {['Overview', 'Operations', 'Investigation', 'Administration', 'System'].map((section) => {
            const sectionItems = filteredMenuItems.filter(item => item.section === section);
            
            if (sectionItems.length === 0) return null;

            return (
              <div key={section} className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                  {section}
                </h3>
                {sectionItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
                        isActive
                          ? 'bg-police-star text-white shadow-lg'
                          : 'text-gray-300 hover:bg-police-star/20 hover:text-white'
                      }`
                    }
                    // ✅ FIX: Use children as function to access isActive
                    children={({ isActive }) => (
                      <>
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-medium text-sm">{item.name}</span>
                        {isActive && (
                          <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
                        )}
                      </>
                    )}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        toggleSidebar();
                      }
                    }}
                  />
                ))}
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-police-star/30 bg-police-dark/50">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-lg bg-police-red hover:bg-red-700 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
          
          {/* System Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">Ghana Police Service</p>
            <p className="text-xs text-police-gold font-semibold mt-1">SERVICE WITH INTEGRITY</p>
            <p className="text-xs text-gray-500 mt-2">v1.0.0 | © 2026</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;