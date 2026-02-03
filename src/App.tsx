import { useState, useEffect } from 'react';
import { generateItinerary } from './services/ai';
import type { UserPreferences, DayPlan, TripData } from './types';
import ItineraryDisplay from './components/ItineraryDisplay';
import Loader from './components/Loader';
import { Map, Calendar, Sparkles, Trash2, History, MapPin } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-primary selection:text-white pb-20">
      
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 bg-opacity-80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
              <Map size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              TripGenie
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="text-yellow-500" size={18} /> Plan Your Trip
            </h2>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    required
                    placeholder="Bali, Japan, Paris..." 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      type="number" 
                      min="1" max="14"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border focus:ring-2 focus:ring-primary outline-none"
                      value={days}
                      onChange={(e) => setDays(parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                  <select 
                    className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary outline-none appearance-none bg-white"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value as any)}
                  >
                    <option value="Budget">💰 Cheap</option>
                    <option value="Moderate">⚖️ Moderate</option>
                    <option value="Luxury">💎 Luxury</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interests (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Food, Nature, Art..." 
                  className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-primary outline-none"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-md flex justify-center items-center gap-2"
              >
                {loading ? 'Generating...' : <>Generate Itinerary <Sparkles size={18} /></>}
              </button>
            </form>
          </div>

          {/* History Section */}
          {history.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-md font-bold mb-4 flex items-center gap-2 text-gray-700">
                <History size={18} /> Saved Trips
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {history.map((trip) => (
                  <div 
                    key={trip.id} 
                    onClick={() => loadFromHistory(trip)}
                    className="p-3 rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition group relative"
                  >
                    <div className="font-bold text-gray-800">{trip.destination}</div>
                    <div className="text-xs text-gray-500 mt-1 flex gap-2">
                      <span>{trip.preferences.days} Days</span>
                      <span>•</span>
                      <span>{trip.preferences.budget}</span>
                    </div>
                    <button 
                      onClick={(e) => deleteHistory(trip.id, e)}
                      className="absolute right-2 top-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Result */}
        <div className="md:col-span-2">
          {loading ? (
            <Loader />
          ) : itinerary ? (
            <div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Trip to {destination}</h2>
                <p className="text-gray-600">
                  Here is your custom {days}-day itinerary based on a {budget} budget.
                </p>
              </div>
              <ItineraryDisplay plans={itinerary} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px] border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
              <Map size={48} className="mb-4 opacity-20" />
              <p>Enter your destination to start planning!</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default App;