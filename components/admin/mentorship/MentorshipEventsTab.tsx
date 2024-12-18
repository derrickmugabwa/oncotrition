'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Calendar, Users, DollarSign, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Event {
  id: string;
  name: string;
  date: string;
  total_slots: number;
  available_slots: number;
  price: number;
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddEvent = async () => {
    try {
      if (!newEvent.name || !newEvent.date || !newEvent.total_slots || !newEvent.price) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (newEvent.price < 0) {
        toast.error('Price cannot be negative');
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
          price: Number(newEvent.price),
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
      if (!editingEvent.name || !editingEvent.date || editingEvent.total_slots < 0 || editingEvent.price < 0) {
        toast.error('Please fill in all required fields and ensure total slots and price are not negative');
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
        price: Number(editingEvent.price),
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
    
    // Use parseFloat for price, parseInt for total_slots
    const processedValue = field === 'price' 
      ? parseFloat(value as string) 
      : field === 'total_slots' 
        ? parseInt(value as string) 
        : value;
    
    setEditingEvent(prev => prev ? { ...prev, [field]: processedValue } : null);
  };

  const handleInputChange = (field: keyof Event, value: string | number) => {
    console.log('Input change:', field, value);
    
    // Use parseFloat for price, parseInt for total_slots
    const processedValue = field === 'price' 
      ? parseFloat(value as string) 
      : field === 'total_slots' 
        ? parseInt(value as string) 
        : value;
    
    setNewEvent(prev => ({ ...prev, [field]: processedValue }));
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Events</h2>
        <button
          onClick={() => setIsAddingEvent(true)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Event
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isAddingEvent && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 md:col-span-2"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Event Name</label>
                  <input
                    type="text"
                    value={newEvent.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newEvent.date || ''}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Total Slots</label>
                  <input
                    type="number"
                    value={newEvent.total_slots || ''}
                    onChange={(e) => handleInputChange('total_slots', parseInt(e.target.value))}
                    min="1"
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter slots"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price (KES)</label>
                  <input
                    type="number"
                    value={newEvent.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    min="0"
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter price"
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => setIsAddingEvent(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </motion.div>
          )}

          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              layout
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              {editingEvent?.id === event.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Event Name</label>
                      <input
                        type="text"
                        value={editingEvent.name}
                        onChange={(e) => handleEditInputChange('name', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={formatDateForInput(editingEvent.date)}
                        onChange={(e) => handleEditInputChange('date', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Total Slots</label>
                      <input
                        type="number"
                        value={editingEvent.total_slots}
                        onChange={(e) => handleEditInputChange('total_slots', parseInt(e.target.value))}
                        min="1"
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Price (KES)</label>
                      <input
                        type="number"
                        value={editingEvent.price}
                        onChange={(e) => handleEditInputChange('price', parseFloat(e.target.value))}
                        min="0"
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingEvent(null)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateEvent}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{event.name}</h3>
                    <div className="mt-1 space-y-0.5">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="w-3.5 h-3.5 mr-1" />
                        {event.available_slots} / {event.total_slots} slots
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <DollarSign className="w-3.5 h-3.5 mr-1" />
                        {formatPrice(event.price)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {filteredEvents.length === 0 && !isAddingEvent && (
            <div className="text-center py-8 text-sm text-gray-500 md:col-span-2">
              No events found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
