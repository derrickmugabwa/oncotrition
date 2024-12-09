'use client';

import { useState, useEffect } from 'react';
import EventCard from './EventCard';
import { toast } from 'react-hot-toast';

interface Event {
  id: string;
  name: string;
  date: string;
  total_slots: number;
  available_slots: number;
}

const EventsList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/mentorship/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            Loading events...
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              No Upcoming Sessions
            </h2>
            <p className="text-lg text-gray-600">
              Check back later for new mentorship sessions.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="events-section" className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Upcoming Sessions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Book your personalized nutrition consultation or join our group workshops
            to transform your health journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              eventName={event.name}
              eventDate={new Date(event.date).toLocaleDateString()}
              availableSlots={event.available_slots}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsList;
