import { useState, useEffect } from 'react';
import { UploadCloud, FileText, Code, Search, Download, Tag, X } from 'lucide-react';

const SOLUTION_IMAGES = {
  1: '/data_structures_cheatsheet.png',
  2: '/react_auth_template.png',
};

const getSolutionImage = (solution) => {
  if (SOLUTION_IMAGES[solution.id]) {
    return SOLUTION_IMAGES[solution.id];
  }
  const title = solution.title.toLowerCase();
  if (title.includes('data structure')) return '/data_structures_cheatsheet.png';
  if (title.includes('auth') || title.includes('react')) return '/react_auth_template.png';
  return '/data_structures_cheatsheet.png';
};

export default function Solutions() {
  const [solutions, setSolutions] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('mock_solutions');
    if (stored) {
      setSolutions(JSON.parse(stored));
    } else {
      const initial = [
        { id: 1, title: 'Data Structures Cheatsheet', type: 'PDF', author: 'Admin', tags: ['CS101', 'Notes'], date: new Date().toISOString() },
        { id: 2, title: 'React Authentication Template', type: 'Code', author: 'Demo User', tags: ['WebDev', 'React'], date: new Date().toISOString() }
      ];
      setSolutions(initial);
      localStorage.setItem('mock_solutions', JSON.stringify(initial));
    }
  }, []);

  const handleUpload = (newSolution) => {
    setIsUploadModalOpen(false);
    const updated = [newSolution, ...solutions];
    setSolutions(updated);
    localStorage.setItem('mock_solutions', JSON.stringify(updated));
  };

  const filtered = solutions.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Solutions & Resources</h1>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search resources..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            />
          </div>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700"
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(solution => (
          <div key={solution.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
            <div className="h-44 w-full overflow-hidden bg-slate-100 relative border-b border-slate-100">
              <img 
                src={getSolutionImage(solution)} 
                alt={solution.title} 
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/95 text-slate-800 shadow-sm border border-slate-100">
                {solution.type}
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                  {solution.type === 'Code' ? <Code className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
              </div>
              <h3 
                onClick={() => setSelectedSolution(solution)} 
                className="text-lg font-semibold text-slate-900 mb-1 cursor-pointer hover:text-brand-600 transition-colors"
              >
                {solution.title}
              </h3>
              <p className="text-sm text-slate-500 mb-4">Uploaded by {solution.author} • {new Date(solution.date).toLocaleDateString()}</p>
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
                  {solution.tags.map(tag => (
                    <button 
                      key={tag} 
                      onClick={() => setSearch(tag)}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                    >
                      <Tag className="w-3 h-3 mr-1" />{tag}
                    </button>
                  ))}
                </div>
                <button onClick={() => alert(`Starting download for ${solution.title}...`)} className="text-slate-400 hover:text-brand-600 transition-colors p-1.5 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100" title="Download">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500">No resources found matching your search.</div>
      )}

      {isUploadModalOpen && (
        <UploadModal onClose={() => setIsUploadModalOpen(false)} onUpload={handleUpload} />
      )}

      {selectedSolution && (
        <ViewModal solution={selectedSolution} onClose={() => setSelectedSolution(null)} />
      )}
    </div>
  );
}

function UploadModal({ onClose, onUpload }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('PDF');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onUpload({
        id: Math.floor(Math.random() * 10000),
        title,
        type,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        author: 'Demo User',
        date: new Date().toISOString()
      });
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900 bg-opacity-50" onClick={onClose} />
        <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-medium leading-6 text-slate-900">Upload Resource</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Resource Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm" placeholder="e.g. CS101 Midterm Notes" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">File Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm">
                <option>PDF</option>
                <option>Document</option>
                <option>Code</option>
                <option>Link</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Tags (comma separated)</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 border p-2 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm" placeholder="e.g. notes, cs101, helpful" />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700">File</label>
               <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                 <div className="space-y-1 text-center">
                   <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                   <div className="flex text-sm text-slate-600 justify-center">
                     <label className="relative cursor-pointer bg-white rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-500">
                       <span>Upload a file</span>
                       <input type="file" className="sr-only" />
                     </label>
                   </div>
                   <p className="text-xs text-slate-500">PDF, DOC, ZIP up to 10MB</p>
                 </div>
               </div>
            </div>
            <div className="pt-4 flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-md hover:bg-brand-700 disabled:opacity-50">{isSubmitting ? 'Uploading...' : 'Upload'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ViewModal({ solution, onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900 bg-opacity-50" onClick={onClose} />
        <div className="relative inline-block w-full max-w-2xl p-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-2xl font-bold leading-6 text-slate-900 flex items-center">
              {solution.type === 'Code' ? <Code className="w-6 h-6 mr-3 text-brand-600" /> : <FileText className="w-6 h-6 mr-3 text-brand-600" />}
              {solution.title}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-500"><X className="w-6 h-6" /></button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center text-sm text-slate-500 space-x-4">
              <span>Uploaded by <span className="font-medium text-slate-900">{solution.author}</span></span>
              <span>•</span>
              <span>{new Date(solution.date).toLocaleDateString()}</span>
              <span>•</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                {solution.type}
              </span>
            </div>
            <div className="flex gap-2 pt-2">
              {solution.tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-brand-50 text-brand-700">
                  <Tag className="w-3.5 h-3.5 mr-1.5" />{tag}
                </span>
              ))}
            </div>
            
            <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden flex flex-col bg-white">
              <div className="h-64 w-full overflow-hidden bg-slate-100 relative">
                <img 
                  src={getSolutionImage(solution)} 
                  alt={solution.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-200 text-center flex flex-col items-center justify-center">
                <p className="text-sm text-slate-500 mb-4">Interactive preview is not available in demo mode.</p>
                <button onClick={() => alert(`Starting download for ${solution.title}...`)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download Complete Resource
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
