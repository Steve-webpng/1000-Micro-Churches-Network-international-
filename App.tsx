import React, { useState, useEffect, useCallback, memo } from 'react';
import Navigation from './components/Navigation';
import { Page, UserRole, Sermon, Event, PrayerRequest, Meeting, SlideshowImage, ChurchBranch, User, PhotoAlbum } from './types';
import { getVerseOfDay, seedSermons, seedEvents, generatePrayerResponse } from './services/geminiService';
import Meetings from './pages/Meetings';
import HomePage from './pages/HomePage';
import SermonsPage from './pages/SermonsPage';
import EventsPage from './pages/EventsPage';
import PrayerPage from './pages/PrayerPage';
import AdminPage from './pages/AdminPage';
import SearchPage from './pages/SearchPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import GalleryPage from './pages/GalleryPage';
import { IconX, IconArrowUp } from './components/Icons';

// Simple localStorage wrapper with error handling
const useStickyState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      console.warn(`Error parsing localStorage key "${key}":`, error);
      return defaultValue;
    }
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState];
};

const initialSlideshowImages: SlideshowImage[] = [
    { id: '1', url: 'https://images.unsplash.com/photo-1507692049484-3a5f6d70a255?q=80&w=2070&auto=format&fit=crop', caption: 'Gathered in Worship' },
    { id: '2', url: 'https://images.unsplash.com/photo-1543825122-38634563a55a?q=80&w=2070&auto=format&fit=crop', caption: 'Community Fellowship' },
    { id: '3', url: 'https://images.unsplash.com/photo-1518018863046-562b7b51b279?q=80&w=1943&auto=format&fit=crop', caption: 'Hearing the Word' },
];

const initialBranches: ChurchBranch[] = [
    { id: 'b1', name: 'Kampala Central Branch', leader: 'John Doe', address: '123 Main St, Kampala', lat: 0.347596, lng: 32.582520, radius: 5000 },
    { id: 'b2', name: 'Gulu Northern Branch', leader: 'Jane Smith', address: '456 Gulu Ave, Gulu', lat: 2.7745, lng: 32.2889, radius: 10000 },
];

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [pageHistory, setPageHistory] = useState<Page[]>([Page.HOME]);
  const currentPage = pageHistory[pageHistory.length - 1];
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [verse, setVerse] = useStickyState<{text: string, ref: string} | null>('verse', null);
  const [verseLoading, setVerseLoading] = useState(false);
  
  // Data State
  const [sermons, setSermons] = useStickyState<Sermon[]>('sermons', []);
  const [events, setEvents] = useStickyState<Event[]>('events', []);
  const [meetings, setMeetings] = useStickyState<Meeting[]>('meetings', []);
  const [prayers, setPrayers] = useStickyState<PrayerRequest[]>('prayers', []);
  const [slideshowImages, setSlideshowImages] = useStickyState<SlideshowImage[]>('slideshowImages', initialSlideshowImages);
  const [branches, setBranches] = useStickyState<ChurchBranch[]>('branches', initialBranches);
  const [photoAlbums, setPhotoAlbums] = useStickyState<PhotoAlbum[]>('photoAlbums', []);

  // UI State
  const [videoModal, setVideoModal] = useState<{open: boolean, url: string | null}>({open: false, url: null});
  const [darkMode, setDarkMode] = useStickyState<boolean>('darkMode', false);
  const [toasts, setToasts] = useState<{id: number, message: string}[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // User State
  const [currentUser, setCurrentUser] = useStickyState<User | null>('currentUser', null);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);
  
  const setPage = useCallback((page: Page) => {
      setPageHistory(prev => [...prev, page]);
      window.scrollTo(0, 0);
  }, []);

  const goBack = useCallback(() => setPageHistory(prev => prev.slice(0, -1)), []);

  useEffect(() => {
    if (!verse) {
        setVerseLoading(true);
        getVerseOfDay().then(v => setVerse({ text: v.verse, ref: v.reference })).finally(() => setVerseLoading(false));
    }
  }, [verse, setVerse]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, {id, message}]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const handleShare = useCallback(async (title: string, text: string, url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(`${title} - ${url}`);
      addToast("Link copied to clipboard!");
    }
  }, [addToast]);

  const handlePrayerSubmit = useCallback(async (name: string, content: string) => {
    const newPrayer: PrayerRequest = { id: Date.now().toString(), name, content, status: 'PENDING', date: new Date().toISOString(), prayerCount: 0 };
    setPrayers(prev => [newPrayer, ...prev]);
    const response = await generatePrayerResponse(content);
    setPrayers(prev => prev.map(p => p.id === newPrayer.id ? { ...p, aiResponse: response } : p));
  }, [setPrayers]);
  
  const handleUserLogin = useCallback((name: string) => {
    setCurrentUser({ name, savedSermonIds: [] });
    addToast(`Welcome, ${name}!`);
  }, [setCurrentUser, addToast]);

  const handleUserLogout = useCallback(() => {
    addToast(`You have been logged out.`);
    setCurrentUser(null);
    if(currentPage === Page.PROFILE) setPage(Page.HOME);
  }, [addToast, setCurrentUser, currentPage, setPage]);

  const handleSaveSermon = useCallback((sermonId: string) => {
    if(!currentUser) {
        addToast("Please log in to save sermons.");
        setPage(Page.PROFILE);
        return;
    }
    setCurrentUser(prevUser => {
        if(!prevUser) return null;
        const isSaved = prevUser.savedSermonIds.includes(sermonId);
        const newSavedIds = isSaved 
            ? prevUser.savedSermonIds.filter(id => id !== sermonId)
            : [...prevUser.savedSermonIds, sermonId];
        addToast(isSaved ? 'Sermon removed from your list.' : 'Sermon saved!');
        return { ...prevUser, savedSermonIds: newSavedIds };
    });
  }, [currentUser, setCurrentUser, addToast, setPage]);

  const handleLogin = useCallback((role: UserRole) => { setUserRole(role); setPage(Page.ADMIN); }, [setPage]);
  const openVideoModal = useCallback((url: string) => {
      const videoId = url.includes('youtu.be') ? url.split('/').pop()?.split('?')[0] : new URL(url).searchParams.get('v');
      setVideoModal({ open: true, url: `https://www.youtube.com/embed/${videoId}` });
  }, []);

  const renderPage = () => {
    const savedSermons = sermons.filter(s => currentUser?.savedSermonIds.includes(s.id));

    switch (currentPage) {
        case Page.HOME: return <HomePage verse={verse} setPage={setPage} slideshowImages={slideshowImages} verseLoading={verseLoading} />;
        case Page.SERMONS: return <SermonsPage sermons={sermons} openVideoModal={openVideoModal} handleShare={handleShare} currentUser={currentUser} handleSaveSermon={handleSaveSermon} />;
        case Page.EVENTS: return <EventsPage events={events} handleShare={handleShare} />;
        case Page.MEETINGS: return <Meetings meetings={meetings} handleShare={handleShare} />;
        case Page.PRAYER: return <PrayerPage prayers={prayers} handlePrayerSubmit={handlePrayerSubmit} setPrayers={setPrayers} addToast={addToast} />;
        case Page.MAP: return <MapPage branches={branches} />;
        case Page.GALLERY: return <GalleryPage albums={photoAlbums} />;
        case Page.PROFILE: return <ProfilePage currentUser={currentUser} handleLogin={handleUserLogin} handleLogout={handleUserLogout} savedSermons={savedSermons} setPage={setPage} openVideoModal={openVideoModal} />;
        case Page.ADMIN: return <AdminPage userRole={userRole} handleLogin={handleLogin} prayers={prayers} setPrayers={setPrayers} sermons={sermons} setSermons={setSermons} events={events} setEvents={setEvents} meetings={meetings} setMeetings={setMeetings} verse={verse} setVerse={setVerse} slideshowImages={slideshowImages} setSlideshowImages={setSlideshowImages} branches={branches} setBranches={setBranches} photoAlbums={photoAlbums} setPhotoAlbums={setPhotoAlbums} addToast={addToast} />;
        case Page.SEARCH: return <SearchPage sermons={sermons} events={events} meetings={meetings} setPage={setPage} />;
        default: return <HomePage verse={verse} setPage={setPage} slideshowImages={slideshowImages} verseLoading={verseLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200">
      <Navigation 
        activePage={currentPage} 
        setPage={setPage} 
        role={userRole} 
        currentUser={currentUser}
        onLogout={handleUserLogout} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        canGoBack={pageHistory.length > 1} 
        goBack={goBack} 
      />
      <main className="pb-20 md:pb-0">{renderPage()}</main>

      {/* Toast Notifications */}
      <div className="fixed bottom-24 md:bottom-6 right-6 z-[150] space-y-2">
          {toasts.map(toast => (
              <div key={toast.id} className="bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-up">
                  {toast.message}
              </div>
          ))}
      </div>
      
      {/* Back to Top Button */}
      {showBackToTop && (
        <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="fixed bottom-24 md:bottom-6 left-6 z-[150] w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition">
            <IconArrowUp className="w-6 h-6" />
        </button>
      )}

      {videoModal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in" onClick={() => setVideoModal({open: false, url: null})}>
            <div className="bg-slate-900 p-4 rounded-xl shadow-2xl w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-end mb-2">
                    <button onClick={() => setVideoModal({open: false, url: null})} className="text-slate-400 hover:text-white"><IconX/></button>
                </div>
                <div className="aspect-video">
                    <iframe className="w-full h-full rounded-lg" src={videoModal.url || ''} title="Sermon Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
