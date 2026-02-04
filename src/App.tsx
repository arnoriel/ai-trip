import { useState, useEffect } from 'react';
import { generateItinerary } from './services/ai';
import type { UserPreferences, DayPlan, TripData } from './types';
import ItineraryDisplay from './components/ItineraryDisplay';
import Loader from './components/Loader';
import { Map, Sparkles, Trash2, MapPin } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid && npm i --save-dev @types/uuid

function App() {
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<DayPlan[] | null>(null);
  const [history, setHistory] = useState<TripData[]>([]);
  
  // Form State
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState<'Budget' | 'Moderate' | 'Luxury'>('Moderate');
  const [interests, setInterests] = useState('');

  // Load History from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('trip_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination) return;

    setLoading(true);
    setItinerary(null);

    const prefs: UserPreferences = {
      destination,
      days,
      budget,
      interests: interests.split(',').map(i => i.trim()).filter(i => i)
    };

    try {
      const plans = await generateItinerary(prefs);
      setItinerary(plans);
      
      // Save to History
      const newTrip: TripData = {
        id: uuidv4(), // Jika tidak mau install uuid, pakai Date.now().toString()
        destination,
        createdAt: new Date().toLocaleDateString(),
        preferences: prefs,
        itinerary: plans
      };
      
      const updatedHistory = [newTrip, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('trip_history', JSON.stringify(updatedHistory));
      
    } catch (error) {
      alert("Maaf, AI sedang sibuk. Coba lagi nanti!");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (trip: TripData) => {
    setDestination(trip.destination);
    setDays(trip.preferences.days);
    setBudget(trip.preferences.budget);
    setInterests(trip.preferences.interests.join(', '));
    setItinerary(trip.itinerary);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('trip_history', JSON.stringify(updated));
  };

 // Edit bagian return di App.tsx
return (
  <div className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans selection:bg-indigo-500 selection:text-white pb-20">
    
    {/* Hero Background Decoration */}
    <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-br from-indigo-600 to-purple-700 -z-10 clip-path-slant" 
         style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' }}>
    </div>

    {/* Header */}
    <header className="bg-transparent py-6">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <Map className="text-indigo-600" size={24} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            TripGenie<span className="text-indigo-200">.ai</span>
          </h1>
        </div>
      </div>
    </header>

    <main className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-12 gap-8">
      
      {/* Left Column: Form (Stick to top when scroll) */}
      <div className="md:col-span-4 lg:col-span-3">
        <div className="sticky top-24 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={20} /> Build Your Trip
            </h2>
            
            {/* ... form kamu tetap sama, tapi ganti warna 'primary' ke 'indigo-600' ... */}
            <form onSubmit={handleGenerate} className="space-y-4">
               {/* (Input fields tetap, cukup pastikan fokus ring nya indigo) */}
               <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] flex justify-center items-center gap-2"
              >
                {loading ? 'Magic is happening...' : 'Generate Plan'}
              </button>
            </form>
          </div>

          {/* History - Dibuat lebih slim */}
          {history.length > 0 && (
            <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-white shadow-sm">
              <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-gray-400">Recent Explorations</h3>
              <div className="space-y-2 max-h-[250px] overflow-y-auto overflow-x-hidden">
                {history.map((trip) => (
                  <div key={trip.id} onClick={() => loadFromHistory(trip)} className="p-3 rounded-xl bg-white hover:shadow-md transition cursor-pointer border border-transparent hover:border-indigo-100 group flex justify-between items-center">
                    <span className="font-medium truncate text-sm">{trip.destination}</span>
                    <button onClick={(e) => deleteHistory(trip.id, e)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Result */}
      <div className="md:col-span-8 lg:col-span-9">
        {loading ? (
          <div className="bg-white rounded-[2rem] p-12 shadow-sm flex flex-col items-center border border-gray-100">
            <Loader />
          </div>
        ) : itinerary ? (
          <div className="animate-in fade-in duration-700">
            <div className="relative h-64 rounded-[2rem] overflow-hidden mb-8 shadow-2xl">
              <img 
                src={`https://source.unsplash.com/featured/?${destination},travel`} 
                className="w-full h-full object-cover" 
                alt={destination}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                <span className="text-indigo-300 font-bold uppercase tracking-[0.2em] text-sm mb-2">Itinerary Ready</span>
                <h2 className="text-4xl font-black text-white">Adventure in {destination}</h2>
              </div>
            </div>
            <ItineraryDisplay plans={itinerary} />
          </div>
        ) : (
          /* Empty State yang lebih cantik */
          <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-gray-200 h-[500px] flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <MapPin className="text-indigo-300" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-700">Where to next?</h3>
            <p className="text-gray-500 max-w-sm mt-2">
              Input your dream destination and let our AI craft the perfect travel experience just for you.
            </p>
          </div>
        )}
      </div>
    </main>
  </div>
);
}

export default App;