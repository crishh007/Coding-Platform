import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Plus, Edit3, Trash2, Download, Eye, FileText, CheckCircle2, Code, User, GraduationCap, BookOpen, FolderGit2, Briefcase, Wrench, Award, Trophy, ChevronLeft, ChevronRight, X, ExternalLink, Sparkles, Move, Wand2, UploadCloud } from 'lucide-react';
import { generateLatex } from '../../utils/latexGenerator';
import { API_BASE } from './ResumeShared';

function ResumePreviewContent({ resume }) {
  if (!resume) return null;
  const p = resume.personal_info || {};
  const education = resume.education || [];
  const coursework = resume.coursework || [];
  const projects = resume.projects || [];
  const experience = resume.experience || [];
  const ts = resume.technical_skills || {};
  const skills = resume.skills || [];
  const extracurriculars = resume.extracurriculars || [];
  const certifications = resume.certifications || [];

  const hasSkills = (ts.languages?.length > 0) || (ts.frameworks?.length > 0) || (ts.databases?.length > 0) || (ts.developer_tools?.length > 0) || (ts.platforms?.length > 0) || (ts.other?.length > 0) || skills.length > 0;

  const tplClass = 'template-' + (resume.template_name || 'ATS Professional').toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`print-area ${tplClass}`} style={{
      background: 'white',
      width: '210mm',
      minHeight: '297mm',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      padding: '28px 32px',
      color: 'black',
      fontSize: '12px',
      lineHeight: '1.3',
    }}>
      <div className="print-header" style={{ textAlign: 'center', marginBottom: '6px' }}>
        <h1 className="print-name" style={{ color: 'black', fontSize: '24px', margin: 0, fontVariant: 'small-caps', fontWeight: 'bold', letterSpacing: '0.02em' }}>{p.full_name || 'Your Name'}</h1>
        {p.location && <div style={{ fontSize: '12px', color: '#333', marginTop: '2px' }}>{p.location}</div>}
        <div className="print-contact" style={{ fontSize: '12px', color: '#333', marginTop: '4px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
          {p.phone && <span>📞 {p.phone}</span>}
          {p.email && <span>✉️ {p.email}</span>}
          {p.linkedin && <a href={p.linkedin} style={{ color: 'inherit', textDecoration: 'underline' }}>LinkedIn</a>}
          {p.github && <a href={p.github} style={{ color: 'inherit', textDecoration: 'underline' }}>GitHub</a>}
          {p.hackerrank && <a href={p.hackerrank} style={{ color: 'inherit', textDecoration: 'underline' }}>HackerRank</a>}
          {p.codeforces && <a href={p.codeforces} style={{ color: 'inherit', textDecoration: 'underline' }}>Codeforces</a>}
        </div>
      </div>

      {education.length > 0 && (
        <div>
          <div className="section-title">Education</div>
          {education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: '6px' }}>
              <div className="subheading">
                <strong style={{ fontSize: '14px' }}>{edu.institution}</strong>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{edu.start_date} — {edu.end_date}</span>
              </div>
              <div className="subheading">
                <em style={{ fontSize: '14px' }}>{edu.degree}{edu.field_of_study ? ` - ${edu.field_of_study}` : ''} — <strong>{edu.score_type || 'CGPA'}</strong>: <strong>{edu.score}{edu.score_type === 'Percentage' ? '%' : ''}</strong></em>
                <em style={{ fontSize: '12px' }}>{edu.location}</em>
              </div>
            </div>
          ))}
        </div>
      )}

      {coursework.length > 0 && (
        <div>
          <div className="section-title">Coursework / Skills</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px 12px', fontSize: '12px', color: '#333' }}>
            {coursework.map((c, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '8px' }}>•</span> {c}
              </div>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div>
          <div className="section-title">Projects</div>
          {projects.map((proj, idx) => (
            <div key={idx} style={{ marginBottom: '8px' }}>
              <div className="subheading">
                <span>
                  <strong style={{ fontSize: '12px', textDecoration: 'underline' }}>{proj.name}</strong>
                  {proj.link && <a href={proj.link} style={{ color: 'inherit', marginLeft: '4px', fontSize: '12px' }}>↗</a>}
                  {(proj.technologies || []).length > 0 && <span style={{ color: '#666', fontSize: '12px' }}> | <span style={{ textDecoration: 'underline' }}>{proj.technologies.join(', ')}</span></span>}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{proj.duration}</span>
              </div>
              {(proj.description || []).map((desc, dIdx) => (
                <div key={dIdx} className="bullet">
                  <span style={{ position: 'absolute', left: '4px', fontSize: '10px' }}>•</span>
                  {desc}
                </div>
              ))}
              {proj.live_link && (
                <div className="bullet">
                  <span style={{ position: 'absolute', left: '4px', fontSize: '10px' }}>•</span>
                  <a href={proj.live_link} style={{ color: 'inherit', textDecoration: 'underline' }}>Live site here</a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {experience.length > 0 && (
        <div>
          <div className="section-title">Experience</div>
          {experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: '8px' }}>
              <div className="subheading">
                <span>
                  <strong style={{ fontSize: '14px' }}>{exp.company}</strong>
                  {exp.certificate_link && <a href={exp.certificate_link} style={{ color: 'inherit', marginLeft: '4px', fontSize: '12px' }}>↗</a>}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{exp.start_date} — {exp.end_date}</span>
              </div>
              <div className="subheading">
                <em style={{ fontSize: '12px', textDecoration: 'underline' }}>{exp.title}</em>
                <em style={{ fontSize: '12px' }}>{exp.location}</em>
              </div>
              {(exp.description || []).map((desc, dIdx) => (
                <div key={dIdx} className="bullet">
                  <span style={{ position: 'absolute', left: '4px', fontSize: '10px' }}>•</span>
                  {desc}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {hasSkills && (
        <div>
          <div className="section-title">Technical Skills</div>
          <div style={{ fontSize: '12px', color: '#333' }}>
            {ts.languages?.length > 0 && <div style={{ marginBottom: '2px' }}><strong>Languages:</strong> {ts.languages.join(', ')}</div>}
            {ts.developer_tools?.length > 0 && <div style={{ marginBottom: '2px' }}><strong>Developer Tools:</strong> {ts.developer_tools.join(', ')}</div>}
            {ts.frameworks?.length > 0 && <div style={{ marginBottom: '2px' }}><strong>Technologies/Frameworks:</strong> {ts.frameworks.join(', ')}</div>}
            {ts.databases?.length > 0 && <div style={{ marginBottom: '2px' }}><strong>Databases:</strong> {ts.databases.join(', ')}</div>}
            {ts.platforms?.length > 0 && <div style={{ marginBottom: '2px' }}><strong>Platforms/Cloud:</strong> {ts.platforms.join(', ')}</div>}
            {ts.other?.length > 0 && <div style={{ marginBottom: '2px' }}><strong>Other:</strong> {ts.other.join(', ')}</div>}
            {!(ts.languages?.length > 0) && skills.length > 0 && <div><strong>Skills:</strong> {skills.join(', ')}</div>}
          </div>
        </div>
      )}

      {extracurriculars.length > 0 && (
        <div>
          <div className="section-title">Extracurricular</div>
          {extracurriculars.map((ext, idx) => (
            <div key={idx} style={{ marginBottom: '8px' }}>
              <div className="subheading">
                <span>
                  <strong style={{ fontSize: '14px' }}>{ext.organization}</strong>
                  {ext.certificate_link && <a href={ext.certificate_link} style={{ color: 'inherit', marginLeft: '4px', fontSize: '12px' }}>↗</a>}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{ext.start_date} — {ext.end_date}</span>
              </div>
              <div className="subheading">
                <em style={{ fontSize: '12px', textDecoration: 'underline' }}>{ext.role}</em>
                <em style={{ fontSize: '12px' }}>{ext.location}</em>
              </div>
              {(ext.description || []).map((desc, dIdx) => (
                <div key={dIdx} className="bullet">
                  <span style={{ position: 'absolute', left: '4px', fontSize: '10px' }}>•</span>
                  {desc}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div>
          <div className="section-title">Certifications</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: '12px', color: '#333' }}>
            {certifications.map((cert, idx) => (
              <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '8px' }}>●</span>
                {cert.credential_url ? (
                  <a href={cert.credential_url} style={{ color: '#333', textDecoration: 'none' }}>{cert.name}{cert.issuer ? ` - ${cert.issuer}` : ''}</a>
                ) : (
                  <span>{cert.name}{cert.issuer ? ` - ${cert.issuer}` : ''}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {resume.custom_sections && resume.custom_sections.length > 0 && resume.custom_sections.map((sec, idx) => (
        <div key={idx} style={{ marginBottom: '8px' }}>
          <div className="section-title">{sec.title}</div>
          {sec.items && sec.items.map((item, iIdx) => (
            <div key={iIdx} className="bullet">
              <span style={{ position: 'absolute', left: '4px', fontSize: '10px' }}>•</span>
              {item}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const ResumePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [resume, setResume] = useState(location.state?.resume || null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        if (!location.state?.resume) {
          const res = await axios.get(`${API_BASE}/${id}`);
          console.log('Resume data:', res.data);
          setResume(res.data.data);
        }
      } catch (err) { 
        console.error('Error fetching resume:', err);
      }
    };
    fetchResume();
  }, [id, location.state?.resume]);

  const handleExportLatex = () => {
    if (!resume) return;
    const latexString = generateLatex(resume);
    const blob = new Blob([latexString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(resume.name || 'resume').replace(/\s+/g, '_')}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!resume) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const p = resume.personal_info || {};
  const education = resume.education || [];
  const coursework = resume.coursework || [];
  const projects = resume.projects || [];
  const experience = resume.experience || [];
  const ts = resume.technical_skills || {};
  const skills = resume.skills || [];
  const extracurriculars = resume.extracurriculars || [];
  const certifications = resume.certifications || [];

  const hasSkills = (ts.languages?.length > 0) || (ts.frameworks?.length > 0) || (ts.databases?.length > 0) || (ts.developer_tools?.length > 0) || (ts.platforms?.length > 0) || (ts.other?.length > 0) || skills.length > 0;

  // Preview styles
  const sectionTitleStyle = { color: '#0F4539', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1.5px solid #0E5484', paddingBottom: '3px', marginTop: '14px', marginBottom: '8px', letterSpacing: '0.05em' };
  const subheadingStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '2px' };
  const bulletStyle = { fontSize: '12px', color: '#333', marginBottom: '2px', paddingLeft: '14px', position: 'relative', lineHeight: '1.4' };

  return (
    <div className="animate-fade-in">
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Resume Preview</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Review your resume before exporting.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate(`/resume/${id}/edit`)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Edit3 size={16} /> Edit
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleExportLatex}>
            <Code size={16} /> Export LaTeX
          </button>
          <button className="primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {/* A4 Paper Preview */}
        <ResumePreviewContent resume={resume} />
      </div>

      {/* Print styles */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          .no-print, .navbar { display: none !important; }
          .print-area { box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; min-height: auto !important; }
          body { background: white !important; }
          .app-container, .main-content { padding: 0 !important; margin: 0 !important; max-width: none !important; }
        }
      `}</style>
    </div>
  );
};

export { ResumePreviewContent };
export default ResumePreview;
