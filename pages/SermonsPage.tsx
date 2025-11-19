import React, { useState, memo } from 'react';
import { Sermon, User } from '../types';
import { IconBookmark, IconShare } from '../components/Icons';

interface SermonsPageProps {
  sermons: Sermon[];
  openVideoModal: (url: string) => void;
  handleShare: (title: string, text: string, url: string) => void;
  currentUser: User | null;
  handleSaveSermon: (sermonId: string) => void;
}

const SermonsPage: React.FC<SermonsPageProps> = ({ sermons, openVideoModal, handleShare, currentUser, handleSaveSermon }) => {
    const [filterSeries, setFilterSeries] = useState('All');
    const [filterSpeaker, setFilterSpeaker] = useState('All');

    const allSeries = ['All', ...Array.from(new Set(sermons.map(s => s.series).filter(Boolean))) as string[]];
    const allSpeakers = ['All', ...Array.from(new Set(sermons.map(s => s.speaker)))];

    const filteredSermons = sermons.filter(sermon => {
        const seriesMatch = filterSeries === 'All' || sermon.series === filterSeries;
        const speakerMatch = filterSpeaker === 'All' || sermon.speaker === filterSpeaker;
        return seriesMatch && speakerMatch;
    });

    return (
        <div className="container mx-auto p-6 max-w-6xl animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Sermons</h2>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <select value={filterSeries} onChange={e => setFilterSeries(e.target.value)} className="w-full sm:w-48 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500">
                        {allSeries.map(series => <option key={series} value={series}>{series}</option>)}
                    </select>
                    <select value={filterSpeaker} onChange={e => setFilterSpeaker(e.target.value)} className="w-full sm:w-48 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500">
                        {allSpeakers.map(speaker => <option key={speaker} value={speaker}>{speaker}</option>)}
                    </select>
                </div>
            </div>

            {filteredSermons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSermons.map((sermon) => (
                    <div key={sermon.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                        <div className="relative">
                            <img src={sermon.imageUrl} alt={sermon.title} className="w-full h-48 object-cover" />
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button onClick={() => handleSaveSermon(sermon.id)} className={`p-2 rounded-full transition-colors ${currentUser?.savedSermonIds.includes(sermon.id) ? 'bg-primary-500 text-white' : 'bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-primary-600'}`}>
                                    <IconBookmark className="w-5 h-5" isFilled={currentUser?.savedSermonIds.includes(sermon.id)} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            {sermon.series && <p className="text-xs font-bold uppercase text-primary-600 dark:text-primary-500 mb-1 tracking-wider">{sermon.series}</p>}
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{sermon.title}</h3>
                            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4">
                                <span>{sermon.speaker}</span>
                                <span className="mx-2">|</span>
                                <span>{new Date(sermon.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm flex-1">{sermon.description}</p>
                            <div className="mt-6 flex gap-2">
                               {sermon.videoUrl && (
                                    <button onClick={() => openVideoModal(sermon.videoUrl)} className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-primary-700">
                                    Watch Now
                                    </button>
                                )}
                                <button onClick={() => handleShare('Check out this sermon', sermon.title, `https://1000micro.church/sermon/${sermon.id}`)} className="border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
                                  <IconShare className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            ) : (
                 <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-dashed border-slate-300 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No Sermons Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your filters or check back later.</p>
                 </div>
            )}

        </div>
    );
};

export default memo(SermonsPage);
