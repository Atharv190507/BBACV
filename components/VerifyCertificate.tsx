
import React, { useState, useRef, useEffect } from 'react';
import { Search, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, QrCode, Sparkles, AlertTriangle, X, ScanLine, Lock, Loader2, UserCheck, Copy, Check, Tags } from 'lucide-react';
import { blockchainService } from '../services/mockBlockchain';
import { CertificateData } from '../types';

const VerifyCertificate = () => {
  const [inputId, setInputId] = useState('');
  const [result, setResult] = useState<CertificateData | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'VALID' | 'INVALID'>('IDLE');
  const [loadingStep, setLoadingStep] = useState('');
  const [isTampered, setIsTampered] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanningRef = useRef(false);

  const handleVerify = async () => {
    if (!inputId.trim()) return;
    
    setStatus('LOADING');
    setResult(null);
    setIsTampered(false);
    setLoadingStep('Checking blockchain record...');

    // Simulate network latency
    await new Promise(r => setTimeout(r, 800));
    
    const cert = await blockchainService.getCertificate(inputId);
    
    if (cert && cert.status === 'VALID') {
        // Step: Integrity Check
        setLoadingStep('Analyzing data integrity...');
        await new Promise(r => setTimeout(r, 800));

        // Re-calculate hash to ensure data hasn't been tampered with
        // Must match the payload structure used during issuance
        const verificationPayload = {
            studentName: cert.studentName,
            university: cert.university,
            degree: cert.degree,
            program: cert.program,
            graduationDate: cert.graduationDate,
            gpa: cert.gpa || '',
            issueDate: cert.issueDate,
            verifiedBy: cert.verifiedBy || '',
            additionalData: cert.additionalData || [],
            id: cert.id
        };

        const recalculatedHash = await blockchainService.generateHash(verificationPayload);
        
        if (recalculatedHash !== cert.hash) {
            setIsTampered(true);
        }

        if (cert.fraudAnalysis) {
             setLoadingStep('AI fraud check in progress...');
             await new Promise(r => setTimeout(r, 800));
        }

        setResult(cert);
        setStatus('VALID');
    } else {
        setResult(null);
        setStatus('INVALID');
    }
    setLoadingStep('');
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Camera & Scanning Logic
  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
         if (canvasRef.current) {
             const canvas = canvasRef.current;
             const video = videoRef.current;
             
             // Set canvas dimensions to match video
             if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
             if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;

             const ctx = canvas.getContext("2d");
             if (ctx) {
                 ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                 const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                 
                 // Use global jsQR
                 const code = (window as any).jsQR ? (window as any).jsQR(imageData.data, imageData.width, imageData.height, {
                     inversionAttempts: "dontInvert",
                 }) : null;
                 
                 if (code) {
                     setInputId(code.data);
                     setIsScanning(false); // Stop scanning
                     return; 
                 }
             }
         }
      }
      if (scanningRef.current) {
           animationFrameId = requestAnimationFrame(tick);
      }
    };

    const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.setAttribute("playsinline", "true");
              await videoRef.current.play();
              scanningRef.current = true;
              requestAnimationFrame(tick);
          }
        } catch (e) {
            console.error("Camera Error", e);
            setIsScanning(false);
            alert("Unable to access camera. Please check permissions.");
        }
    };

    if (isScanning) {
        startCamera();
    }

    return () => {
        scanningRef.current = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
        }
    };
  }, [isScanning]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-4xl mx-auto pb-20">
        <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-4xl font-display font-bold mb-4 glow-text">Verify Academic Credentials</h1>
            <p className="text-slate-400 text-lg">Blockchain-backed immutability with AI fraud checks.</p>
        </div>

        <div className="w-full glass-card p-10 rounded-[2rem] shadow-2xl relative z-10 neon-border animate-in zoom-in duration-500 delay-100">
            {/* Input Section */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    <input 
                        type="text" 
                        value={inputId}
                        onChange={(e) => setInputId(e.target.value)}
                        disabled={status === 'LOADING'}
                        placeholder="Enter Certificate ID (e.g., CERT-2024-001)" 
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.3)] outline-none transition-all duration-300 text-lg placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>
                <button 
                    onClick={handleVerify}
                    disabled={status === 'LOADING'}
                    className="bg-white text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-slate-200 btn-interactive flex items-center gap-2 shadow-lg hover:shadow-white/20 disabled:opacity-80 disabled:cursor-wait min-w-[180px] justify-center"
                >
                    {status === 'LOADING' ? (
                        <div className="flex items-center gap-2">
                            <Loader2 size={20} className="animate-spin" />
                            <span>Processing</span>
                        </div>
                    ) : (
                        <>
                            Verify Now
                            <ShieldCheck size={20} />
                        </>
                    )}
                </button>
            </div>

            {/* Granular Loading Feedback */}
            {status === 'LOADING' && (
                <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="w-full max-w-md h-1 bg-slate-800 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_infinite] origin-left w-full"></div>
                    </div>
                    <p className="text-blue-400 text-sm font-mono animate-pulse flex items-center gap-2">
                        <Sparkles size={12} /> {loadingStep}
                    </p>
                    <style>{`
                        @keyframes loading {
                            0% { transform: translateX(-100%); }
                            50% { transform: translateX(0%); }
                            100% { transform: translateX(100%); }
                        }
                    `}</style>
                </div>
            )}

            <div className="flex justify-center mb-8">
                <button 
                    onClick={() => setIsScanning(true)}
                    disabled={status === 'LOADING'}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm hover:scale-105 duration-200 bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:border-white/20 disabled:opacity-50"
                >
                    <QrCode size={16} /> Scan QR Code
                </button>
            </div>

            {/* Scanner Overlay */}
            {isScanning && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <button 
                        onClick={() => setIsScanning(false)}
                        className="absolute top-8 right-8 text-white/70 hover:text-white p-3 bg-white/10 rounded-full transition-colors hover:bg-white/20 hover:rotate-90 duration-300"
                    >
                        <X size={24} />
                    </button>
                    <div className="relative w-72 h-72 border-2 border-blue-500/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                         <video ref={videoRef} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 border-[3px] border-blue-400 rounded-3xl opacity-50"></div>
                         <div className="absolute w-full h-1 bg-blue-400/80 shadow-[0_0_15px_#60a5fa] animate-scan"></div>
                         <div className="absolute bottom-4 left-0 w-full text-center text-xs text-blue-200 font-mono">SCANNING...</div>
                    </div>
                    <p className="text-slate-400 mt-6">Align QR code within the frame</p>
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            )}

            {/* Results Section */}
            {status === 'VALID' && result && (
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="border-t border-white/10 my-8"></div>
                    
                    {/* Integrity Status Banner */}
                    {isTampered ? (
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl mb-6 flex items-start gap-4 animate-pulse">
                            <div className="bg-red-500/20 p-2 rounded-lg text-red-500 shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Data Integrity Mismatch</h3>
                                <p className="text-red-300 text-sm mt-1">
                                    CRITICAL WARNING: The data in this certificate generates a hash that does not match the immutable record on the blockchain. This certificate may have been tampered with.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl mb-6 flex items-center gap-4">
                             <div className="bg-green-500/20 p-2 rounded-lg text-green-400 shrink-0">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Blockchain Integrity Verified</h3>
                                <p className="text-green-300 text-sm">
                                    Cryptographic hash matches the immutable ledger record. Data is authentic.
                                </p>
                            </div>
                        </div>
                    )}
                    
                    <div className={`flex items-center gap-3 mb-6 ${isTampered ? 'text-red-400' : 'text-green-400'}`}>
                        {isTampered ? <XCircle size={32} /> : <CheckCircle2 size={32} />}
                        <div>
                            <h3 className="text-xl font-bold text-white">{isTampered ? 'Certificate Tampered' : 'Certificate Valid'}</h3>
                            <p className={`text-sm ${isTampered ? 'text-red-400' : 'text-green-400/80'}`}>
                                {isTampered ? 'Hash Verification Failed' : 'Blockchain Verified • Immutable'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="text-xs text-slate-400 uppercase font-bold">Student Name</p>
                                <p className="text-lg text-white font-medium">{result.studentName}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="text-xs text-slate-400 uppercase font-bold">Degree Program</p>
                                <p className="text-lg text-white font-medium">{result.degree}</p>
                                <p className="text-sm text-blue-400">{result.program}</p>
                            </div>
                             <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="text-xs text-slate-400 uppercase font-bold">Institution</p>
                                <p className="text-lg text-white font-medium">{result.university}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex-1">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Issue Date</p>
                                    <p className="text-lg text-white font-medium">{result.issueDate}</p>
                                </div>
                                {result.verifiedBy && (
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex-1">
                                        <p className="text-xs text-slate-400 uppercase font-bold flex items-center gap-1"><UserCheck size={12}/> Verified By</p>
                                        <p className="text-lg text-white font-medium truncate">{result.verifiedBy}</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Certificate ID with Copy Button */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 relative group">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 mr-2">
                                        <p className="text-xs text-slate-400 uppercase font-bold">Certificate ID</p>
                                        <p className="text-sm text-white font-mono break-all">{result.id}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleCopy(result.id, 'id')}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                        title="Copy ID"
                                    >
                                        {copiedField === 'id' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Blockchain Hash with Copy Button */}
                             <div className={`bg-white/5 p-4 rounded-xl border ${isTampered ? 'border-red-500/30 bg-red-500/5' : 'border-white/5'}`}>
                                <div className="flex justify-between items-start">
                                     <div className="flex-1 mr-2">
                                        <p className="text-xs text-slate-400 uppercase font-bold">Blockchain Hash</p>
                                        <p className={`text-[10px] font-mono break-all ${isTampered ? 'text-red-400' : 'text-slate-500'}`}>{result.hash}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleCopy(result.hash, 'hash')}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                        title="Copy Hash"
                                    >
                                        {copiedField === 'hash' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Metadata Display */}
                    {result.additionalData && result.additionalData.length > 0 && (
                        <div className="mt-6 bg-white/5 p-6 rounded-2xl border border-white/5">
                            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-4">
                                <Tags size={16} /> Additional Metadata
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {result.additionalData.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                                        <span className="text-xs text-slate-400 font-medium uppercase">{item.key}</span>
                                        <span className="text-sm text-white font-mono">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Fraud Analysis Display */}
                    {result.fraudAnalysis && (
                        <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Sparkles size={100} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className={result.fraudAnalysis.score > 50 ? "text-yellow-500" : "text-green-400"} size={20} />
                                        <h4 className="font-bold text-white">AI Fraud Analysis</h4>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${result.fraudAnalysis.score < 20 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                                        Confidence: {result.fraudAnalysis.aiConfidence}%
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mb-4">
                                    <div className="text-center">
                                        <div className={`text-3xl font-bold ${result.fraudAnalysis.score < 20 ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {result.fraudAnalysis.score}/100
                                        </div>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Risk Score</p>
                                    </div>
                                    <div className="h-10 w-px bg-white/10"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-300 mb-2">Analysis Factors:</p>
                                        <ul className="space-y-1">
                                            {result.fraudAnalysis.reasons.map((reason, idx) => (
                                                <li key={idx} className="text-xs text-slate-400 flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${result.fraudAnalysis!.isSuspicious ? 'bg-red-400' : 'bg-blue-400'}`}></div>
                                                    {reason}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {status === 'INVALID' && (
                 <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 mt-8 text-center p-8 bg-red-500/10 rounded-2xl border border-red-500/20">
                    <XCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Verification Failed</h3>
                    <p className="text-slate-300">
                        We could not find a valid certificate with ID <span className="font-mono text-white bg-white/10 px-1 rounded">{inputId}</span>.
                    </p>
                    <p className="text-sm text-slate-400 mt-2">Please check the ID and try again.</p>
                 </div>
            )}
        </div>
    </div>
  );
};

export default VerifyCertificate;
