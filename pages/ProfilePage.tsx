import React, { useState, memo } from 'react';
import { User, Sermon, Page } from '../types';
import { IconLogout, IconBookmark, IconSermon } from '../components/Icons';

interface ProfilePageProps {
    currentUser: User | null;
    handleLogin: (name: string) => void;
    handleLogout: () => void;
    savedSermons: Sermon[];
    setPage: (page: Page) => void;
    openVideoModal: (url: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, handleLogin, handleLogout, savedSermons, setPage, openVideoModal }) => {
    const [name, setName] = useState('');

    const onLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name.trim()) handleLogin(name.trim());
    };

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <form onSubmit={onLoginSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-sm animate-fade-in">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Login / Create Profile</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Enter your name to save sermons and personalize your experience.</p>
                    <input autoFocus required value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-primary-500 outline-none" />
                    <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700">Continue</button>
                </form>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Welcome, {currentUser.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage your profile and saved content.</p>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500 bg-red-100 dark:bg-red-900/50 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-900">
                    <IconLogout className="w-4 h-4" />
                    Logout
                </button>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <IconBookmark className="w-5 h-5 text-primary-500" />
                    Your Saved Sermons ({savedSermons.length})
                </h3>
                {savedSermons.length > 0 ? (
                    <div className="space-y-4">
                        {savedSermons.map(sermon => (
                            <div key={sermon.id} className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                <img src={sermon.imageUrl} alt={sermon.title} className="w-full sm:w-32 h-auto sm:h-20 object-cover rounded-md" />
                                <div className="flex-1">
                                    <h4 className="font-bold">{sermon.title}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{sermon.speaker} | {new Date(sermon.date).toLocaleDateString()}</p>
                                </div>
                                {sermon.videoUrl && (
                                     <button onClick={() => openVideoModal(sermon.videoUrl)} className="w-full sm:w-auto bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-primary-700 whitespace-nowrap">
                                        Watch
                                     </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                         <IconSermon className="w-12 h-12 text-slate-300 dark:text-slate-500 mx-auto mb-4" />
                         <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No Saved Sermons</h3>
                         <p className="text-slate-500 dark:text-slate-400 mt-1">You can save sermons by clicking the bookmark icon.</p>
                         <button onClick={() => setPage(Page.SERMONS)} className="mt-4 bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-lg text-sm font-bold">
                            Browse Sermons
                         </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(ProfilePage);
