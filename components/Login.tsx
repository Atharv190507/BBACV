import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/mockAuth';
import { ShieldCheck, User, Building2, ArrowRight, KeyRound, AlertCircle, ArrowLeft, Eye, EyeOff, Lock, Mail, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [activeTab, setActiveTab] = useState<'INSTITUTION' | 'STUDENT'>('INSTITUTION');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!identifier || !password) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
    }

    // Pass identifier (Email or ID) to login service
    const res = await login(activeTab, identifier, password);
    
    if (res.success) {
        navigate(activeTab === 'INSTITUTION' ? '/' : '/student-portal');
    } else {
        setError(res.error || "Login failed");
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);
    setIsLoading(true);

    if (!identifier) {
        setResetMessage({ type: 'error', text: "Please enter your registered email or mobile." });
        setIsLoading(false);
        return;
    }

    const res = await authService.resetPassword(identifier, activeTab);
    
    if (res.success) {
        setResetMessage({ type: 'success', text: res.message || "Reset link sent successfully." });
    } else {
        setResetMessage({ type: 'error', text: res.message || "Failed to reset password." });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center relative overflow-hidden bg-[url('https://cdn.pixabay.com/photo/2020/02/07/20/45/abstract-4828359_1280.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
      
      {/* Back Button */}
      <Link to="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
        </div>
        <span className="font-medium text-sm">Back to Home</span>
      </Link>

      <div className="relative z-10 w-full max-w-md p-6 animate-in zoom-in duration-500">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/30 mb-4">
                <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">BBACV</h1>
            <p className="text-slate-400 mt-2">Blockchain Academic Verification</p>
        </div>

        <div className="glass-card border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
            {/* Tabs - Hidden in Forgot Password Mode */}
            {!isForgotPassword && (
                <div className="flex p-1 bg-slate-900/50 rounded-xl mb-8 animate-in slide-in-from-top-2">
                    <button 
                        onClick={() => { setActiveTab('INSTITUTION'); setIdentifier(''); setError(''); }}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'INSTITUTION' ? 'bg-white/10 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Building2 size={16} /> Institution
                    </button>
                    <button 
                        onClick={() => { setActiveTab('STUDENT'); setIdentifier(''); setError(''); }}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'STUDENT' ? 'bg-white/10 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <User size={16} /> Student
                    </button>
                </div>
            )}

            {/* Error Message for Login */}
            {error && !isForgotPassword && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-2 text-red-200 text-sm animate-in fade-in">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span className="flex-1 leading-tight">{error}</span>
                </div>
            )}

            {isForgotPassword ? (
                // --- Forgot Password View ---
                <div className="animate-in slide-in-from-right duration-300">
                    <button 
                        onClick={() => { setIsForgotPassword(false); setResetMessage(null); setError(''); }} 
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Login
                    </button>

                    <div className="text-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
                            <Lock size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Reset Password</h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Enter your registered {activeTab === 'INSTITUTION' ? 'email' : 'email or mobile'} to receive reset instructions.
                        </p>
                    </div>

                    {resetMessage && (
                        <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-sm animate-in zoom-in ${resetMessage.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'}`}>
                            {resetMessage.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0"/> : <AlertCircle size={16} className="mt-0.5 shrink-0"/>}
                            <span className="flex-1 leading-tight">{resetMessage.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div>
                            <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5 ml-1">
                                {activeTab === 'INSTITUTION' ? 'Official Email' : 'Email or Mobile Number'}
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                    <Mail size={18} />
                                </div>
                                <input 
                                    type="text" 
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none placeholder:text-slate-600"
                                    placeholder={activeTab === 'INSTITUTION' ? 'admin@university.edu' : 'student@email.com / +123...'}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>
            ) : (
                // --- Login View ---
                <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in">
                    <div>
                        <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5 ml-1">
                            {activeTab === 'INSTITUTION' ? 'Institution ID or Email' : 'Email or Mobile Number'}
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                {activeTab === 'INSTITUTION' ? <Building2 size={18} /> : <User size={18} />}
                            </div>
                            <input 
                                type="text" 
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none placeholder:text-slate-600"
                                placeholder={activeTab === 'INSTITUTION' ? 'admin@university.edu / INST-ID' : 'student@email.com / +1234567890'}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
                            <label className="block text-xs uppercase font-bold text-slate-400">
                                Password
                            </label>
                            <button 
                                type="button"
                                onClick={() => setIsForgotPassword(true)}
                                className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-all"
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                <KeyRound size={18} />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-12 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none placeholder:text-slate-600"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            )}

            {!isForgotPassword && (
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-400">
                        New to BBACV?{' '}
                        <Link 
                            to="/signup" 
                            state={{ defaultTab: activeTab }}
                            className="text-blue-400 hover:text-blue-300 font-medium underline-offset-2 hover:underline"
                        >
                            Register {activeTab === 'INSTITUTION' ? 'Institution' : 'Student'}
                        </Link>
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Login;