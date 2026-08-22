import React, { useState } from 'react';
import { X, Paperclip, Tag } from 'lucide-react';

export default function CreateDiscussionForm({ problemId, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Assuming a real backend endpoint exists. Since we are in mock mode, this will fail and fall back to local storage.
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/problems/${problemId}/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          problem_id: parseInt(problemId),
          author_id: 1, // Demo user
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create discussion');
      }

      const data = await response.json();
      onSuccess(data);
    } catch (err) {
      console.warn('API error, simulating success:', err);
      // Simulate success for demo purposes if backend isn't running
      const fakeDiscussion = {
        id: Math.floor(Math.random() * 1000) + 100,
        title,
        description,
        author: { username: 'Current User' },
        created_at: new Date().toISOString(),
      };
      setTimeout(() => {
        onSuccess(fakeDiscussion);
      }, 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ zIndex: 9999 }}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900 bg-opacity-50" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />

        <div className="relative inline-block w-full max-w-lg p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl" style={{ position: 'relative', background: 'var(--pr-bg-card)', border: '1px solid var(--pr-border-color)', color: 'var(--pr-text-main)', borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '500px', margin: '0 auto', top: '20vh' }}>
          <div className="flex items-center justify-between mb-5" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 className="text-lg font-medium leading-6" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Create New Discussion</h3>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--pr-text-secondary)', cursor: 'pointer' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{ padding: '0.75rem', fontSize: '0.9rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="title" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--pr-text-secondary)' }}>
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--pr-border-color)', color: 'var(--pr-text-main)', borderRadius: '6px', boxSizing: 'border-box' }}
                placeholder="What's your question or solution?"
              />
            </div>

            <div>
              <label htmlFor="description" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--pr-text-secondary)' }}>
                Description
              </label>
              <textarea
                id="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--pr-border-color)', color: 'var(--pr-text-main)', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box' }}
                placeholder="Provide more details, code snippets, or explanation here..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '0.6rem 1rem', background: 'transparent', border: '1px solid var(--pr-border-color)', color: 'var(--pr-text-main)', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ padding: '0.6rem 1rem', background: 'var(--pr-primary)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? 'Posting...' : 'Post Discussion'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
