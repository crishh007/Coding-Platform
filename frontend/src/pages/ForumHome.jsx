import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

// Mock data fallback if API fails
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

const getCategoryImage = (category) => {
  if (CATEGORY_IMAGES[category.id]) {
    return CATEGORY_IMAGES[category.id];
  }
  const name = category.name.toLowerCase();
  if (name.includes('general')) return '/general_discussion.png';
  if (name.includes('help') || name.includes('course')) return '/course_help.png';
  if (name.includes('announcement')) return '/announcements.png';
  return '/general_discussion.png';
};

export default function ForumHome() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to fetch from API, fallback to mock data
    fetch('http://localhost:8080/api/categories')
      .then(res => {
        if (!res.ok) throw new Error('API not reachable');
        return res.json();
      })
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Using mock data:', err);
        setCategories(MOCK_CATEGORIES);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading categories...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Community Forums</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            to={`/category/${category.id}`}
            className="block bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md hover:border-brand-300 transition-all duration-200"
          >
            <div className="h-48 w-full overflow-hidden bg-slate-100 relative border-b border-slate-100">
              <img 
                src={getCategoryImage(category)} 
                alt={category.name} 
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{category.name}</h2>
                  <p className="mt-2 text-sm text-slate-500 line-clamp-2">{category.description}</p>
                </div>
                <div className="p-2 bg-brand-50 rounded-lg text-brand-600 flex-shrink-0 ml-4">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>
              {category.tags && category.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {category.tags.map(tag => (
                    <span key={tag.name} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
