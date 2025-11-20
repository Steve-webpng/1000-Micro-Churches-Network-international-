
import React, { useState, useEffect } from 'react';
import { Page, SlideshowImage } from '../types';
import { IconChevronLeft, IconChevronRight, IconMail, IconLoader } from '../components/Icons';
import { supabase } from '../services/supabaseClient';

interface HomePageProps {
    verse: { text: string; ref: string } | null;
    setPage: (page: Page) => void;
    slideshowImages: SlideshowImage[];
    verseLoading: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ verse, setPage, slideshowImages, verseLoading }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Connect Form State
    const [connectName, setConnectName] = useState('');
    const [connectEmail, setConnectEmail] = useState('');
    const [connectType, setConnectType] = useState('First Time Guest');
    const [connectMessage, setConnectMessage] = useState('');
    const [connectLoading, setConnectLoading] = useState(false);
    const [connectStatus, setConnectStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const prevSlide = () => setCurrentIndex(i => (i === 0 ? slideshowImages.length - 1 : i - 1));
    const nextSlide = () => {
        if (slideshowImages.length > 0) {
            setCurrentIndex(i => (i === slideshowImages.length - 1 ? 0 : i + 1));
        }
    };
    
    useEffect(() => {
        if (slideshowImages.length > 1) {
            const timer = setTimeout(nextSlide, 5000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, slideshowImages.length]);

    const handleConnectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setConnectLoading(true);
        setConnectStatus('idle');
        
        try {
            const { error } = await supabase.from('connect_submissions').insert([{
                name: connectName,
                email: connectEmail,
                type: connectType,
                message: connectMessage
            }]);
            
            if (error) throw error;
            
            setConnectStatus('success');
            setConnectName('');
            setConnectEmail('');
            setConnectMessage('');
            setConnectType('First Time Guest');
            setTimeout(() => setConnectStatus('idle'), 3000);
        } catch (err) {
            console.error(err);
            setConnectStatus('error');
        } finally {
            setConnectLoading(false);
        }
    };

    return (
        <div className="animate-fade-in pb-20">
            {/* Slideshow */}
            <div className="relative w-full h-[60vh] md:h-[70vh] group bg-slate-900">
                {slideshowImages.map((image, index) => (
                    <div
                        key={image.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img src={image.url} alt={image.caption || 'Slideshow image'} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50"></div>
                        {image.caption && (
                             <div className="absolute bottom-10 md:bottom-20 left-1/2 -translate-x-1/2 text-center text-white px-4">
                                <h2 className="text-3xl md:text-5xl font-bold tracking-tight drop-shadow-lg animate-fade-in-up">
                                    {image.caption}
                                </h2>
                             </div>
                        )}
                    </div>
                ))}
                {slideshowImages.length > 1 && (
                    <>
                        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-white/40">
                            <IconChevronLeft className="w-6 h-6" />
                        </button>
                        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-white/40">
                            <IconChevronRight className="w-6 h-6" />
                        </button>
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                            {slideshowImages.map((_, i) => (
                                <div key={i} onClick={() => setCurrentIndex(i)} className={`w-2 h-2 rounded-full cursor-pointer transition-all ${i === currentIndex ? 'bg-white w-4' : 'bg-white/50'}`}></div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="container mx-auto p-6 max-w-6xl -mt-16 relative z-10">
                {/* Verse of the Day */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl text-center border border-slate-100 dark:border-slate-700">
                    {verseLoading ? (
                        <div className="h-20 flex justify-center items-center"><div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : verse ? (
                        <>
                            <p className="text-2xl md:text-3xl font-serif text-slate-700 dark:text-slate-200">"{verse.text}"</p>
                            <cite className="block mt-4 text-slate-500 dark:text-slate-400 not-italic font-semibold tracking-wide uppercase text-sm">{verse.ref}</cite>
                        </>
                    ) : (
                        <p className="text-slate-500">Verse of the day could not be loaded.</p>
                    )}
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12">
                    <button onClick={() => setPage(Page.SERMONS)} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-center border border-slate-100 dark:border-slate-700/50 hover:border-primary-500/50 dark:hover:border-primary-500/50">
                        <h3 className="font-bold text-lg text-primary-600 dark:text-primary-500">Latest Sermons</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Listen to recent messages</p>
                    </button>
                    <button onClick={() => setPage(Page.EVENTS)} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-center border border-slate-100 dark:border-slate-700/50 hover:border-primary-500/50 dark:hover:border-primary-500/50">
                        <h3 className="font-bold text-lg text-primary-600 dark:text-primary-500">Upcoming Events</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">See what's happening</p>
                    </button>
                    <button onClick={() => setPage(Page.PRAYER)} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-center border border-slate-100 dark:border-slate-700/50 hover:border-primary-500/50 dark:hover:border-primary-500/50">
                        <h3 className="font-bold text-lg text-primary-600 dark:text-primary-500">Prayer Wall</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Share & receive prayer</p>
                    </button>
                     <button onClick={() => setPage(Page.RESOURCES)} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-center border border-slate-100 dark:border-slate-700/50 hover:border-primary-500/50 dark:hover:border-primary-500/50">
                        <h3 className="font-bold text-lg text-primary-600 dark:text-primary-500">Resources</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Study guides & more</p>
                    </button>
                </div>

                {/* Connect Card Section */}
                <div className="mt-20 bg-slate-50 dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-12 items-start">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">New Here? Connect With Us</h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                            We would love to get to know you! Whether you're visiting for the first time, have a prayer request, or are looking for a way to serve, fill out this card and we'll be in touch.
                        </p>
                        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
                            <div className="flex items-center gap-2"><IconMail className="w-5 h-5 text-primary-500"/> hello@1000micro.church</div>
                        </div>
                    </div>
                    <form onSubmit={handleConnectSubmit} className="flex-1 w-full bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800">
                        <div className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="Your Name" 
                                required
                                value={connectName}
                                onChange={e => setConnectName(e.target.value)}
                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition"
                            />
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                required
                                value={connectEmail}
                                onChange={e => setConnectEmail(e.target.value)}
                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition"
                            />
                            <select 
                                value={connectType}
                                onChange={e => setConnectType(e.target.value)}
                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition"
                            >
                                <option value="First Time Guest">First Time Guest</option>
                                <option value="Returning Guest">Returning Guest</option>
                                <option value="Prayer Request">Prayer Request</option>
                                <option value="Interested in Serving">Interested in Serving</option>
                                <option value="Other">Other</option>
                            </select>
                            <textarea 
                                placeholder="How can we help you?" 
                                rows={4}
                                value={connectMessage}
                                onChange={e => setConnectMessage(e.target.value)}
                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition"
                            ></textarea>
                            <button 
                                type="submit" 
                                disabled={connectLoading}
                                className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {connectLoading ? <IconLoader className="w-5 h-5" /> : 'Submit'}
                            </button>
                            {connectStatus === 'success' && <p className="text-green-600 text-center text-sm font-bold">Sent successfully! We'll be in touch.</p>}
                            {connectStatus === 'error' && <p className="text-red-500 text-center text-sm">Something went wrong. Please try again.</p>}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
