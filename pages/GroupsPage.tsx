import React, { useState, useMemo, memo } from 'react';
import { SmallGroup, Page } from '../types';
import { IconSearch, IconX, IconUsers } from '../components/Icons';

interface GroupsPageProps {
    smallGroups: SmallGroup[];
    addToast: (message: string) => void;
    supabaseUser: any;
    setPage: (page: Page) => void;
}

const GroupsPage: React.FC<GroupsPageProps> = ({ smallGroups, addToast, supabaseUser, setPage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('All');
    const [selectedGroup, setSelectedGroup] = useState<SmallGroup | null>(null);
    
    const topics = ['All', ...Array.from(new Set(smallGroups.map(g => g.topic)))];

    const filteredGroups = useMemo(() => {
        return smallGroups.filter(group => {
            const topicMatch = selectedTopic === 'All' || group.topic === selectedTopic;
            const searchMatch = searchTerm === '' ||
                group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.description.toLowerCase().includes(searchTerm.toLowerCase());
            return topicMatch && searchMatch;
        });
    }, [smallGroups, searchTerm, selectedTopic]);

    const handleJoinRequest = (group: SmallGroup) => {
        if (!supabaseUser) {
            addToast("Please log in to join a group.");
            setPage(Page.PROFILE);
            return;
        }
        // In a real app, this would write to a 'join_requests' table.
        // For now, we just show a confirmation.
        addToast(`Your request to join "${group.name}" has been sent!`);
        setSelectedGroup(null);
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">Find Your Community</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
                    Life is better together. Browse our small groups to find one that's right for you.
                </p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="relative flex-1">
                    <IconSearch className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text"
                        placeholder="Search by name, leader, or keyword..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </div>
                <select 
                    value={selectedTopic} 
                    onChange={e => setSelectedTopic(e.target.value)}
                    className="md:w-56 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 py-2 px-3 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                    {topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                </select>
            </div>

            {/* Groups Grid */}
            {filteredGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredGroups.map(group => (
                        <div key={group.id} onClick={() => setSelectedGroup(group)} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
                            <img src={group.imageUrl} alt={group.name} className="w-full h-48 object-cover"/>
                            <div className="p-6 flex-1 flex flex-col">
                                <span className="text-xs font-bold uppercase text-primary-600 dark:text-primary-500 mb-1 tracking-wider">{group.topic}</span>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{group.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Leader: {group.leader}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Schedule: {group.schedule}</p>
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
                                    <span className="text-primary-600 dark:text-primary-500 font-bold">View Details</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-dashed border-slate-300 dark:border-slate-700">
                    <IconUsers className="w-12 h-12 text-slate-300 dark:text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No Groups Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your filters or check back later.</p>
                 </div>
            )}

            {/* Details Modal */}
            {selectedGroup && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in" onClick={() => setSelectedGroup(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="relative">
                            <img src={selectedGroup.imageUrl} alt={selectedGroup.name} className="w-full h-64 object-cover rounded-t-2xl"/>
                            <button onClick={() => setSelectedGroup(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/80"><IconX/></button>
                        </div>
                        <div className="p-8">
                            <span className="text-sm font-bold uppercase text-primary-600 dark:text-primary-500 tracking-wider">{selectedGroup.topic}</span>
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1 mb-4">{selectedGroup.name}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600 dark:text-slate-300 mb-6">
                                <p><span className="font-semibold text-slate-800 dark:text-slate-100">Leader:</span> {selectedGroup.leader}</p>
                                <p><span className="font-semibold text-slate-800 dark:text-slate-100">Schedule:</span> {selectedGroup.schedule}</p>
                                <p><span className="font-semibold text-slate-800 dark:text-slate-100">Location:</span> {selectedGroup.location}</p>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedGroup.description}</p>
                            <button onClick={() => handleJoinRequest(selectedGroup)} className="w-full mt-8 bg-primary-600 text-white py-3 rounded-lg font-bold shadow hover:bg-primary-700 transition">
                                Request to Join
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(GroupsPage);
