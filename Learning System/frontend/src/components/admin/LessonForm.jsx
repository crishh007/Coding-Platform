import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/client';

const LessonForm = ({ courses, onAdded }) => {
  const [topicId, setTopicId] = useState('');
  
  const defaultQuizQuestion = { question: '', option0: '', option1: '', option2: '', option3: '', answer: 0, explanation: '' };
  const defaultPracticeQuestion = { problemTitle: '', description: '', pythonCode: '', cppCode: '', javaCode: '', testInput: '', testOutput: '' };

  const [lesson, setLesson] = useState({
    title: '',
    slug: '',
    difficulty: 'Easy',
    estimatedTime: 10,
    explanation: { briefOverview: '', realWorldAnalogy: '', keySteps: [''], proTip: '' },
    visualSimulation: { type: 'none', config: '{}', pseudocode: '' },
    sandbox: { pythonCode: '', cppCode: '', javaCode: '', testInput: '', testOutput: '' },
    quizQuestions: [{ ...defaultQuizQuestion }],
    practiceQuestions: [{ ...defaultPracticeQuestion }]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topicId) return alert('Please select a topic');
    
    try {
      let parsedConfig = {};
      try { parsedConfig = JSON.parse(lesson.visualSimulation.config || '{}'); } catch(e) {}
      
      const payload = {
        title: lesson.title,
        slug: lesson.slug,
        difficulty: lesson.difficulty,
        estimatedTime: parseInt(lesson.estimatedTime),
        explanation: {
          briefOverview: lesson.explanation.briefOverview,
          realWorldAnalogy: lesson.explanation.realWorldAnalogy,
          keySteps: lesson.explanation.keySteps[0].split('\n').filter(s => s.trim() !== ''),
          proTip: lesson.explanation.proTip
        },
        visualSimulation: {
          type: lesson.visualSimulation.type,
          config: parsedConfig,
          pseudocode: lesson.visualSimulation.pseudocode.split('\n').map((text, i) => ({ line: i+1, text }))
        },
        sandbox: {
          languages: { python: lesson.sandbox.pythonCode, cpp: lesson.sandbox.cppCode, java: lesson.sandbox.javaCode },
          testCases: [{ input: lesson.sandbox.testInput, output: lesson.sandbox.testOutput }]
        },
        quiz: {
          questions: lesson.quizQuestions.map(q => ({
            question: q.question,
            options: [q.option0, q.option1, q.option2, q.option3],
            answer: parseInt(q.answer),
            explanation: q.explanation
          }))
        },
        practice: {
          questions: lesson.practiceQuestions.map((p, i) => ({
            id: `pq_${Date.now()}_${i}`,
            problemTitle: p.problemTitle,
            description: p.description,
            starterCode: { python: p.pythonCode, cpp: p.cppCode, java: p.javaCode },
            testCases: [{ input: p.testInput, output: p.testOutput }]
          }))
        }
      };

      await axios.post(`${API_BASE_URL}/admin/lessons`, { topicId, lesson: payload });
      onAdded();
      alert('Lesson added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to add lesson');
    }
  };

  const handleNestedChange = (section, field, value) => {
    if (section === 'root') {
      setLesson({ ...lesson, [field]: value });
    } else {
      setLesson({ ...lesson, [section]: { ...lesson[section], [field]: value } });
    }
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    const newArray = [...lesson[arrayName]];
    newArray[index][field] = value;
    setLesson({ ...lesson, [arrayName]: newArray });
  };

  const addArrayItem = (arrayName, defaultItem) => {
    setLesson({ ...lesson, [arrayName]: [...lesson[arrayName], { ...defaultItem }] });
  };

  const removeArrayItem = (arrayName, index) => {
    const newArray = [...lesson[arrayName]];
    newArray.splice(index, 1);
    setLesson({ ...lesson, [arrayName]: newArray });
  };

  const allTopics = courses.flatMap(c => c.children?.map(t => ({ id: t.id, title: t.title, courseTitle: c.title })) || []);

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2>Add New Lesson</h2>
      
      <div style={rowStyle}>
        <div style={{...formGroup, flex: 1}}>
          <label>Select Topic</label>
          <select value={topicId} onChange={(e) => setTopicId(e.target.value)} required style={inputStyle}>
            <option value="">-- Select a Topic --</option>
            {allTopics.map(t => <option key={t.id} value={t.id}>{t.courseTitle} - {t.title}</option>)}
          </select>
        </div>
      </div>

      <div style={rowStyle}>
        <div style={{...formGroup, flex: 1}}>
          <label>Lesson Title</label>
          <input type="text" value={lesson.title} onChange={e => handleNestedChange('root', 'title', e.target.value)} required style={inputStyle} />
        </div>
        <div style={{...formGroup, flex: 1}}>
          <label>Slug (e.g. intro-to-java)</label>
          <input type="text" value={lesson.slug} onChange={e => handleNestedChange('root', 'slug', e.target.value)} required style={inputStyle} />
        </div>
      </div>

      <div style={rowStyle}>
        <div style={{...formGroup, flex: 1}}>
          <label>Difficulty</label>
          <select value={lesson.difficulty} onChange={e => handleNestedChange('root', 'difficulty', e.target.value)} style={inputStyle}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div style={{...formGroup, flex: 1}}>
          <label>Estimated Time (mins)</label>
          <input type="number" value={lesson.estimatedTime} onChange={e => handleNestedChange('root', 'estimatedTime', e.target.value)} style={inputStyle} />
        </div>
      </div>

      <h3 style={sectionHeader}>1. Explanation Details</h3>
      <div style={formGroup}>
        <label>Brief Overview</label>
        <textarea value={lesson.explanation.briefOverview} onChange={e => handleNestedChange('explanation', 'briefOverview', e.target.value)} style={textareaStyle} />
      </div>
      <div style={formGroup}>
        <label>Real World Analogy</label>
        <textarea value={lesson.explanation.realWorldAnalogy} onChange={e => handleNestedChange('explanation', 'realWorldAnalogy', e.target.value)} style={textareaStyle} />
      </div>
      <div style={formGroup}>
        <label>Key Steps (One per line)</label>
        <textarea value={lesson.explanation.keySteps[0]} onChange={e => handleNestedChange('explanation', 'keySteps', [e.target.value])} style={textareaStyle} placeholder="Step 1...\nStep 2..." />
      </div>
      <div style={formGroup}>
        <label>Pro Tip</label>
        <input type="text" value={lesson.explanation.proTip} onChange={e => handleNestedChange('explanation', 'proTip', e.target.value)} style={inputStyle} />
      </div>

      <h3 style={sectionHeader}>2. Visual Simulation</h3>
      <div style={rowStyle}>
        <div style={{...formGroup, flex: 1}}>
          <label>Simulation Type (e.g., binary-search, array, none)</label>
          <input type="text" value={lesson.visualSimulation.type} onChange={e => handleNestedChange('visualSimulation', 'type', e.target.value)} style={inputStyle} />
        </div>
        <div style={{...formGroup, flex: 1}}>
          <label>Config (JSON format)</label>
          <input type="text" value={lesson.visualSimulation.config} onChange={e => handleNestedChange('visualSimulation', 'config', e.target.value)} style={inputStyle} placeholder='{"array": [1,2,3]}' />
        </div>
      </div>
      <div style={formGroup}>
        <label>Pseudocode (One line of code per line)</label>
        <textarea value={lesson.visualSimulation.pseudocode} onChange={e => handleNestedChange('visualSimulation', 'pseudocode', e.target.value)} style={textareaStyle} />
      </div>

      <h3 style={sectionHeader}>3. Sandbox (Main Coding Area)</h3>
      <div style={rowStyle}>
        <div style={{...formGroup, flex: 1}}>
          <label>Python Starter Code</label>
          <textarea value={lesson.sandbox.pythonCode} onChange={e => handleNestedChange('sandbox', 'pythonCode', e.target.value)} style={textareaStyle} />
        </div>
        <div style={{...formGroup, flex: 1}}>
          <label>Java Starter Code</label>
          <textarea value={lesson.sandbox.javaCode} onChange={e => handleNestedChange('sandbox', 'javaCode', e.target.value)} style={textareaStyle} />
        </div>
      </div>
      <div style={rowStyle}>
        <div style={{...formGroup, flex: 1}}>
          <label>Test Case Input</label>
          <input type="text" value={lesson.sandbox.testInput} onChange={e => handleNestedChange('sandbox', 'testInput', e.target.value)} style={inputStyle} />
        </div>
        <div style={{...formGroup, flex: 1}}>
          <label>Test Case Output</label>
          <input type="text" value={lesson.sandbox.testOutput} onChange={e => handleNestedChange('sandbox', 'testOutput', e.target.value)} style={inputStyle} />
        </div>
      </div>

      <h3 style={sectionHeader}>4. Quiz Section</h3>
      {lesson.quizQuestions.map((q, index) => (
        <div key={index} style={itemCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h4>Question {index + 1}</h4>
            {lesson.quizQuestions.length > 1 && (
              <button type="button" onClick={() => removeArrayItem('quizQuestions', index)} style={deleteBtnStyle}>Delete</button>
            )}
          </div>
          <div style={formGroup}>
            <label>Question Text</label>
            <input type="text" value={q.question} onChange={e => handleArrayChange('quizQuestions', index, 'question', e.target.value)} style={inputStyle} />
          </div>
          <div style={rowStyle}>
            <div style={{...formGroup, flex: 1}}>
              <label>Option 1 (Index 0)</label>
              <input type="text" value={q.option0} onChange={e => handleArrayChange('quizQuestions', index, 'option0', e.target.value)} style={inputStyle} />
            </div>
            <div style={{...formGroup, flex: 1}}>
              <label>Option 2 (Index 1)</label>
              <input type="text" value={q.option1} onChange={e => handleArrayChange('quizQuestions', index, 'option1', e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={rowStyle}>
            <div style={{...formGroup, flex: 1}}>
              <label>Option 3 (Index 2)</label>
              <input type="text" value={q.option2} onChange={e => handleArrayChange('quizQuestions', index, 'option2', e.target.value)} style={inputStyle} />
            </div>
            <div style={{...formGroup, flex: 1}}>
              <label>Option 4 (Index 3)</label>
              <input type="text" value={q.option3} onChange={e => handleArrayChange('quizQuestions', index, 'option3', e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={rowStyle}>
            <div style={{...formGroup, flex: 1}}>
              <label>Correct Answer Index (0-3)</label>
              <input type="number" min="0" max="3" value={q.answer} onChange={e => handleArrayChange('quizQuestions', index, 'answer', e.target.value)} style={inputStyle} />
            </div>
            <div style={{...formGroup, flex: 1}}>
              <label>Explanation</label>
              <input type="text" value={q.explanation} onChange={e => handleArrayChange('quizQuestions', index, 'explanation', e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => addArrayItem('quizQuestions', defaultQuizQuestion)} style={addBtnStyle}>+ Add Another Question</button>

      <h3 style={sectionHeader}>5. Practice Section</h3>
      {lesson.practiceQuestions.map((p, index) => (
        <div key={index} style={itemCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h4>Practice Problem {index + 1}</h4>
            {lesson.practiceQuestions.length > 1 && (
              <button type="button" onClick={() => removeArrayItem('practiceQuestions', index)} style={deleteBtnStyle}>Delete</button>
            )}
          </div>
          <div style={formGroup}>
            <label>Problem Title</label>
            <input type="text" value={p.problemTitle} onChange={e => handleArrayChange('practiceQuestions', index, 'problemTitle', e.target.value)} style={inputStyle} />
          </div>
          <div style={formGroup}>
            <label>Problem Description</label>
            <textarea value={p.description} onChange={e => handleArrayChange('practiceQuestions', index, 'description', e.target.value)} style={textareaStyle} />
          </div>
          <div style={rowStyle}>
            <div style={{...formGroup, flex: 1}}>
              <label>Practice Python Code</label>
              <textarea value={p.pythonCode} onChange={e => handleArrayChange('practiceQuestions', index, 'pythonCode', e.target.value)} style={textareaStyle} />
            </div>
            <div style={{...formGroup, flex: 1}}>
              <label>Practice Java Code</label>
              <textarea value={p.javaCode} onChange={e => handleArrayChange('practiceQuestions', index, 'javaCode', e.target.value)} style={textareaStyle} />
            </div>
          </div>
          <div style={rowStyle}>
            <div style={{...formGroup, flex: 1}}>
              <label>Practice Test Case Input</label>
              <input type="text" value={p.testInput} onChange={e => handleArrayChange('practiceQuestions', index, 'testInput', e.target.value)} style={inputStyle} />
            </div>
            <div style={{...formGroup, flex: 1}}>
              <label>Practice Test Case Output</label>
              <input type="text" value={p.testOutput} onChange={e => handleArrayChange('practiceQuestions', index, 'testOutput', e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => addArrayItem('practiceQuestions', defaultPracticeQuestion)} style={addBtnStyle}>+ Add Another Practice Problem</button>
      
      <div style={{ marginTop: '2rem', borderTop: '2px solid #4CAF50', paddingTop: '1rem' }}>
        <button type="submit" style={btnStyle}>Save Complete Lesson</button>
      </div>
    </form>
  );
};

const formStyle = { display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '1rem' };
const formGroup = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const rowStyle = { display: 'flex', gap: '1rem', width: '100%' };
const inputStyle = { padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white', width: '100%' };
const textareaStyle = { padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white', minHeight: '80px', width: '100%', resize: 'vertical' };
const btnStyle = { padding: '0.75rem 1.5rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontSize: '1.2rem', fontWeight: 'bold' };
const addBtnStyle = { padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'fit-content', marginTop: '0.5rem' };
const deleteBtnStyle = { padding: '0.25rem 0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: 'fit-content' };
const sectionHeader = { marginTop: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #444', color: '#60a5fa' };
const itemCardStyle = { border: '1px solid #444', padding: '1rem', borderRadius: '8px', background: '#222', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '0.5rem' };

export default LessonForm;
