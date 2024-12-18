'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Check, X, Calendar, Mail, Phone, User, DollarSign, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  booking_status: 'pending' | 'approved' | 'rejected';
  payment_status: 'pending' | 'completed' | 'failed';
  payment_amount: number;
  payment_reference?: string;
  payment_date?: string;
  payment_phone?: string;
  created_at: string;
  event_id: string;
  mentorship_events: {
    name: string;
    date: string;
    total_slots: number;
    available_slots: number;
    price: number;
  };
}

export default function EventBookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('event_bookings')
        .select(`
          *,
          mentorship_events (
            name,
            date,
            total_slots,
            available_slots,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription for bookings
  useEffect(() => {
    fetchBookings();

    // Subscribe to changes
    const subscription = supabase
      .channel('event_bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_bookings'
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleStatusUpdate = async (bookingId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setIsUpdating(bookingId);
      
      const { data, error } = await supabase
        .from('event_bookings')
        .update({ booking_status: newStatus })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId ? { ...booking, booking_status: newStatus } : booking
        )
      );

      toast.success(`Booking ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking status');
    } finally {
      setIsUpdating(null);
    }
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchQuery.toLowerCase();
    return (
      booking.name?.toLowerCase().includes(searchLower) ||
      booking.email?.toLowerCase().includes(searchLower) ||
      booking.phone?.toLowerCase().includes(searchLower) ||
      booking.mentorship_events?.name?.toLowerCase().includes(searchLower)
    );
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Bookings</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className={cn(
                "bg-white p-6 rounded-lg shadow-sm border-l-4",
                booking.booking_status === 'approved' && "border-l-green-500",
                booking.booking_status === 'rejected' && "border-l-red-500",
                booking.booking_status === 'pending' && "border-l-yellow-500"
              )}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{booking.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span>{booking.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span>{booking.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Booked on {formatDate(booking.created_at)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span>{formatDate(booking.mentorship_events.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-500" />
                    <span>{formatPrice(booking.payment_amount || booking.mentorship_events.price)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Payment Status:</span>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      booking.payment_status === 'completed' && "bg-green-100 text-green-800",
                      booking.payment_status === 'pending' && "bg-yellow-100 text-yellow-800",
                      booking.payment_status === 'failed' && "bg-red-100 text-red-800"
                    )}>
                      {booking.payment_status}
                    </span>
                  </div>
                  {booking.payment_reference && (
                    <div className="text-sm text-gray-500">
                      Ref: {booking.payment_reference}
                    </div>
                  )}
                  {booking.payment_date && (
                    <div className="text-sm text-gray-500">
                      Paid on: {formatDate(booking.payment_date)}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                {booking.booking_status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'approved')}
                      disabled={isUpdating === booking.id}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium",
                        "bg-green-100 text-green-700 hover:bg-green-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                      disabled={isUpdating === booking.id}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium",
                        "bg-red-100 text-red-700 hover:bg-red-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No bookings found.
        </div>
      )}
    </div>
  );
}
