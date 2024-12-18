'use client';

import React from 'react';
import { Calendar, Users } from 'lucide-react';

interface EventCardProps {
  id: string;
  eventName: string;
  eventDate: string;
  availableSlots: number;
  price: number;
  onBook: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  eventName,
  eventDate,
  availableSlots,
  price,
  onBook,
}) => {
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedPrice = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full">
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-purple-500 to-blue-500"></div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
            {eventName}
          </h3>
          <span className={`inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full ${
            availableSlots > 0 ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'
          }`}>
            {availableSlots > 0 ? `${availableSlots} slots` : 'Full'}
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-sm">{formattedDate}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-sm">{availableSlots} slots available</span>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span className="text-2xl font-bold text-gray-900">{formattedPrice}</span>
            <button
              onClick={onBook}
              disabled={availableSlots <= 0}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                availableSlots > 0
                  ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {availableSlots > 0 ? 'Book Now' : 'Fully Booked'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
