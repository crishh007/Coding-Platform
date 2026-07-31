import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Reply, ArrowLeft, PlusCircle, User, Trash2 } from 'lucide-react';
import CreateDiscussionForm from './CreateDiscussionForm';

export default function ProblemDiscussion({ problemId }) {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeThread, setActiveThread] = useState(null);
  
  // Fetch discussions for this specific problem
  const fetchDiscussions = () => {
    setLoading(true);
    // Real API would be: fetch(`/api/problems/${problemId}/discussions`)
    // Mock logic using local storage specifically for this problem ID
    const stored = localStorage.getItem(`mock_discussions_problem_${problemId}`);
    if (stored) {
      setDiscussions(JSON.parse(stored));
    } else {
      setDiscussions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDiscussions();
  }, [problemId]);

  const handleDiscussionCreated = (newDiscussion) => {
    setIsModalOpen(false);
    if (newDiscussion) {
      setDiscussions(prev => {
        const updated = [{...newDiscussion, comments: []}, ...prev];
        localStorage.setItem(`mock_discussions_problem_${problemId}`, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleDeleteDiscussion = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this discussion?")) {
      setDiscussions(prev => {
        const updated = prev.filter(d => d.id !== id);
        localStorage.setItem(`mock_discussions_problem_${problemId}`, JSON.stringify(updated));
        return updated;
      });
      if (activeThread && activeThread.id === id) {
        setActiveThread(null);
      }
    }
  };

  // Internal component to render Thread Details
  const renderThread = () => {
    return (
      <div style={{ padding: '1rem', color: 'var(--pr-text-main)' }}>
        <button 
          onClick={() => setActiveThread(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: 'none', color: 'var(--pr-text-secondary)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={16} /> Back to all discussions
        </button>

        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{activeThread.title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pr-text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          <User size={14} /> <span>{activeThread.author?.username || 'User'}</span>
          <span>•</span>
          <span>{new Date(activeThread.created_at).toLocaleDateString()}</span>
        </div>

        <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--pr-border-color)', marginBottom: '2rem', lineHeight: '1.6' }}>
          {activeThread.description}
        </div>

        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--pr-border-color)', paddingBottom: '0.5rem' }}>Replies</h3>
        
        {(!activeThread.comments || activeThread.comments.length === 0) ? (
          <p style={{ color: 'var(--pr-text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>No replies yet. Be the first to reply!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeThread.comments.map((comment, idx) => (
              <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--pr-text-secondary)', marginBottom: '0.4rem' }}>{comment.author?.username || 'User'}</div>
                <div style={{ fontSize: '0.95rem' }}>{comment.content}</div>
              </div>
            ))}
          </div>
        )}

        {/* Reply Box placeholder */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <input type="text" placeholder="Write a reply..." style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--pr-border-color)', color: 'var(--pr-text-main)', borderRadius: '6px' }} />
          <button style={{ padding: '0 1rem', background: 'var(--pr-primary)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Reply</button>
        </div>
      </div>
    );
  };

  if (activeThread) {
    return renderThread();
  }

  return (
    <div style={{ padding: '1rem', color: 'var(--pr-text-main)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Problem Discussions</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'var(--pr-primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
        >
          <PlusCircle size={16} /> New Topic
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--pr-text-secondary)', textAlign: 'center', padding: '2rem' }}>Loading discussions...</div>
      ) : discussions.length === 0 ? (
        <div style={{ color: 'var(--pr-text-secondary)', textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--pr-border-color)' }}>
          <MessageSquare size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <p>No discussions found for this problem.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Start a new topic to ask for help or share your solution!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {discussions.map(disc => (
            <div 
              key={disc.id} 
              onClick={() => setActiveThread(disc)}
              style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--pr-border-color)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--pr-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--pr-border-color)'}
            >
              <div>
                <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', fontWeight: 500 }}>{disc.title}</h3>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--pr-text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={12} /> {disc.author?.username || 'User'}</span>
                  <span>{new Date(disc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--pr-text-secondary)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Reply size={14} /> {(disc.comments || []).length}
                </div>
                <button 
                  onClick={(e) => handleDeleteDiscussion(e, disc.id)}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center', opacity: 0.8 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.8}
                  title="Delete topic"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateDiscussionForm 
          problemId={problemId} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleDiscussionCreated} 
        />
      )}
    </div>
  );
}
