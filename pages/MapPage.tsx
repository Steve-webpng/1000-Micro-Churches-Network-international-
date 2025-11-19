
import React, { useState, useEffect, memo } from 'react';
import { ChurchBranch } from '../types';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface MapPageProps {
    branches: ChurchBranch[];
}

const MapPage: React.FC<MapPageProps> = ({ branches }) => {
    const [map, setMap] = useState<any>(null);
    const [infoWindow, setInfoWindow] = useState<any>(null);
    const [markers, setMarkers] = useState<any[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<ChurchBranch | null>(null);
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        if (!API_KEY) return;

        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
            script.async = true;
            script.defer = true;
            window.initMap = initMap;
            document.head.appendChild(script);
        } else {
            initMap();
        }
    }, [API_KEY]);

    const initMap = () => {
        const mapInstance = new window.google.maps.Map(document.getElementById('map'), {
            center: { lat: 1.3733, lng: 32.2903 }, // Center of Uganda
            zoom: 7,
            mapId: '1000_MICRO_CHURCH_MAP',
        });
        setMap(mapInstance);
        setInfoWindow(new window.google.maps.InfoWindow());
    };

    useEffect(() => {
        if (map && infoWindow && branches.length > 0) {
            // Clear old markers
            markers.forEach(marker => marker.setMap(null));
            
            const newMarkers = branches.map(branch => {
                const marker = new window.google.maps.Marker({
                    position: { lat: branch.lat, lng: branch.lng },
                    map: map,
                    title: branch.name,
                });

                const circle = new window.google.maps.Circle({
                    strokeColor: '#16a34a',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#22c55e',
                    fillOpacity: 0.2,
                    map,
                    center: { lat: branch.lat, lng: branch.lng },
                    radius: branch.radius,
                });
                
                marker.addListener('click', () => {
                    const content = `
                        <div style="font-family: sans-serif;">
                            <h3 style="font-weight: bold; margin: 0 0 4px;">${branch.name}</h3>
                            <p style="margin: 0;">Leader: ${branch.leader}</p>
                            <p style="margin: 0;">${branch.address}</p>
                        </div>`;
                    infoWindow.setContent(content);
                    infoWindow.open(map, marker);
                    setSelectedBranch(branch);
                });

                return marker;
            });
            setMarkers(newMarkers);
        }
    }, [map, infoWindow, branches]);
    
    const handleBranchClick = (branch: ChurchBranch) => {
      if (map && markers.length > 0) {
        const marker = markers.find(m => m.getTitle() === branch.name);
        if (marker) {
          map.panTo(marker.getPosition());
          map.setZoom(12);
          window.google.maps.event.trigger(marker, 'click');
        }
      }
    };

    if (!API_KEY) {
        return (
            <div className="container mx-auto p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">Branch Map</h2>
                <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
                    Google Maps API Key is not configured. Please add it to your environment variables to display the map.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] animate-fade-in">
            <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-slate-800 overflow-y-auto border-r border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">Our Branches ({branches.length})</h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {branches.map(branch => (
                        <div key={branch.id} 
                             onClick={() => handleBranchClick(branch)}
                             className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selectedBranch?.id === branch.id ? 'bg-primary-50 dark:bg-primary-500/10' : ''}`}>
                            <h3 className="font-semibold text-primary-600 dark:text-primary-400">{branch.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{branch.leader}</p>
                            <p className="text-xs text-slate-400 mt-1">{branch.address}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div id="map" className="flex-1 h-full w-full"></div>
        </div>
    );
};

export default memo(MapPage);
