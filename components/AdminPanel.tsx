import React, { useEffect, useState } from 'react';
import { authService } from '../services/mockAuth';
import { User } from '../types';
import { CheckCircle, XCircle, Globe, Building2, AlertTriangle } from 'lucide-react';

const AdminPanel = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    const users = await authService.getPendingInstitutions();
    setPendingUsers(users);
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (email: string) => {
    await authService.approveInstitution(email);
    fetchPending(); // Refresh list
  };

  const handleReject = async (email: string) => {
    await authService.rejectInstitution(email);
    fetchPending(); // Refresh list
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Control Center</h1>
        <p className="text-slate-400">Verify and approve institution registration requests.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="glass-card p-6 rounded-3xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" /> Pending Approvals
            </h3>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading requests...</div>
            ) : pendingUsers.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-700 rounded-2xl">
                    <CheckCircle className="mx-auto text-slate-600 mb-2" size={32} />
                    <p className="text-slate-400">No pending registration requests.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingUsers.map((user) => (
                        <div key={user.id} className="bg-[#0f172a] p-6 rounded-2xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white">{user.name}</h4>
                                    <p className="text-slate-400 text-sm mb-2">{user.email}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        {user.institutionDetails?.website && (
                                            <span className="flex items-center gap-1">
                                                <Globe size={12} /> 
                                                <a href={user.institutionDetails.website} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">
                                                    {user.institutionDetails.website}
                                                </a>
                                            </span>
                                        )}
                                        <span>Est: {user.institutionDetails?.foundedYear}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button 
                                    onClick={() => handleReject(user.email)}
                                    className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    <XCircle size={16} /> Reject
                                </button>
                                <button 
                                    onClick={() => handleApprove(user.email)}
                                    className="flex-1 md:flex-none px-6 py-2 rounded-xl bg-green-500 text-slate-900 hover:bg-green-400 transition-colors flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-green-500/20"
                                >
                                    <CheckCircle size={16} /> Approve Access
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;