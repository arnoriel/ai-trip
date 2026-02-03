import { Plane } from 'lucide-react';

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-10">
      <div className="animate-bounce">
        <Plane className="w-12 h-12 text-primary" />
      </div>
      <p className="text-gray-500 animate-pulse font-medium">Meracik liburan impianmu...</p>
    </div>
  );
}