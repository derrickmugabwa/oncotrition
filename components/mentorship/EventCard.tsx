'use client';

import React, { useState } from 'react';
import BookingModal from './BookingModal';

interface EventCardProps {
  id: string;
  eventName: string;
  eventDate: string;
  availableSlots: number;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  eventName,
  eventDate,
  availableSlots,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-purple-500 to-blue-500"></div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
              {eventName}
            </h3>
            <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
              {availableSlots} slots
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span className="font-medium">{eventDate}</span>
            </div>

            <div className="flex items-center">
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div 
                  className={`h-2 rounded-full ${
                    availableSlots > 5 
                      ? 'bg-green-500' 
                      : availableSlots > 2 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((availableSlots / 10) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={availableSlots === 0}
            className={`mt-6 w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
              availableSlots === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transform hover:scale-[1.02]'
            }`}
          >
            {availableSlots === 0 ? 'Fully Booked' : 'Book Now'}
          </button>
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId={id}
        eventName={eventName}
        eventDate={eventDate}
      />
    </>
  );
};

export default EventCard;
