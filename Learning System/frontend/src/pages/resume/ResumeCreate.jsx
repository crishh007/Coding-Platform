import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Plus, Edit3, Trash2, Download, Eye, FileText, CheckCircle2, Code, User, GraduationCap, BookOpen, FolderGit2, Briefcase, Wrench, Award, Trophy, ChevronLeft, ChevronRight, X, ExternalLink, Sparkles, Move, Wand2, UploadCloud } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from './ResumeShared';

const ResumeCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', target_role: '', template_name: 'ATS Professional' });
  const [creating, setCreating] = useState(false);
  const [parsing, setParsing] = useState(false);

  const handleUploadPDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setParsing(true);
    const form = new FormData();
    form.append('resume', file);
    try {
      const res = await axios.post(`${API_BASE}/parse-pdf`, form);
      const parsedData = res.data.data;
      const newResume = {
        name: formData.name || parsedData.personal_info?.full_name + ' Resume' || 'Imported Resume',
        target_role: formData.target_role || 'General',
        template_name: formData.template_name || 'ATS Professional',
        ...parsedData
      };
      const createRes = await axios.post(API_BASE, newResume);
      navigate(`/resume/${createRes.data.id}/edit`);
    } catch (err) {
      console.error(err);
      alert('Failed to parse PDF.');
    } finally {
      setParsing(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    setCreating(true);
    try {
      const res = await axios.post(API_BASE, formData);
      navigate(`/resume/${res.data.id}/edit`);
    } catch (err) {
      console.error(err);
      alert('Failed to create resume');
    } finally { setCreating(false); }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={28} color="white" />
        </div>
        <h2 style={{ marginBottom: '8px' }}>Create New Resume</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Build a professional ATS-friendly resume step by step, or import an existing PDF.</p>
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--accent-primary)' }}>
            {parsing ? <div style={{width:'18px',height:'18px',border:'2px solid var(--accent-primary)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/> : <UploadCloud size={18} />}
            {parsing ? 'Parsing PDF...' : 'Import from PDF (Beta)'}
            <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleUploadPDF} disabled={parsing} />
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label>Resume Name *</label>
          <input type="text" placeholder="e.g. SDE Frontend Resume" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div>
          <label>Target Role</label>
          <input type="text" placeholder="e.g. Software Development Engineer" value={formData.target_role} onChange={e => setFormData({ ...formData, target_role: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button onClick={() => navigate('/resume')}>Cancel</button>
          <button className="primary" onClick={handleCreate} disabled={creating || !formData.name.trim()}>
            {creating ? 'Creating...' : 'Start Building →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeCreate;
