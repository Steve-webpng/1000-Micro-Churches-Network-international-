
import React, { useState, memo } from 'react';
import { Page, UserRole, PrayerRequest, Sermon, Event, Meeting, SlideshowImage, ChurchBranch, PhotoAlbum, Photo, Announcement, Resource } from '../types';
import { seedSermons, seedEvents } from '../services/geminiService';
import { IconTrash, IconPlus, IconLoader, IconMegaphone, IconBell, IconVideo, IconMapPin, IconFile } from '../components/Icons';
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
  branches: ChurchBranch[];
  setBranches: React.Dispatch<React.SetStateAction<ChurchBranch[]>>;
  photoAlbums: PhotoAlbum[];
  setPhotoAlbums: React.Dispatch<React.SetStateAction<PhotoAlbum[]>>;
  addToast: (message: string) => void;
  supabaseUser: any;
  fetchData: () => void;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
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
        // 1. Authenticate User
        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        
        if (signInError) throw signInError;
        if (!user) throw new Error("Authentication failed");

        // 2. Check Admin Role in 'profiles' table
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

        // 3. Success
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
        case 'Prayers': return <PrayerManagement {...props} />;
        case 'Sermons': return <SermonManagement {...props} />;
        case 'Events': return <EventManagement {...props} />;
        case 'Meetings': return <MeetingManagement {...props} />;
        case 'Slideshow': return <SlideshowManagement {...props} />;
        case 'Gallery': return <GalleryManagement {...props} />;
        case 'Branches': return <BranchManagement {...props} />;
        case 'Resources': return <ResourceManagement {...props} />;
        default: return null;
    }
  };

  // 1. Not Logged In
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

  // 2. Logged In but NOT Admin (RBAC Check)
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

  const tabs = ['Dashboard', 'Announcements', 'Prayers', 'Sermons', 'Events', 'Meetings', 'Slideshow', 'Gallery', 'Branches', 'Resources'];

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
        addToast("Announcement deleted.");
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
                 <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Active Announcements</h3>
                 <div className="space-y-3">
                    {announcements.map(item => (
                        <div key={item.id} className={`flex items-center justify-between p-4 rounded-lg border ${item.isActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 opacity-60'}`}>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{item.message}</p>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${
                                    item.type === 'ALERT' ? 'bg-red-100 text-red-800' : item.type === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}>{item.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleStatus(item.id, item.isActive)} className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${item.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                    {item.isActive ? 'Active' : 'Inactive'}
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"><IconTrash className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                    {announcements.length === 0 && <p className="text-slate-500 text-sm italic text-center py-4">No announcements found.</p>}
                 </div>
            </div>
        </div>
    );
};

const PrayerManagement: React.FC<AdminPageProps> = ({ prayers, setPrayers, addToast, fetchData }) => {
  const pendingPrayers = prayers.filter(p => p.status === 'PENDING');

  const handleApprove = async (id: string) => {
    await supabase.from('prayers').update({ status: 'APPROVED' }).eq('id', id);
    fetchData();
    addToast("Prayer request approved.");
  };

  const handleDelete = async (id: string) => {
    await supabase.from('prayers').delete().eq('id', id);
    fetchData();
    addToast("Prayer request deleted.");
  };
  
  return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Pending Prayer Requests ({pendingPrayers.length})</h2>
        <div className="space-y-4">
          {pendingPrayers.map(p => (
            <div key={p.id} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-0">
              <p className="font-semibold text-slate-800 dark:text-slate-100">{p.name}</p>
              <p className="text-slate-600 dark:text-slate-300 my-2 italic">"{p.content}"</p>
              <div className="flex gap-3 mt-3">
                <button onClick={() => handleApprove(p.id)} className="bg-green-500 text-white px-4 py-1.5 text-sm font-medium rounded-lg hover:bg-green-600 transition-colors">Approve</button>
                <button onClick={() => handleDelete(p.id)} className="bg-red-500 text-white px-4 py-1.5 text-sm font-medium rounded-lg hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </div>
          ))}
          {pendingPrayers.length === 0 && <p className="text-slate-500 italic text-center py-8">No pending requests.</p>}
        </div>
      </div>
  );
};

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
            // Upload to 'images' bucket. 
            const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('images').getPublicUrl(fileName);
            setPreview(data.publicUrl);
            onImageSelect(data.publicUrl);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading. Ensure you have a public "images" bucket.');
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


const SermonManagement: React.FC<AdminPageProps> = ({ sermons, setSermons, addToast, fetchData }) => {
  const [form, setForm] = useState({ title: '', speaker: '', series: '', date: '', description: '', imageUrl: '', videoUrl: '', audioUrl: '' });
  const [isSeeding, setIsSeeding] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleImageSelect = (url: string) => {
    setForm({...form, imageUrl: url});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('sermons').insert([form]);
    if (error) {
        addToast("Error adding sermon.");
    } else {
        fetchData();
        setForm({ title: '', speaker: '', series: '', date: '', description: '', imageUrl: '', videoUrl: '', audioUrl: '' });
        addToast("Sermon added.");
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('sermons').delete().eq('id', id);
    fetchData();
    addToast("Sermon deleted.");
  };
  
  const handleSeed = async () => {
      setIsSeeding(true);
      await seedSermons();
      fetchData();
      setIsSeeding(false);
      addToast(`Sermons seeded.`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4 h-fit">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add Sermon</h3>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
        <input name="speaker" value={form.speaker} onChange={handleChange} placeholder="Speaker" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
        <input name="series" value={form.series} onChange={handleChange} placeholder="Series (Optional)" className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
        <input name="date" type="date" value={form.date} onChange={handleChange} required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none" rows={3}></textarea>
        
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cover Image</label>
            <ImageUploader onImageSelect={handleImageSelect} />
        </div>

        <input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="YouTube URL (Optional)" className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
        <input name="audioUrl" value={form.audioUrl} onChange={handleChange} placeholder="Audio URL (Optional)" className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
        
        <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-bold hover:bg-primary-700 transition-colors">Publish Sermon</button>
      </form>
      
      <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Manage Sermons ({sermons.length})</h3>
            <button onClick={handleSeed} disabled={isSeeding} className="flex items-center text-sm bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 font-medium transition-colors">
                {isSeeding && <IconLoader className="w-4 h-4 mr-2 animate-spin" />} Seed with AI
            </button>
        </div>
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {sermons.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
              <div className="flex items-center gap-4">
                <img src={s.imageUrl} alt={s.title} className="w-16 h-10 object-cover rounded shadow-sm"/>
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{s.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.speaker} • {s.date}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(s.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><IconTrash className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const EventManagement: React.FC<AdminPageProps> = ({ events, setEvents, addToast, fetchData }) => {
    const [form, setForm] = useState({ title: '', date: '', location: '', description: ''});
    const [isSeeding, setIsSeeding] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await supabase.from('events').insert([form]);
      fetchData();
      setForm({ title: '', date: '', location: '', description: '' });
      addToast("Event added.");
    };

    const handleDelete = async (id: string) => {
        await supabase.from('events').delete().eq('id', id);
        fetchData();
        addToast("Event deleted.");
    };

    const handleSeed = async () => {
      setIsSeeding(true);
      await seedEvents();
      fetchData();
      setIsSeeding(false);
      addToast(`Events seeded.`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4 h-fit">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add Event</h3>
            <input name="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
            <input name="date" type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
            <input name="location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Location" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
            <textarea name="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none" rows={3}></textarea>
            <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-bold hover:bg-primary-700 transition-colors">Add Event</button>
          </form>
          <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Manage Events ({events.length})</h3>
              <button onClick={handleSeed} disabled={isSeeding} className="flex items-center text-sm bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 font-medium transition-colors">
                {isSeeding && <IconLoader className="w-4 h-4 mr-2 animate-spin" />} Seed with AI
              </button>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {events.map(item => (
                <div key={item.id} className="flex items-start justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(item.date).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><IconTrash className="w-4 h-4"/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
    );
};

const MeetingManagement: React.FC<AdminPageProps> = ({ meetings, setMeetings, addToast, fetchData }) => {
    const [form, setForm] = useState({ title: '', host: '', startTime: '', description: '', participants: 0 });
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await supabase.from('meetings').insert([form]);
        fetchData();
        setForm({ title: '', host: '', startTime: '', description: '', participants: 0 });
        addToast("Meeting scheduled.");
    };
    
    const handleDelete = async (id: string) => {
        await supabase.from('meetings').delete().eq('id', id);
        fetchData();
        addToast("Meeting deleted.");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4 h-fit">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Schedule Meeting</h3>
                <input name="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
                <input name="host" value={form.host} onChange={e => setForm({...form, host: e.target.value})} placeholder="Host Name" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
                <input name="startTime" type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
                <textarea name="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none" rows={3}></textarea>
                <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-bold hover:bg-primary-700 transition-colors">Schedule</button>
            </form>
            <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Upcoming Meetings ({meetings.length})</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {meetings.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg text-primary-600 dark:text-primary-400"><IconVideo className="w-6 h-6"/></div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{m.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{m.startTime} • {m.host}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(m.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><IconTrash className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SlideshowManagement: React.FC<AdminPageProps> = ({ slideshowImages, setSlideshowImages, addToast, fetchData }) => {
    const [caption, setCaption] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleImageSelect = (url: string) => {
        setImageUrl(url);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl) { addToast("Please upload an image."); return; }
        
        await supabase.from('slideshow_images').insert([{ url: imageUrl, caption }]);
        fetchData();
        setCaption('');
        setImageUrl('');
        addToast("Slide added.");
    };

    const handleDelete = async (id: string) => {
        await supabase.from('slideshow_images').delete().eq('id', id);
        fetchData();
        addToast("Slide removed.");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4 h-fit">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add Slide</h3>
                <ImageUploader onImageSelect={handleImageSelect} />
                <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption (Optional)" className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
                <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-bold hover:bg-primary-700 transition-colors">Add Slide</button>
            </form>
             <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Slides ({slideshowImages.length})</h3>
                <div className="grid grid-cols-2 gap-4">
                    {slideshowImages.map(img => (
                        <div key={img.id} className="relative group rounded-lg overflow-hidden aspect-video">
                            <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => handleDelete(img.id)} className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"><IconTrash className="w-5 h-5"/></button>
                            </div>
                            {img.caption && <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">{img.caption}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const BranchManagement: React.FC<AdminPageProps> = ({ branches, setBranches, addToast, fetchData }) => {
    const [form, setForm] = useState({ name: '', leader: '', address: '', lat: '', lng: '', radius: 2000 });
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newBranch = {
            ...form,
            lat: parseFloat(form.lat),
            lng: parseFloat(form.lng)
        };
        await supabase.from('church_branches').insert([newBranch]);
        fetchData();
        setForm({ name: '', leader: '', address: '', lat: '', lng: '', radius: 2000 });
        addToast("Branch added.");
    };

    const handleDelete = async (id: string) => {
        await supabase.from('church_branches').delete().eq('id', id);
        fetchData();
        addToast("Branch deleted.");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4 h-fit">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add Branch</h3>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Branch Name" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
                <input value={form.leader} onChange={e => setForm({...form, leader: e.target.value})} placeholder="Leader Name" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
                <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Address" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
                <div className="grid grid-cols-2 gap-2">
                    <input value={form.lat} onChange={e => setForm({...form, lat: e.target.value})} placeholder="Latitude" required type="number" step="any" className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
                    <input value={form.lng} onChange={e => setForm({...form, lng: e.target.value})} placeholder="Longitude" required type="number" step="any" className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
                </div>
                <input value={form.radius} onChange={e => setForm({...form, radius: parseInt(e.target.value)})} placeholder="Radius (meters)" required type="number" className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
                <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-bold hover:bg-primary-700 transition-colors">Add Branch</button>
            </form>
            <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Manage Branches ({branches.length})</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {branches.map(b => (
                        <div key={b.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg text-primary-600 dark:text-primary-400"><IconMapPin className="w-6 h-6"/></div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{b.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{b.leader} • {b.address}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(b.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><IconTrash className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const GalleryManagement: React.FC<AdminPageProps> = ({ photoAlbums, setPhotoAlbums, addToast, fetchData }) => {
    const [albumTitle, setAlbumTitle] = useState('');
    const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

    const handleCreateAlbum = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!albumTitle.trim()) return;
        await supabase.from('photo_albums').insert([{ title: albumTitle }]);
        fetchData();
        setAlbumTitle('');
        addToast("Album created.");
    };

    const handleDeleteAlbum = async (id: string) => {
        await supabase.from('photo_albums').delete().eq('id', id);
        fetchData();
        addToast("Album deleted.");
    };

    const handleAddPhoto = async (url: string) => {
        if (!selectedAlbumId) return;
        await supabase.from('photos').insert([{ url, album_id: selectedAlbumId }]);
        fetchData();
        addToast("Photo added.");
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Create Album</h3>
                <form onSubmit={handleCreateAlbum} className="flex gap-4">
                    <input value={albumTitle} onChange={e => setAlbumTitle(e.target.value)} placeholder="Album Title" required className="flex-1 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
                    <button type="submit" className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary-700 transition-colors">Create</button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {photoAlbums.map(album => (
                    <div key={album.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{album.title}</h4>
                            <button onClick={() => handleDeleteAlbum(album.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full"><IconTrash className="w-5 h-5"/></button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {album.photos?.slice(0, 5).map(photo => (
                                <img key={photo.id} src={photo.url} className="w-full aspect-square object-cover rounded-md border border-slate-200 dark:border-slate-600" />
                            ))}
                            {album.photos?.length > 5 && <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-md text-xs text-slate-500">+{album.photos.length - 5} more</div>}
                        </div>

                        <div onClick={() => setSelectedAlbumId(album.id)}>
                            <ImageUploader onImageSelect={handleAddPhoto} label="Add Photo to Album" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ResourceManagement: React.FC<AdminPageProps> = ({ resources, setResources, addToast, fetchData }) => {
    const [form, setForm] = useState({ title: '', description: '', category: '', fileUrl: '' });

    const handleFileSelect = (url: string) => {
        setForm({ ...form, fileUrl: url });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.fileUrl) { addToast("Please upload a file."); return; }
        await supabase.from('resources').insert([form]);
        fetchData();
        setForm({ title: '', description: '', category: '', fileUrl: '' });
        addToast("Resource added.");
    };

    const handleDelete = async (id: string) => {
        await supabase.from('resources').delete().eq('id', id);
        fetchData();
        addToast("Resource deleted.");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4 h-fit">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add Resource</h3>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"/>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none" rows={3}></textarea>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="">Select Category</option>
                    <option value="Study Guide">Study Guide</option>
                    <option value="Policy">Policy</option>
                    <option value="Children">Children</option>
                    <option value="Worship">Worship</option>
                    <option value="Other">Other</option>
                </select>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Upload File (PDF/Doc)</label>
                    <ImageUploader onImageSelect={handleFileSelect} label="Upload Document" accept=".pdf,.doc,.docx,.txt" />
                </div>
                <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-bold hover:bg-primary-700 transition-colors">Add Resource</button>
            </form>
            <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Manage Resources ({resources?.length || 0})</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {resources?.map(r => (
                        <div key={r.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg text-primary-600 dark:text-primary-400"><IconFile className="w-6 h-6"/></div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{r.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{r.category}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary-600 p-2"><IconFile className="w-4 h-4"/></a>
                                <button onClick={() => handleDelete(r.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><IconTrash className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
