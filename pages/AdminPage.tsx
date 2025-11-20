

import React, { useState, memo, useEffect } from 'react';
import { Page, UserRole, PrayerRequest, Sermon, Event, Meeting, SlideshowImage, PhotoAlbum, Announcement, Resource, ConnectSubmission, SmallGroup } from '../types';
import { seedSermons, seedEvents } from '../services/geminiService';
import { IconTrash, IconPlus, IconLoader, IconMegaphone, IconVideo, IconMapPin, IconFile, IconMail, IconBell, IconUsers } from '../components/Icons';
import { supabase } from '../services/supabaseClient';

interface AdminPageProps {
  userRole: UserRole | null;
  handleLogin: (role: UserRole) => void;
  prayers: PrayerRequest[];
  setPrayers: React.Dispatch<React.SetStateAction<PrayerRequest[]>>;
  sermons: Sermon[];
  setSermons: React.Dispatch<React.SetStateAction<Sermon[]>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  meetings: Meeting[];
  setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
  verse: { text: string; ref: string } | null;
  setVerse: React.Dispatch<React.SetStateAction<{ text: string; ref: string; } | null>>;
  slideshowImages: SlideshowImage[];
  setSlideshowImages: React.Dispatch<React.SetStateAction<SlideshowImage[]>>;
  photoAlbums: PhotoAlbum[];
  setPhotoAlbums: React.Dispatch<React.SetStateAction<PhotoAlbum[]>>;
  addToast: (message: string) => void;
  supabaseUser: any;
  fetchData: () => void;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  smallGroups: SmallGroup[];
  setSmallGroups: React.Dispatch<React.SetStateAction<SmallGroup[]>>;
}

const AdminPage: React.FC<AdminPageProps> = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        
        if (signInError) throw signInError;
        if (!user) throw new Error("Authentication failed");

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError) {
             console.warn("Profile check failed, proceeding if auth valid (Check RLS policies)");
        }

        if (profile && profile.role !== 'ADMIN') {
             await supabase.auth.signOut();
             throw new Error("Access Denied: You do not have Administrator privileges.");
        }

        props.handleLogin(UserRole.ADMIN);

    } catch (error: any) {
        setAuthError(error.message);
    } finally {
        setAuthLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
        case 'Dashboard': return <Dashboard {...props} />;
        case 'Announcements': return <AnnouncementManagement {...props} />;
        case 'Connect Cards': return <ConnectManagement {...props} />;
        case 'Prayers': return <PrayerManagement {...props} />;
        case 'Sermons': return <SermonManagement {...props} />;
        case 'Events': return <EventManagement {...props} />;
        case 'Meetings': return <MeetingManagement {...props} />;
        case 'Slideshow': return <SlideshowManagement {...props} />;
        case 'Gallery': return <GalleryManagement {...props} />;
        case 'Resources': return <ResourceManagement {...props} />;
        case 'Notifications': return <NotificationManagement {...props} />;
        case 'Groups': return <GroupManagement {...props} />;
        default: return null;
    }
  };

  if (!props.supabaseUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <form onSubmit={handleAdminAuth} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">A</div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">Admin Login</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-center text-sm">Restricted to authorized personnel.</p>
          
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-primary-500 outline-none transition-shadow" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-primary-500 outline-none transition-shadow" />
          
          {authError && <p className="text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-900/20 p-2 rounded text-center border border-red-200 dark:border-red-800">{authError}</p>}
          
          <button type="submit" disabled={authLoading} className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors flex justify-center items-center">
              {authLoading ? <IconLoader className="w-5 h-5" /> : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  if (props.userRole !== UserRole.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-xl text-center max-w-md border border-red-200 dark:border-red-800">
            <div className="flex justify-center mb-4 text-red-500 dark:text-red-400">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Access Denied</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
                Your account ({props.supabaseUser.email}) is logged in, but you do not have administrator privileges. Please contact the site owner to request access.
            </p>
            <button onClick={() => supabase.auth.signOut()} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-700 transition-colors">
                Log Out
            </button>
        </div>
      </div>
    );
  }

  const tabs = ['Dashboard', 'Announcements', 'Connect Cards', 'Prayers', 'Sermons', 'Events', 'Meetings', 'Slideshow', 'Gallery', 'Resources', 'Notifications', 'Groups'];

  return (
    <div className="container mx-auto p-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Admin Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Logged in as {props.supabaseUser.email}</p>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Sign Out</button>
        </div>
        
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                    {tab}
                </button>
            ))}
        </div>
        
        <div className="min-h-[400px]">{renderContent()}</div>
    </div>
  );
};

const Dashboard: React.FC<AdminPageProps> = ({ prayers, sermons, events, meetings }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Total Sermons</h3>
            <p className="text-4xl font-bold mt-2 text-slate-800 dark:text-slate-100">{sermons.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Total Events</h3>
            <p className="text-4xl font-bold mt-2 text-slate-800 dark:text-slate-100">{events.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Meetings</h3>
            <p className="text-4xl font-bold mt-2 text-slate-800 dark:text-slate-100">{meetings.length}</p>
        </div>
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Pending Prayers</h3>
            <p className="text-4xl font-bold mt-2 text-primary-600 dark:text-primary-400">{prayers.filter(p => p.status === 'PENDING').length}</p>
        </div>
    </div>
);

const NotificationManagement: React.FC<AdminPageProps> = ({ addToast, supabaseUser }) => {
    const [message, setMessage] = useState('');
    const [linkToPage, setLinkToPage] = useState<Page>(Page.HOME);
    const [loading, setLoading] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !supabaseUser) return;
        setLoading(true);
        const { error } = await supabase.from('notifications').insert({
            user_id: supabaseUser.id,
            message,
            link_to_page: linkToPage
        });
        setLoading(false);
        if (error) {
            addToast(`Error: ${error.message}`);
        } else {
            addToast('Test notification sent to yourself!');
            setMessage('');
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2"><IconBell className="w-5 h-5 text-primary-500" /> Send Test Notification</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Send a notification to your own account to test the system. You may need to refresh the app to see it.</p>
            <form onSubmit={handleSend} className="space-y-4">
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Notification Message" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3" rows={3}></textarea>
                <select value={linkToPage} onChange={e => setLinkToPage(e.target.value as Page)} className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3">
                    {Object.values(Page).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-bold hover:bg-primary-700 transition-colors flex items-center justify-center">
                    {loading ? <IconLoader className="w-5 h-5"/> : 'Send Notification'}
                </button>
            </form>
        </div>
    );
};

const ConnectManagement: React.FC<AdminPageProps> = ({ addToast }) => {
    const [submissions, setSubmissions] = useState<ConnectSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubmissions = async () => {
        setLoading(true);
        const { data } = await supabase.from('connect_submissions').select('*').order('created_at', { ascending: false });
        if (data) setSubmissions(data as ConnectSubmission[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleDelete = async (id: string) => {
        await supabase.from('connect_submissions').delete().eq('id', id);
        fetchSubmissions();
        addToast("Submission deleted.");
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <IconMail className="w-5 h-5 text-primary-500" /> Connect Card Submissions
            </h2>
            {loading ? (
                <div className="flex justify-center py-10"><IconLoader className="w-8 h-8 text-primary-500"/></div>
            ) : (
                <div className="space-y-4">
                    {submissions.length === 0 ? <p className="text-center text-slate-500 py-8">No submissions yet.</p> : 
                    submissions.map(sub => (
                        <div key={sub.id} className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg relative group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{sub.name}</h3>
                                    <div className="text-sm text-slate-500 dark:text-slate-400 flex gap-3 mt-1">
                                        <span>{sub.email}</span>
                                        {sub.phone && <span>• {sub.phone}</span>}
                                    </div>
                                </div>
                                <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full">{sub.type}</span>
                            </div>
                            <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-100 dark:border-slate-800">"{sub.message}"</p>
                            <p className="text-xs text-slate-400 mt-2">{new Date(sub.created_at || '').toLocaleString()}</p>
                            <button onClick={() => handleDelete(sub.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 text-red-500 p-1 rounded hover:bg-red-200"><IconTrash className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ... Reused Components ...
const ImageUploader: React.FC<{onImageSelect: (url: string) => void, label?: string, accept?: string}> = ({ onImageSelect, label = "Upload Image", accept = "image/*" }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('images').getPublicUrl(fileName);
            setPreview(data.publicUrl);
            onImageSelect(data.publicUrl);
        } catch (error) {
            console.error(error);
            alert('Error uploading file.');
        } finally {
            setUploading(false);
        }
    };
    
    return (
        <div>
            <input type="file" accept={accept} onChange={handleFileChange} className="hidden" ref={fileInputRef} />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full text-sm border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 hover:border-primary-500 hover:text-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {uploading ? <IconLoader className="w-5 h-5 animate-spin" /> : <><IconPlus className="w-5 h-5"/> {label}</>}
            </button>
            {preview && accept.startsWith('image') && <img src={preview} alt="Preview" className="mt-3 rounded-lg max-h-40 object-cover w-full border border-slate-200 dark:border-slate-700" />}
        </div>
    );
};

const AnnouncementManagement: React.FC<AdminPageProps> = ({ announcements, setAnnouncements, addToast, fetchData }) => {
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'INFO' | 'ALERT' | 'SUCCESS'>('INFO');
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        await supabase.from('announcements').insert([{ message, type, isActive: true }]);
        fetchData();
        setMessage('');
        addToast("Announcement posted.");
    };
    const toggleStatus = async (id: string, currentStatus: boolean) => {
        await supabase.from('announcements').update({ isActive: !currentStatus }).eq('id', id);
        fetchData();
    };
    const handleDelete = async (id: string) => {
        await supabase.from('announcements').delete().eq('id', id);
        fetchData();
    };
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4 h-fit">
                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100"><IconMegaphone className="w-5 h-5 text-primary-500"/> Post Announcement</h3>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message..." required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none" rows={3}></textarea>
                <select value={type} onChange={e => setType(e.target.value as any)} className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="INFO">Information (Blue)</option>
                    <option value="ALERT">Alert (Red)</option>
                    <option value="SUCCESS">Success (Green)</option>
                </select>
                <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-bold hover:bg-primary-700 transition-colors">Post Announcement</button>
            </form>
            <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                 <div className="space-y-3">
                    {announcements.map(item => (
                        <div key={item.id} className={`flex items-center justify-between p-4 rounded-lg border ${item.isActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 opacity-60'}`}>
                            <div><p className="font-semibold text-slate-800 dark:text-slate-100">{item.message}</p></div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleStatus(item.id, item.isActive)} className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200">{item.isActive ? 'Active' : 'Inactive'}</button>
                                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><IconTrash className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

const PrayerManagement: React.FC<AdminPageProps> = ({ prayers, addToast, fetchData }) => {
  const pendingPrayers = prayers.filter(p => p.status === 'PENDING');
  const handleApprove = async (id: string) => { await supabase.from('prayers').update({ status: 'APPROVED' }).eq('id', id); fetchData(); addToast("Approved."); };
  const handleDelete = async (id: string) => { await supabase.from('prayers').delete().eq('id', id); fetchData(); addToast("Deleted."); };
  return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Pending Prayers ({pendingPrayers.length})</h2>
        <div className="space-y-4">
          {pendingPrayers.map(p => (
            <div key={p.id} className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <p className="font-semibold text-slate-800 dark:text-slate-100">{p.name}: "{p.content}"</p>
              <div className="flex gap-3 mt-3">
                <button onClick={() => handleApprove(p.id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm">Approve</button>
                <button onClick={() => handleDelete(p.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
};

const SermonManagement: React.FC<AdminPageProps> = ({ sermons, addToast, fetchData }) => {
  const [form, setForm] = useState({ title: '', speaker: '', series: '', date: '', description: '', imageUrl: '', videoUrl: '', audioUrl: '' });
  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('sermons').insert([form]);
    fetchData();
    setForm({ title: '', speaker: '', series: '', date: '', description: '', imageUrl: '', videoUrl: '', audioUrl: '' });
    addToast("Sermon added.");
  };
  const handleDelete = async (id: string) => { await supabase.from('sermons').delete().eq('id', id); fetchData(); };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4 h-fit">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add Sermon</h3>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm"/>
        <input name="speaker" value={form.speaker} onChange={handleChange} placeholder="Speaker" required className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm"/>
        <input name="date" type="date" value={form.date} onChange={handleChange} required className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm"/>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Desc" required className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm"/>
        <ImageUploader onImageSelect={(url) => setForm({...form, imageUrl: url})} />
        <input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="Video URL" className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm"/>
        <input name="audioUrl" value={form.audioUrl} onChange={handleChange} placeholder="Audio URL" className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm"/>
        <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded font-bold">Add</button>
      </form>
      <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="space-y-2 max-h-[500px] overflow-y-auto">{sermons.map(s => (
            <div key={s.id} className="flex justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded">
                <span>{s.title}</span>
                <button onClick={() => handleDelete(s.id)} className="text-red-500"><IconTrash className="w-4 h-4"/></button>
            </div>
        ))}</div>
      </div>
    </div>
  );
};

const EventManagement: React.FC<AdminPageProps> = ({ events, addToast, fetchData }) => {
    const [form, setForm] = useState({ title: '', date: '', location: '', description: ''});
    const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); await supabase.from('events').insert([form]); fetchData(); addToast("Event added."); setForm({title:'',date:'',location:'',description:''}); };
    const handleDelete = async (id: string) => { await supabase.from('events').delete().eq('id', id); fetchData(); };
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded space-y-4"><h3 className="font-bold text-slate-800 dark:text-slate-100">Add Event</h3><input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700"/><input type="datetime-local" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700"/><button className="w-full bg-primary-600 text-white py-2 rounded">Add</button></form>
          <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded space-y-2">{events.map(e => <div key={e.id} className="flex justify-between p-2 border-b"><span className="text-slate-800 dark:text-slate-200">{e.title}</span><button onClick={()=>handleDelete(e.id)} className="text-red-500"><IconTrash className="w-4 h-4"/></button></div>)}</div>
        </div>
    );
};

const MeetingManagement: React.FC<AdminPageProps> = ({ meetings, addToast, fetchData }) => {
    const [form, setForm] = useState({ title: '', host: '', startTime: '', description: '', participants: 0 });
    const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); await supabase.from('meetings').insert([form]); fetchData(); addToast("Meeting added."); setForm({title:'',host:'',startTime:'',description:'',participants:0}); };
    const handleDelete = async (id: string) => { await supabase.from('meetings').delete().eq('id', id); fetchData(); };
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded space-y-4"><h3 className="font-bold text-slate-800 dark:text-slate-100">Schedule Meeting</h3><input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700"/><input type="datetime-local" value={form.startTime} onChange={e=>setForm({...form, startTime:e.target.value})} className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700"/><button className="w-full bg-primary-600 text-white py-2 rounded">Schedule</button></form>
             <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded space-y-2">{meetings.map(m => <div key={m.id} className="flex justify-between p-2 border-b"><span className="text-slate-800 dark:text-slate-200">{m.title}</span><button onClick={()=>handleDelete(m.id)} className="text-red-500"><IconTrash className="w-4 h-4"/></button></div>)}</div>
        </div>
    );
};

const SlideshowManagement: React.FC<AdminPageProps> = ({ slideshowImages, addToast, fetchData }) => {
    const [caption, setCaption] = useState('');
    const [url, setUrl] = useState('');
    const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if(!url) return; await supabase.from('slideshow_images').insert([{url, caption}]); fetchData(); setUrl(''); setCaption(''); addToast("Slide added."); };
    const handleDelete = async (id: string) => { await supabase.from('slideshow_images').delete().eq('id', id); fetchData(); };
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded space-y-4"><h3 className="font-bold text-slate-800 dark:text-slate-100">Add Slide</h3><ImageUploader onImageSelect={setUrl}/><input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption" className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700"/><button className="w-full bg-primary-600 text-white py-2 rounded">Add</button></form>
            <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-white dark:bg-slate-800 p-6 rounded">{slideshowImages.map(img => <div key={img.id} className="relative group aspect-video"><img src={img.url} className="w-full h-full object-cover"/><button onClick={()=>handleDelete(img.id)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><IconTrash/></button></div>)}</div>
        </div>
    );
};

const GalleryManagement: React.FC<AdminPageProps> = ({ photoAlbums, addToast, fetchData }) => {
    const [title, setTitle] = useState('');
    const handleCreate = async (e:React.FormEvent) => { e.preventDefault(); await supabase.from('photo_albums').insert([{title}]); fetchData(); setTitle(''); addToast("Album created"); };
    const handleDelete = async (id:string) => { await supabase.from('photo_albums').delete().eq('id', id); fetchData(); };
    return (
        <div className="space-y-6">
            <form onSubmit={handleCreate} className="flex gap-4 bg-white dark:bg-slate-800 p-4 rounded"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="New Album Title" className="flex-1 p-2 border rounded bg-slate-50 dark:bg-slate-700"/><button className="bg-primary-600 text-white px-4 rounded">Create</button></form>
            <div className="grid grid-cols-2 gap-4">{photoAlbums.map(a => <div key={a.id} className="bg-white dark:bg-slate-800 p-4 rounded border flex justify-between"><span>{a.title}</span><button onClick={()=>handleDelete(a.id)} className="text-red-500"><IconTrash/></button></div>)}</div>
        </div>
    );
};

const ResourceManagement: React.FC<AdminPageProps> = ({ resources, addToast, fetchData }) => {
    const [form, setForm] = useState({ title: '', description: '', category: '', fileUrl: '' });
    const handleSubmit = async (e:React.FormEvent) => { e.preventDefault(); if(!form.fileUrl) return; await supabase.from('resources').insert([form]); fetchData(); setForm({title:'',description:'',category:'',fileUrl:''}); addToast("Resource added."); };
    const handleDelete = async (id:string) => { await supabase.from('resources').delete().eq('id', id); fetchData(); };
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded space-y-4"><h3 className="font-bold text-slate-800 dark:text-slate-100">Add Resource</h3><input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" className="w-full p-2 bg-slate-50 dark:bg-slate-700 border rounded"/><ImageUploader onImageSelect={url=>setForm({...form, fileUrl:url})} label="Upload File"/><button className="w-full bg-primary-600 text-white py-2 rounded">Add</button></form>
            <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded space-y-2">{resources.map(r => <div key={r.id} className="flex justify-between p-2 border-b text-slate-800 dark:text-slate-200"><span>{r.title}</span><button onClick={()=>handleDelete(r.id)} className="text-red-500"><IconTrash className="w-4 h-4"/></button></div>)}</div>
        </div>
    );
};

const GroupManagement: React.FC<AdminPageProps> = ({ smallGroups, addToast, fetchData }) => {
  const [form, setForm] = useState({ name: '', leader: '', topic: 'Bible Study', schedule: '', location: '', description: '', imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const topics = ['Bible Study', 'Men', 'Women', 'Youth', 'Marriage', 'Community Outreach'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) {
        addToast("Please upload an image for the group.");
        return;
    }
    setLoading(true);
    await supabase.from('small_groups').insert([form]);
    fetchData();
    setForm({ name: '', leader: '', topic: 'Bible Study', schedule: '', location: '', description: '', imageUrl: '' });
    addToast("Small group added.");
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
        await supabase.from('small_groups').delete().eq('id', id);
        fetchData();
        addToast("Group deleted.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4 h-fit">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><IconUsers className="w-5 h-5 text-primary-500" /> Add Small Group</h3>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Group Name" required className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm"/>
        <input name="leader" value={form.leader} onChange={handleChange} placeholder="Leader Name" required className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm"/>
        <select name="topic" value={form.topic} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm">
            {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input name="schedule" value={form.schedule} onChange={handleChange} placeholder="Schedule (e.g., Tuesdays at 7pm)" required className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm"/>
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location (e.g., Online or Address)" required className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm"/>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm" rows={3}/>
        <ImageUploader onImageSelect={(url) => setForm({...form, imageUrl: url})} label="Upload Group Image" />
        <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2 rounded font-bold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center">
            {loading ? <IconLoader className="w-5 h-5"/> : 'Add Group'}
        </button>
      </form>
      <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {smallGroups.map(g => (
                <div key={g.id} className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded">
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{g.name}</p>
                        <p className="text-xs text-slate-500">{g.leader}</p>
                    </div>
                    <button onClick={() => handleDelete(g.id)} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 p-2 rounded-full"><IconTrash className="w-4 h-4"/></button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;