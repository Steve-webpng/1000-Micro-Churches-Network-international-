


import React, { useState, memo } from 'react';
import { Post, User, UserRole, Comment } from '../types';
import { supabase } from '../services/supabaseClient';
import ImageUploader from '../components/ImageUploader';
import { IconLoader, IconTrash, IconMessageSquare, IconPlus, IconX, IconHeart, IconMessageCircle } from '../components/Icons';

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
    const [activeCommentSection, setActiveCommentSection] = useState<string | null>(null);
    const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});

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
            const { error: dbError } = await supabase.from('posts').delete().eq('id', post.id);
            if (post.image_url) {
                const bucketName = 'images';
                const urlParts = post.image_url.split(`/${bucketName}/`);
                if (urlParts.length > 1) {
                    const filePath = urlParts[1];
                    await supabase.storage.from(bucketName).remove([filePath]);
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

    const handleLikePost = async (postId: string) => {
        if (!supabaseUser) {
            addToast("Please log in to like posts.");
            return;
        }

        const userId = supabaseUser.id;
        const post = posts.find(p => p.id === postId);
        const existingLike = post?.likes.find(like => like.user_id === userId);

        if (existingLike) {
            await supabase.from('likes').delete().match({ id: existingLike.id });
        } else {
            await supabase.from('likes').insert({ user_id: userId, post_id: postId });
        }
        fetchData(); // Refresh data to show immediate feedback
    };

    const handlePostComment = async (e: React.FormEvent, postId: string) => {
        e.preventDefault();
        const commentContent = commentInputs[postId] || '';
        if (!supabaseUser || !commentContent.trim()) return;

        await supabase.from('comments').insert({
            user_id: supabaseUser.id,
            post_id: postId,
            content: commentContent.trim()
        });
        setCommentInputs(prev => ({ ...prev, [postId]: '' })); // Clear input
        fetchData();
    };

    const handleDeleteComment = async (commentId: string) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            await supabase.from('comments').delete().eq('id', commentId);
            fetchData();
        }
    };
    
    return (
        <div className="container mx-auto p-6 max-w-3xl animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Community Feed</h2>
            
            {supabaseUser ? (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 mb-8">
                    <form onSubmit={handlePost} className="space-y-4">
                        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={`What's on your mind, ${currentUser?.name}?`} required className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none transition" rows={4}/>
                        {imageUrl && (
                            <div className="relative"><img src={imageUrl} alt="Upload preview" className="max-h-48 rounded-lg border border-slate-200 dark:border-slate-700"/><button type="button" onClick={() => setImageUrl(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/80"><IconX className="w-4 h-4"/></button></div>
                        )}
                        <div className="flex justify-between items-center">
                            <ImageUploader supabaseUser={supabaseUser} onImageSelect={setImageUrl} onUploadStart={() => setImageUploading(true)} onUploadEnd={() => setImageUploading(false)} label="Add Photo" />
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
            
            <div className="space-y-6">
                {posts.map(post => {
                    const userHasLiked = post.likes.some(like => like.user_id === supabaseUser?.id);
                    return (
                        <div key={post.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative group">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 rounded-full flex items-center justify-center font-bold text-lg">{post.profiles.name.charAt(0)}</div>
                                <div className="ml-3">
                                    <p className="font-bold text-slate-800 dark:text-slate-100">{post.profiles.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(post.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                            <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap mb-4">{post.content}</p>
                            {post.image_url && <img src={post.image_url} alt="User post" className="w-full max-h-96 object-cover rounded-lg border border-slate-200 dark:border-slate-700 mb-4"/>}

                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-700">
                                <button onClick={() => handleLikePost(post.id)} className={`flex items-center gap-1.5 hover:text-red-500 transition-colors ${userHasLiked ? 'text-red-500' : ''}`} disabled={!supabaseUser}><IconHeart className="w-5 h-5" isFilled={userHasLiked}/> <span>{post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}</span></button>
                                <button onClick={() => setActiveCommentSection(activeCommentSection === post.id ? null : post.id)} className="flex items-center gap-1.5 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"><IconMessageCircle className="w-5 h-5"/> <span>{post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}</span></button>
                            </div>

                            {activeCommentSection === post.id && (
                                <div className="mt-4 animate-fade-in">
                                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                                        {post.comments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map(comment => (
                                            <div key={comment.id} className="flex items-start gap-2 group/comment">
                                                <div className="w-7 h-7 mt-1 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-xs">{comment.profiles.name.charAt(0)}</div>
                                                <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                                                    <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{comment.profiles.name}</p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300">{comment.content}</p>
                                                </div>
                                                {(comment.user_id === supabaseUser?.id || userRole === UserRole.ADMIN) && (
                                                    <button onClick={() => handleDeleteComment(comment.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover/comment:opacity-100 p-1"><IconTrash className="w-3 h-3"/></button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {supabaseUser && (
                                        <form onSubmit={(e) => handlePostComment(e, post.id)} className="flex gap-2 items-center">
                                            <input value={commentInputs[post.id] || ''} onChange={e => setCommentInputs(prev => ({...prev, [post.id]: e.target.value}))} placeholder="Write a comment..." className="flex-1 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-full pl-4 pr-10 py-2 text-sm focus:ring-1 focus:ring-primary-500 outline-none" />
                                            <button type="submit" className="text-primary-600 dark:text-primary-400 font-semibold text-sm">Post</button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {(supabaseUser?.id === post.user_id || userRole === UserRole.ADMIN) && (
                                <button onClick={() => handleDelete(post)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"><IconTrash className="w-4 h-4" /></button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default memo(CommunityPage);