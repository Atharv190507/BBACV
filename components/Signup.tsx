
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Building2, User, CheckCircle, Globe, Calendar, Smartphone, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/mockAuth';

const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', country: 'IN' },
  { code: '+1', flag: '🇺🇸', country: 'US' },
  { code: '+44', flag: '🇬🇧', country: 'UK' },
  { code: '+971', flag: '🇦🇪', country: 'UAE' },
  { code: '+86', flag: '🇨🇳', country: 'CN' },
  { code: '+81', flag: '🇯🇵', country: 'JP' },
  { code: '+49', flag: '🇩🇪', country: 'DE' },
  { code: '+33', flag: '🇫🇷', country: 'FR' },
  { code: '+61', flag: '🇦🇺', country: 'AU' },
];

const Signup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'INSTITUTION' | 'STUDENT'>('INSTITUTION');
  
  // Common Form States
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Institution Fields
  const [instName, setInstName] = useState('');
  const [instEmail, setInstEmail] = useState('');
  const [instPassword, setInstPassword] = useState('');
  const [showInstPassword, setShowInstPassword] = useState(false);
  const [instWebsite, setInstWebsite] = useState('');
  const [instYear, setInstYear] = useState('');

  // Student Fields
  const [stuName, setStuName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [stuMobile, setStuMobile] = useState('');
  const [stuEmail, setStuEmail] = useState('');
  const [stuPassword, setStuPassword] = useState('');
  const [showStuPassword, setShowStuPassword] = useState(false);
  
  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    if (location.state?.defaultTab) {
        setActiveTab(location.state.defaultTab);
    }
  }, [location]);

  useEffect(() => {
    let interval: any;
    if (otpTimer > 0) {
        interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // --- Institution Logic ---
  const handleInstitutionRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const res = await authService.registerInstitution({
        institutionName: instName,
        email: instEmail,
        password: instPassword,
        website: instWebsite,
        foundedYear: instYear
    });

    if (res.success) {
        setSuccessMsg("Application Submitted! Our compliance team will verify your details. You will receive an email once approved.");
    } else {
        setErrorMsg(res.message || "Registration failed");
    }
    setIsLoading(false);
  };

  // --- Student Logic ---

  const getFullMobile = () => `${countryCode}${stuMobile}`;

  const handleSendOTP = async () => {
      if (!stuMobile || stuMobile.length < 5) {
          setErrorMsg("Please enter a valid mobile number");
          return;
      }
      setIsLoading(true);
      setErrorMsg('');
      
      // Simulate sending OTP
      const fullNumber = getFullMobile();
      const res = await authService.sendOTP(fullNumber);
      if (res.success) {
          setOtpSent(true);
          setOtpTimer(30); // 30 second cooldown
          // In a real app, this alert wouldn't exist, the SMS would go to the phone.
          // We keep it here for the demo so you know the code.
          alert(`[DEMO SMS] OTP for ${fullNumber} is: ${res.code}`); 
      }
      setIsLoading(false);
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!otpSent) {
        await handleSendOTP();
        return;
    }

    // Verify OTP first
    const fullNumber = getFullMobile();
    const isOtpValid = await authService.verifyOTP(fullNumber, otpCode);
    if (!isOtpValid) {
        setErrorMsg("Invalid OTP Code. Please try again.");
        setIsLoading(false);
        return;
    }

    // Proceed to Register
    const res = await authService.registerStudent({
        name: stuName,
        mobileNumber: fullNumber,
        email: stuEmail,
        password: stuPassword
    });

    if (res.success) {
        setTimeout(() => {
            navigate('/login', { state: { message: "Registration successful! Please log in." } });
        }, 1500);
        setSuccessMsg("Registration Successful! Redirecting to login...");
    } else {
        setErrorMsg(res.message || "Registration failed");
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

      <div className="relative z-10 w-full max-w-xl p-6 animate-in slide-in-from-right duration-500">
        <div className="text-center mb-8">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/30 mb-4">
                <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">Join BBACV</h1>
            <p className="text-slate-400 mt-2">
                {activeTab === 'INSTITUTION' ? 'Partner with us to issue blockchain certificates' : 'Create your secure student wallet'}
            </p>
        </div>

        <div className="glass-card border border-white/10 rounded-3xl p-8 shadow-2xl">
            
             {/* Tabs */}
             <div className="flex p-1 bg-slate-900/50 rounded-xl mb-8">
                <button 
                    onClick={() => { setActiveTab('INSTITUTION'); setSuccessMsg(''); setErrorMsg(''); setOtpSent(false); }}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'INSTITUTION' ? 'bg-white/10 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Building2 size={16} /> Register Institution
                </button>
                <button 
                    onClick={() => { setActiveTab('STUDENT'); setSuccessMsg(''); setErrorMsg(''); }}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'STUDENT' ? 'bg-white/10 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <User size={16} /> Register Student
                </button>
            </div>

            {successMsg ? (
                <div className="text-center py-8 animate-in zoom-in">
                    <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Success</h3>
                    <p className="text-slate-300 mb-6">{successMsg}</p>
                    <Link to="/login" className="inline-block px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                        Back to Login
                    </Link>
                </div>
            ) : (
                <>
                    {errorMsg && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                            {errorMsg}
                        </div>
                    )}

                    {activeTab === 'INSTITUTION' ? (
                        <form onSubmit={handleInstitutionRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5 ml-1">Institution Name</label>
                                    <input required value={instName} onChange={e => setInstName(e.target.value)} type="text" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none" placeholder="e.g. University of Tech" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5 ml-1">Founded Year</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3.5 text-slate-500" size={16} />
                                        <input required value={instYear} onChange={e => setInstYear(e.target.value)} type="text" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 transition-all outline-none" placeholder="1990" />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5 ml-1">Official Work Email</label>
                                <input required value={instEmail} onChange={e => setInstEmail(e.target.value)} type="email" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none" placeholder="admin@university.edu" />
                                <p className="text-[10px] text-slate-500 mt-1 ml-1">Must be an official educational domain (.edu, .ac, etc.)</p>
                            </div>

                            <div>
                                <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5 ml-1">Official Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3.5 text-slate-500" size={16} />
                                    <input required value={instWebsite} onChange={e => setInstWebsite(e.target.value)} type="url" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 transition-all outline-none" placeholder="https://www.university.edu" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5 ml-1">Set Password</label>
                                <div className="relative">
                                    <input 
                                        required 
                                        value={instPassword} 
                                        onChange={e => setInstPassword(e.target.value)} 
                                        type={showInstPassword ? "text" : "password"}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-white focus:border-blue-500 transition-all outline-none" 
                                        placeholder="••••••••" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowInstPassword(!showInstPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showInstPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button disabled={isLoading} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 group mt-2 disabled:opacity-50">
                                {isLoading ? 'Submitting...' : 'Submit for Verification'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleStudentRegister} className="space-y-4">
                             <div>
                                <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5 ml-1">Full Name</label>
                                <input disabled={otpSent} required value={stuName} onChange={e => setStuName(e.target.value)} type="text" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none disabled:opacity-50" placeholder="John Doe" />
                            </div>
                            
                            <div>
                                <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5 ml-1">Mobile Number</label>
                                <div className="flex gap-2">
                                    <div className="relative w-[35%]">
                                        <select 
                                            disabled={otpSent}
                                            value={countryCode}
                                            onChange={(e) => setCountryCode(e.target.value)}
                                            className="w-full h-full appearance-none bg-slate-900/50 border border-slate-700 rounded-xl pl-4 pr-8 py-3 text-white focus:border-blue-500 outline-none disabled:opacity-50"
                                        >
                                            {COUNTRY_CODES.map((c) => (
                                                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            ▼
                                        </div>
                                    </div>
                                    <div className="relative w-[65%]">
                                        <Smartphone className="absolute left-3 top-3.5 text-slate-500" size={16} />
                                        <input 
                                            disabled={otpSent}
                                            required 
                                            value={stuMobile} 
                                            onChange={e => setStuMobile(e.target.value.replace(/\D/g, ''))} 
                                            type="tel" 
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 transition-all outline-none disabled:opacity-50" 
                                            placeholder="9876543210" 
                                        />
                                    </div>
                                </div>
                            </div>

                             {/* OTP Section */}
                            {otpSent && (
                                <div className="animate-in slide-in-from-top-2 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs uppercase font-bold text-blue-400 ml-1">Enter Verification Code</label>
                                        <button type="button" onClick={() => setOtpSent(false)} className="text-[10px] text-slate-400 hover:text-white">Change Number</button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3.5 text-blue-500" size={16} />
                                        <input 
                                            required 
                                            value={otpCode} 
                                            onChange={e => setOtpCode(e.target.value)} 
                                            type="text" 
                                            className="w-full bg-slate-900 border border-blue-500/50 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 transition-all outline-none tracking-widest font-bold text-lg" 
                                            placeholder="------" 
                                            maxLength={6}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-slate-500">Sent to {getFullMobile()}</p>
                                        <p className="text-xs text-slate-400">
                                            {otpTimer > 0 ? `Resend in ${otpTimer}s` : <span onClick={handleSendOTP} className="text-blue-400 cursor-pointer hover:underline font-bold">Resend OTP</span>}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!otpSent && (
                                <>
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5 ml-1">Personal Email</label>
                                        <input required value={stuEmail} onChange={e => setStuEmail(e.target.value)} type="email" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none" placeholder="john@gmail.com" />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5 ml-1">Set Password</label>
                                        <div className="relative">
                                            <input 
                                                required 
                                                value={stuPassword} 
                                                onChange={e => setStuPassword(e.target.value)} 
                                                type={showStuPassword ? "text" : "password"}
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-white focus:border-blue-500 transition-all outline-none" 
                                                placeholder="••••••••" 
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowStuPassword(!showStuPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                            >
                                                {showStuPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Action Buttons */}
                            {!otpSent ? (
                                <button 
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={isLoading}
                                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                                >
                                    {isLoading ? 'Sending...' : 'Send OTP Code'} <Smartphone size={18} />
                                </button>
                            ) : (
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Register'} <CheckCircle size={18} />
                                </button>
                            )}
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-400">
                            Already registered? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Log In</Link>
                        </p>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
