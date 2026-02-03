import type { DayPlan } from '../types';
import { Clock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  plans: DayPlan[];
}

export default function ItineraryDisplay({ plans }: Props) {
  return (
    <div className="space-y-8 mt-8">
      {plans.map((day, index) => (
        <motion.div 
          key={day.day}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
            <h3 className="text-xl font-bold">Day {day.day}: {day.theme}</h3>
          </div>
          <div className="p-6 space-y-6">
            {day.activities.map((act, idx) => (
              <div key={idx} className="flex gap-4 items-start relative pb-6 last:pb-0 last:border-0 border-l-2 border-gray-200 pl-6 ml-2">
                <div className="absolute -left-[9px] top-0 bg-white border-2 border-primary w-4 h-4 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-800 text-lg">{act.activity}</h4>
                    <span className="flex items-center text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-600">
                      <Clock size={12} className="mr-1" /> {act.time}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{act.description}</p>
                  <div className="mt-2 flex items-center text-sm text-green-600 font-medium">
                    <DollarSign size={14} className="mr-1" /> Est: {act.estimatedCost}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}