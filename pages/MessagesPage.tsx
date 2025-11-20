
import React, { useState, useEffect, useRef, memo } from 'react';
import { Conversation, Message, User } from '../types';
import { supabase } from '../services/supabaseClient';
import { IconLoader, IconSend, IconMessageSquare } from '../components/Icons';

interface MessagesPageProps {
    conversations: Conversation[];
    currentUser: User;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ conversations: initialConversations, currentUser }) => {
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    useEffect(() => {
        // Automatically select the first conversation if none is selected
        if (!activeConversationId && conversations.length > 0) {
            setActiveConversationId(conversations[0].id);
        }
    }, [conversations, activeConversationId]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!activeConversationId) return;
            setLoading(true);
            const { data } = await supabase
                .from('messages')
                .select('*, profiles(id, name, avatar_url)')
                .eq('conversation_id', activeConversationId)
                .order('created_at', { ascending: true });
            setMessages(data as any[] || []);
            setLoading(false);
        };
        fetchMessages();

        const channel = supabase.channel(`messages:${activeConversationId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConversationId}` }, async (payload) => {
                const { data: profile } = await supabase.from('profiles').select('id, name, avatar_url').eq('id', payload.new.sender_id).single();
                setMessages(prev => [...prev, { ...payload.new, profiles: profile } as Message]);
            })
            .subscribe();
            
        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeConversationId]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversationId) return;

        await supabase.from('messages').insert({
            conversation_id: activeConversationId,
            sender_id: currentUser.id,
            content: newMessage.trim(),
        });
        setNewMessage('');
    };
    
    const getOtherParticipant = (convo: Conversation) => {
        return convo.conversation_participants.find(p => p.user_id !== currentUser.id)?.profiles;
    };

    return (
        <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-80px)] animate-fade-in bg-white dark:bg-slate-900">
            {/* Conversations List */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex-col ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map(convo => {
                        const otherUser = getOtherParticipant(convo);
                        const lastMessage = convo.messages[0];
                        return (
                            <div key={convo.id} onClick={() => setActiveConversationId(convo.id)} className={`flex items-center p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${activeConversationId === convo.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                                {otherUser?.avatar_url ? (
                                    <img src={otherUser.avatar_url} alt={otherUser.name} className="w-12 h-12 rounded-full object-cover mr-4"/>
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center font-bold text-xl text-primary-600 dark:text-primary-300 mr-4">{otherUser?.name.charAt(0)}</div>
                                )}
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{otherUser?.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{lastMessage?.content || 'No messages yet'}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Active Chat */}
            <div className={`flex-1 flex-col ${activeConversationId ? 'flex' : 'hidden md:flex'}`}>
                {activeConversation ? (
                    <>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <button className="md:hidden" onClick={() => setActiveConversationId(null)}>←</button>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{getOtherParticipant(activeConversation)?.name}</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {loading && <div className="flex justify-center items-center h-full"><IconLoader className="w-8 h-8"/></div>}
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex items-start gap-3 ${msg.sender_id === currentUser.id ? 'justify-end' : ''}`}>
                                {msg.sender_id !== currentUser.id && (
                                     msg.profiles?.avatar_url ? (
                                        <img src={msg.profiles.avatar_url} alt={msg.profiles.name} className="w-8 h-8 rounded-full object-cover"/>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">{msg.profiles?.name.charAt(0)}</div>
                                    )
                                )}
                                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender_id === currentUser.id ? 'bg-primary-600 text-white rounded-br-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-lg'}`}>
                                    <p className="text-sm">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-slate-100 dark:bg-slate-800 border-transparent focus:ring-primary-500 focus:border-primary-500 rounded-full px-4 py-2 text-sm outline-none" />
                        <button type="submit" className="bg-primary-600 text-white rounded-full p-3 hover:bg-primary-700"><IconSend className="w-5 h-5"/></button>
                    </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
                        <IconMessageSquare className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4"/>
                        <h3 className="text-lg font-semibold">Select a conversation</h3>
                        <p>Your private messages will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(MessagesPage);