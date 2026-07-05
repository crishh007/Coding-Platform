import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit3, Trash2, Download, Eye, FileText, CheckCircle2, Code, User, GraduationCap, BookOpen, FolderGit2, Briefcase, Wrench, Award, Trophy, ChevronLeft, ChevronRight, X, ExternalLink, Sparkles, Move, Wand2, UploadCloud } from 'lucide-react';
import axios from 'axios';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
const API_BASE = 'http://127.0.0.1:8080/api/resumes';

const SAMPLE_RESUME = {
  name: 'Sample Resume',
  target_role: 'Software Engineer',
  template_name: 'ATS Professional',
  personal_info: {
    full_name: 'Arjun Sharma',
    phone: '+91-9876543210',
    email: 'arjun.sharma@email.com',
    location: 'Bangalore, Karnataka',
    linkedin: 'https://linkedin.com/in/arjunsharma',
    github: 'https://github.com/arjunsharma',
  },
  education: [
    {
      institution: 'Indian Institute of Technology, Bombay',
      degree: 'B.Tech',
      field_of_study: 'Computer Science & Engineering',
      start_date: '08 2020',
      end_date: '05 2024',
      score: '9.1',
      score_type: 'CGPA',
      location: 'Mumbai, India',
    },
  ],
  coursework: ['Data Structures & Algorithms', 'Operating Systems', 'Database Management', 'Computer Networks', 'Machine Learning'],
  projects: [
    {
      name: 'SmartCart — AI Shopping Assistant',
      technologies: ['React', 'Node.js', 'MongoDB', 'OpenAI API'],
      duration: '01 2024',
      link: 'https://github.com/arjunsharma/smartcart',
      description: [
        'Built a full-stack e-commerce platform serving 2,000+ active users with real-time AI product recommendations.',
        'Reduced cart abandonment by 35% by implementing personalized nudges using GPT-4 embeddings.',
        'Designed REST APIs with Node.js achieving sub-100ms latency under concurrent load of 500 requests/sec.',
      ],
    },
    {
      name: 'CodeCollab — Real-time Pair Programming IDE',
      technologies: ['WebSockets', 'React', 'Go', 'Redis'],
      duration: '09 2023',
      description: [
        'Engineered a real-time collaborative code editor supporting 50+ simultaneous users with Operational Transformation.',
        'Implemented syntax highlighting for 12 languages and optimised delta-sync reducing bandwidth usage by 60%.',
      ],
    },
  ],
  experience: [
    {
      company: 'Google',
      title: 'Software Engineering Intern',
      location: 'Hyderabad, India',
      start_date: '05 2023',
      end_date: '08 2023',
      description: [
        'Developed a microservice in Go that reduced data pipeline latency by 42%, processing 10M events/day.',
        'Contributed 3,500+ lines of production code to Google Search infrastructure reviewed by senior engineers.',
      ],
    },
  ],
  technical_skills: {
    languages: ['Python', 'JavaScript', 'Go', 'Java', 'C++'],
    frameworks: ['React', 'Node.js', 'Django', 'Express', 'Spring Boot'],
    databases: ['MongoDB', 'PostgreSQL', 'Redis', 'MySQL'],
    developer_tools: ['Git', 'Docker', 'Kubernetes', 'Postman', 'VS Code'],
    platforms: ['AWS', 'GCP', 'Linux'],
    other: ['REST APIs', 'GraphQL', 'CI/CD', 'Agile/Scrum'],
  },
  certifications: [
    { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', credential_url: '#' },
    { name: 'Google Cloud Professional', issuer: 'Google', credential_url: '#' },
  ],
  extracurriculars: [
    {
      organization: 'Google Developer Student Club, IIT Bombay',
      role: 'Technical Lead',
      start_date: '08 2022',
      end_date: '05 2023',
      location: 'Campus',
      description: ['Led a team of 12 developers to build 4 open-source tools used by 500+ students across the campus.'],
    },
  ],
  custom_sections: [],
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const SortableItem = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, marginBottom: '20px' };
  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} style={{ position: 'absolute', top: '12px', left: '12px', cursor: 'grab', color: 'var(--text-tertiary)' }} title="Drag to reorder">
        <Move size={16} />
      </div>
      {children}
    </div>
  );
};

// ─── Reusable Dynamic List Item ───────────────────────────────
const DynamicListSection = ({ items, onAdd, onRemove, onUpdate, onReorder, renderItem, addLabel, emptyLabel }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = items.findIndex((_, idx) => `item-${idx}` === active.id);
      const newIndex = items.findIndex((_, idx) => `item-${idx}` === over.id);
      if (onReorder) onReorder(oldIndex, newIndex);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)', borderRadius: '16px', border: '2px dashed var(--border-color)' }}>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>{emptyLabel}</p>
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((_, idx) => `item-${idx}`)} strategy={verticalListSortingStrategy}>
          {items.map((item, idx) => (
            <SortableItem key={`item-${idx}`} id={`item-${idx}`}>
              <div style={{ position: 'relative', background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px 24px 24px 40px', border: '1px solid var(--border-color)', transition: 'border-color 0.3s' }}>
                <button
                  onClick={() => onRemove(idx)}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '6px', color: 'var(--error)', cursor: 'pointer' }}
                  title="Remove"
                >
                  <X size={14} />
                </button>
                {renderItem(item, idx, (field, value) => onUpdate(idx, field, value))}
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      <button
        onClick={onAdd}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '12px', border: '2px dashed var(--accent-primary)', background: 'transparent', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500', transition: 'all 0.3s' }}
      >
        <Plus size={18} /> {addLabel}
      </button>
    </div>
  );
};

// ─── Bullet List Editor ───────────────────────────────────────
const BulletListEditor = ({ items = [], onChange, placeholder }) => {
  const [enhancing, setEnhancing] = useState(null);

  const addBullet = () => onChange([...items, '']);
  const removeBullet = (idx) => onChange(items.filter((_, i) => i !== idx));
  const updateBullet = (idx, val) => { const copy = [...items]; copy[idx] = val; onChange(copy); };

  const enhanceBullet = async (idx) => {
    if (!items[idx]) return;
    setEnhancing(idx);
    try {
      const res = await axios.post(`${API_BASE}/enhance-bullet`, { text: items[idx] });
      updateBullet(idx, res.data.enhanced_text);
    } catch (err) {
      console.error(err);
      alert('Failed to enhance bullet.');
    } finally {
      setEnhancing(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '0.8rem' }}>•</span>
          <input
            type="text"
            value={item}
            onChange={e => updateBullet(idx, e.target.value)}
            placeholder={placeholder || `Bullet point ${idx + 1}`}
            style={{ flex: 1, marginBottom: 0 }}
          />
          <button onClick={() => enhanceBullet(idx)} title="Enhance with AI" disabled={enhancing === idx} style={{ background: 'transparent', border: 'none', padding: '4px', color: 'var(--accent-secondary)', cursor: 'pointer', minWidth: 'auto' }}>
            {enhancing === idx ? <div style={{width:'14px',height:'14px',border:'2px solid var(--accent-secondary)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/> : <Wand2 size={14} />}
          </button>
          <button onClick={() => removeBullet(idx)} title="Remove" style={{ background: 'transparent', border: 'none', padding: '4px', color: 'var(--error)', cursor: 'pointer', minWidth: 'auto' }}>
            <X size={14} />
          </button>
        </div>
      ))}
      <button onClick={addBullet} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', padding: '4px 8px', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
        + Add bullet point
      </button>
    </div>
  );
};

// ─── Tag Input ────────────────────────────────────────────────
const TagInput = ({ tags = [], onChange, placeholder }) => {
  const [inputVal, setInputVal] = useState('');
  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && inputVal.trim()) {
      e.preventDefault();
      if (!tags.includes(inputVal.trim())) {
        onChange([...tags, inputVal.trim()]);
      }
      setInputVal('');
    } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', minHeight: '48px', alignItems: 'center', transition: 'border-color 0.3s' }}
      onClick={() => document.getElementById(placeholder)?.focus()}
    >
      {tags.map((tag, idx) => (
        <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '8px', background: 'var(--accent-primary)', color: 'white', fontSize: '0.82rem', fontWeight: '500' }}>
          {tag}
          <button onClick={(e) => { e.stopPropagation(); onChange(tags.filter((_, i) => i !== idx)); }} style={{ background: 'transparent', border: 'none', padding: '0 2px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1 }}>×</button>
        </span>
      ))}
      <input
        id={placeholder}
        type="text"
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        style={{ flex: 1, minWidth: '120px', border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', padding: '4px', fontSize: '0.9rem', marginBottom: 0 }}
      />
    </div>
  );
};

// ─── Progress Stepper ─────────────────────────────────────────
const ProgressStepper = ({ steps, currentStep, onStepClick, completionMap }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '16px 0', overflowX: 'auto' }}>
    {steps.map((step, idx) => {
      const isActive = idx === currentStep;
      const isCompleted = completionMap[idx];
      return (
        <React.Fragment key={idx}>
          <button
            onClick={() => onStepClick(idx)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: isActive ? '600' : '400', transition: 'all 0.3s',
              background: isActive ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : isCompleted ? 'rgba(16,185,129,0.1)' : 'var(--bg-secondary)',
              color: isActive ? 'white' : isCompleted ? 'var(--success)' : 'var(--text-secondary)',
              border: isActive ? 'none' : isCompleted ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border-color)',
              boxShadow: isActive ? '0 4px 15px var(--accent-glow)' : 'none',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {isCompleted && !isActive ? <CheckCircle2 size={14} /> : React.cloneElement(step.icon, { size: 14 })}
            <span style={{ display: isActive ? 'inline' : 'none' }}>{step.label}</span>
            {!isActive && <span>{idx + 1}</span>}
          </button>
          {idx < steps.length - 1 && <div style={{ width: '20px', height: '2px', background: isCompleted ? 'var(--success)' : 'var(--border-color)', borderRadius: '1px', flexShrink: 0 }} />}
        </React.Fragment>
      );
    })}
  </div>
);

export { SAMPLE_RESUME, useDebounce, SortableItem, DynamicListSection, BulletListEditor, TagInput, ProgressStepper, API_BASE };
