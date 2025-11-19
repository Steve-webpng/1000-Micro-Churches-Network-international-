
import React, { useState, useEffect, memo } from 'react';
import { PhotoAlbum } from '../types';
import { IconGallery, IconChevronLeft, IconChevronRight, IconX } from '../components/Icons';

interface GalleryPageProps {
    albums: PhotoAlbum[];
}

const GalleryPage: React.FC<GalleryPageProps> = ({ albums }) => {
    const [lightbox, setLightbox] = useState<{ album: PhotoAlbum | null; photoIndex: number }>({ album: null, photoIndex: 0 });

    const openLightbox = (album: PhotoAlbum, photoIndex: number) => {
        setLightbox({ album, photoIndex });
    };

    const closeLightbox = () => {
        setLightbox({ album: null, photoIndex: 0 });
    };

    const nextPhoto = () => {
        if (lightbox.album) {
            setLightbox(prev => ({ ...prev, photoIndex: (prev.photoIndex + 1) % prev.album!.photos.length }));
        }
    };

    const prevPhoto = () => {
        if (lightbox.album) {
            setLightbox(prev => ({ ...prev, photoIndex: (prev.photoIndex - 1 + prev.album!.photos.length) % prev.album!.photos.length }));
        }
    };
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightbox.album) {
                if (e.key === 'ArrowRight') nextPhoto();
                if (e.key === 'ArrowLeft') prevPhoto();
                if (e.key === 'Escape') closeLightbox();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightbox.album]); 


    return (
        <div className="container mx-auto p-6 max-w-6xl animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">Photo Gallery</h2>
            {albums.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {albums.map(album => (
                        <div key={album.id} onClick={() => openLightbox(album, 0)} className="group cursor-pointer aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden relative shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <img src={album.photos[0]?.url || 'https://picsum.photos/400'} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="font-bold text-lg drop-shadow-md">{album.title}</h3>
                                <p className="text-xs drop-shadow-md">{album.photos.length} photos</p>
                            </div>
                        </div>
                    ))}
                 </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-dashed border-slate-300 dark:border-slate-700">
                    <IconGallery className="w-12 h-12 text-slate-300 dark:text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No Photo Albums</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">An admin can create new albums in the dashboard.</p>
                </div>
            )}

            {lightbox.album && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-fade-in">
                    <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/70 hover:text-white z-50">
                        <IconX className="w-8 h-8"/>
                    </button>
                    
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <button onClick={prevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/40 z-50">
                            <IconChevronLeft className="w-6 h-6" />
                        </button>
                        
                        <div className="text-center">
                            <img 
                                src={lightbox.album.photos[lightbox.photoIndex].url} 
                                alt={lightbox.album.photos[lightbox.photoIndex].caption || 'Gallery image'}
                                className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl"
                            />
                             <div className="text-white mt-4 px-4">
                                <p className="font-bold">{lightbox.album.photos[lightbox.photoIndex].caption}</p>
                                <p className="text-sm text-white/70">{lightbox.photoIndex + 1} / {lightbox.album.photos.length}</p>
                             </div>
                        </div>

                        <button onClick={nextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/40 z-50">
                            <IconChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(GalleryPage);
