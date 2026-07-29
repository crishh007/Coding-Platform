import { Routes, Route, Link, useLocation, NavLink } from 'react-router-dom';
import ForumHome from './pages/ForumHome';
import CategoryDiscussions from './pages/CategoryDiscussions';
import ThreadDetails from './pages/ThreadDetails';
import Solutions from './pages/Solutions';
import Blogs from './pages/Blogs';
import Leaderboard from './pages/Leaderboard';

function App() {
  const location = useLocation();
  const isDiscussionsActive = location.pathname === '/' || location.pathname.startsWith('/category') || location.pathname.startsWith('/thread');

  const navItemClass = "px-3 py-2 rounded-md font-medium transition-colors";
  const activeClass = "text-brand-600 bg-brand-50";
  const inactiveClass = "text-slate-500 hover:text-slate-700 hover:bg-slate-50";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-brand-600">Module H</span>
              </Link>
              <div className="hidden md:flex space-x-2">
                <Link to="/" className={`${navItemClass} ${isDiscussionsActive ? activeClass : inactiveClass}`}>Discussions</Link>
                <NavLink to="/solutions" className={({ isActive }) => `${navItemClass} ${isActive ? activeClass : inactiveClass}`}>Solutions</NavLink>
                <NavLink to="/blogs" className={({ isActive }) => `${navItemClass} ${isActive ? activeClass : inactiveClass}`}>Blogs</NavLink>
                <NavLink to="/leaderboard" className={({ isActive }) => `${navItemClass} ${isActive ? activeClass : inactiveClass}`}>Leaderboard</NavLink>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-500">Logged in as <span className="font-medium text-slate-900">Demo User</span></div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<ForumHome />} />
          <Route path="/category/:categoryId" element={<CategoryDiscussions />} />
          <Route path="/thread/:threadId" element={<ThreadDetails />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
