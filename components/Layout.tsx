
import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileCheck, 
  PlusCircle, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  GraduationCap,
  User as UserIcon,
  ChevronDown,
  ShieldAlert,
  LogIn,
  UserPlus,
  X,
  Mail,
  Phone,
  Calendar,
  Globe
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide layout for login/signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsProfileModalOpen(false);
    navigate('/login');
  };

  // Define menu items based on Role (or Guest)
  const allMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['ALL'] },
    { name: 'Verify', icon: FileCheck, path: '/verify', roles: ['ALL'] },
    { name: 'Issue Certificate', icon: PlusCircle, path: '/issue', roles: [UserRole.INSTITUTION, UserRole.ADMIN] },
    { name: 'My Certificates', icon: GraduationCap, path: '/student-portal', roles: [UserRole.STUDENT] },
    { name: 'Admin Panel', icon: ShieldAlert, path: '/admin', roles: [UserRole.ADMIN] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: [UserRole.INSTITUTION, UserRole.ADMIN, UserRole.STUDENT] },
  ];

  const visibleMenuItems = allMenuItems.filter(item => {
    if (item.roles.includes('ALL')) return true;
    if (!user) return false; // Hide protected items if not logged in
    return item.roles.includes(user.role);
  });

  return (
    <div className="flex h-screen w-full bg-[#0f172a] text-white overflow-hidden bg-[url('https://cdn.pixabay.com/photo/2020/02/07/20/45/abstract-4828359_1280.jpg')] bg-cover bg-no-repeat bg-fixed bg-blend-multiply">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col glass-panel m-4 rounded-3xl border border-white/10 shadow-2xl relative z-10 animate-slide-up">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 animate-float">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
            BBACV
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {visibleMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group btn-interactive
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white shadow-lg shadow-blue-500/20 border border-white/10' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white hover:pl-5'
                  }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400 transition-colors'} />
                <span className="font-medium tracking-wide">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}
              </button>
            );
          })}
          
          {/* Guest Prompt in Sidebar if not logged in */}
          {!user && (
            <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mx-2 animate-in fade-in zoom-in duration-300">
              <p className="text-xs text-blue-200 mb-3">Log in to access student portals or issue certificates.</p>
              <Link to="/login" className="block w-full py-2 text-center text-xs font-bold bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors hover:shadow-lg hover:shadow-blue-500/20">
                Log In Now
              </Link>
            </div>
          )}
        </nav>

        <div className="p-4 mt-auto">
          <div className="glass-card p-4 rounded-2xl mb-4 relative overflow-hidden group cursor-default transition-all duration-300 hover:border-purple-500/30">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-500/30 rounded-full blur-xl group-hover:bg-purple-500/50 transition-colors duration-500" />
            <h4 className="text-sm font-semibold text-slate-200">System Status</h4>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_#4ade80]" />
              <span className="text-xs text-green-400 font-medium">Blockchain Online</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
               <span className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
               <span className="text-xs text-cyan-400 font-medium">AI Engine Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
              {/* Institution Logo Display */}
              {user?.role === UserRole.INSTITUTION && (
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-lg hover:scale-105 transition-transform">
                     {user.avatar ? (
                       <img src={user.avatar} alt="Institution Logo" className="w-full h-full object-cover" />
                     ) : (
                       <ShieldCheck className="text-blue-400" size={20} />
                     )}
                  </div>
              )}
              <h2 className="text-xl font-display font-medium text-slate-200 opacity-80">
                {location.pathname === '/student-portal' ? 'Student Dashboard' : 
                 location.pathname === '/admin' ? 'Admin Control' : 
                 location.pathname === '/verify' ? 'Certificate Verification' :
                 user?.role === UserRole.INSTITUTION ? user.name : 'Academic Verification System'}
              </h2>
          </div>
          
          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
                <div 
                  className="flex items-center gap-3 cursor-pointer p-1.5 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 select-none animate-in fade-in slide-in-from-right-4"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  {(user?.role === UserRole.INSTITUTION || user?.role === UserRole.ADMIN) && (
                      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span className="text-xs text-purple-200 font-medium">{user.role === UserRole.ADMIN ? 'Super Admin' : 'Institution Mode'}</span>
                      </div>
                  )}
                  <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-white leading-none">{user?.name || 'Guest'}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{user?.role || 'Visitor'}</p>
                  </div>
                  <img 
                    src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=random"} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-blue-400 transition-colors"
                  />
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 glass-card rounded-xl shadow-xl border border-white/10 p-2 animate-in slide-in-from-top-2 fade-in duration-200 z-50 origin-top-right">
                        <div className="px-3 py-2 border-b border-white/10 mb-2">
                            <p className="text-sm text-white font-medium">Signed in as</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                        <button 
                            onClick={() => {
                                setIsProfileOpen(false);
                                setIsProfileModalOpen(true);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <UserIcon size={16} /> View Profile
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white rounded-lg flex items-center gap-2 transition-colors">
                            <Settings size={16} /> Preferences
                        </button>
                        <div className="my-1 border-b border-white/5"></div>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                )}
            </div>
          ) : (
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
               <Link to="/login" className="px-5 py-2 text-sm font-medium text-white hover:text-blue-300 transition-colors flex items-center gap-2">
                  Log In
               </Link>
               <Link to="/signup" className="px-5 py-2 bg-white text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all hover:scale-105 shadow-lg shadow-white/10 flex items-center gap-2">
                  Sign Up <ArrowRightIcon />
               </Link>
            </div>
          )}
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 scroll-smooth">
          {children}
        </div>

        {/* Profile Modal Overlay */}
        {isProfileModalOpen && user && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                <div className="w-full max-w-md glass-card border border-white/20 rounded-3xl p-0 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                    {/* Modal Header / Banner */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                        <button 
                            onClick={() => setIsProfileModalOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm hover:rotate-90 duration-300"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    
                    {/* Profile Image & Basic Info */}
                    <div className="px-8 pb-8 relative">
                        <div className="relative -mt-12 mb-4">
                            <img 
                                src={user.avatar || "https://ui-avatars.com/api/?name=User&background=random"} 
                                alt={user.name} 
                                className="w-24 h-24 rounded-full border-4 border-[#0f172a] shadow-xl"
                            />
                            <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-[#0f172a] ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        </div>
                        
                        <h2 className="text-2xl font-display font-bold text-white">{user.name}</h2>
                        <p className="text-purple-300 font-medium">{user.role === 'ADMIN' ? 'System Administrator' : user.role}</p>
                        
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center gap-3 text-slate-300">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                                    <Mail size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 uppercase font-bold">Email Address</p>
                                    <p className="text-sm">{user.email}</p>
                                </div>
                            </div>

                            {user.mobileNumber && (
                                <div className="flex items-center gap-3 text-slate-300">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                                        <Phone size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-500 uppercase font-bold">Mobile</p>
                                        <p className="text-sm">{user.mobileNumber}</p>
                                    </div>
                                </div>
                            )}

                            {user.institutionDetails && (
                                 <div className="flex items-center gap-3 text-slate-300">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                                        <Globe size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-500 uppercase font-bold">Website</p>
                                        <a href={user.institutionDetails.website} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline">
                                            {user.institutionDetails.website}
                                        </a>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-3 text-slate-300">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                                    <Calendar size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 uppercase font-bold">Member Since</p>
                                    <p className="text-sm">{user.institutionDetails?.foundedYear ? `Est. ${user.institutionDetails.foundedYear}` : new Date().getFullYear()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 flex gap-3">
                            <button className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors hover:scale-[1.02] active:scale-[0.98]">
                                Edit Profile
                            </button>
                             <button onClick={handleLogout} className="flex-1 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium transition-colors hover:scale-[1.02] active:scale-[0.98]">
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

// Helper for the arrow icon
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default Layout;
