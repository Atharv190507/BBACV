import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { blockchainService } from '../services/mockBlockchain';
import { CertificateData } from '../types';
import { Download, Share2, ExternalLink, Award, CheckCircle2 } from 'lucide-react';

const StudentPortal = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.studentId) {
      const fetchCerts = async () => {
        const data = await blockchainService.getCertificatesByStudent(user.studentId!);
        setCertificates(data);
        setLoading(false);
      };
      fetchCerts();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold text-white mb-2">My Certificates</h1>
        <p className="text-slate-400">Securely stored on the blockchain. verifiable anywhere.</p>
      </div>

      {certificates.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center border-dashed border-2 border-slate-700 animate-in fade-in zoom-in duration-500">
            <Award size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-300">No Certificates Found</h3>
            <p className="text-slate-500 mt-2">There are no academic records issued to your Student ID yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert, index) => (
                <div 
                    key={cert.id} 
                    className="glass-card p-0 rounded-3xl overflow-hidden group card-hover cursor-default border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
                >
                    <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 relative p-6 flex items-start justify-between group-hover:from-blue-900/40 group-hover:to-purple-900/40 transition-colors duration-500">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            🎓
                        </div>
                        <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2.5 py-1 rounded-full border border-green-500/20 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Verified
                        </span>
                    </div>
                    <div className="p-6 -mt-6 relative z-10">
                         <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-700 shadow-xl group-hover:border-blue-500/30 transition-colors duration-300">
                             <h3 className="text-xl font-bold text-white mb-1">{cert.degree}</h3>
                             <p className="text-blue-400 font-medium mb-4">{cert.program}</p>
                             
                             <div className="space-y-3 text-sm text-slate-400 mb-6">
                                <div className="flex justify-between">
                                    <span>Institution</span>
                                    <span className="text-slate-200">{cert.university}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Issued</span>
                                    <span className="text-slate-200">{cert.issueDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>ID</span>
                                    <span className="text-slate-200 font-mono">{cert.id}</span>
                                </div>
                             </div>

                             <div className="flex gap-3">
                                 <button className="flex-1 bg-white text-slate-900 py-2.5 rounded-xl font-bold hover:bg-slate-200 btn-interactive flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-white/20">
                                     <Download size={16} /> Download
                                 </button>
                                 <button className="flex-1 bg-slate-800 text-white py-2.5 rounded-xl font-medium hover:bg-slate-700 btn-interactive flex items-center justify-center gap-2 text-sm border border-slate-600">
                                     <Share2 size={16} /> Share
                                 </button>
                             </div>
                             <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                                 <p className="text-[10px] text-slate-500 font-mono truncate w-48">{cert.hash}</p>
                                 <a 
                                    href={`https://sepolia.etherscan.io/tx/0x${cert.hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-indigo-400 flex items-center gap-1 hover:underline hover:text-indigo-300 transition-colors"
                                 >
                                    View on Chain <ExternalLink size={10} />
                                 </a>
                             </div>
                         </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default StudentPortal;