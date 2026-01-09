'use client';

import { useState, useEffect } from 'react';
import EventCard from './EventCard';
import BookingModal from './BookingModal';
import { toast } from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client';

interface Event {
  id: string;
  created_at: string;
  name: string;
  date: string;
  total_slots: number;
  price: number;
  description: string;
  event_bookings: {
    id: string;
    booking_status: 'pending' | 'approved' | 'rejected';
  }[];
  available_slots: number;
  approved_bookings_count: number;
}

const EventsList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      // First get all events
      const { data: eventsData, error: eventsError } = await supabase
        .from('mentorship_events')
        .select(`
          *,
          event_bookings(
            id,
            booking_status
          )
        `)
        .order('date', { ascending: true });

      if (eventsError) {
        throw eventsError;
      }

      // Calculate available slots and filter out past events
      const currentDate = new Date();
      const eventsWithSlots = eventsData?.map(event => {
        const approvedBookings = event.event_bookings.filter(
          booking => booking.booking_status === 'approved'
        ).length;
        return {
          ...event,
          available_slots: event.total_slots - approvedBookings,
          approved_bookings_count: approvedBookings
        };
      })
      .filter(event => new Date(event.date) >= currentDate) || [];

      setEvents(eventsWithSlots);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Upcoming Sessions
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse"
              >
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                eventName={event.name}
                eventDate={event.date}
                availableSlots={event.available_slots}
                price={event.price}
                onBook={() => handleBooking(event)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No upcoming sessions available.
          </p>
        )}
      </div>

      {selectedEvent && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          eventId={selectedEvent.id}
          eventName={selectedEvent.name}
          eventDate={selectedEvent.date}
          amount={selectedEvent.price}
        />
      )}
    </section>
  );
};

export default EventsList;
