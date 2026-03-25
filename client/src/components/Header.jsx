import NotificationBell from './NotificationBell';

function Header({ toggleSidebar, user }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left: Menu Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 rounded"
        >
          <span className="text-2xl">☰</span>
        </button>
        <h1 className="text-xl font-semibold text-police-blue">Dashboard</h1>
      </div>

      {/* Right: User Profile */}
      <div className="flex items-center gap-4">
        {/* ✅ Notifications - Using Actual NotificationBell Component */}
        <NotificationBell user={user} />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-police-blue">{user?.name || 'Officer'}</p>
            <p className="text-xs text-gray-500">{user?.policeId || 'GPS-XXXXX'}</p>
          </div>
          <div className="w-10 h-10 bg-police-blue rounded-full flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || 'O'}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;