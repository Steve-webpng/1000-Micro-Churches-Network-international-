import React, { useState, useEffect } from 'react';
import { Page, SlideshowImage } from '../types';
import { IconChevronLeft, IconChevronRight } from '../components/Icons';

interface HomePageProps {
    verse: { text: string; ref: string } | null;
    setPage: (page: Page) => void;
    slideshowImages: SlideshowImage[];
    verseLoading: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ verse, setPage, slideshowImages, verseLoading }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

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

    return (
        <div className="animate-fade-in">
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
                     <button onClick={() => setPage(Page.MAP)} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-center border border-slate-100 dark:border-slate-700/50 hover:border-primary-500/50 dark:hover:border-primary-500/50">
                        <h3 className="font-bold text-lg text-primary-600 dark:text-primary-500">Find a Church</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Explore our branches</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
