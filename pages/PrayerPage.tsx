import React, { useState, memo } from 'react';
import { PrayerRequest } from '../types';
import { IconLoader } from '../components/Icons';

interface PrayerPageProps {
  prayers: PrayerRequest[];
  handlePrayerSubmit: (name: string, content: string) => Promise<void>;
  setPrayers: React.Dispatch<React.SetStateAction<PrayerRequest[]>>;
  addToast: (message: string) => void;
}

const PrayerPage: React.FC<PrayerPageProps> = ({ prayers, handlePrayerSubmit, setPrayers, addToast }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prayedForIds, setPrayedForIds] = useState<string[]>([]);

  const approvedPrayers = prayers.filter(p => p.status === 'APPROVED').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setIsSubmitting(true);
    await handlePrayerSubmit(name, content);
    setIsSubmitting(false);
    setName('');
    setContent('');
    addToast("Your prayer request has been submitted for review.");
  };

  const handlePrayClick = (id: string) => {
    if(prayedForIds.includes(id)) return;
    setPrayers(prev => prev.map(p => p.id === id ? {...p, prayerCount: p.prayerCount + 1} : p));
    setPrayedForIds(prev => [...prev, id]);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Prayer Requests Column */}
        <div className="md:col-span-2">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Community Prayer Wall</h2>
          <div className="space-y-4">
            {approvedPrayers.map(prayer => (
              <div key={prayer.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-slate-700 dark:text-slate-200">{prayer.content}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">- {prayer.name}</span>
                   <button 
                    onClick={() => handlePrayClick(prayer.id)}
                    disabled={prayedForIds.includes(prayer.id)}
                    className={`text-sm font-bold py-2 px-4 rounded-lg transition ${prayedForIds.includes(prayer.id) ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400' : 'bg-primary-500 text-white hover:bg-primary-600'}`}>
                        🙏 {prayedForIds.includes(prayer.id) ? 'Prayed' : 'Pray'} ({prayer.prayerCount})
                   </button>
                </div>
                {prayer.aiResponse && (
                  <div className="mt-4 p-3 bg-primary-50 dark:bg-slate-700/50 rounded-lg text-sm text-primary-800 dark:text-primary-300 italic border-l-4 border-primary-500">
                    {prayer.aiResponse}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Submission Form Column */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 sticky top-28">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Submit a Prayer Request</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="Your Name" className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm" />
              <textarea value={content} onChange={e => setContent(e.target.value)} required placeholder="Your prayer..." rows={5} className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm"></textarea>
              <button type="submit" disabled={isSubmitting} className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold shadow hover:bg-primary-700 disabled:bg-slate-400 flex items-center justify-center">
                {isSubmitting && <IconLoader className="w-5 h-5 mr-2" />}
                {isSubmitting ? 'Submitting...' : 'Submit Prayer'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PrayerPage);
