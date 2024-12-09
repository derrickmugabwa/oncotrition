'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Calendar, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Event {
  id: string;
  name: string;
  date: string;
  total_slots: number;
  available_slots: number;
}

export default function MentorshipEventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Fetching events...');
      const response = await fetch('/api/mentorship/events');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch events');
      }

      console.log('Fetched events:', data);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter events based on search query
  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    new Date(event.date).toLocaleDateString().includes(searchQuery)
  );

  const handleAddEvent = async () => {
    try {
      if (!newEvent.name || !newEvent.date || !newEvent.total_slots) {
        toast.error('Please fill in all required fields');
        return;
      }

      console.log('Creating new event with data:', newEvent);
      setIsSubmitting(true);

      const response = await fetch('/api/mentorship/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEvent.name,
          date: newEvent.date,
          totalSlots: Number(newEvent.total_slots),
        }),
      });

      const data = await response.json();
      console.log('API response:', data);

      if (!response.ok) {
        console.error('API error:', data);
        throw new Error(data.error || data.details || 'Failed to create event');
      }
      
      await fetchEvents();
      setNewEvent({});
      setIsAddingEvent(false);
      toast.success('Event created successfully');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      console.log('Deleting event:', id);
      const response = await fetch('/api/mentorship/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      console.log('Delete response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to delete event');
      }

      await fetchEvents();
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete event');
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;

    try {
      if (!editingEvent.name || !editingEvent.date || editingEvent.total_slots < 0) {
        toast.error('Please fill in all required fields and ensure total slots is not negative');
        return;
      }

      // Calculate booked slots
      const bookedSlots = editingEvent.total_slots - editingEvent.available_slots;
      
      console.log('Updating event with data:', editingEvent);
      setIsSubmitting(true);

      const requestBody = {
        id: editingEvent.id,
        name: editingEvent.name,
        date: editingEvent.date,
        totalSlots: Number(editingEvent.total_slots),
      };

      console.log('Sending request with body:', requestBody);

      const response = await fetch('/api/mentorship/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('API response status:', response.status);
      console.log('API response data:', data);

      if (!response.ok) {
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.error || data.details || `Failed to update event (${response.status})`);
      }

      await fetchEvents();
      setEditingEvent(null);
      toast.success('Event updated successfully');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInputChange = (field: keyof Event, value: string | number) => {
    if (!editingEvent) return;
    setEditingEvent(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleInputChange = (field: keyof Event, value: string | number) => {
    console.log('Input change:', field, value);
    setNewEvent(prev => ({ ...prev, [field]: value }));
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mentorship Events</h2>
        <button
          onClick={() => setIsAddingEvent(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search events by name or date..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading events...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <li key={event.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {event.name}
                        </h3>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {new Date(event.date).toLocaleDateString()}
                          <Users className="flex-shrink-0 ml-4 mr-1.5 h-5 w-5 text-gray-400" />
                          {event.available_slots} / {event.total_slots} slots available
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingEvent(event)}
                          className="p-2 text-gray-400 hover:text-gray-500"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 text-red-400 hover:text-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                {searchQuery ? 'No events found matching your search' : 'No events available'}
              </li>
            )}
          </ul>
        </div>
      )}
      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Edit Event
                  </h3>
                  <div className="mt-2 space-y-4">
                    <div>
                      <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                        Event Name
                      </label>
                      <input
                        type="text"
                        id="edit-name"
                        value={editingEvent.name}
                        onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700">
                        Date
                      </label>
                      <input
                        type="date"
                        id="edit-date"
                        value={formatDateForInput(editingEvent.date)}
                        onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-slots" className="block text-sm font-medium text-gray-700">
                        Total Slots
                      </label>
                      <input
                        type="number"
                        id="edit-slots"
                        value={editingEvent.total_slots}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 0;
                          // Allow any value but show warning if below booked slots
                          const bookedSlots = editingEvent.total_slots - editingEvent.available_slots;
                          if (newValue < bookedSlots) {
                            toast.error(`Warning: ${bookedSlots} slots are already booked. Reducing below this may cause issues.`);
                          }
                          setEditingEvent({ 
                            ...editingEvent, 
                            total_slots: newValue,
                            available_slots: Math.max(0, newValue - bookedSlots) // Update available slots
                          });
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        min="0"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Currently booked: {editingEvent.total_slots - editingEvent.available_slots} slots
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleUpdateEvent}
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  disabled={isSubmitting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddingEvent && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Name</label>
              <input
                type="text"
                value={newEvent.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={newEvent.date || ''}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Slots</label>
              <input
                type="number"
                value={newEvent.total_slots || ''}
                onChange={(e) => handleInputChange('total_slots', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                min="1"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsAddingEvent(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleAddEvent}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
