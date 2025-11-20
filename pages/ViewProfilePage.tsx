
import React, { memo } from 'react';
import { Page, User, Post } from '../types';
import { IconMail, IconMessageSquare, IconSend } from '../components/Icons';
import { supabase } from '../services/supabaseClient';

interface ViewProfilePageProps {
    viewingProfile: User | null;
    currentUser: User | null;
    setPage: (page: Page, state?: any) => void;
}

const ViewProfilePage: React.FC<ViewProfilePageProps> = ({ viewingProfile, currentUser, setPage }) => {
    
    // In a real app, you would fetch this user's posts separately
    const userPosts: Post[] = []; 

    const handleStartConversation = async () => {
        if (!currentUser || !viewingProfile || currentUser.id === viewingProfile.id) return;

        // Check if a conversation already exists
        const { data: existingConvo, error: checkError } = await supabase.rpc('find_conversation_between_users', {
            user_id_1: currentUser.id,
            user_id_2: viewingProfile.id
        });

        if (checkError) {
            console.error("Error checking for existing conversation", checkError);
            return;
        }

        if (existingConvo && existingConvo.length > 0) {
            // Conversation exists, navigate to it
            setPage(Page.MESSAGES, { conversationId: existingConvo[0].id });
            return;
        }

        // Create a new conversation
        const { data: newConvo, error: createConvoError } = await supabase
            .from('conversations')
            .insert({})
            .select()
            .single();

        if (createConvoError || !newConvo) {
            console.error("Error creating conversation", createConvoError);
            return;
        }

        // Add participants
        const { error: participantsError } = await supabase
            .from('conversation_participants')
            .insert([
                { conversation_id: newConvo.id, user_id: currentUser.id },
                { conversation_id: newConvo.id, user_id: viewingProfile.id }
            ]);

        if (participantsError) {
            console.error("Error adding participants", participantsError);
            return;
        }
        
        setPage(Page.MESSAGES, { conversationId: newConvo.id });
    };

    if (!viewingProfile) {
        return <div className="p-6 text-center">User not found.</div>;
    }

    const isOwnProfile = currentUser?.id === viewingProfile.id;

    return (
        <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center sm:items-start gap-8">
                {viewingProfile.avatar_url ? (
                    <img src={viewingProfile.avatar_url} alt={viewingProfile.name} className="w-32 h-32 rounded-full object-cover ring-4 ring-primary-500/50 dark:ring-primary-500/30" />
                ) : (
                    <div className="w-32 h-32 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center ring-4 ring-primary-500/50 dark:ring-primary-500/30">
                        <span className="text-5xl font-bold text-primary-600 dark:text-primary-300">{viewingProfile.name.charAt(0)}</span>
                    </div>
                )}
                <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{viewingProfile.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{viewingProfile.email}</p>
                    {viewingProfile.bio && <p className="mt-4 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg italic">"{viewingProfile.bio}"</p>}
                    <div className="mt-6 flex gap-4 justify-center sm:justify-start">
                         {isOwnProfile ? (
                            <button onClick={() => setPage(Page.PROFILE)} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-primary-700">
                                Edit Your Profile
                            </button>
                         ) : (
                            <button onClick={handleStartConversation} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-primary-700">
                                <IconSend className="w-4 h-4" /> Message
                            </button>
                         )}
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-200 dark:border-slate-700 pb-3 flex items-center gap-2">
                    <IconMessageSquare className="w-5 h-5 text-primary-500"/> Posts by {viewingProfile.name}
                </h3>
                {userPosts.length > 0 ? (
                    <div className="space-y-6">
                        {/* Map over user's posts here */}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-dashed border-slate-300 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400">{viewingProfile.name} hasn't made any posts yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(ViewProfilePage);