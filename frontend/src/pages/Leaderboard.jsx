import { useState, useEffect } from 'react';
import { TrendingUp, Award, Activity, Star } from 'lucide-react';

const USER_AVATARS = {
  'Alex Johnson': '/avatar_alex.png',
  'Sarah Miller': '/avatar_sarah.png',
  'Mike Chen': '/avatar_mike.png',
  'Demo User': '/avatar_default.png',
  'Admin': '/avatar_default.png',
};

const getUserAvatar = (name) => {
  return USER_AVATARS[name] || '/avatar_default.png';
};

export default function Leaderboard() {
  const [topContributors, setTopContributors] = useState([
    { id: 1, name: 'Alex Johnson', score: 1450, badge: 'Expert', level: 12 },
    { id: 2, name: 'Sarah Miller', score: 1230, badge: 'Guide', level: 9 },
    { id: 3, name: 'Demo User', score: 890, badge: 'Contributor', level: 5 },
    { id: 4, name: 'Mike Chen', score: 750, badge: 'Enthusiast', level: 4 }
  ]);

  const [trendingTopics, setTrendingTopics] = useState([
    { id: 1, title: 'Understanding Dynamic Programming', category: 'Blogs', views: 342, upvotes: 45 },
    { id: 2, title: 'Need help with Assignment 1', category: 'Discussions', views: 128, upvotes: 12 },
    { id: 3, title: 'React Authentication Template', category: 'Solutions', views: 89, upvotes: 34 }
  ]);

  const [stats, setStats] = useState({
    total_engagement: '4,231',
    badges_awarded: '182',
    active_members: '89'
  });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/leaderboard');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (data.contributors) {
          setTopContributors(data.contributors);
        }
        if (data.trending) {
          setTrendingTopics(data.trending);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (error) {
        console.warn('API error, using fallback mock data:', error);
      }
    };

    fetchLeaderboard();
  }, []);

  const formatStat = (val) => {
    if (typeof val === 'string') {
      return val;
    }
    return val ? val.toLocaleString() : '0';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Community Leaderboard</h1>
        <p className="mt-2 text-sm text-slate-500">Track engagement, discover trending content, and see who's leading the pack.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-brand-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Total Engagement</dt>
                  <dd className="text-3xl font-semibold text-slate-900">{formatStat(stats.total_engagement)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Badges Awarded</dt>
                  <dd className="text-3xl font-semibold text-slate-900">{formatStat(stats.badges_awarded)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-6 w-6 text-brand-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Active Members</dt>
                  <dd className="text-3xl font-semibold text-slate-900">{formatStat(stats.active_members)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Contributors */}
        <div className="bg-white shadow-sm sm:rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-slate-900 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Top Contributors
            </h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {topContributors.map((user, index) => (
              <li key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-slate-200 text-slate-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-brand-50 text-brand-600'}`}>
                    #{index + 1}
                  </div>
                  <img 
                    src={getUserAvatar(user.name)} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 mr-4 shadow-sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">Level {user.level} • {user.badge}</p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-brand-600">{user.score} pts</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Trending Topics */}
        <div className="bg-white shadow-sm sm:rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-slate-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Trending Now
            </h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {trendingTopics.map((topic) => (
              <li key={topic.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                <div className="flex flex-col flex-1 min-w-0 pr-4">
                  <p className="text-sm font-medium text-slate-900 truncate">{topic.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{topic.category}</p>
                </div>
                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-slate-700">{topic.views}</span>
                    <span>Views</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-brand-600">{topic.upvotes}</span>
                    <span>Upvotes</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
