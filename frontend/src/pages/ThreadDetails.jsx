import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ThumbsUp, Reply, Share2, MoreHorizontal } from 'lucide-react';

export default function ThreadDetails() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load comments for this thread
    const storedComments = localStorage.getItem(`mock_comments_${threadId}`);
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    }
  }, [threadId]);

  useEffect(() => {
    // In a real app, fetch from /api/discussions/:threadId
    // For this mock demo, we'll try to find it in localStorage across all categories
    // or just show a default thread if not found.
    setLoading(true);
    
    setTimeout(() => {
      let foundThread = null;
      // Search all mock categories in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('mock_discussions_')) {
          const discussions = JSON.parse(localStorage.getItem(key) || '[]');
          const match = discussions.find(d => d.id.toString() === threadId);
          if (match) {
            foundThread = match;
            break;
          }
        }
      }

      if (foundThread) {
        setThread(foundThread);
      } else {
        // Fallback dummy thread if not found
        setThread({
          id: parseInt(threadId),
          title: 'Example Thread Title',
          description: 'This is the detailed content of the thread. It provides all the necessary information and context for the discussion. Users can read this and then post their replies below.',
          author: { username: 'Admin' },
          created_at: new Date().toISOString(),
        });
      }
      setLoading(false);
    }, 400); // simulate network delay
  }, [threadId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading thread details...</div>;
  }

  if (!thread) {
    return <div className="p-8 text-center text-red-500">Thread not found.</div>;
  }

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    
    const comment = {
      id: Math.floor(Math.random() * 10000),
      text: newComment,
      author: { username: 'Demo User' },
      created_at: new Date().toISOString(),
      upvotes: 0
    };

    setTimeout(() => {
      const updatedComments = [...comments, comment];
      setComments(updatedComments);
      localStorage.setItem(`mock_comments_${threadId}`, JSON.stringify(updatedComments));
      setNewComment('');
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-medium text-slate-500">Back to Discussions</h1>
      </div>

      <div className="bg-white shadow-sm sm:rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-slate-900">{thread.title}</h2>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 flex items-center text-sm text-slate-500 space-x-2">
            <span className="font-medium text-slate-900">{thread.author?.username || 'Unknown'}</span>
            <span>•</span>
            <span>{new Date(thread.created_at).toLocaleString()}</span>
          </div>
        </div>
        <div className="px-6 py-6 text-slate-700 whitespace-pre-wrap">
          {thread.description || <span className="italic text-slate-400">No additional details provided.</span>}
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center space-x-6">
          <button className="flex items-center text-slate-500 hover:text-brand-600 transition-colors text-sm font-medium">
            <ThumbsUp className="w-4 h-4 mr-2" />
            Upvote (0)
          </button>
          <button className="flex items-center text-slate-500 hover:text-brand-600 transition-colors text-sm font-medium">
            <Reply className="w-4 h-4 mr-2" />
            Reply
          </button>
          <button className="flex items-center text-slate-500 hover:text-brand-600 transition-colors text-sm font-medium">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
        </div>
      </div>

      {/* Phase 2: Comments Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-brand-500" />
          Replies ({comments.length})
        </h3>
        
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2 text-sm text-slate-500 mb-2">
                <span className="font-medium text-slate-900">{comment.author.username}</span>
                <span>•</span>
                <span>{new Date(comment.created_at).toLocaleString()}</span>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{comment.text}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center text-xs text-slate-500 hover:text-brand-600 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                    Helpful ({comment.upvotes})
                  </button>
                  <button className="flex items-center text-xs text-slate-500 hover:text-brand-600 transition-colors">
                    <Reply className="w-3.5 h-3.5 mr-1" />
                    Reply
                  </button>
                </div>
                <button className="flex items-center text-xs text-slate-400 hover:text-red-500 transition-colors" title="Report Comment">
                  <span className="sr-only">Report</span>
                  Report
                </button>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center text-slate-500 text-sm">
              No replies yet. Be the first to share your thoughts!
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="bg-white shadow-sm sm:rounded-xl border border-slate-200 p-6">
          <form onSubmit={handlePostComment}>
            <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-2">
              Write a Reply
            </label>
            <textarea
              id="comment"
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-3 border"
              placeholder="What are your thoughts?"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
