import React, { useState, memo } from 'react';
import { Page, UserRole, PrayerRequest, Sermon, Event, Meeting, SlideshowImage, ChurchBranch, PhotoAlbum, Photo } from '../types';
import { seedSermons, seedEvents } from '../services/geminiService';
import { IconTrash, IconPlus, IconLoader } from '../components/Icons';

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
}

const AdminPage: React.FC<AdminPageProps> = (props) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '12345678') {
      props.handleLogin(UserRole.ADMIN);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
        case 'Dashboard': return <Dashboard {...props} />;
        case 'Prayers': return <PrayerManagement {...props} />;
        case 'Sermons': return <SermonManagement {...props} />;
        case 'Events': return <EventManagement {...props} />;
        case 'Meetings': return <MeetingManagement {...props} />;
        case 'Slideshow': return <SlideshowManagement {...props} />;
        case 'Gallery': return <GalleryManagement {...props} />;
        case 'Branches': return <BranchManagement {...props} />;
        case 'Settings': return <Settings {...props} />;
        default: return null;
    }
  };

  if (!props.userRole) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-sm animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Admin Login</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Enter password to access dashboard.</p>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-primary-500 outline-none" />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700">Login</button>
        </form>
      </div>
    );
  }

  const tabs = ['Dashboard', 'Prayers', 'Sermons', 'Events', 'Meetings', 'Slideshow', 'Gallery', 'Branches', 'Settings'];

  return (
    <div className="container mx-auto p-6 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
            {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                    {tab}
                </button>
            ))}
        </div>
        <div>{renderContent()}</div>
    </div>
  );
};

// ... Sub-components for each tab
const Dashboard: React.FC<AdminPageProps> = ({ prayers, sermons, events, meetings }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Sermons</h3>
            <p className="text-3xl font-bold mt-1">{sermons.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Events</h3>
            <p className="text-3xl font-bold mt-1">{events.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Scheduled Meetings</h3>
            <p className="text-3xl font-bold mt-1">{meetings.length}</p>
        </div>
         <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Prayers</h3>
            <p className="text-3xl font-bold mt-1">{prayers.filter(p => p.status === 'PENDING').length}</p>
        </div>
    </div>
);

const PrayerManagement: React.FC<AdminPageProps> = ({ prayers, setPrayers, addToast }) => {
  const pendingPrayers = prayers.filter(p => p.status === 'PENDING');

  const handleApprove = (id: string) => {
    setPrayers(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
    addToast("Prayer request approved.");
  };

  const handleDelete = (id: string) => {
    setPrayers(prev => prev.filter(p => p.id !== id));
    addToast("Prayer request deleted.");
  };
  
  return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Pending Prayer Requests ({pendingPrayers.length})</h2>
        <div className="space-y-4">
          {pendingPrayers.map(p => (
            <div key={p.id} className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <p className="font-semibold">{p.name}</p>
              <p className="text-slate-600 dark:text-slate-300 my-2">{p.content}</p>
              <div className="flex gap-2">
                <button onClick={() => handleApprove(p.id)} className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600">Approve</button>
                <button onClick={() => handleDelete(p.id)} className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600">Delete</button>
              </div>
            </div>
          ))}
          {pendingPrayers.length === 0 && <p className="text-slate-500">No pending requests.</p>}
        </div>
      </div>
  );
};

const ImageUploader: React.FC<{onImageSelect: (base64: string) => void}> = ({ onImageSelect }) => {
    const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
    const [imageUrl, setImageUrl] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPreview(base64String);
                onImageSelect(base64String);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      setImageUrl(url);
      setPreview(url);
      onImageSelect(url);
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <button type="button" onClick={() => setUploadType('file')} className={`text-sm px-3 py-1 rounded-full ${uploadType === 'file' ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Upload File</button>
                <button type="button" onClick={() => setUploadType('url')} className={`text-sm px-3 py-1 rounded-full ${uploadType === 'url' ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>From URL</button>
            </div>
            {uploadType === 'file' ? (
                <>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full text-sm border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 hover:border-primary-500">
                        Choose Image...
                    </button>
                </>
            ) : (
                <input type="url" placeholder="https://example.com/image.png" value={imageUrl} onChange={handleUrlChange} className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3" />
            )}
            {preview && <img src={preview} alt="Preview" className="mt-2 rounded-lg max-h-32" />}
        </div>
    );
};


const SermonManagement: React.FC<AdminPageProps> = ({ sermons, setSermons, addToast }) => {
  const [form, setForm] = useState({ title: '', speaker: '', series: '', date: '', description: '', imageUrl: '', videoUrl: '' });
  const [isSeeding, setIsSeeding] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleImageSelect = (base64: string) => {
    setForm({...form, imageUrl: base64});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSermon: Sermon = { ...form, id: Date.now().toString() };
    setSermons(prev => [newSermon, ...prev]);
    setForm({ title: '', speaker: '', series: '', date: '', description: '', imageUrl: '', videoUrl: '' });
    addToast("Sermon added.");
  };

  const handleDelete = (id: string) => {
    setSermons(prev => prev.filter(s => s.id !== id));
    addToast("Sermon deleted.");
  };
  
  const handleSeed = async () => {
      setIsSeeding(true);
      const newSermons = await seedSermons();
      setSermons(prev => [...newSermons, ...prev]);
      setIsSeeding(false);
      addToast(`${newSermons.length} new sermons seeded.`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-bold">Add Sermon</h3>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
        <input name="speaker" value={form.speaker} onChange={handleChange} placeholder="Speaker" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
        <input name="series" value={form.series} onChange={handleChange} placeholder="Sermon Series (Optional)" className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
        <input name="date" type="date" value={form.date} onChange={handleChange} required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"></textarea>
        <ImageUploader onImageSelect={handleImageSelect} />
        <input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="YouTube URL (Optional)" className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
        <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold">Add Sermon</button>
      </form>
      <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Manage Sermons ({sermons.length})</h3>
            <button onClick={handleSeed} disabled={isSeeding} className="flex items-center text-sm bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50">
                {isSeeding && <IconLoader className="w-4 h-4 mr-2" />} Seed 5 with AI
            </button>
        </div>
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {sermons.map(s => (
            <div key={s.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <div className="flex items-center gap-3">
                <img src={s.imageUrl} alt={s.title} className="w-16 h-10 object-cover rounded"/>
                <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-xs text-slate-500">{s.speaker}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 p-1"><IconTrash className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const EventManagement: React.FC<AdminPageProps> = ({ events, setEvents, addToast }) => {
    const [form, setForm] = useState({ title: '', date: '', location: '', description: ''});
    const [isSeeding, setIsSeeding] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newEvent: Event = { ...form, id: Date.now().toString() };
      setEvents(prev => [newEvent, ...prev]);
      setForm({ title: '', date: '', location: '', description: '' });
      addToast("Event added.");
    };

    const handleDelete = (id: string) => {
        setEvents(prev => prev.filter(item => item.id !== id));
        addToast("Event deleted.");
    };

    const handleSeed = async () => {
      setIsSeeding(true);
      const newEvents = await seedEvents();
      setEvents(prev => [...newEvents, ...prev]);
      setIsSeeding(false);
      addToast(`${newEvents.length} new events seeded.`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-4">
            <h3 className="text-xl font-bold">Add Event</h3>
            <input name="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
            <input name="date" type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
            <input name="location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Location / Address" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
            <textarea name="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"></textarea>
            <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold">Add Event</button>
          </form>
          <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Manage Events ({events.length})</h3>
              <button onClick={handleSeed} disabled={isSeeding} className="flex items-center text-sm bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50">
                {isSeeding && <IconLoader className="w-4 h-4 mr-2" />} Seed 5 with AI
              </button>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {events.map(item => (
                <div key={item.id} className="flex items-start justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-slate-500">{new Date(item.date).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-1"><IconTrash className="w-4 h-4"/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
    );
};

const MeetingManagement: React.FC<AdminPageProps> = ({ meetings, setMeetings, addToast }) => {
    const [form, setForm] = useState({ title: '', host: '', startTime: '', description: '' });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newMeeting: Meeting = { ...form, id: Date.now().toString(), participants: 1 };
      setMeetings(prev => [newMeeting, ...prev]);
      setForm({ title: '', host: '', startTime: '', description: '' });
      addToast("Meeting scheduled.");
    };

    const handleDelete = (id: string) => {
        setMeetings(prev => prev.filter(item => item.id !== id));
        addToast("Meeting deleted.");
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-4">
                <h3 className="text-xl font-bold">Schedule Meeting</h3>
                <input name="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
                <input name="host" value={form.host} onChange={e => setForm({...form, host: e.target.value})} placeholder="Host Name" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
                <input name="startTime" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} placeholder="e.g., Friday, 7:00 PM" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
                <textarea name="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" required rows={3} className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"></textarea>
                <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold">Schedule Meeting</button>
            </form>
            <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                 <h3 className="text-xl font-bold mb-4">Scheduled Meetings ({meetings.length})</h3>
                 <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                    {meetings.map(item => (
                        <div key={item.id} className="flex items-start justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <div>
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-xs text-slate-500">{item.startTime}</p>
                            </div>
                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-1"><IconTrash className="w-4 h-4"/></button>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

const SlideshowManagement: React.FC<AdminPageProps> = ({ slideshowImages, setSlideshowImages, addToast }) => {
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState('');

    const handleAdd = () => {
        if(!image) return addToast("Please select an image first.");
        const newImage: SlideshowImage = { id: Date.now().toString(), url: image, caption };
        setSlideshowImages(prev => [...prev, newImage]);
        setCaption('');
        setImage('');
        addToast("Image added to slideshow.");
    };
    
    const handleDelete = (id: string) => {
        setSlideshowImages(prev => prev.filter(img => img.id !== id));
        addToast("Image removed from slideshow.");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-4">
                <h3 className="text-xl font-bold">Add Slideshow Image</h3>
                <ImageUploader onImageSelect={setImage} />
                <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption (Optional)" className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
                <button onClick={handleAdd} className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold">Add Image</button>
            </div>
            <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                 <h3 className="text-xl font-bold mb-4">Manage Slideshow ({slideshowImages.length})</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {slideshowImages.map(img => (
                        <div key={img.id} className="relative group">
                            <img src={img.url} alt={img.caption} className="w-full h-24 object-cover rounded-lg"/>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <button onClick={() => handleDelete(img.id)} className="text-white bg-red-500/80 p-2 rounded-full"><IconTrash className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

const GalleryManagement: React.FC<AdminPageProps> = ({ photoAlbums, setPhotoAlbums, addToast }) => {
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoImage, setPhotoImage] = useState('');

  const handleAddAlbum = () => {
    if (!newAlbumTitle.trim()) return;
    const newAlbum: PhotoAlbum = { id: Date.now().toString(), title: newAlbumTitle, photos: [] };
    setPhotoAlbums(prev => [newAlbum, ...prev]);
    setNewAlbumTitle('');
    addToast("Photo album created.");
  };
  
  const handleDeleteAlbum = (id: string) => {
      setPhotoAlbums(prev => prev.filter(a => a.id !== id));
      addToast("Album deleted.");
  };
  
  const handleAddPhoto = () => {
      if(!selectedAlbumId || !photoImage) return;
      const newPhoto: Photo = { id: Date.now().toString(), url: photoImage, caption: photoCaption };
      setPhotoAlbums(prev => prev.map(album => 
          album.id === selectedAlbumId ? { ...album, photos: [...album.photos, newPhoto] } : album
      ));
      setPhotoImage('');
      setPhotoCaption('');
      addToast("Photo added to album.");
  };
  
  const handleDeletePhoto = (albumId: string, photoId: string) => {
      setPhotoAlbums(prev => prev.map(album => 
          album.id === albumId ? { ...album, photos: album.photos.filter(p => p.id !== photoId) } : album
      ));
  };
  
  return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-4">
              <h3 className="text-xl font-bold">Add Album</h3>
              <input value={newAlbumTitle} onChange={e => setNewAlbumTitle(e.target.value)} placeholder="New Album Title" className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
              <button onClick={handleAddAlbum} className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold">Create Album</button>
              <hr className="border-slate-200 dark:border-slate-700 my-4" />
              <h3 className="text-xl font-bold">Add Photo to Album</h3>
              <select value={selectedAlbumId || ''} onChange={e => setSelectedAlbumId(e.target.value)} className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3">
                  <option value="">Select an album...</option>
                  {photoAlbums.map(album => <option key={album.id} value={album.id}>{album.title}</option>)}
              </select>
              <ImageUploader onImageSelect={setPhotoImage} />
              <input value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} placeholder="Caption (Optional)" className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
              <button onClick={handleAddPhoto} disabled={!selectedAlbumId} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold disabled:bg-slate-400">Add Photo</button>
          </div>
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
               <h3 className="text-xl font-bold mb-4">Manage Photo Albums ({photoAlbums.length})</h3>
               <div className="space-y-4">
                  {photoAlbums.map(album => (
                      <div key={album.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                              <h4 className="font-bold">{album.title} ({album.photos.length})</h4>
                              <button onClick={() => handleDeleteAlbum(album.id)} className="text-red-500 hover:text-red-700"><IconTrash className="w-4 h-4"/></button>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                              {album.photos.map(photo => (
                                  <div key={photo.id} className="relative group aspect-square">
                                      <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover rounded"/>
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                          <button onClick={() => handleDeletePhoto(album.id, photo.id)} className="text-white bg-red-500/80 p-2 rounded-full"><IconTrash className="w-4 h-4"/></button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
               </div>
          </div>
      </div>
  );
};

const BranchManagement: React.FC<AdminPageProps> = ({ branches, setBranches, addToast }) => {
    // Implement management UI for Church Branches
    const [form, setForm] = useState({ name: '', leader: '', address: '', lat: '', lng: '', radius: '5000' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, [e.target.name]: e.target.value });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newBranch: ChurchBranch = {
            id: Date.now().toString(),
            name: form.name,
            leader: form.leader,
            address: form.address,
            lat: parseFloat(form.lat),
            lng: parseFloat(form.lng),
            radius: parseInt(form.radius, 10),
        };
        setBranches(prev => [newBranch, ...prev]);
        addToast("Branch added.");
        setForm({ name: '', leader: '', address: '', lat: '', lng: '', radius: '5000' });
    };

    const handleDelete = (id: string) => {
        setBranches(prev => prev.filter(b => b.id !== id));
        addToast("Branch deleted.");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <form onSubmit={handleSubmit} className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-4">
                <h3 className="text-xl font-bold">Add Church Branch</h3>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Branch Name" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
                <input name="leader" value={form.leader} onChange={handleChange} placeholder="Branch Leader" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Address" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
                <input name="lat" type="number" step="any" value={form.lat} onChange={handleChange} placeholder="Latitude" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
                <input name="lng" type="number" step="any" value={form.lng} onChange={handleChange} placeholder="Longitude" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
                <input name="radius" type="number" value={form.radius} onChange={handleChange} placeholder="Coverage Radius (meters)" required className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"/>
                <p className="text-xs text-slate-500">Hint: Right-click on Google Maps to get coordinates.</p>
                <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold">Add Branch</button>
            </form>
            <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                 <h3 className="text-xl font-bold mb-4">Manage Branches ({branches.length})</h3>
                 <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                    {branches.map(item => (
                        <div key={item.id} className="flex items-start justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-xs text-slate-500">{item.leader} - {item.address}</p>
                            </div>
                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-1"><IconTrash className="w-4 h-4"/></button>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};


const Settings: React.FC<AdminPageProps> = ({ verse, setVerse, addToast }) => {
    const [tempVerse, setTempVerse] = useState(verse?.text || '');
    const [tempRef, setTempRef] = useState(verse?.ref || '');

    const handleUpdate = () => {
        setVerse({text: tempVerse, ref: tempRef});
        addToast("Verse of the day updated.");
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md max-w-lg">
            <h2 className="text-xl font-bold mb-4">Site Settings</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Verse of the Day</label>
                    <textarea value={tempVerse} onChange={e => setTempVerse(e.target.value)} rows={3} className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3"></textarea>
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Reference</label>
                    <input value={tempRef} onChange={e => setTempRef(e.target.value)} className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3" />
                </div>
                <button onClick={handleUpdate} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold">Update Verse</button>
            </div>
        </div>
    );
};

export default memo(AdminPage);
