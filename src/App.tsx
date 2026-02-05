import { useState, useEffect } from 'react';
import { generateItinerary } from './services/ai';
import type { UserPreferences, DayPlan, TripData } from './types';
import ItineraryDisplay from './components/ItineraryDisplay';
import Loader from './components/Loader';
import { Map, Calendar, Sparkles, Trash2, History, MapPin, Plane, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<DayPlan[] | null>(null);
  const [history, setHistory] = useState<TripData[]>([]);
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);
  
  // Form State
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState<'Budget' | 'Moderate' | 'Luxury'>('Moderate');
  const [interests, setInterests] = useState('');

  // Load History
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
      
      const newTrip: TripData = {
        id: uuidv4(),
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
    window.scrollTo({ top: 500, behavior: 'smooth' }); // Scroll ke hasil
    setShowHistoryMobile(false);
  };

  const deleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('trip_history', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20 relative overflow-x-hidden">
      
      {/* Decorative Background Blob */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-900 via-purple-900 to-gray-50 -z-10" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500 rounded-full blur-3xl mix-blend-screen animate-pulse" />
          <div className="absolute top-32 -left-24 w-72 h-72 bg-blue-500 rounded-full blur-3xl mix-blend-screen animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-sm border-b border-white/10 bg-indigo-950/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:rotate-12 transition-transform">
              <Plane size={24} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Trip<span className="text-cyan-400">Genie</span>
            </h1>
          </div>
          
          <button 
            onClick={() => setShowHistoryMobile(!showHistoryMobile)}
            className="md:hidden text-white p-2 rounded-lg bg-white/10 hover:bg-white/20"
          >
            <History size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pt-32 grid lg:grid-cols-12 gap-10">
        
        {/* Left Column: Form & Hero Text */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 mb-10 px-2" // Menambahkan z-index untuk memastikan di atas layer background
          >
            <h2 className="text-4xl lg:text-6xl font-black mb-6 leading-[1.1] text-black drop-shadow-2xl">
              Design Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 filter drop-shadow-sm">
                Dream Trip
              </span>
            </h2>
            
            <p className="text-black text-lg lg:text-xl font-medium max-w-md leading-relaxed opacity-100 drop-shadow-md">
              Let AI craft the <span className="text-cyan-500">perfect itinerary</span> tailored to your style, budget, and passions.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/95 backdrop-blur-xl p-6 lg:p-8 rounded-3xl shadow-2xl shadow-indigo-900/20 border border-white/50"
          >
            <form onSubmit={handleGenerate} className="space-y-6">
              
              {/* Destination Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Where to?</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-3.5 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Kyoto, Japan" 
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>

              {/* Days Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">How Long?</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-3.5 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    type="number" 
                    min="1" max="14"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-700"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 text-sm font-medium">Days</span>
                </div>
              </div>

              {/* Custom Budget Selector */}
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Your Budget</label>
                 <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
                    {(['Budget', 'Moderate', 'Luxury'] as const).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBudget(b)}
                        className={`py-2 rounded-xl text-sm font-bold transition-all ${
                          budget === b 
                          ? 'bg-white text-indigo-600 shadow-md transform scale-[1.02]' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                      >
                        {b === 'Budget' ? '$' : b === 'Moderate' ? '$$' : '$$$'} {b}
                      </button>
                    ))}
                 </div>
              </div>

              {/* Interests Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Interests</label>
                <div className="relative">
                   <Sparkles className="absolute left-4 top-3.5 text-indigo-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Photography, Food, History..." 
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-700"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/30 flex justify-center items-center gap-3 text-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">Planning...</span>
                ) : (
                  <>Generate Itinerary <Plane className="rotate-45" size={20} /></>
                )}
              </button>
            </form>
          </motion.div>

          {/* Desktop History */}
          <div className="hidden lg:block bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <History className="text-indigo-500" size={18} /> Recent Trips
                </h3>
             </div>
             <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {history.length === 0 && <p className="text-gray-400 text-sm italic">No trips saved yet.</p>}
                {history.map((trip) => (
                  <div 
                    key={trip.id} 
                    onClick={() => loadFromHistory(trip)}
                    className="group relative p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                         <div className="font-bold text-gray-800">{trip.destination}</div>
                         <div className="text-xs text-gray-500 mt-1 font-medium bg-white px-2 py-1 rounded-md inline-block shadow-sm">
                            {trip.preferences.days} Days • {trip.preferences.budget}
                         </div>
                      </div>
                      <button 
                        onClick={(e) => deleteHistory(trip.id, e)}
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>

        {/* Right Column: Result */}
        <div className="lg:col-span-8">
          <AnimatePresence mode='wait'>
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center min-h-[500px]"
              >
                <Loader />
                <p className="mt-8 text-indigo-800 font-medium animate-pulse">Consulting the travel maps...</p>
              </motion.div>
            ) : itinerary ? (
               <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="space-y-6"
               >
                {/* Itinerary Header Card */}
                <div className="relative overflow-hidden rounded-3xl bg-indigo-900 text-white p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-indigo-300 mb-2 font-medium">
                        <Map size={18} />
                        <span>Trip Itinerary</span>
                      </div>
                      <h2 className="text-4xl font-bold mb-4">{destination}</h2>
                      <div className="flex flex-wrap gap-3">
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-sm">📅 {days} Days</span>
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-sm">💰 {budget} Budget</span>
                          {interests && <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-sm">✨ {interests}</span>}
                      </div>
                    </div>
                </div>

                <ItineraryDisplay plans={itinerary} />
               </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="hidden lg:flex flex-col items-center justify-center h-full min-h-[500px] text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 backdrop-blur-sm"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                   <MapPin size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-600">Ready to explore?</h3>
                <p className="text-gray-500">Fill in the details to generate your plan.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Mobile History Drawer (Optional Polish) */}
      {showHistoryMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHistoryMobile(false)} />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }}
            className="absolute right-0 top-0 h-full w-80 bg-white p-6 shadow-2xl"
          >
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Your Trips</h3>
                <button onClick={() => setShowHistoryMobile(false)}><X /></button>
             </div>
             {/* Reuse history list logic here if needed */}
             <div className="space-y-4">
               {history.map(h => (
                 <div key={h.id} onClick={() => loadFromHistory(h)} className="p-4 bg-gray-50 rounded-xl cursor-pointer">
                    <div className="font-bold">{h.destination}</div>
                 </div>
               ))}
             </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default App;
