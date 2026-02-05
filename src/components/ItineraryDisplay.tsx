// src/components/ItineraryDisplay.tsx
import type { DayPlan } from '../types';
import { Clock, DollarSign, MapPin, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  plans: DayPlan[];
}

export default function ItineraryDisplay({ plans }: Props) {
  return (
    <div className="space-y-12 pb-12">
      {plans.map((day, index) => (
        <motion.div 
          key={day.day}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative pl-8 md:pl-0"
        >
          <div className="hidden md:block absolute left-[27px] top-14 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 to-transparent -z-10" />

          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="flex-shrink-0">
               <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-indigo-300 transform -rotate-3 hover:rotate-0 transition-transform border-4 border-white">
                <span className="text-[10px] uppercase font-bold opacity-90 tracking-wider">Day</span>
                <span className="text-2xl font-black leading-none">{day.day}</span>
              </div>
            </div>
            
            <div className="bg-white px-6 py-3 rounded-2xl border border-indigo-100 shadow-sm flex-grow">
               <h3 className="text-xl font-bold text-gray-800">{day.theme}</h3>
               <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"/> 
                 Recommended Schedule
               </p>
            </div>
          </div>

          <div className="space-y-6 md:pl-20">
            {day.activities.map((act, idx) => {
              // PERBAIKAN LOGIKA GAMBAR:
              // Gunakan URL Unsplash yang lebih modern dan tambahkan sig (randomizer)
              const searchKeyword = act.activity.split(' ').slice(0, 3).join(',');
              
              // Alternatif jika Unsplash Source benar-benar mati, kita gunakan keyword-based image:

              return (
                <div key={idx} className="group bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-5">
                    
                    <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 relative rounded-2xl overflow-hidden bg-gray-200">
                       <img 
                         // Menggunakan pola "featured topic" yang lebih reliabel
                         src={`https://plus.unsplash.com/premium_photo-1677343210638-5d3ce6ddbf85?q=80&w=500&auto=format&fit=crop`}
                         // Note: Untuk hasil maksimal tanpa API Key, kita gunakan redirect service
                         srcSet={`https://loremflickr.com/640/480/${searchKeyword},travel/all?lock=${idx+day.day}`}
                         alt={act.activity}
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                         onError={(e) => {
                           (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503220317375-aa3a7d1f12a2?w=400&q=80';
                         }}
                       />
                       <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-indigo-900 shadow-sm flex items-center gap-1">
                          <Clock size={12} /> {act.time}
                       </div>
                    </div>

                    <div className="flex-grow py-2 pr-2">
                      <div className="flex justify-between items-start mb-2">
                         <h4 className="font-bold text-xl text-gray-800 group-hover:text-indigo-600 transition-colors">
                           {act.activity}
                         </h4>
                         <div className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-lg border border-green-100 flex items-center">
                           <DollarSign size={12} className="mr-0.5" /> {act.estimatedCost}
                         </div>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {act.description}
                      </p>
                      
                      <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                          <button 
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.activity + " " + day.theme)}`, '_blank')}
                            className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
                          >
                             <MapPin size={14} /> View on Map
                          </button>
                          <button className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors ml-auto">
                             Details <ExternalLink size={14} />
                          </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}