import React, { useState } from 'react';
import axios from 'axios';

const PracticeProblemForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy',
    acceptance: '0%',
    description: '',
    examples: [''],
    topics: [],
    likes: 0,
    dislikes: 0,
    testCases: [{ input: '', expected_output: '', is_hidden: false }]
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    if (e.target.name === 'topics') {
      const topicsArray = e.target.value.split(',').map(t => t.trim()).filter(t => t);
      setFormData({ ...formData, topics: topicsArray });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleExampleChange = (index, value) => {
    const newExamples = [...formData.examples];
    newExamples[index] = value;
    setFormData({ ...formData, examples: newExamples });
  };

  const addExample = () => {
    setFormData({ ...formData, examples: [...formData.examples, ''] });
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index][field] = value;
    setFormData({ ...formData, testCases: newTestCases });
  };

  const addTestCase = () => {
    setFormData({ ...formData, testCases: [...formData.testCases, { input: '', expected_output: '', is_hidden: false }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      // The Go backend is running on 8081 for Practice Module
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/problems`, formData);
      setStatus('Problem added successfully!');
      // Reset form
      setFormData({
        title: '',
        difficulty: 'Easy',
        acceptance: '0%',
        description: '',
        examples: [''],
        topics: [],
        likes: 0,
        dislikes: 0,
        testCases: [{ input: '', expected_output: '', is_hidden: false }]
      });
    } catch (err) {
      console.error(err);
      setStatus('Failed to add problem.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'white' }}>
      <h2>Add New Practice Problem</h2>
      
      {status && <div style={{ color: status.includes('Failed') ? 'red' : 'green' }}>{status}</div>}

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 2 }}>
          <label>Title</label>
          <input name="title" value={formData.title} onChange={handleChange} required style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label>Difficulty</label>
          <select name="difficulty" value={formData.difficulty} onChange={handleChange} style={inputStyle}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Acceptance (e.g. 55.2%)</label>
          <input name="acceptance" value={formData.acceptance} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label>Topics (comma separated)</label>
          <input name="topics" value={formData.topics.join(', ')} onChange={handleChange} placeholder="e.g. Array, Hash Table" style={inputStyle} />
        </div>
      </div>

      <div>
        <label>Description (Markdown/Text)</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required rows={6} style={inputStyle} />
      </div>

      <div>
        <label>Examples (Shown in Workspace)</label>
        {formData.examples.map((ex, i) => (
          <textarea key={i} value={ex} onChange={(e) => handleExampleChange(i, e.target.value)} rows={3} style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder={`Example ${i + 1} (Input: ... \nOutput: ...)`} />
        ))}
        <button type="button" onClick={addExample} style={btnStyle}>+ Add Example</button>
      </div>

      <div>
        <label>Test Cases (Used by Execution Engine)</label>
        {formData.testCases.map((tc, i) => (
          <div key={i} style={{ border: '1px solid #333', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
            <h4>Test Case {i + 1}</h4>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label>Input</label>
                <textarea value={tc.input} onChange={(e) => handleTestCaseChange(i, 'input', e.target.value)} required rows={2} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Expected Output</label>
                <textarea value={tc.expected_output} onChange={(e) => handleTestCaseChange(i, 'expected_output', e.target.value)} required rows={2} style={inputStyle} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={tc.is_hidden} onChange={(e) => handleTestCaseChange(i, 'is_hidden', e.target.checked)} />
              Hidden Test Case (Used for Submit only)
            </label>
          </div>
        ))}
        <button type="button" onClick={addTestCase} style={btnStyle}>+ Add Test Case</button>
      </div>

      <button type="submit" style={{ ...btnStyle, background: '#10b981', color: 'white', fontSize: '1.1rem', marginTop: '1rem', padding: '0.75rem' }}>Save Problem</button>
    </form>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  background: '#333',
  border: '1px solid #444',
  color: 'white',
  borderRadius: '4px',
  marginTop: '0.25rem'
};

const btnStyle = {
  padding: '0.5rem 1rem',
  background: '#444',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

export default PracticeProblemForm;
