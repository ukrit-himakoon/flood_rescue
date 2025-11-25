import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import { MapPin, Plus, AlertTriangle, Phone, Navigation, Layers } from 'lucide-react';
import { Coordinates, HelpRequest, UrgencyLevel } from './types';
import MapController from './components/MapController';
import { RequestForm } from './components/RequestForm';
import { getRequests, saveRequest } from './services/storageService';

// Hat Yai Center Coordinates
const HAT_YAI_CENTER: Coordinates = { lat: 7.0083, lng: 100.4767 };

const App: React.FC = () => {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  useEffect(() => {
    // Load initial data
    setRequests(getRequests());
    
    // Attempt to get user location on load
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          // If we are opening the form, autofill location
          if (showForm && !selectedLocation) {
              setSelectedLocation({ lat: latitude, lng: longitude });
          }
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Could not detect location. Please pin manually on map.");
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleMapClick = (coords: Coordinates) => {
    setSelectedLocation(coords);
    if (!showForm) {
       // Optional: Auto open form on click? 
       // For now, let's keep it manual or just update the "selected" state
    }
  };

  const handleNewRequest = () => {
    setShowForm(true);
    // If we have user location but no selected location, default to user location
    if (userLocation && !selectedLocation) {
        setSelectedLocation(userLocation);
    }
  };

  const handleSubmitRequest = (newRequest: HelpRequest) => {
    const updated = saveRequest(newRequest);
    setRequests(updated);
    setShowForm(false);
    setSelectedLocation(null);
  };

  const getUrgencyColor = (level: UrgencyLevel) => {
    switch (level) {
      case UrgencyLevel.CRITICAL: return '#ef4444'; // red-500
      case UrgencyLevel.HIGH: return '#f97316'; // orange-500
      case UrgencyLevel.MEDIUM: return '#eab308'; // yellow-500
      case UrgencyLevel.LOW: return '#22c55e'; // green-500
      default: return '#3b82f6';
    }
  };

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden">
      
      {/* Header */}
      <header className="z-20 bg-white shadow-md px-4 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-2">
          <div className="bg-red-600 p-2 rounded-lg text-white">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-800">Hat Yai Flood Rescue</h1>
            <p className="text-xs text-slate-500">Real-time Victim Assistance</p>
          </div>
        </div>
        <button 
          onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          className="md:hidden p-2 bg-slate-100 rounded-lg text-slate-600"
        >
          {viewMode === 'map' ? 'List View' : 'Map View'}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow relative flex">
        
        {/* Map Container */}
        <div className={`w-full h-full relative ${viewMode === 'list' ? 'hidden md:block' : 'block'}`}>
          <MapContainer 
            center={[HAT_YAI_CENTER.lat, HAT_YAI_CENTER.lng]} 
            zoom={13} 
            scrollWheelZoom={true}
            className="w-full h-full z-0"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="topright" />

            <MapController 
              onLocationSelect={handleMapClick} 
              selectedLocation={selectedLocation}
              userLocation={userLocation}
            />

            {/* Render Request Markers */}
            {requests.map(req => (
              <CircleMarker
                key={req.id}
                center={[req.location.lat, req.location.lng]}
                pathOptions={{ 
                  color: 'white', 
                  fillColor: getUrgencyColor(req.urgency), 
                  fillOpacity: 0.8, 
                  weight: 2 
                }}
                radius={10}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex justify-between items-start mb-2 border-b pb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded text-white`} style={{backgroundColor: getUrgencyColor(req.urgency)}}>
                        {req.urgency}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(req.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{req.name}</h3>
                    <p className="text-sm text-slate-700 my-1">{req.details}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {req.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                       <a href={`tel:${req.phone}`} className="flex-1 bg-green-50 text-green-700 text-xs py-1 px-2 rounded border border-green-200 flex items-center justify-center hover:bg-green-100">
                        <Phone size={12} className="mr-1" /> Call
                       </a>
                       <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${req.location.lat},${req.location.lng}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 bg-blue-50 text-blue-700 text-xs py-1 px-2 rounded border border-blue-200 flex items-center justify-center hover:bg-blue-100"
                       >
                        <Navigation size={12} className="mr-1" /> GPS
                       </a>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* Floating Action Button for New Request */}
          <button
            onClick={handleNewRequest}
            className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-[500] bg-red-600 text-white p-4 rounded-full shadow-xl hover:bg-red-700 transition-transform hover:scale-105 flex items-center font-bold gap-2"
          >
            <Plus size={24} />
            <span className="hidden md:inline">Request Help</span>
          </button>
        </div>

        {/* Sidebar List (Desktop) / Full View (Mobile List Mode) */}
        <div className={`bg-white border-l w-full md:w-96 flex-shrink-0 flex flex-col z-10 ${viewMode === 'list' ? 'block' : 'hidden md:flex'}`}>
          <div className="p-4 bg-slate-50 border-b">
            <h2 className="font-semibold text-slate-700 flex items-center">
              <Layers size={18} className="mr-2" />
              Recent Requests
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {requests.length === 0 && (
               <div className="text-center text-gray-400 py-10">
                 No active requests. Stay safe!
               </div>
             )}
             {[...requests].sort((a,b) => b.timestamp - a.timestamp).map(req => (
               <div key={req.id} className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                 <div className={`absolute left-0 top-0 bottom-0 w-1`} style={{backgroundColor: getUrgencyColor(req.urgency)}}></div>
                 <div className="pl-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-800">{req.name}</h3>
                      <span className="text-[10px] text-slate-400">{new Date(req.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{req.details}</p>
                    <div className="mt-2 flex items-center justify-between">
                       <span className="text-xs font-semibold text-slate-500">{req.urgency}</span>
                       <a href={`tel:${req.phone}`} className="text-xs flex items-center text-blue-600 hover:underline">
                         <Phone size={12} className="mr-1" /> {req.phone}
                       </a>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Form Overlay */}
        {showForm && (
          <div className="absolute inset-0 z-[1000] bg-black/50 flex items-center justify-center sm:p-4 backdrop-blur-sm">
            <div className="w-full h-full sm:h-auto flex items-end sm:items-center justify-center">
              <RequestForm 
                location={selectedLocation} 
                onSubmit={handleSubmitRequest}
                onCancel={() => setShowForm(false)}
                onRequestLocation={() => {
                   detectLocation();
                   if(userLocation) setSelectedLocation(userLocation);
                }}
              />
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;