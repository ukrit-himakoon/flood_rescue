import React, { useEffect } from 'react';
import { useMap, useMapEvents, Marker, Popup } from 'react-leaflet';
import { Coordinates } from '../types';
import L from 'leaflet';

// Fix for Leaflet default icon in React/Web environments
// We remove the prototype _getIconUrl and use CDN links explicitly
// to avoid bundling issues with image assets.
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapControllerProps {
  onLocationSelect: (coords: Coordinates) => void;
  selectedLocation: Coordinates | null;
  userLocation: Coordinates | null;
}

const MapController: React.FC<MapControllerProps> = ({ 
  onLocationSelect, 
  selectedLocation,
  userLocation
}) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  // Fly to user location when it becomes available
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 15);
    }
  }, [userLocation, map]);

  return (
    <>
      {selectedLocation && (
        <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
          <Popup>Pinned Location</Popup>
        </Marker>
      )}
    </>
  );
};

export default MapController;