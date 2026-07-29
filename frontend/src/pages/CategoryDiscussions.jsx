import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft, PlusCircle, ThumbsUp, Reply, Share2 } from 'lucide-react';
import CreateDiscussionForm from '../components/CreateDiscussionForm';

const MOCK_CATEGORIES = [
  { id: 1, name: 'General Discussion', description: 'Talk about anything related to the platform.', tags: [{name: 'general'}] },
  { id: 2, name: 'Course Help', description: 'Ask questions and get help with your courses.', tags: [{name: 'help'}, {name: 'courses'}] },
  { id: 3, name: 'Announcements', description: 'Official news and updates.', tags: [{name: 'news'}] },
];

const CATEGORY_IMAGES = {
  1: '/general_discussion.png',
  2: '/course_help.png',
  3: '/announcements.png',
};

const getCategoryImage = (categoryId) => {
  const idNum = parseInt(categoryId);
  if (CATEGORY_IMAGES[idNum]) {
    return CATEGORY_IMAGES[idNum];
  }
  return '/general_discussion.png';
};

export default function CategoryDiscussions() {
  const { categoryId } = useParams();
  const [discussions, setDiscussions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);

  const fetchDiscussions = () => {
    setLoading(true);
    fetch(`http://localhost:8080/api/categories/${categoryId}/discussions`)
      .then(res => {
        if (!res.ok) throw new Error('API not reachable');
        return res.json();
      })
      .then(data => {
        setDiscussions(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Using mock data:', err);
        const stored = localStorage.getItem(`mock_discussions_${categoryId}`);
        if (stored) {
          setDiscussions(JSON.parse(stored));
        } else {
          const initialMock = [
            { id: 1, title: 'How to use this forum?', author: { username: 'Admin' }, created_at: new Date().toISOString() },
            { id: 2, title: 'Need help with Assignment 1', author: { username: 'StudentA' }, created_at: new Date().toISOString() },
          ];
          setDiscussions(initialMock);
          localStorage.setItem(`mock_discussions_${categoryId}`, JSON.stringify(initialMock));
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDiscussions();

    // Fetch category info to show banner
    fetch('http://localhost:8080/api/categories')
      .then(res => {
        if (!res.ok) throw new Error('API not reachable');
        return res.json();
      })
      .then(data => {
        const found = data.find(c => c.id === parseInt(categoryId));
        if (found) setCategory(found);
      })
      .catch(err => {
        console.warn('Fallback category metadata:', err);
        const found = MOCK_CATEGORIES.find(c => c.id === parseInt(categoryId));
        if (found) setCategory(found);
      });
  }, [categoryId]);

  const handleDiscussionCreated = (newDiscussion) => {
    setIsModalOpen(false);
    if (newDiscussion) {
      setDiscussions(prev => {
        const updated = [newDiscussion, ...prev];
        localStorage.setItem(`mock_discussions_${categoryId}`, JSON.stringify(updated));
        return updated;
      });
    } else {
      fetchDiscussions();
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Header Banner */}
      {category && (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
          <div className="h-48 w-full overflow-hidden bg-slate-100 relative">
            <img 
              src={getCategoryImage(categoryId)} 
              alt={category.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/35 to-transparent flex items-end p-6">
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-sm">{category.name}</h1>
                <p className="mt-1.5 text-sm text-slate-200 max-w-2xl drop-shadow-sm">{category.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm font-medium text-slate-600">Back to Categories</span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          New Thread
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading discussions...</div>
        ) : discussions.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No discussions</h3>
            <p className="mt-1 text-sm text-slate-500">Get started by creating a new thread.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {discussions.map((discussion) => (
              <li key={discussion.id}>
                <div className="block hover:bg-slate-50 transition-colors px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <Link to={`/thread/${discussion.id}`} className="text-sm font-medium text-brand-600 truncate hover:underline">
                        {discussion.title}
                      </Link>
                      <p className="mt-1 flex items-center text-xs text-slate-500">
                        Started by {discussion.author?.username || 'Unknown'} on {new Date(discussion.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-4">
                    <button className="flex items-center text-slate-500 hover:text-brand-600 transition-colors text-xs font-medium">
                      <ThumbsUp className="w-4 h-4 mr-1.5" />
                      Upvote
                    </button>
                    <button className="flex items-center text-slate-500 hover:text-brand-600 transition-colors text-xs font-medium">
                      <Reply className="w-4 h-4 mr-1.5" />
                      Reply
                    </button>
                    <button className="flex items-center text-slate-500 hover:text-brand-600 transition-colors text-xs font-medium">
                      <Share2 className="w-4 h-4 mr-1.5" />
                      Share
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isModalOpen && (
        <CreateDiscussionForm 
          categoryId={categoryId} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleDiscussionCreated} 
        />
      )}
    </div>
  );
}
