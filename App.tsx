

import React, { useState, useEffect, useCallback, memo } from 'react';
import Navigation from './components/Navigation';
import { Page, UserRole, Sermon, Event, PrayerRequest, Meeting, SlideshowImage, ChurchBranch, User, PhotoAlbum, Announcement, Resource, Notification, SmallGroup, Post } from './types';
import { getVerseOfDay, generatePrayerResponse } from './services/geminiService';
import { supabase } from './services/supabaseClient';
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
import ResourcesPage from './pages/ResourcesPage';
import TithePage from './pages/TithePage';
import GroupsPage from './pages/GroupsPage';
import CommunityPage from './pages/CommunityPage';
import { IconX, IconArrowUp, IconLoader, IconBell } from './components/Icons';

const App: React.FC = () => {
  const [pageHistory, setPageHistory] = useState<Page[]>([Page.HOME]);
  const currentPage = pageHistory[pageHistory.length - 1];
  
  const [userRole, setUserRole] = useState<UserRole | null>(null); // Admin Role
  const [supabaseUser, setSupabaseUser] = useState<any>(null); // Authenticated User

  const [verse, setVerse] = useState<{text: string, ref: string} | null>(null);
  const [verseLoading, setVerseLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data State (Fetched from Supabase)
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [slideshowImages, setSlideshowImages] = useState<SlideshowImage[]>([]);
  const [branches, setBranches] = useState<ChurchBranch[]>([]);
  const [photoAlbums, setPhotoAlbums] = useState<PhotoAlbum[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [smallGroups, setSmallGroups] = useState<SmallGroup[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  // User Data
  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // UI State
  const [videoModal, setVideoModal] = useState<{open: boolean, url: string | null}>({open: false, url: null});
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [toasts, setToasts] = useState<{id: number, message: string}[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // --- SUPABASE FETCHING ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const { data: s } = await supabase.from('sermons').select('*').order('created_at', { ascending: false });
        if (s) setSermons(s);

        const { data: e } = await supabase.from('events').select('*').order('date', { ascending: true });
        if (e) setEvents(e);

        const { data: m } = await supabase.from('meetings').select('*');
        if (m) setMeetings(m);

        const { data: p } = await supabase.from('prayers').select('*').order('created_at', { ascending: false });
        if (p) setPrayers(p);

        const { data: si } = await supabase.from('slideshow_images').select('*');
        if (si) setSlideshowImages(si);

        const { data: b } = await supabase.from('church_branches').select('*');
        if (b) setBranches(b);

        const { data: a } = await supabase.from('announcements').select('*').eq('isActive', true).order('created_at', { ascending: false });
        if (a) setAnnouncements(a);

        const { data: r } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
        if (r) setResources(r);

        const { data: g } = await supabase.from('small_groups').select('*').order('created_at', { ascending: false });
        if (g) setSmallGroups(g as SmallGroup[]);

        const { data: po } = await supabase.from('posts').select('*, profiles(name)').order('created_at', { ascending: false });
        if (po) setPosts(po as unknown as Post[]);
        
        const { data: pa } = await supabase.from('photo_albums').select('*');
        if (pa) {
            const albumsWithPhotos = await Promise.all(pa.map(async (album: any) => {
                const { data: photos } = await supabase.from('photos').select('*').eq('album_id', album.id);
                return { ...album, photos: photos || [] };
            }));
            setPhotoAlbums(albumsWithPhotos);
        }

    } catch (error) {
        console.error("Error fetching data from Supabase:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  const fetchUserRole = async (userId: string) => {
      try {
          const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
          if (data && data.role === 'ADMIN') {
              setUserRole(UserRole.ADMIN);
          } else {
              setUserRole(UserRole.GUEST);
          }
      } catch (err) {
          setUserRole(UserRole.GUEST);
      }
  };

  const fetchNotifications = useCallback(async (userId: string) => {
    if (!userId) return;
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

    if (data) {
        setNotifications(data as Notification[]);
        setUnreadCount(data.filter(n => !n.is_read).length);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
          fetchUserProfile(session.user.id, session.user.email || '');
          fetchUserRole(session.user.id);
          fetchNotifications(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
          fetchUserProfile(session.user.id, session.user.email || '');
          fetchUserRole(session.user.id);
          fetchNotifications(session.user.id);
      } else {
          setCurrentUserProfile(null);
          setUserRole(null);
          setNotifications([]);
          setUnreadCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchData, fetchNotifications]);

  const fetchUserProfile = async (userId: string, email: string) => {
      const { data: saved } = await supabase.from('saved_sermons').select('sermon_id').eq('user_id', userId);
      const savedIds = saved ? saved.map((s: any) => s.sermon_id) : [];

      const { data: profile } = await supabase.from('profiles').select('name').eq('id', userId).single();
      
      setCurrentUserProfile({
          name: profile?.name || email.split('@')[0],
          email: email,
          savedSermonIds: savedIds
      });
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);
  
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const setPage = useCallback((page: Page) => {
      setPageHistory(prev => [...prev, page]);
      window.scrollTo(0, 0);
  }, []);

  const goBack = useCallback(() => setPageHistory(prev => prev.slice(0, -1)), []);

  useEffect(() => {
    if (!verse && !verseLoading) {
        setVerseLoading(true);
        getVerseOfDay().then(v => setVerse({ text: v.verse, ref: v.reference })).finally(() => setVerseLoading(false));
    }
  }, [verse, verseLoading]);

  const addToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, {id, message}]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const handleShare = useCallback(async (title: string, text: string, url: string) => {
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); } catch (error) { console.error('Error sharing:', error); }
    } else {
      navigator.clipboard.writeText(`${title} - ${url}`);
      addToast("Link copied to clipboard!");
    }
  }, [addToast]);

  const handlePrayerSubmit = useCallback(async (name: string, content: string) => {
    const { data, error } = await supabase.from('prayers').insert([
        { name, content, status: 'PENDING', prayer_count: 0 }
    ]).select();
    if (error) { addToast("Error submitting prayer."); return; }
    if (data) setPrayers(prev => [data[0] as unknown as PrayerRequest, ...prev]);
    const response = await generatePrayerResponse(content);
    if (data && data[0]) {
        await supabase.from('prayers').update({ ai_response: response }).eq('id', data[0].id);
        fetchData();
    }
  }, [addToast, fetchData]);
  
  const handleSaveSermon = useCallback(async (sermonId: string) => {
    if(!supabaseUser) { addToast("Please log in to save sermons."); setPage(Page.PROFILE); return; }
    const isSaved = currentUserProfile?.savedSermonIds.includes(sermonId);
    if (isSaved) {
        await supabase.from('saved_sermons').delete().match({ user_id: supabaseUser.id, sermon_id: sermonId });
        setCurrentUserProfile(prev => prev ? ({...prev, savedSermonIds: prev.savedSermonIds.filter(id => id !== sermonId)}) : null);
        addToast('Sermon removed from your list.');
    } else {
        await supabase.from('saved_sermons').insert({ user_id: supabaseUser.id, sermon_id: sermonId });
        setCurrentUserProfile(prev => prev ? ({...prev, savedSermonIds: [...prev.savedSermonIds, sermonId]}) : null);
        addToast('Sermon saved!');
    }
  }, [supabaseUser, currentUserProfile, addToast, setPage]);

  const handleAdminLogin = useCallback((role: UserRole) => { setUserRole(role); setPage(Page.ADMIN); }, [setPage]);

  const openVideoModal = useCallback((url: string) => {
      let embedUrl = url;
      if (url.includes('youtu.be')) {
           const videoId = url.split('/').pop()?.split('?')[0];
           embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtube.com')) {
           const videoId = new URL(url).searchParams.get('v');
           embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      setVideoModal({ open: true, url: embedUrl });
  }, []);

  const handleOpenNotifications = useCallback(async () => {
    if (!supabaseUser || unreadCount === 0) return;
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({...n, is_read: true})));
    const { error } = await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    if (error) { console.error("Error marking notifications as read:", error); fetchNotifications(supabaseUser.id); }
  }, [supabaseUser, unreadCount, notifications, fetchNotifications]);

  const handleNotificationClick = useCallback((page: Page, id?: string) => {
    setPage(page);
  }, [setPage]);

  const renderPage = () => {
    const savedSermonsList = sermons.filter(s => currentUserProfile?.savedSermonIds.includes(s.id));
    if (loading) { return <div className="flex items-center justify-center min-h-screen"><IconLoader className="w-10 h-10 text-primary-600" /></div>; }
    switch (currentPage) {
        case Page.HOME: return <HomePage verse={verse} setPage={setPage} slideshowImages={slideshowImages} verseLoading={verseLoading} />;
        case Page.SERMONS: return <SermonsPage sermons={sermons} openVideoModal={openVideoModal} handleShare={handleShare} currentUser={currentUserProfile} handleSaveSermon={handleSaveSermon} supabaseUser={supabaseUser} />;
        case Page.EVENTS: return <EventsPage events={events} handleShare={handleShare} />;
        case Page.MEETINGS: return <Meetings meetings={meetings} handleShare={handleShare} />;
        case Page.PRAYER: return <PrayerPage prayers={prayers} handlePrayerSubmit={handlePrayerSubmit} setPrayers={setPrayers} addToast={addToast} />;
        case Page.MAP: return <MapPage branches={branches} />;
        case Page.GALLERY: return <GalleryPage albums={photoAlbums} />;
        case Page.PROFILE: return <ProfilePage supabaseUser={supabaseUser} currentUser={currentUserProfile} savedSermons={savedSermonsList} setPage={setPage} openVideoModal={openVideoModal} addToast={addToast} fetchData={fetchData} />;
        case Page.RESOURCES: return <ResourcesPage resources={resources} />;
        case Page.TITHE: return <TithePage />;
        case Page.GROUPS: return <GroupsPage smallGroups={smallGroups} addToast={addToast} supabaseUser={supabaseUser} setPage={setPage} />;
        case Page.COMMUNITY: return <CommunityPage posts={posts} fetchData={fetchData} supabaseUser={supabaseUser} currentUser={currentUserProfile} addToast={addToast} userRole={userRole} />;
        case Page.ADMIN: return <AdminPage userRole={userRole} handleLogin={handleAdminLogin} prayers={prayers} setPrayers={setPrayers} sermons={sermons} setSermons={setSermons} events={events} setEvents={setEvents} meetings={meetings} setMeetings={setMeetings} verse={verse} setVerse={setVerse} slideshowImages={slideshowImages} setSlideshowImages={setSlideshowImages} branches={branches} setBranches={setBranches} photoAlbums={photoAlbums} setPhotoAlbums={setPhotoAlbums} announcements={announcements} setAnnouncements={setAnnouncements} resources={resources} setResources={setResources} addToast={addToast} supabaseUser={supabaseUser} fetchData={fetchData} smallGroups={smallGroups} setSmallGroups={setSmallGroups} posts={posts} setPosts={setPosts} />;
        case Page.SEARCH: return <SearchPage sermons={sermons} events={events} meetings={meetings} setPage={setPage} />;
        default: return <HomePage verse={verse} setPage={setPage} slideshowImages={slideshowImages} verseLoading={verseLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200">
      {announcements.length > 0 && (
          <div className="bg-slate-900 dark:bg-black text-white p-3 text-center text-sm font-medium relative z-[60]">
             <div className="flex items-center justify-center gap-2 animate-pulse-slow">
                <IconBell className="w-4 h-4 text-yellow-400" />
                <span>{announcements[0].message}</span>
             </div>
          </div>
      )}

      <Navigation 
        activePage={currentPage} 
        setPage={setPage} 
        role={userRole} 
        currentUser={currentUserProfile}
        supabaseUser={supabaseUser}
        onLogout={async () => { await supabase.auth.signOut(); setUserRole(null); addToast("Logged out"); }} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        canGoBack={pageHistory.length > 1} 
        goBack={goBack} 
        notifications={notifications}
        unreadCount={unreadCount}
        onOpenNotifications={handleOpenNotifications}
        onNotificationClick={handleNotificationClick}
      />
      <main className="pb-20 md:pb-0">{renderPage()}</main>

      <div className="fixed bottom-24 md:bottom-6 right-6 z-[150] space-y-2">
          {toasts.map(toast => (
              <div key={toast.id} className="bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-up">
                  {toast.message}
              </div>
          ))}
      </div>
      
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