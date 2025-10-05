// ---- File: src/clients/react-spa/src/components/AddressMap.tsx ----

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { type LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// --- (Interfaces and Leaflet icon fix remain the same) ---
// Fix for default Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Interfaces for Nominatim API response
interface NominatimAddress {
    road?: string; house_number?: string; suburb?: string; city?: string; town?: string; village?: string; county?: string; state?: string; postcode?: string; country?: string;
}
interface GeocodeResponse {
    place_id: number; lat: string; lon: string; display_name: string;
}
interface ReverseGeocodeResponse { address: NominatimAddress; }
interface AddressMapProps { onAddressSelect: (address: Partial<ShippingInfo>) => void; }
interface ShippingInfo { address: string; city: string; state: string; zipCode: string; country: string; }

// ChangeView component (uses useEffect to prevent snapping on drag)
const ChangeView = ({ center }: { center: LatLngExpression }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, map.getZoom() < 16 ? 16 : map.getZoom());
    }, [center, map]);
    return null;
};


const AddressMap = ({ onAddressSelect }: AddressMapProps) => {
    const [position, setPosition] = useState<LatLngExpression>([10.3157, 123.8854]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // NEW: State for search suggestions
    const [suggestions, setSuggestions] = useState<GeocodeResponse[]>([]);
    
    const markerRef = useRef<L.Marker>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Reverse geocode when marker position changes (from drag or click)
    const reverseGeocode = useCallback(async (pos: LatLngExpression) => {
        const [lat, lng] = pos as [number, number];
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (!response.ok) throw new Error('Failed to fetch address.');
            const data: ReverseGeocodeResponse = await response.json();
            const addr = data.address;
            const fullAddress = `${addr.house_number || ''} ${addr.road || ''}`.trim();

            onAddressSelect({
                address: fullAddress,
                city: addr.city || addr.town || addr.village || addr.suburb || '',
                state: addr.state || addr.county || '',
                zipCode: addr.postcode || '',
                country: addr.country || '',
            });
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
            toast.error("Could not find address for this location.");
        }
    }, [onAddressSelect]);

    // Handlers for the draggable marker
    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const { lat, lng } = marker.getLatLng();
                const newPos: LatLngExpression = [lat, lng];
                setPosition(newPos);
                reverseGeocode(newPos); // Immediately update address on drag end
            }
        },
    }), [reverseGeocode]);
    
    // NEW: Debounced effect for fetching suggestions as user types
    useEffect(() => {
        if (searchQuery.trim().length < 3) {
            setSuggestions([]);
            return;
        }

        const handler = setTimeout(async () => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
                if (!response.ok) throw new Error('Failed to fetch suggestions.');
                const data: GeocodeResponse[] = await response.json();
                setSuggestions(data);
            } catch (error) {
                console.error("Autocomplete search failed:", error);
            }
        }, 500); // 500ms delay after user stops typing

        return () => clearTimeout(handler); // Cleanup on every keystroke
    }, [searchQuery]);

    // NEW: Handler for when a suggestion is clicked
    const handleSuggestionClick = (suggestion: GeocodeResponse) => {
        const newPos: LatLngExpression = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
        setSearchQuery(suggestion.display_name); // Set input to full address
        setPosition(newPos); // Update map position
        setSuggestions([]); // Close the suggestions list
    };
    
    // NEW: Effect to close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div>
            {/* Search container */}
            <div className="relative" ref={searchContainerRef}>
                <form onSubmit={(e) => { e.preventDefault(); if (suggestions.length > 0) handleSuggestionClick(suggestions[0]); }} className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for an address or place..."
                        className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700"
                        autoComplete="off"
                    />
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors" aria-label="Search">
                        <FaSearch />
                    </button>
                </form>

                {/* NEW: Suggestions Dropdown */}
                {suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion) => (
                            <li
                                key={suggestion.place_id}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
                            >
                                {suggestion.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Map Container */}
            <div className="h-80 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-slate-600 mt-2">
                <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <ChangeView center={position} />
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker 
                        position={position} 
                        draggable={true} 
                        eventHandlers={eventHandlers}
                        ref={markerRef}
                    />
                </MapContainer>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">You can also drag the marker to pinpoint your exact location.</p>
        </div>
    );
};

export default AddressMap;