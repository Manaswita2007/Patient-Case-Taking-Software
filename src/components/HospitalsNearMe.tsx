import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  ShieldAlert, 
  Compass, 
  ExternalLink, 
  Bed, 
  CheckCircle, 
  AlertCircle,
  Volume2,
  RefreshCw,
  Search,
  Filter,
  Siren
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import { useAppContext } from '../context/AppContext';
import RetractableBackButton from './RetractableBackButton';
import TTSButton from './TTSButton';

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  category: '2km' | '5km' | '10km';
  address: string;
  phone: string;
  emergencyOpen24x7: boolean;
  icuBedsAvailable: number;
  traumaRating: string;
  estimatedDriveMins: number;
}

interface HospitalsNearMeProps {
  onBack: () => void;
  onSelectForAmbulance?: (hospital: Hospital) => void;
}

export default function HospitalsNearMe({ onBack, onSelectForAmbulance }: HospitalsNearMeProps) {
  const { t, language } = useAppContext();

  // Location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('Detecting location...');
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Filter state: 'all' | '2km' | '5km' | '10km'
  const [activeCategory, setActiveCategory] = useState<'all' | '2km' | '5km' | '10km'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Request user location with geolocation API
  const requestLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser. Using default city center.");
      fallbackToDefaultLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setPermissionState('granted');
        setLocationLoading(false);
        fetchNearbyHospitals(latitude, longitude);
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        console.warn("Geolocation permission error/denied:", error.message);
        setPermissionState('denied');
        setLocationLoading(false);
        setLocationError("Location permission denied or unavailable. You can click 'Use Sample Location' to explore hospitals.");
        fallbackToDefaultLocation();
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  };

  const fallbackToDefaultLocation = () => {
    // Default to central New Delhi medical district
    const defaultLat = 28.6139;
    const defaultLng = 77.2090;
    setUserLocation({ lat: defaultLat, lng: defaultLng });
    setLocationAddress("Connaught Place / AIIMS Medical Corridor, New Delhi");
    fetchNearbyHospitals(defaultLat, defaultLng);
  };

  // Reverse geocoding via OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        const shortAddr = addr.split(',').slice(0, 3).join(', ');
        setLocationAddress(shortAddr);
      }
    } catch {
      setLocationAddress(`Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  // Fetch nearby hospitals from backend API
  const fetchNearbyHospitals = async (lat: number, lng: number) => {
    try {
      const res = await fetch('/api/hospitals/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.hospitals && Array.isArray(data.hospitals)) {
          setHospitals(data.hospitals);
          if (data.hospitals.length > 0) {
            setSelectedHospital(data.hospitals[0]);
          }
        }
      }
    } catch (e) {
      console.error("Error fetching nearby hospitals:", e);
    }
  };

  // Auto-request location on mount
  useEffect(() => {
    requestLocation();
  }, []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || !userLocation) return;

    if (!mapInstanceRef.current) {
      // Create Leaflet map instance with zoomControl on bottomright to avoid overlay collision
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Free OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13);
    }

    const map = mapInstanceRef.current;

    // Remove previous user marker
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }

    // Custom pulse icon for User's live location
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(59, 130, 246, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 18px; height: 18px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.3); z-index: 10;"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
    userMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 13px; font-weight: bold; color: #1e293b;">
        📍 You Are Here
        <div style="font-size: 11px; font-weight: normal; color: #64748b; margin-top: 3px;">
          ${locationAddress}
        </div>
      </div>
    `);
    userMarkerRef.current = userMarker;

    // Clear existing hospital markers
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    // Filtered list for markers
    const filteredList = hospitals.filter(h => {
      const matchCat = activeCategory === 'all' || h.category === activeCategory;
      const matchQuery = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         h.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });

    // Add hospital markers
    filteredList.forEach(h => {
      const isSelected = selectedHospital?.id === h.id;
      const markerColor = h.category === '2km' ? '#10b981' : h.category === '5km' ? '#3b82f6' : '#8b5cf6';

      const hospitalIcon = L.divIcon({
        className: `custom-hospital-marker-${h.id}`,
        html: `
          <div style="
            display: flex; 
            align-items: center; 
            justify-content: center; 
            width: ${isSelected ? '38px' : '32px'}; 
            height: ${isSelected ? '38px' : '32px'}; 
            background: ${markerColor}; 
            color: #ffffff; 
            border-radius: 10px; 
            border: 2px solid #ffffff; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); 
            font-weight: 900; 
            font-size: 16px; 
            cursor: pointer;
            transition: all 0.2s;
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          ">
            +
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([h.lat, h.lng], { icon: hospitalIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 180px; padding: 2px;">
          <div style="font-weight: bold; font-size: 14px; color: #0f172a; margin-bottom: 3px;">
            ${h.name}
          </div>
          <div style="font-size: 11px; font-weight: 600; color: ${markerColor}; margin-bottom: 4px;">
            ${h.distanceKm} km away • ~${h.estimatedDriveMins} mins
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            ${h.address}
          </div>
          <div style="font-size: 11px; font-weight: bold; color: #059669; margin-bottom: 6px;">
            🛏️ ${h.icuBedsAvailable} ICU Beds Available
          </div>
          <a href="tel:${h.phone}" style="display: inline-block; background: #0284c7; color: #fff; padding: 4px 8px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold;">
            📞 Call Emergency
          </a>
        </div>
      `);

      marker.on('click', () => {
        setSelectedHospital(h);
      });

      markersRef.current[h.id] = marker;
    });

  }, [userLocation, hospitals, activeCategory, searchQuery, selectedHospital]);

  // Pan to selected hospital
  const handleSelectHospital = (h: Hospital) => {
    setSelectedHospital(h);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([h.lat, h.lng], 15, { duration: 1.2 });
      const marker = markersRef.current[h.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const filteredHospitals = hospitals.filter(h => {
    const matchCat = activeCategory === 'all' || h.category === activeCategory;
    const matchQuery = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       h.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const count2km = hospitals.filter(h => h.category === '2km').length;
  const count5km = hospitals.filter(h => h.category === '5km').length;
  const count10km = hospitals.filter(h => h.category === '10km').length;

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      
      {/* Top Header Bar */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-4 py-3 shrink-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <RetractableBackButton onClick={onBack} label="Back" id="hospitals-back-btn" />
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-normal">
                {t('hospitalsNearMe')}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 tracking-normal shrink-0">
                Live Open-Source Map
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate mt-0.5 tracking-normal">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{locationAddress}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={requestLocation}
            disabled={locationLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 cursor-pointer transition-colors tracking-normal shrink-0"
            title="Refresh current location"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${locationLoading ? 'animate-spin' : ''}`} />
            <span>{locationLoading ? 'Locating...' : 'Refresh Location'}</span>
          </button>

          <TTSButton 
            text={`Hospitals Near Me. Found ${filteredHospitals.length} verified hospitals. Categorized within 2km, 5km, and 10km. Your current location is ${locationAddress}.`}
            size="sm"
            label="Read Screen"
          />
        </div>
      </div>

      {/* Location Permission Notice if Denied/Prompt */}
      {locationError && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 px-4 py-2 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3 shrink-0 tracking-normal">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">{locationError}</span>
          </div>
          <button
            onClick={fallbackToDefaultLocation}
            className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-bold hover:bg-amber-700 transition shrink-0 cursor-pointer tracking-normal"
          >
            Use Sample Location
          </button>
        </div>
      )}

      {/* Main Split Layout: Left Map, Right Hospital Cards */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left: Leaflet OpenStreetMap View */}
        <div className="h-64 sm:h-80 lg:h-full lg:flex-1 relative border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/85 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-medium border border-white/10 shadow-md tracking-normal">
            🗺️ Open-Source OpenStreetMap &bull; Zero Tracking
          </div>
        </div>

        {/* Right: Hospital Filters & Categorized Cards Listing */}
        <div className="w-full lg:w-[420px] xl:w-[480px] h-full flex flex-col bg-white dark:bg-slate-800/90 overflow-hidden shrink-0">
          
          {/* Categorization Tabs */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 space-y-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search hospital name, area..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition text-slate-900 dark:text-white tracking-normal"
              />
            </div>

            {/* Distance Category Pills */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`py-1.5 px-1.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer tracking-normal truncate ${
                  activeCategory === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                All ({hospitals.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('2km')}
                className={`py-1.5 px-1.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 tracking-normal truncate ${
                  activeCategory === '2km'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                <span>&le; 2km</span>
                <span className="text-[10px] opacity-80">({count2km})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('5km')}
                className={`py-1.5 px-1.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 tracking-normal truncate ${
                  activeCategory === '5km'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                }`}
              >
                <span>&le; 5km</span>
                <span className="text-[10px] opacity-80">({count5km})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('10km')}
                className={`py-1.5 px-1.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 tracking-normal truncate ${
                  activeCategory === '10km'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                }`}
              >
                <span>&le; 10km</span>
                <span className="text-[10px] opacity-80">({count10km})</span>
              </button>
            </div>
          </div>

          {/* Hospitals List */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            {filteredHospitals.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs tracking-normal">
                No hospitals found matching the selected distance category or search query.
              </div>
            ) : (
              filteredHospitals.map(h => {
                const isSelected = selectedHospital?.id === h.id;
                const badgeColor = h.category === '2km' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : h.category === '5km'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                  : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';

                return (
                  <motion.div
                    key={h.id}
                    layout
                    onClick={() => handleSelectHospital(h)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 shadow-md ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border tracking-normal ${badgeColor}`}>
                            {h.distanceKm} km away
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-normal">
                            ~{h.estimatedDriveMins} mins drive
                          </span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug tracking-normal">
                          {h.name}
                        </h3>
                      </div>

                      <TTSButton 
                        text={`${h.name}. Distance: ${h.distanceKm} kilometers, approximately ${h.estimatedDriveMins} minutes. ${h.icuBedsAvailable} ICU beds available. Emergency phone: ${h.phone}.`} 
                        size="sm" 
                      />
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2.5 tracking-normal leading-normal">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{h.address}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3 tracking-normal">
                      <div className="bg-slate-100 dark:bg-slate-900/60 p-2 rounded-xl flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Bed className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white">{h.icuBedsAvailable}</span> ICU Beds
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-900/60 p-2 rounded-xl flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <ShieldAlert className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate font-semibold">{h.traumaRating}</span>
                      </div>
                    </div>

                    {/* Action buttons with no overlap */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      <a
                        href={`tel:${h.phone}`}
                        onClick={e => e.stopPropagation()}
                        className="py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm tracking-normal truncate"
                      >
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Call</span>
                      </a>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectHospital(h);
                        }}
                        className="py-2 px-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition tracking-normal cursor-pointer truncate"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">Focus</span>
                      </button>

                      {onSelectForAmbulance ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectForAmbulance(h);
                          }}
                          className="py-2 px-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition tracking-normal cursor-pointer truncate"
                        >
                          <Siren className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Ambulance</span>
                        </button>
                      ) : (
                        <a
                          href={`tel:${h.phone}`}
                          onClick={e => e.stopPropagation()}
                          className="py-2 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition tracking-normal cursor-pointer truncate"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">ER Desk</span>
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
