import type { DayPlan } from '../types';
import { Clock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  plans: DayPlan[];
}

// Edit ItineraryDisplay.tsx
export default function ItineraryDisplay({ plans }: Props) {
  return (
    <div className="grid gap-12 mt-8">
      {plans.map((day, index) => (
        <motion.div 
          key={day.day}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          {/* Day Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-[10px] uppercase font-bold opacity-80">Day</span>
              <span className="text-xl font-black leading-none">{day.day}</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{day.theme}</h3>
              <p className="text-sm text-gray-500 font-medium">Explore the best of the city</p>
            </div>
          </div>

          {/* Activities List */}
          <div className="grid md:grid-cols-2 gap-4 ml-4 pl-10 border-l-2 border-indigo-100">
            {day.activities.map((act, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
                   <Clock size={40} className="text-indigo-600" />
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                    {act.time}
                  </span>
                </div>
                
                <h4 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                  {act.activity}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {act.description}
                </p>
                
                <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                  <div className="flex items-center text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg">
                    <DollarSign size={12} className="mr-1" /> {act.estimatedCost}
                  </div>
                  <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-600 underline">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}