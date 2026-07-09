import React from 'react';
import { useParams } from 'react-router-dom';

const FoundationalContent = () => {
  const { feature, topic } = useParams();

  const formatString = (str) => {
    if (!str) return '';
    return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden border border-white/5 bg-bg-secondary/50 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        
        <h1 className="text-3xl font-extrabold mb-4 text-white">
          {formatString(topic || 'Arrays')}
        </h1>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/20">
          {formatString(feature || 'Quick Notes')}
        </div>

        <div className="text-text-secondary leading-relaxed space-y-6">
          <p>
            Welcome to the <strong>{formatString(feature || 'Quick Notes')}</strong> section for <strong>{formatString(topic || 'Arrays')}</strong>.
          </p>
          <p>
            This content is currently being generated. In the final version, this area will feature rich, interactive components tailored to the selected topic and feature, such as embedded Monaco editors, flashcard swiping interfaces, or detailed cheat sheets.
          </p>
          
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mt-8">
            <h3 className="text-white font-bold mb-2">Example Placeholder Content</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Key concept definitions</li>
              <li>Code snippets and examples</li>
              <li>Common pitfalls and mistakes</li>
              <li>Interactive quizzes or flashcards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoundationalContent;
