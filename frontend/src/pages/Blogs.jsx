import { useState, useEffect } from 'react';
import { PenTool, ChevronRight, X } from 'lucide-react';

const BLOG_IMAGES = {
  1: '/dynamic_programming.png',
  2: '/technical_interview.png',
};

const getBlogImage = (blog) => {
  if (BLOG_IMAGES[blog.id]) {
    return BLOG_IMAGES[blog.id];
  }
  const title = blog.title.toLowerCase();
  if (title.includes('dynamic') || title.includes('programming')) return '/dynamic_programming.png';
  if (title.includes('interview') || title.includes('ace')) return '/technical_interview.png';
  return '/dynamic_programming.png';
};

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('mock_blogs');
    if (stored) {
      setBlogs(JSON.parse(stored));
    } else {
      const initial = [
        { id: 1, title: 'Understanding Dynamic Programming', excerpt: 'A comprehensive guide to breaking down complex problems into simpler subproblems.', content: 'Full content goes here...', author: 'Admin', date: new Date().toISOString() },
        { id: 2, title: 'How to ace your next technical interview', excerpt: 'Top 5 tips to stay calm, communicate effectively, and solve the problem.', content: 'Full content goes here...', author: 'Demo User', date: new Date().toISOString() }
      ];
      setBlogs(initial);
      localStorage.setItem('mock_blogs', JSON.stringify(initial));
    }
  }, []);

  const handlePublish = (newBlog) => {
    setIsComposeModalOpen(false);
    const updated = [newBlog, ...blogs];
    setBlogs(updated);
    localStorage.setItem('mock_blogs', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Community Blogs</h1>
          <p className="mt-2 text-sm text-slate-500">Read the latest thoughts and tutorials from the community.</p>
        </div>
        <button 
          onClick={() => setIsComposeModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700"
        >
          <PenTool className="w-4 h-4 mr-2" />
          Write Blog
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {blogs.map(blog => (
          <div key={blog.id} className="flex flex-col rounded-xl shadow-sm border border-slate-200 overflow-hidden bg-white hover:shadow-md transition-shadow">
            <div className="h-48 w-full overflow-hidden bg-slate-100 relative border-b border-slate-100">
              <img 
                src={getBlogImage(blog)} 
                alt={blog.title} 
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-between flex-1 p-6">
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-600">
                  <span className="hover:underline">Article</span>
                </p>
                <a href="#" className="block mt-2">
                  <p className="text-xl font-semibold text-slate-900">{blog.title}</p>
                  <p className="mt-3 text-base text-slate-500 line-clamp-3">{blog.excerpt}</p>
                </a>
              </div>
              <div className="mt-6 flex items-center">
                <div className="flex-shrink-0">
                  <span className="sr-only">{blog.author}</span>
                  <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold uppercase">
                    {blog.author.charAt(0)}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-900">{blog.author}</p>
                  <div className="flex space-x-1 text-sm text-slate-500">
                    <time dateTime={blog.date}>{new Date(blog.date).toLocaleDateString()}</time>
                    <span aria-hidden="true">&middot;</span>
                    <span>5 min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isComposeModalOpen && (
        <ComposeModal onClose={() => setIsComposeModalOpen(false)} onPublish={handlePublish} />
      )}
    </div>
  );
}

function ComposeModal({ onClose, onPublish }) {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onPublish({
        id: Math.floor(Math.random() * 10000),
        title,
        excerpt,
        content,
        author: 'Demo User',
        date: new Date().toISOString()
      });
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900 bg-opacity-50" onClick={onClose} />
        <div className="relative inline-block w-full max-w-4xl p-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900">Write a New Blog</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-500"><X className="w-6 h-6" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full border-0 border-b-2 border-slate-200 focus:ring-0 focus:border-brand-500 text-3xl font-bold p-2 placeholder:text-slate-300" placeholder="Blog Title" />
            </div>
            <div>
              <input type="text" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="block w-full border-0 border-b-2 border-slate-200 focus:ring-0 focus:border-brand-500 text-lg p-2 placeholder:text-slate-400" placeholder="Short excerpt or subtitle..." />
            </div>
            <div>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} className="block w-full border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 p-4 text-slate-700" placeholder="Start writing your amazing story..." />
            </div>
            <div className="pt-4 flex justify-end space-x-4 border-t border-slate-100 mt-8">
              <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Save as Draft</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-3 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg shadow-sm hover:bg-brand-700 disabled:opacity-50 flex items-center">
                {isSubmitting ? 'Publishing...' : 'Publish Blog'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
