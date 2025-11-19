import React, { useState, useMemo, memo } from 'react';
import { Page, Sermon, Event, Meeting, SearchResult } from '../types';

interface SearchPageProps {
  sermons: Sermon[];
  events: Event[];
  meetings: Meeting[];
  setPage: (page: Page) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ sermons, events, meetings, setPage }) => {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    let results: SearchResult[] = [];

    sermons.forEach(s => {
      let score = 0;
      if (s.title.toLowerCase().includes(lowerQuery)) score += 2;
      if (s.speaker.toLowerCase().includes(lowerQuery)) score += 1;
      if (s.description.toLowerCase().includes(lowerQuery)) score += 1;
      if (score > 0) results.push({ id: s.id, type: 'SERMON', title: s.title, description: `By ${s.speaker}: ${s.description}`, score });
    });

    events.forEach(e => {
      let score = 0;
      if (e.title.toLowerCase().includes(lowerQuery)) score += 2;
      if (e.location.toLowerCase().includes(lowerQuery)) score += 1;
      if (e.description.toLowerCase().includes(lowerQuery)) score += 1;
      if (score > 0) results.push({ id: e.id, type: 'EVENT', title: e.title, description: `At ${e.location}: ${e.description}`, score });
    });

    meetings.forEach(m => {
      let score = 0;
      if (m.title.toLowerCase().includes(lowerQuery)) score += 2;
      if (m.host.toLowerCase().includes(lowerQuery)) score += 1;
      if (m.description.toLowerCase().includes(lowerQuery)) score += 1;
      if (score > 0) results.push({ id: m.id, type: 'MEETING', title: m.title, description: `Hosted by ${m.host}: ${m.description}`, score });
    });
    
    return results.sort((a, b) => b.score - a.score);
  }, [query, sermons, events, meetings]);

  const highlight = (text: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-primary-100 dark:bg-primary-500/30 text-primary-700 dark:text-primary-300 rounded px-1">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl animate-fade-in">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for sermons, events, meetings..."
        autoFocus
        className="w-full text-lg p-4 mb-8 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 outline-none"
      />
      
      {query && (
          <p className="text-sm text-slate-500 mb-4">Found {searchResults.length} results.</p>
      )}

      <div className="space-y-4">
        {searchResults.map((result) => (
          <div
            key={`${result.type}-${result.id}`}
            onClick={() => {
                if(result.type === 'SERMON') setPage(Page.SERMONS);
                if(result.type === 'EVENT') setPage(Page.EVENTS);
                if(result.type === 'MEETING') setPage(Page.MEETINGS);
            }}
            className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                    result.type === 'SERMON' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                    result.type === 'EVENT' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                    'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                }`}>{result.type}</span>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{highlight(result.title)}</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{highlight(result.description)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(SearchPage);
