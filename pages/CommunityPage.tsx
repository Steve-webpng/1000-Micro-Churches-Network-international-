
import React, { useState, memo } from 'react';
import { Post, User, UserRole } from '../types';
import { supabase } from '../services/supabaseClient';
import ImageUploader from '../components/ImageUploader';
import { IconLoader, IconTrash, IconMessageSquare, IconPlus, IconX } from '../components/Icons';

interface CommunityPageProps {
    posts: Post[];
    fetchData: () => void;
    supabaseUser: any;
    currentUser: User | null;
    addToast: (message: string) => void;
    userRole: UserRole | null;
}

const CommunityPage: React.FC<CommunityPageProps> = ({ posts, fetchData, supabaseUser, currentUser, addToast, userRole }) => {
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !supabaseUser) {
            addToast("Post content cannot be empty.");
            return;
        };
        setLoading(true);

        const { error } = await supabase.from('posts').insert({
            user_id: supabaseUser.id,
            content: content,
            image_url: imageUrl,
        });

        if (error) {
            addToast(`Error creating post: ${error.message}`);
        } else {
            addToast("Post created!");
            setContent('');
            setImageUrl(null);
            fetchData(); // Refresh the feed
        }
        setLoading(false);
    };

    const handleDelete = async (post: Post) => {
        if (window.confirm("Are you sure you want to delete this post? This is permanent.")) {
            // Delete post from DB
            const { error: dbError } = await supabase.from('posts').delete().eq('id', post.id);

            // Delete image from storage if it exists
            if (post.image_url) {
                const fileName = post.image_url.split('/').pop();
                if (fileName) {
                    await supabase.storage.from('images').remove([fileName]);
                }
            }

            if (dbError) {
                addToast(`Error deleting post: ${dbError.message}`);
            } else {
                addToast("Post deleted successfully.");
                fetchData();
            }
        }
    };
    
    return (
        <div className="container mx-auto p-6 max-w-3xl animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Community Feed</h2>
            
            {/* New Post Form */}
            {supabaseUser ? (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                    <form onSubmit={handlePost} className="space-y-4">
                        <textarea 
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder={`What's on your mind, ${currentUser?.name}?`}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none transition"
                            rows={4}
                        />
                        {imageUrl && (
                            <div className="relative">
                                <img src={imageUrl} alt="Upload preview" className="max-h-48 rounded-lg border border-slate-200 dark:border-slate-700"/>
                                <button type="button" onClick={() => setImageUrl(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/80"><IconX className="w-4 h-4"/></button>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <ImageUploader 
                                onImageSelect={setImageUrl} 
                                onUploadStart={() => setImageUploading(true)}
                                onUploadEnd={() => setImageUploading(false)}
                                label="Add Photo" 
                            />
                            <button type="submit" disabled={loading || imageUploading} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading ? <IconLoader className="w-5 h-5"/> : 'Post'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-dashed border-slate-300 dark:border-slate-700 mb-8">
                    <p className="text-slate-600 dark:text-slate-300">Please log in to create a post and join the conversation.</p>
                </div>
            )}
            
            {/* Posts Feed */}
            <div className="space-y-6">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <div key={post.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative group">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 rounded-full flex items-center justify-center font-bold text-lg">
                                    {post.profiles.name.charAt(0)}
                                </div>
                                <div className="ml-3">
                                    <p className="font-bold text-slate-800 dark:text-slate-100">{post.profiles.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(post.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                            <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap mb-4">{post.content}</p>
                            {post.image_url && (
                                <img src={post.image_url} alt="User post" className="w-full max-h-96 object-cover rounded-lg border border-slate-200 dark:border-slate-700"/>
                            )}

                            {(supabaseUser?.id === post.user_id || userRole === UserRole.ADMIN) && (
                                <button onClick={() => handleDelete(post)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1">
                                    <IconTrash className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                     <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-dashed border-slate-300 dark:border-slate-700">
                        <IconMessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No Posts Yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Be the first one to share something with the community!</p>
                     </div>
                )}
            </div>
        </div>
    );
};

export default memo(CommunityPage);
