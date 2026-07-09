import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Plus, Edit3, Trash2, Download, Eye, FileText, CheckCircle2, Code, User, GraduationCap, BookOpen, FolderGit2, Briefcase, Wrench, Award, Trophy, ChevronLeft, ChevronRight, X, ExternalLink, Sparkles, Move, Wand2, UploadCloud } from 'lucide-react';
import axios from 'axios';
import { API_BASE, useDebounce, DynamicListSection, BulletListEditor, TagInput, ProgressStepper } from './ResumeShared';
import { ResumePreviewContent } from './ResumePreview';

const STEPS = [
  { id: 'personal',        label: 'Personal Info',    icon: <User /> },
  { id: 'education',       label: 'Education',        icon: <GraduationCap /> },
  { id: 'coursework',      label: 'Coursework',       icon: <BookOpen /> },
  { id: 'projects',        label: 'Projects',         icon: <FolderGit2 /> },
  { id: 'experience',      label: 'Experience',       icon: <Briefcase /> },
  { id: 'skills',          label: 'Technical Skills', icon: <Wrench /> },
  { id: 'extracurricular', label: 'Extracurricular',  icon: <Trophy /> },
  { id: 'certifications',  label: 'Certifications',   icon: <Award /> },
  { id: 'custom',          label: 'Custom Sections',  icon: <Plus /> },
  { id: 'review',          label: 'Review & Export',  icon: <Eye /> },
];

const ResumeEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [resume, setResume] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const debouncedResume = useDebounce(resume, 1500);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (initialLoadRef.current) {
      if (resume) initialLoadRef.current = false;
      return;
    }
    if (debouncedResume) {
      handleSaveDebounced(debouncedResume);
    }
  }, [debouncedResume]);

  const handleSaveDebounced = async (resumeData) => {
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/${id}`, resumeData);
      setSaveMsg('✓ Auto-saved');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      console.error('Auto-save error:', err);
      setSaveMsg(`Save failed`);
    } finally { setSaving(false); }
  };

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await axios.get(`${API_BASE}/${id}`);
        const data = res.data.data;
        // Ensure all arrays/objects exist
        if (!data.personal_info) data.personal_info = {};
        if (!data.education) data.education = [];
        if (!data.experience) data.experience = [];
        if (!data.projects) data.projects = [];
        if (!data.skills) data.skills = [];
        if (!data.coursework) data.coursework = [];
        if (!data.certifications) data.certifications = [];
        if (!data.extracurriculars) data.extracurriculars = [];
        if (!data.technical_skills) data.technical_skills = { languages: [], frameworks: [], databases: [], developer_tools: [], platforms: [], other: [] };
        setResume(data);
      } catch (err) { console.error(err); }
    };
    fetchResume();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      console.log('Saving resume:', resume);
      const response = await axios.put(`${API_BASE}/${id}`, resume);
      console.log('Save response:', response.data);
      setSaveMsg('✓ Saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
      return true;
    } catch (err) {
      console.error('Save error:', err);
      setSaveMsg(`Failed to save: ${err.response?.data?.error || err.message}`);
      return false;
    } finally { setSaving(false); }
  };

  const updatePersonal = (field, value) => setResume({ ...resume, personal_info: { ...resume.personal_info, [field]: value } });
  const updateTechSkills = (field, value) => setResume({ ...resume, technical_skills: { ...resume.technical_skills, [field]: value } });

  // Dynamic list helpers
  const addItem = (key, template) => setResume({ ...resume, [key]: [...(resume[key] || []), template] });
  const removeItem = (key, idx) => setResume({ ...resume, [key]: resume[key].filter((_, i) => i !== idx) });
  const updateItem = (key, idx, field, value) => {
    const items = [...resume[key]];
    items[idx] = { ...items[idx], [field]: value };
    setResume({ ...resume, [key]: items });
  };
  const reorderItem = (key, oldIdx, newIdx) => {
    const arr = [...(resume[key] || [])];
    const [moved] = arr.splice(oldIdx, 1);
    arr.splice(newIdx, 0, moved);
    setResume({ ...resume, [key]: arr });
  };

  const getCompletionMap = useCallback(() => {
    if (!resume) return {};
    const p = resume.personal_info || {};
    return {
      0: !!(p.full_name && p.email && p.phone),
      1: (resume.education || []).length > 0,
      2: (resume.coursework || []).length > 0,
      3: (resume.projects || []).length > 0,
      4: (resume.experience || []).length > 0,
      5: !!((resume.technical_skills?.languages?.length > 0) || (resume.skills?.length > 0)),
      6: (resume.extracurriculars || []).length > 0,
      7: (resume.certifications || []).length > 0,
      8: true,
    };
  }, [resume]);

  if (!resume) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const completionMap = getCompletionMap();

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      // ──── Step 1: Personal Info ────
      case 'personal':
        return (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '4px' }}>Personal Information</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Your contact details for the resume header.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label>Full Name *</label><input type="text" placeholder="John Doe" value={resume.personal_info.full_name || ''} onChange={e => updatePersonal('full_name', e.target.value)} /></div>
              <div><label>Phone Number *</label><input type="tel" placeholder="+91-9999999999" value={resume.personal_info.phone || ''} onChange={e => updatePersonal('phone', e.target.value)} /></div>
              <div><label>Email Address *</label><input type="email" placeholder="john@example.com" value={resume.personal_info.email || ''} onChange={e => updatePersonal('email', e.target.value)} /></div>
              <div><label>City & State</label><input type="text" placeholder="Mumbai, Maharashtra" value={resume.personal_info.location || ''} onChange={e => updatePersonal('location', e.target.value)} /></div>
              <div><label>LinkedIn URL</label><input type="url" placeholder="https://linkedin.com/in/johndoe" value={resume.personal_info.linkedin || ''} onChange={e => updatePersonal('linkedin', e.target.value)} /></div>
              <div><label>GitHub URL</label><input type="url" placeholder="https://github.com/johndoe" value={resume.personal_info.github || ''} onChange={e => updatePersonal('github', e.target.value)} /></div>
              <div><label>Portfolio / Website</label><input type="url" placeholder="https://johndoe.dev" value={resume.personal_info.portfolio || ''} onChange={e => updatePersonal('portfolio', e.target.value)} /></div>
              <div><label>HackerRank URL</label><input type="url" placeholder="https://hackerrank.com/johndoe" value={resume.personal_info.hackerrank || ''} onChange={e => updatePersonal('hackerrank', e.target.value)} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label>Codeforces URL</label><input type="url" placeholder="https://codeforces.com/profile/johndoe" value={resume.personal_info.codeforces || ''} onChange={e => updatePersonal('codeforces', e.target.value)} /></div>
            </div>
          </div>
        );

      // ──── Step 2: Education ────
      case 'education':
        return (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '4px' }}>Education</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Add your educational qualifications in reverse chronological order.</p>
            <DynamicListSection
              items={resume.education}
              onAdd={() => addItem('education', { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', score: '', score_type: 'CGPA', location: '' })}
              onRemove={(idx) => removeItem('education', idx)}
              onUpdate={(idx, field, val) => updateItem('education', idx, field, val)}
              onReorder={(oldIdx, newIdx) => reorderItem('education', oldIdx, newIdx)}
              addLabel="Add Education"
              emptyLabel="No education entries yet. Add your first one!"
              renderItem={(item, idx, update) => (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ gridColumn: '1 / -1' }}><label>Institution Name</label><input type="text" placeholder="IIT Bombay" value={item.institution} onChange={e => update('institution', e.target.value)} style={{ marginBottom: 0 }} /></div>
                  <div><label>Degree / Course</label><input type="text" placeholder="B.Tech" value={item.degree} onChange={e => update('degree', e.target.value)} style={{ marginBottom: 0 }} /></div>
                  <div><label>Specialization</label><input type="text" placeholder="Computer Science" value={item.field_of_study} onChange={e => update('field_of_study', e.target.value)} style={{ marginBottom: 0 }} /></div>
                  <div><label>Score Type</label>
                    <select value={item.score_type || 'CGPA'} onChange={e => update('score_type', e.target.value)} style={{ marginBottom: 0 }}>
                      <option value="CGPA">CGPA</option>
                      <option value="Percentage">Percentage</option>
                    </select>
                  </div>
                  <div><label>Score</label><input type="text" placeholder={item.score_type === 'Percentage' ? '92%' : '9.2'} value={item.score} onChange={e => update('score', e.target.value)} style={{ marginBottom: 0 }} /></div>
                  <div><label>Start Date</label><input type="text" placeholder="08 2020" value={item.start_date} onChange={e => update('start_date', e.target.value)} style={{ marginBottom: 0 }} /></div>
                  <div><label>End Date</label><input type="text" placeholder="05 2024" value={item.end_date} onChange={e => update('end_date', e.target.value)} style={{ marginBottom: 0 }} /></div>
                  <div style={{ gridColumn: '1 / -1' }}><label>Location</label><input type="text" placeholder="Mumbai, India" value={item.location || ''} onChange={e => update('location', e.target.value)} style={{ marginBottom: 0 }} /></div>
                </div>
              )}
            />
          </div>
        );

      // ──── Step 3: Coursework ────
      case 'coursework':
        return (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '4px' }}>Relevant Coursework / Skills</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Add relevant subjects and domains. Press Enter or comma to add each item.</p>
            <label>Coursework Subjects</label>
            <TagInput
              tags={resume.coursework || []}
              onChange={(val) => setResume({ ...resume, coursework: val })}
              placeholder="Type a subject and press Enter..."
            />
            <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Data Structures & Algorithms', 'Operating Systems', 'Database Management', 'Computer Networks', 'Artificial Intelligence', 'Machine Learning', 'Web Development', 'OOP Concepts', 'Software Engineering', 'Discrete Mathematics'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => {
                    if (!(resume.coursework || []).includes(suggestion)) {
                      setResume({ ...resume, coursework: [...(resume.coursework || []), suggestion] });
                    }
                  }}
                  style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', background: (resume.coursework || []).includes(suggestion) ? 'rgba(16,185,129,0.15)' : 'var(--bg-tertiary)', color: (resume.coursework || []).includes(suggestion) ? 'var(--success)' : 'var(--text-secondary)', border: (resume.coursework || []).includes(suggestion) ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {(resume.coursework || []).includes(suggestion) ? '✓ ' : '+ '}{suggestion}
                </button>
              ))}
            </div>
          </div>
        );

      // ──── Step 4: Projects ────
      case 'projects':
        return (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '4px' }}>Projects</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Showcase your best projects with measurable impact and strong action verbs.</p>
            <DynamicListSection
              items={resume.projects}
              onAdd={() => addItem('projects', { name: '', technologies: [], description: [], link: '', live_link: '', duration: '' })}
              onRemove={(idx) => removeItem('projects', idx)}
              onUpdate={(idx, field, val) => updateItem('projects', idx, field, val)}
              onReorder={(oldIdx, newIdx) => reorderItem('projects', oldIdx, newIdx)}
              addLabel="Add Project"
              emptyLabel="No projects added yet."
              renderItem={(item, idx, update) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div><label>Project Name</label><input type="text" placeholder="E-commerce Platform" value={item.name} onChange={e => update('name', e.target.value)} style={{ marginBottom: 0 }} /></div>
                    <div><label>Duration</label><input type="text" placeholder="06 2023" value={item.duration} onChange={e => update('duration', e.target.value)} style={{ marginBottom: 0 }} /></div>
                    <div><label>GitHub / Source Link</label><input type="url" placeholder="https://github.com/..." value={item.link || ''} onChange={e => update('link', e.target.value)} style={{ marginBottom: 0 }} /></div>
                    <div><label>Live Demo Link</label><input type="url" placeholder="https://myproject.com" value={item.live_link || ''} onChange={e => update('live_link', e.target.value)} style={{ marginBottom: 0 }} /></div>
                  </div>
                  <div>
                    <label>Technologies Used</label>
                    <TagInput tags={item.technologies || []} onChange={(val) => update('technologies', val)} placeholder="React, Node.js, MongoDB..." />
                  </div>
                  <div>
                    <label>Description Bullets</label>
                    <BulletListEditor items={item.description || []} onChange={(val) => update('description', val)} placeholder="Engineered a full-stack web app serving 500+ users..." />
                  </div>
                </div>
              )}
            />
          </div>
        );

      // ──── Step 5: Experience ────
      case 'experience':
        return (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '4px' }}>Internship / Work Experience</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Add your work experience with achievement-based bullet points.</p>
            <DynamicListSection
              items={resume.experience}
              onAdd={() => addItem('experience', { company: '', title: '', location: '', start_date: '', end_date: '', description: [], certificate_link: '' })}
              onRemove={(idx) => removeItem('experience', idx)}
              onUpdate={(idx, field, val) => updateItem('experience', idx, field, val)}
              onReorder={(oldIdx, newIdx) => reorderItem('experience', oldIdx, newIdx)}
              addLabel="Add Experience"
              emptyLabel="No experience entries yet."
              renderItem={(item, idx, update) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div><label>Company Name</label><input type="text" placeholder="Google" value={item.company} onChange={e => update('company', e.target.value)} style={{ marginBottom: 0 }} /></div>
                    <div><label>Role / Position</label><input type="text" placeholder="Software Engineering Intern" value={item.title} onChange={e => update('title', e.target.value)} style={{ marginBottom: 0 }} /></div>
                    <div><label>Start Date</label><input type="text" placeholder="05 2023" value={item.start_date} onChange={e => update('start_date', e.target.value)} style={{ marginBottom: 0 }} /></div>
                    <div><label>End Date</label><input type="text" placeholder="08 2023" value={item.end_date} onChange={e => update('end_date', e.target.value)} style={{ marginBottom: 0 }} /></div>
                    <div><label>Location</label><input type="text" placeholder="Bangalore, India" value={item.location || ''} onChange={e => update('location', e.target.value)} style={{ marginBottom: 0 }} /></div>
                    <div><label>Certificate Link</label><input type="url" placeholder="https://..." value={item.certificate_link || ''} onChange={e => update('certificate_link', e.target.value)} style={{ marginBottom: 0 }} /></div>
                  </div>
                  <div>
                    <label>Responsibilities & Achievements</label>
                    <BulletListEditor items={item.description || []} onChange={(val) => update('description', val)} placeholder="Developed a microservice reducing latency by 40%..." />
                  </div>
                </div>
              )}
            />
          </div>
        );

      // ──── Step 6: Technical Skills ────
      case 'skills':
        return (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '4px' }}>Technical Skills</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Categorize your technical skills. Press Enter or comma to add each skill.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div><label>Programming Languages</label><TagInput tags={resume.technical_skills?.languages || []} onChange={(val) => updateTechSkills('languages', val)} placeholder="Python, Java, C++, JavaScript..." /></div>
              <div><label>Frameworks / Libraries</label><TagInput tags={resume.technical_skills?.frameworks || []} onChange={(val) => updateTechSkills('frameworks', val)} placeholder="React, Node.js, Django, Flutter..." /></div>
              <div><label>Databases</label><TagInput tags={resume.technical_skills?.databases || []} onChange={(val) => updateTechSkills('databases', val)} placeholder="MongoDB, PostgreSQL, MySQL..." /></div>
              <div><label>Developer Tools</label><TagInput tags={resume.technical_skills?.developer_tools || []} onChange={(val) => updateTechSkills('developer_tools', val)} placeholder="VS Code, Git, Docker, Postman..." /></div>
              <div><label>Platforms / Cloud</label><TagInput tags={resume.technical_skills?.platforms || []} onChange={(val) => updateTechSkills('platforms', val)} placeholder="AWS, GCP, Linux, Heroku..." /></div>
              <div><label>Other Technologies</label><TagInput tags={resume.technical_skills?.other || []} onChange={(val) => updateTechSkills('other', val)} placeholder="REST APIs, GraphQL, CI/CD..." /></div>
            </div>
          </div>
        );

      // ──── Step 7: Extracurricular ────
      case 'extracurricular':
        return (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '4px' }}>Extracurricular Activities</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Add clubs, organizations, volunteering, and leadership roles.</p>
            <DynamicListSection
              items={resume.extracurriculars}
              onAdd={() => addItem('extracurriculars', { organization: '', role: '', start_date: '', end_date: '', location: '', description: [], certificate_link: '' })}
              onRemove={(idx) => removeItem('extracurriculars', idx)}
              onUpdate={(idx, field, val) => updateItem('extracurriculars', idx, field, val)}
              onReorder={(oldIdx, newIdx) => reorderItem('extracurriculars', oldIdx, newIdx)}
              addLabel="Add Activity"
              emptyLabel="No extracurricular activities yet."
              renderItem={(item, idx, update) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div><label>Organization Name</label><input type="text" placeholder="Google Developer Student Club" value={item.organization} onChange={e => update('organization', e.target.value)} style={{ marginBottom: 0 }} /></div>
                    <div><label>Role</label><input type="text" placeholder="Technical Lead" value={item.role} onChange={e => update('role', e.target.value)} style={{ marginBottom: 0 }} /></div>
                    <div><label>Start Date</label><input type="text" placeholder="08 2022" value={item.start_date} onChange={e => update('start_date', e.target.value)} style={{ marginBottom: 0 }} /></div>
                    <div><label>End Date</label><input type="text" placeholder="05 2023" value={item.end_date} onChange={e => update('end_date', e.target.value)} style={{ marginBottom: 0 }} /></div>
                    <div><label>Location</label><input type="text" placeholder="Campus" value={item.location || ''} onChange={e => update('location', e.target.value)} style={{ marginBottom: 0 }} /></div>
                    <div><label>Certificate Link</label><input type="url" placeholder="https://..." value={item.certificate_link || ''} onChange={e => update('certificate_link', e.target.value)} style={{ marginBottom: 0 }} /></div>
                  </div>
                  <div>
                    <label>Description</label>
                    <BulletListEditor items={item.description || []} onChange={(val) => update('description', val)} placeholder="Led a team of 10 members..." />
                  </div>
                </div>
              )}
            />
          </div>
        );

      // ──── Step 8: Certifications ────
      case 'certifications':
        return (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '4px' }}>Certifications</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Add relevant certifications with verification links.</p>
            <DynamicListSection
              items={resume.certifications}
              onAdd={() => addItem('certifications', { name: '', issuer: '', date: '', credential_url: '' })}
              onRemove={(idx) => removeItem('certifications', idx)}
              onUpdate={(idx, field, val) => updateItem('certifications', idx, field, val)}
              onReorder={(oldIdx, newIdx) => reorderItem('certifications', oldIdx, newIdx)}
              addLabel="Add Certification"
              emptyLabel="No certifications added yet."
              renderItem={(item, idx, update) => (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div><label>Certification Name</label><input type="text" placeholder="AWS Solutions Architect" value={item.name} onChange={e => update('name', e.target.value)} style={{ marginBottom: 0 }} /></div>
                  <div><label>Platform / Provider</label><input type="text" placeholder="Amazon Web Services" value={item.issuer} onChange={e => update('issuer', e.target.value)} style={{ marginBottom: 0 }} /></div>
                  <div><label>Completion Year</label><input type="text" placeholder="2023" value={item.date} onChange={e => update('date', e.target.value)} style={{ marginBottom: 0 }} /></div>
                  <div><label>Certificate Link</label><input type="url" placeholder="https://..." value={item.credential_url || ''} onChange={e => update('credential_url', e.target.value)} style={{ marginBottom: 0 }} /></div>
                </div>
              )}
            />
          </div>
        );

      // ──── Step 9: Custom Sections ────
      case 'custom':
        return (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '4px' }}>Custom Sections</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Add specialized sections like "Publications", "Languages", or "Patents".</p>
            <DynamicListSection
              items={resume.custom_sections || []}
              onAdd={() => addItem('custom_sections', { title: '', items: [] })}
              onRemove={(idx) => removeItem('custom_sections', idx)}
              onUpdate={(idx, field, val) => updateItem('custom_sections', idx, field, val)}
              onReorder={(oldIdx, newIdx) => reorderItem('custom_sections', oldIdx, newIdx)}
              addLabel="Add Custom Section"
              emptyLabel="No custom sections added."
              renderItem={(item, idx, update) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div><label>Section Title</label><input type="text" placeholder="e.g., Languages" value={item.title} onChange={e => update('title', e.target.value)} style={{ marginBottom: 0 }} /></div>
                  <div>
                    <label>Items / Bullets</label>
                    <BulletListEditor items={item.items || []} onChange={(val) => update('items', val)} placeholder="English (Native), Spanish (Fluent)..." />
                  </div>
                </div>
              )}
            />
          </div>
        );

      // ──── Step 10: Review & Export ────
      case 'review': {
        const completedCount = Object.values(completionMap).filter(Boolean).length;
        const totalSteps = STEPS.length;
        const p = resume.personal_info || {};
        return (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '4px' }}>Review & Export</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Review your resume completeness and export.</p>

            {/* Completion overview */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: '600' }}>Completion</span>
                <span style={{ fontWeight: 'bold', color: completedCount >= 7 ? 'var(--success)' : 'var(--warning)' }}>{completedCount}/{totalSteps} sections</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(completedCount / totalSteps) * 100}%`, height: '100%', background: completedCount >= 7 ? 'var(--success)' : 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '4px', transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '16px' }}>
                {STEPS.slice(0, -1).map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: completionMap[idx] ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', fontSize: '0.85rem' }}>
                    {completionMap[idx] ? <CheckCircle2 size={14} color="var(--success)" /> : <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid var(--warning)' }} />}
                    <span style={{ color: completionMap[idx] ? 'var(--success)' : 'var(--warning)' }}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Selector */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ marginBottom: '16px' }}>Template Selection</h4>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['ATS Professional', 'Modern', 'Creative'].map(tpl => (
                  <button key={tpl} onClick={() => setResume({ ...resume, template_name: tpl })} className={resume.template_name === tpl ? 'primary' : ''} style={{ flex: 1 }}>
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick preview summary */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '16px' }}>Resume Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Name:</span> <strong>{p.full_name || '—'}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Email:</span> {p.email || '—'}</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Education:</span> {resume.education?.length || 0} entries</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Projects:</span> {resume.projects?.length || 0} entries</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Experience:</span> {resume.experience?.length || 0} entries</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Certifications:</span> {resume.certifications?.length || 0} entries</div>
              </div>
            </div>

            {/* Resume Tips */}
            <div style={{ background: 'rgba(99,102,241,0.06)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(99,102,241,0.15)', marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--accent-primary)" /> Resume Writing Tips
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {[
                  'Use strong action verbs: "Engineered", "Optimized", "Spearheaded" instead of "Worked on".',
                  'Quantify achievements with numbers: "Reduced latency by 42%", "Served 10K+ users".',
                  'Keep it to 1 page for freshers — recruiters spend ~6 seconds on initial screening.',
                  'Tailor your resume for each role — match keywords from the job description.',
                  'Proofread carefully — a single typo can lead to rejection at top companies.',
                ].map((tip, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--success)' }} />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Export buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={async () => {
                const success = await handleSave();
                if (success) {
                  navigate(`/resume/${id}/preview`, { state: { resume } });
                }
              }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}>
                <Eye size={18} /> Full Preview
              </button>
              <button className="primary" onClick={() => {
                const latexStr = generateLatex(resume);
                const blob = new Blob([latexStr], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${(resume.name || 'resume').replace(/\s+/g, '_')}.tex`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}>
                <Code size={18} /> Export LaTeX
              </button>
            </div>
          </div>
        );
      }
      default: return null;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/resume')} style={{ padding: '8px', background: 'transparent', border: 'none' }}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{resume.name}</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{resume.target_role}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {saveMsg && <span style={{ fontSize: '0.85rem', color: saveMsg.startsWith('✓') ? 'var(--success)' : 'var(--error)', fontWeight: '500' }}>{saveMsg}</span>}
          <button className="primary" onClick={handleSave} disabled={saving} style={{ padding: '10px 24px' }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '24px', overflow: 'hidden', marginTop: '8px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Progress Stepper */}
          <ProgressStepper steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} completionMap={completionMap} />

          {/* Step Content */}
          <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', marginTop: '8px' }}>
            {renderStep()}
          </div>

          {/* Navigation Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 0' }}>
            <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: currentStep === 0 ? 0.4 : 1 }}>
              <ChevronLeft size={18} /> Previous
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Step {currentStep + 1} of {STEPS.length}</span>
            <button onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))} disabled={currentStep === STEPS.length - 1} className={currentStep < STEPS.length - 1 ? 'primary' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: currentStep === STEPS.length - 1 ? 0.4 : 1 }}>
              Next <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="no-print" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
          <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center', width: '210mm' }}>
            <ResumePreviewContent resume={resume} />
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ResumeEditor;
