import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Plus, Edit3, Trash2, Download, Eye, FileText, CheckCircle2, Code, User, GraduationCap, BookOpen, FolderGit2, Briefcase, Wrench, Award, Trophy, ChevronLeft, ChevronRight, X, ExternalLink, Sparkles, Move, Wand2, UploadCloud } from 'lucide-react';
import axios from 'axios';
import { API_BASE, SAMPLE_RESUME } from './ResumeShared';
import { ResumePreviewContent } from './ResumePreview';

const ResumeDashboard = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchResumes(); }, []);

  const fetchResumes = async () => {
    try {
      const res = await axios.get(API_BASE);
      setResumes(res.data.data || []);
    } catch (err) { console.error("Failed to fetch resumes", err); }
    finally { setLoading(false); }
  };

  const deleteResume = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try { await axios.delete(`${API_BASE}/${id}`); fetchResumes(); }
      catch (err) { console.error("Failed to delete", err); }
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>My Resumes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create and manage your professional ATS-optimized resumes.</p>
        </div>
        <button className="primary" onClick={() => navigate('/resume/create')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Create New Resume
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {resumes.map(resume => (
            <div key={resume.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.15))', borderRadius: '12px' }}>
                    <FileText size={24} color="var(--accent-primary)" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{resume.name}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target: {resume.target_role}</span>
                  </div>
                </div>
                <button style={{ background: 'transparent', padding: '6px', border: 'none' }} onClick={(e) => deleteResume(resume.id, e)}>
                  <Trash2 size={16} color="var(--error)" />
                </button>
              </div>



              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '6px' }} onClick={() => navigate(`/resume/${resume.id}/edit`)}>
                  <Edit3 size={16} /> Edit
                </button>
                <button style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '6px' }} onClick={() => navigate(`/resume/${resume.id}/preview`)}>
                  <Eye size={16} /> Preview
                </button>
              </div>
            </div>
          ))}
          {resumes.length === 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              {/* Empty-state callout */}
              <div style={{ textAlign: 'center', padding: '40px 20px 32px' }}>
                <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={28} color="var(--accent-primary)" />
                </div>
                <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px' }}>No resumes yet</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 24px' }}>Create your first ATS-optimized resume to get started.</p>
              </div>
              {/* Sample resume preview */}
              <div style={{ position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="var(--accent-secondary)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sample Resume Preview</span>
                  <Sparkles size={16} color="var(--accent-secondary)" />
                </div>
                {/* Blurred overlay encouraging creation */}
                <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <div style={{ transform: 'scale(0.55)', transformOrigin: 'top center', width: '210mm', margin: '0 auto', pointerEvents: 'none' }}>
                    <ResumePreviewContent resume={SAMPLE_RESUME} />
                  </div>
                  {/* Gradient fade-out at bottom */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '140px', background: 'linear-gradient(to bottom, transparent, var(--bg-primary))', borderRadius: '0 0 16px 16px' }} />
                  {/* CTA overlay */}
                  <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                    <button className="primary" onClick={() => navigate('/resume/create')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', boxShadow: '0 8px 24px var(--accent-glow)' }}>
                      <Plus size={18} /> Create Your Resume
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ResumeDashboard;
