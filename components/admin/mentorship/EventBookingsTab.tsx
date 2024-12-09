'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Check, X, Calendar, Mail, Phone, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  booking_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  mentorship_events: {
    name: string;
    date: string;
    total_slots: number;
    available_slots: number;
  };
}

export default function EventBookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/mentorship/bookings');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setIsUpdating(bookingId);
      console.log('[Client] Starting status update:', { bookingId, newStatus });
      
      const response = await fetch('/api/mentorship/bookings', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });

      const data = await response.json();
      console.log('[Client] Response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${newStatus} booking`);
      }
      setBookings(prevBookings => {
        return prevBookings.map(booking => {
          if (booking.id === bookingId) {
            console.log('[Client] Updating booking:', {
              id: booking.id,
              oldStatus: booking.booking_status,
              newStatus: data.booking.booking_status
            });
            
            return {
              ...booking,
              ...data.booking
            };
          }
          return booking;
        });
      });

      toast.success(data.message || `Booking ${newStatus} successfully`);
    } catch (error) {
      console.error('[Client] Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update booking');
    } finally {
      setIsUpdating(null);
    }
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchQuery.toLowerCase();
    return (
      booking.name.toLowerCase().includes(searchLower) ||
      booking.email.toLowerCase().includes(searchLower) ||
      booking.phone.toLowerCase().includes(searchLower) ||
      booking.mentorship_events.name.toLowerCase().includes(searchLower) ||
      booking.booking_status.toLowerCase().includes(searchLower) ||
      new Date(booking.mentorship_events.date).toLocaleDateString().includes(searchQuery)
    );
  });

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-2xl font-semibold text-gray-900">Event Bookings</h2>
          <p className="mt-2 text-sm text-gray-700">
            Manage and review all mentorship event bookings
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search bookings by name, email, phone, event, status, or date..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading bookings...</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Event Details
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Contact Information
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.mentorship_events.name}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(booking.mentorship_events.date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-900">
                              <User className="w-4 h-4 mr-1" />
                              {booking.name}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Mail className="w-4 h-4 mr-1" />
                              {booking.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Phone className="w-4 h-4 mr-1" />
                              {booking.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={cn(
                                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                                {
                                  'bg-green-100 text-green-800': booking.booking_status === 'approved',
                                  'bg-red-100 text-red-800': booking.booking_status === 'rejected',
                                  'bg-yellow-100 text-yellow-800': booking.booking_status === 'pending'
                                }
                              )}
                            >
                              {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {booking.booking_status === 'pending' && !isUpdating && (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleStatusUpdate(booking.id, 'approved')}
                                  disabled={isUpdating === booking.id}
                                  className={cn(
                                    'text-green-600 hover:text-green-900 transition-colors duration-200',
                                    isUpdating === booking.id && 'opacity-50 cursor-not-allowed'
                                  )}
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                                  disabled={isUpdating === booking.id}
                                  className={cn(
                                    'text-red-600 hover:text-red-900 transition-colors duration-200',
                                    isUpdating === booking.id && 'opacity-50 cursor-not-allowed'
                                  )}
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          {searchQuery ? 'No bookings found matching your search' : 'No bookings available'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
