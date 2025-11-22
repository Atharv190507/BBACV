import React, { useState, useRef } from 'react';
import { Upload, Cpu, CheckCircle, RefreshCw, Eye, X, FileText, Image as ImageIcon, Lock, Calendar, GraduationCap, Award, UserCheck, Download, Loader2, Plus, Trash2, Tags } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { blockchainService } from '../services/mockBlockchain';
import { CertificateData, FraudAnalysisResult } from '../types';
import { useAuth } from '../context/AuthContext';
import QRCode from 'qrcode';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const IssueCertificate = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<Partial<CertificateData>>({
    studentName: '',
    university: user?.institutionDetails ? user.name : 'University of Tech',
    degree: '',
    program: '',
    gpa: '',
    graduationDate: '',
    issueDate: new Date().toISOString().split('T')[0],
    verifiedBy: ''
  });
  
  // Metadata State
  const [additionalMetadata, setAdditionalMetadata] = useState<{key: string, value: string}[]>([]);
  const [newMetaKey, setNewMetaKey] = useState('');
  const [newMetaValue, setNewMetaValue] = useState('');

  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [generatedHash, setGeneratedHash] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [fraudScore, setFraudScore] = useState<number | null>(null);
  const [fraudData, setFraudData] = useState<FraudAnalysisResult | null>(null);
  
  // New State for Enhanced Upload
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setUploadProgress(0);
    setGeneratedId(null);
    setGeneratedHash(null);
    setQrCodeUrl(null);
    setFraudScore(null);
    setFraudData(null);
    setAdditionalMetadata([]);

    // Generate Preview
    const reader = new FileReader();
    reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);

    // Simulate Upload Progress
    const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
            if (prev >= 90) return prev;
            return prev + 10;
        });
    }, 200);

    // Actual AI Processing
    const base64Reader = new FileReader();
    base64Reader.onloadend = async () => {
        const base64 = base64Reader.result as string;
        const base64Data = base64.split(',')[1]; // Strip prefix
        
        try {
          // Pass mimeType correctly to handle PDFs and Images
          const aiData = await geminiService.extractCertificateData(base64Data, selectedFile.type);
          
          clearInterval(progressInterval);
          setUploadProgress(100); // Complete
          
          if (aiData) {
            // Smart merge: Only update fields if AI found something, preserving default university if AI returns empty
            setFormData(prev => ({ 
                ...prev, 
                studentName: aiData.studentName || prev.studentName,
                university: aiData.university || prev.university,
                degree: aiData.degree || prev.degree,
                program: aiData.program || prev.program,
                graduationDate: aiData.graduationDate || prev.graduationDate,
                gpa: aiData.gpa || prev.gpa,
                issueDate: aiData.issueDate || prev.issueDate,
                verifiedBy: aiData.verifiedBy || prev.verifiedBy
            }));
          }
        } catch (err) {
            console.error(err);
            clearInterval(progressInterval);
            setUploadProgress(0);
        } finally {
            setTimeout(() => setIsProcessing(false), 500);
        }
    };
    base64Reader.readAsDataURL(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
    } else if (e.type === "dragleave") {
        setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClearFile = (e: React.MouseEvent) => {
      e.stopPropagation();
      setFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      setIsProcessing(false);
      setGeneratedId(null);
      setGeneratedHash(null);
      setQrCodeUrl(null);
      setFraudScore(null);
      setFraudData(null);
      setAdditionalMetadata([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Metadata Handlers
  const handleAddMetadata = () => {
      if (newMetaKey.trim() && newMetaValue.trim()) {
          setAdditionalMetadata([...additionalMetadata, { key: newMetaKey.trim(), value: newMetaValue.trim() }]);
          setNewMetaKey('');
          setNewMetaValue('');
      }
  };

  const handleRemoveMetadata = (index: number) => {
      const updated = [...additionalMetadata];
      updated.splice(index, 1);
      setAdditionalMetadata(updated);
  };

  const handleIssue = async () => {
    if (!formData.studentName) return;
    setIsProcessing(true);

    // 1. AI Fraud Check
    const fraudAnalysis = await geminiService.detectFraud(formData);
    setFraudScore(fraudAnalysis.score);
    setFraudData(fraudAnalysis);

    if (fraudAnalysis.isSuspicious && fraudAnalysis.score > 80) {
        alert("High fraud risk detected! Issuance blocked by AI.");
        setIsProcessing(false);
        return;
    }

    // 2. Generate Hash & ID
    const randomNum = Math.floor(Math.random() * 100000);
    const newId = `CERT-${new Date().getFullYear()}-${randomNum}`;
    
    // Construct payload explicitly to match verification logic
    const payload = {
        studentName: formData.studentName!,
        university: user?.name || formData.university || 'University of Tech',
        degree: formData.degree || 'Bachelor',
        program: formData.program || 'General',
        graduationDate: formData.graduationDate || '2024-01-01',
        gpa: formData.gpa || '',
        issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
        verifiedBy: formData.verifiedBy || '',
        additionalData: additionalMetadata,
        id: newId
    };

    const hash = await blockchainService.generateHash(payload);

    // 3. Issue to Blockchain (Persistent)
    const newCert: CertificateData = {
        ...payload, // Use the payload properties
        studentId: 'STU-' + Math.floor(Math.random()*1000), // Mock ID
        hash: hash,
        status: 'VALID',
        issuerId: user?.id || 'INST-UNKNOWN',
        fraudAnalysis: fraudAnalysis // Store analysis
    };

    await blockchainService.issueCertificate(newCert);
    setGeneratedId(newId);
    setGeneratedHash(hash);

    // 4. Generate QR Code
    try {
        const url = await QRCode.toDataURL(newId, {
            width: 200,
            margin: 1,
            color: {
                dark: '#0f172a',
                light: '#ffffff'
            }
        });
        setQrCodeUrl(url);
    } catch (err) {
        console.error("QR Gen Error", err);
    }

    setIsProcessing(false);
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);

    try {
        const canvas = await html2canvas(certificateRef.current, {
            scale: 2, // Higher scale for better resolution
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Calculate ratio to fit
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.9; // 0.9 for margin
        
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        const x = (pdfWidth - finalWidth) / 2;
        const y = (pdfHeight - finalHeight) / 2;

        pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
        pdf.save(`${formData.studentName?.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (error) {
        console.error("PDF Generation Error", error);
        alert("Failed to generate PDF.");
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)] animate-slide-up">
      
      {/* Input Form */}
      <div className="glass-card p-8 rounded-3xl flex flex-col overflow-y-auto">
        <h2 className="text-2xl font-display font-bold text-white mb-6">Issue New Certificate</h2>
        
        {/* Drag & Drop Upload Area */}
        <div 
          onClick={() => !file && fileInputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 group mb-8
            ${dragActive ? 'border-blue-400 bg-blue-500/10 scale-[1.02]' : 'border-slate-600'}
            ${!file ? 'hover:border-blue-400 hover:bg-white/5 cursor-pointer' : 'bg-slate-800/30 border-slate-600 cursor-default'}
          `}
        >
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
          
          {file ? (
              // Enhanced File Preview State
              <div className="w-full relative z-10 animate-in fade-in zoom-in">
                  <div className="flex flex-col items-center">
                      {previewUrl && file.type.startsWith('image/') ? (
                          <div className="w-full h-64 rounded-xl overflow-hidden bg-black/20 border border-white/10 mb-4 relative group/img shadow-2xl">
                              <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                          </div>
                      ) : (
                          <div className="w-24 h-24 bg-slate-700/50 rounded-2xl flex items-center justify-center mb-4 border border-white/10 shadow-xl">
                              <FileText className="text-blue-400" size={40} />
                          </div>
                      )}

                      <div className="text-center w-full">
                          <p className="text-lg font-medium text-white truncate max-w-full px-4">{file.name}</p>
                          <p className="text-sm text-slate-400 mb-4">{(file.size / 1024).toFixed(1)} KB</p>

                          {/* Upload Progress */}
                           {(isProcessing || uploadProgress > 0) && uploadProgress < 100 && (
                              <div className="w-full max-w-xs mx-auto h-2 bg-slate-700 rounded-full overflow-hidden mb-4 relative">
                                  <div 
                                      className="h-full bg-blue-500 transition-all duration-300 ease-out rounded-full relative overflow-hidden"
                                      style={{ width: `${uploadProgress}%` }}
                                  >
                                      <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12"></div>
                                  </div>
                              </div>
                          )}
                          
                          {isProcessing ? (
                               <p className="text-sm text-blue-400 animate-pulse flex items-center justify-center gap-2">
                                   <Cpu size={16} /> AI Analyzing Document...
                               </p>
                          ) : (
                               <button 
                                onClick={handleClearFile}
                                className="px-6 py-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto hover:scale-105"
                              >
                                  <X size={16} /> Remove File
                              </button>
                          )}
                      </div>
                  </div>
              </div>
          ) : (
              // Empty State
              <>
                <div className={`w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 relative z-10 ${dragActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    <Upload className={`text-blue-400 ${dragActive ? 'animate-bounce' : ''}`} />
                </div>
                <p className="text-slate-300 font-medium relative z-10">
                    {dragActive ? "Drop file here" : "Click to upload or drag certificate"}
                </p>
                <p className="text-slate-500 text-sm mt-2 relative z-10">Supports PDF, JPG, PNG</p>
                <div className={`absolute inset-0 bg-blue-500/5 transition-opacity duration-300 pointer-events-none ${dragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
              </>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
            <div>
                <label htmlFor="studentName" className="text-xs text-slate-400 uppercase font-bold tracking-wider">Student Name</label>
                <input 
                    id="studentName"
                    type="text" 
                    value={formData.studentName} 
                    onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white mt-1 focus:border-blue-500 outline-none transition-colors focus:ring-1 focus:ring-blue-500/50"
                    placeholder="Automatically detected..."
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="degree" className="text-xs text-slate-400 uppercase font-bold tracking-wider">Degree</label>
                    <div className="relative mt-1">
                        <GraduationCap className="absolute left-3 top-3.5 text-slate-500" size={16} />
                        <input 
                            id="degree"
                            type="text" 
                            value={formData.degree} 
                            onChange={(e) => setFormData({...formData, degree: e.target.value})}
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500/50"
                            placeholder="Bachelor of Science"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="program" className="text-xs text-slate-400 uppercase font-bold tracking-wider">Program</label>
                    <input 
                        id="program"
                        type="text" 
                        value={formData.program} 
                        onChange={(e) => setFormData({...formData, program: e.target.value})}
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white mt-1 focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500/50"
                        placeholder="Computer Science"
                    />
                </div>
            </div>

            {/* GPA and Graduation Date */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="graduationDate" className="text-xs text-slate-400 uppercase font-bold tracking-wider">Graduation Date</label>
                    <div className="relative mt-1">
                        <Calendar className="absolute left-3 top-3.5 text-slate-500" size={16} />
                        <input 
                            id="graduationDate"
                            type="date" 
                            value={formData.graduationDate} 
                            onChange={(e) => setFormData({...formData, graduationDate: e.target.value})}
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500/50 date-input-icon"
                            aria-label="Graduation Date"
                            aria-required="true"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="gpa" className="text-xs text-slate-400 uppercase font-bold tracking-wider">GPA / CGPA</label>
                    <div className="relative mt-1">
                         <Award className="absolute left-3 top-3.5 text-slate-500" size={16} />
                        <input 
                            id="gpa"
                            type="text" 
                            value={formData.gpa} 
                            onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500/50"
                            placeholder="e.g. 3.8"
                            aria-label="Grade Point Average"
                        />
                    </div>
                </div>
            </div>

            {/* Issue Date and Verified By */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="issueDate" className="text-xs text-slate-400 uppercase font-bold tracking-wider">Issue Date</label>
                    <div className="relative mt-1">
                        <Calendar className="absolute left-3 top-3.5 text-slate-500" size={16} />
                        <input 
                            id="issueDate"
                            type="date" 
                            value={formData.issueDate} 
                            onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500/50"
                            aria-label="Certificate Issue Date"
                            aria-required="true"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="verifiedBy" className="text-xs text-slate-400 uppercase font-bold tracking-wider">Verified By</label>
                    <div className="relative mt-1">
                        <UserCheck className="absolute left-3 top-3.5 text-slate-500" size={16} />
                         <input 
                            id="verifiedBy"
                            type="text" 
                            value={formData.verifiedBy} 
                            onChange={(e) => setFormData({...formData, verifiedBy: e.target.value})}
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500/50"
                            placeholder="e.g. Registrar"
                            aria-label="Verified By"
                        />
                    </div>
                </div>
            </div>

            {/* Additional Metadata Section */}
            <div className="pt-4 border-t border-white/10">
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider flex items-center gap-2 mb-2">
                    <Tags size={14} /> Additional Metadata
                </label>
                
                <div className="flex gap-2 mb-3">
                    <input 
                        type="text"
                        value={newMetaKey}
                        onChange={(e) => setNewMetaKey(e.target.value)}
                        placeholder="Key (e.g. Major GPA)"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                    />
                    <input 
                        type="text"
                        value={newMetaValue}
                        onChange={(e) => setNewMetaValue(e.target.value)}
                        placeholder="Value (e.g. 4.0)"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                    />
                    <button 
                        onClick={handleAddMetadata}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                        disabled={!newMetaKey || !newMetaValue}
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {additionalMetadata.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {additionalMetadata.map((meta, index) => (
                            <div key={index} className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm animate-in zoom-in duration-200">
                                <span className="text-slate-400">{meta.key}:</span>
                                <span className="text-white font-medium">{meta.value}</span>
                                <button 
                                    onClick={() => handleRemoveMetadata(index)}
                                    className="text-slate-500 hover:text-red-400 transition-colors ml-1"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Action Button */}
            <button 
                onClick={handleIssue}
                disabled={isProcessing || generatedId !== null}
                className="w-full py-4 mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-blue-500/30 btn-interactive disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <RefreshCw className="animate-spin" /> Processing...
                    </>
                ) : generatedId ? (
                    <>
                        <CheckCircle /> Certificate Issued
                    </>
                ) : (
                    <>
                        <Cpu /> Issue & Pin to IPFS
                    </>
                )}
            </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="flex flex-col gap-6">
        {/* Real-time Preview */}
        <div className="glass-card p-1 rounded-3xl flex-1 relative overflow-hidden flex flex-col animate-in fade-in zoom-in duration-500 delay-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none" />
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300 flex items-center gap-2"><Eye size={16}/> Live Preview</span>
                {generatedId && (
                    <div className="flex gap-3">
                         <button 
                             onClick={handleDownloadPDF}
                             disabled={isDownloading}
                             className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                         >
                             {isDownloading ? <Loader2 size={12} className="animate-spin"/> : <Download size={12} />} 
                             {isDownloading ? 'Exporting...' : 'Download PDF'}
                         </button>
                         <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1.5 rounded animate-in zoom-in">ID: {generatedId}</span>
                    </div>
                )}
            </div>
            <div className="flex-1 flex items-center justify-center p-8 overflow-x-auto">
                {/* Certificate Design - Referenced for PDF Capture */}
                <div 
                    ref={certificateRef}
                    className="bg-white text-slate-900 p-12 rounded shadow-2xl w-full max-w-2xl aspect-[1.4/1] relative flex flex-col items-center justify-center text-center border-8 border-double border-slate-200 min-w-[600px]"
                >
                    {/* Ornamental corners */}
                    <div className="absolute top-6 left-6 w-24 h-24 border-t-4 border-l-4 border-slate-900 opacity-20"></div>
                    <div className="absolute bottom-6 right-6 w-24 h-24 border-b-4 border-r-4 border-slate-900 opacity-20"></div>
                    <div className="absolute top-6 right-6 w-24 h-24 border-t-4 border-r-4 border-slate-900 opacity-20"></div>
                    <div className="absolute bottom-6 left-6 w-24 h-24 border-b-4 border-l-4 border-slate-900 opacity-20"></div>
                    
                    <div className="w-20 h-20 bg-slate-900 rounded-full mb-6 flex items-center justify-center text-white font-serif text-3xl shadow-lg">
                        <GraduationCap size={32} />
                    </div>
                    
                    <h3 className="text-4xl font-serif font-bold mb-2 tracking-wide uppercase text-slate-800">{user?.name || formData.university}</h3>
                    <div className="w-full h-px bg-slate-300 max-w-md my-2"></div>
                    <p className="text-sm text-slate-500 uppercase tracking-[0.2em] mb-8">Certificate of Completion</p>
                    
                    <p className="text-xl italic font-serif mb-2 text-slate-600">This is to certify that</p>
                    <h2 className="text-5xl font-serif font-bold text-blue-900 mb-4 py-2 border-b-2 border-slate-100">{formData.studentName || 'Student Name'}</h2>
                    
                    <p className="text-xl italic font-serif mb-2 text-slate-600">has successfully completed the requirements for</p>
                    <h4 className="text-2xl font-bold uppercase tracking-wider mb-2 text-slate-800">{formData.degree || 'Degree Name'}</h4>
                    <p className="text-lg font-medium text-slate-600 mb-2">{formData.program}</p>
                    
                    <div className="flex gap-4 justify-center mb-6">
                         {formData.gpa && <span className="text-md text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded">GPA: {formData.gpa}</span>}
                         {additionalMetadata.map((meta, i) => (
                             <span key={i} className="text-md text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded">{meta.key}: {meta.value}</span>
                         ))}
                    </div>
                    
                    <div className="flex justify-between w-full px-16 mt-auto items-end">
                        <div className="text-center flex flex-col items-center">
                             <div className="text-slate-800 font-signature text-xl mb-1 font-serif italic">{formData.verifiedBy || 'Authority Signature'}</div>
                            <div className="w-40 border-b border-slate-400 mb-2"></div>
                            <p className="text-xs uppercase text-slate-500 font-bold tracking-wider">Verified By</p>
                        </div>
                        
                        {generatedId ? (
                           <div className="flex flex-col items-center gap-1">
                               <div className="w-20 h-20 bg-white p-1 shadow-md border border-slate-200">
                                   {qrCodeUrl ? (
                                       <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                                   ) : (
                                       <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[8px]">QR</div>
                                   )}
                               </div>
                               <p className="text-[8px] font-mono text-slate-400">{generatedId}</p>
                           </div>
                        ) : (
                            <div className="w-20 h-20 border-2 border-dashed border-slate-300 flex items-center justify-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full opacity-50"></div>
                            </div>
                        )}

                         <div className="text-center flex flex-col items-center">
                            <div className="text-slate-800 font-serif mb-1">{formData.issueDate || 'YYYY-MM-DD'}</div>
                            <div className="w-40 border-b border-slate-400 mb-2"></div>
                            <p className="text-xs uppercase text-slate-500 font-bold tracking-wider">Date Issued</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Generated Hash Display */}
            {generatedHash && (
              <div className="bg-slate-900/80 p-3 text-center border-t border-white/10 animate-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
                      <Lock size={12} />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Cryptographic Hash</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono break-all max-w-md mx-auto">{generatedHash}</p>
              </div>
            )}
        </div>

        {/* AI Fraud Analysis Widget */}
        {fraudScore !== null && (
             <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border-l-4 border-l-green-400 animate-slide-up">
                <div>
                    <h4 className="text-sm font-bold text-slate-200">AI Fraud Analysis</h4>
                    <p className="text-xs text-slate-400">Based on metadata patterns & historical data</p>
                </div>
                <div className="text-right">
                    <span className={`text-2xl font-bold ${fraudScore > 50 ? 'text-red-400' : 'text-green-400'}`}>{fraudScore}%</span>
                    <p className="text-[10px] uppercase text-slate-500">Risk Score</p>
                </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default IssueCertificate;