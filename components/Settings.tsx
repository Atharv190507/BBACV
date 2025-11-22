import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Shield, 
  Smartphone, 
  LogOut, 
  Mail, 
  Globe, 
  Building2, 
  Download,
  Bell,
  Lock
} from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Listen for PWA install event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstalled(false);
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-slide-up pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Account Settings</h1>
        <p className="text-slate-400">Manage your profile, preferences, and app installation.</p>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-8 rounded-3xl mb-8 flex flex-col md:flex-row items-center gap-8 border border-white/10">
        <div className="relative">
          <img 
            src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=random"} 
            alt="Profile" 
            className="w-24 h-24 rounded-full border-4 border-slate-700 shadow-2xl"
          />
          <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-[#0f172a] ${user?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-white">{user?.name || 'Guest User'}</h2>
          <p className="text-purple-400 font-medium mb-2">{user?.role}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1"><Mail size={14}/> {user?.email}</span>
            {user?.mobileNumber && <span className="flex items-center gap-1"><Smartphone size={14}/> {user.mobileNumber}</span>}
            {user?.institutionDetails?.website && <span className="flex items-center gap-1"><Globe size={14}/> {user.institutionDetails.website}</span>}
          </div>
        </div>

        <button 
          onClick={logout}
          className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors font-medium flex items-center gap-2"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* App Installation */}
        <div className="glass-card p-6 rounded-3xl border border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Mobile App</h3>
           </div>
           <p className="text-slate-400 mb-6 text-sm leading-relaxed">
             Install BBACV on your device for faster access and native notifications. 
             {isInstalled ? " You are currently using the installed version." : " Works on Android, iOS, and Desktop."}
           </p>
           
           <button 
             onClick={handleInstall}
             disabled={!deferredPrompt || isInstalled}
             className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
           >
             {isInstalled ? "App Installed" : "Install App"} <Download size={18} />
           </button>
        </div>

        {/* Security & Privacy */}
        <div className="glass-card p-6 rounded-3xl border border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Security</h3>
           </div>
           
           <div className="space-y-4">
             <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
               <div className="flex items-center gap-3">
                 <Lock size={18} className="text-slate-400"/>
                 <span className="text-sm text-slate-200">Password</span>
               </div>
               <button className="text-xs text-blue-400 hover:text-blue-300">Change</button>
             </div>
             <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
               <div className="flex items-center gap-3">
                 <Building2 size={18} className="text-slate-400"/>
                 <span className="text-sm text-slate-200">Account Status</span>
               </div>
               <span className={`text-xs px-2 py-1 rounded border ${user?.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                 {user?.status || 'GUEST'}
               </span>
             </div>
             <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
               <div className="flex items-center gap-3">
                 <Bell size={18} className="text-slate-400"/>
                 <span className="text-sm text-slate-200">Notifications</span>
               </div>
               <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500">BBACV Version 2.1.0 (Build 2024)</p>
        <div className="flex justify-center gap-4 mt-2 text-xs text-slate-600">
           <a href="#" className="hover:text-slate-400">Privacy Policy</a>
           <span>•</span>
           <a href="#" className="hover:text-slate-400">Terms of Service</a>
           <span>•</span>
           <a href="#" className="hover:text-slate-400">Support</a>
        </div>
      </div>
    </div>
  );
};

export default Settings;