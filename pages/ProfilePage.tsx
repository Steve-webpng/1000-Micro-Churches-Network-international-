

import React, { useState, memo, useEffect } from 'react';
import { User, Sermon, Page } from '../types';
import { IconLogout, IconBookmark, IconSermon, IconLoader, IconPen, IconSave } from '../components/Icons';
import { supabase } from '../services/supabaseClient';

interface ProfilePageProps {
    supabaseUser: any;
    currentUser: User | null;
    savedSermons: Sermon[];
    setPage: (page: Page) => void;
    openVideoModal: (url: string) => void;
    addToast: (message: string) => void;
    fetchData: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ supabaseUser, currentUser, savedSermons, setPage, openVideoModal, addToast, fetchData }) => {
    // Auth form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');

    // Profile editing state
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);
    
    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
        }
    }, [currentUser]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        
        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                // Create a profile for the new user
                if (data.user) {
                    const { error: profileError } = await supabase.from('profiles').insert({
                        id: data.user.id,
                        email: data.user.email,
                        name: email.split('@')[0]
                    });
                    if (profileError) throw profileError;
                }
                setMessage('Sign up successful! Please check your email to verify.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error: any) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        addToast("You've been logged out.");
    };

    const handleUpdateProfile = async () => {
        if (!supabaseUser) return;
        setUpdateLoading(true);

        // Password update logic
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                addToast("Passwords do not match.");
                setUpdateLoading(false);
                return;
            }
            const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
            if (passwordError) {
                addToast(`Password update failed: ${passwordError.message}`);
                setUpdateLoading(false);
                return;
            }
        }

        // Name update logic
        if (name !== currentUser?.name) {
            const { error: nameError } = await supabase.from('profiles').update({ name }).eq('id', supabaseUser.id);
            if (nameError) {
                addToast(`Name update failed: ${nameError.message}`);
                setUpdateLoading(false);
                return;
            }
        }
        
        addToast("Profile updated successfully!");
        setNewPassword('');
        setConfirmPassword('');
        await fetchData(); // Refetch user profile data from App
        setUpdateLoading(false);
        setIsEditing(false);
    };

    if (!supabaseUser) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <form onSubmit={handleAuth} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-sm animate-fade-in">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{isSignUp ? 'Create Account' : 'Login'}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Enter your email to save sermons and more.</p>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-primary-500 outline-none" />
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-primary-500 outline-none" />
                    {message && <p className={`text-sm mb-4 p-2 rounded text-center ${message.includes('success') ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>{message}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50 flex justify-center">
                        {loading ? <IconLoader className="w-5 h-5"/> : (isSignUp ? 'Sign Up' : 'Login')}
                    </button>
                    <p className="mt-4 text-center text-sm text-slate-500">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"} <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-primary-600 hover:underline font-semibold">{isSignUp ? 'Login' : 'Sign Up'}</button>
                    </p>
                </form>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Welcome, {currentUser?.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage your profile and saved content.</p>
                </div>
                <div className="flex gap-2">
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-600">
                            <IconPen className="w-4 h-4" /> Edit Profile
                        </button>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500 bg-red-100 dark:bg-red-900/50 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-900">
                        <IconLogout className="w-4 h-4" /> Logout
                    </button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Account Information</h3>
                {isEditing ? (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Display Name</label>
                            <input value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</label>
                            <p className="text-slate-600 dark:text-slate-300 mt-1">{currentUser?.email}</p>
                        </div>
                        <hr className="dark:border-slate-700"/>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Change Password</p>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"/>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"/>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setIsEditing(false)} className="text-sm px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold">Cancel</button>
                            <button onClick={handleUpdateProfile} disabled={updateLoading} className="flex items-center gap-2 text-sm bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50">
                                {updateLoading ? <IconLoader className="w-4 h-4"/> : <IconSave className="w-4 h-4" />} Save Changes
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Display Name</p>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">{currentUser?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</p>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">{currentUser?.email}</p>
                        </div>
                    </div>
                )}
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
                                     <button onClick={() => openVideoModal(sermon.videoUrl!)} className="w-full sm:w-auto bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-primary-700 whitespace-nowrap">
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