'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Check, X, Calendar, Mail, Phone, User, DollarSign, Clock, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface Filters {
  date: string;
  paymentStatus: string;
  bookingStatus: string;
}

export default function EventBookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    date: '',
    paymentStatus: '',
    bookingStatus: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const ITEMS_PER_PAGE = 5;

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

  useEffect(() => {
    fetchBookings();

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

  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      booking.name?.toLowerCase().includes(searchLower) ||
      booking.email?.toLowerCase().includes(searchLower) ||
      booking.phone?.toLowerCase().includes(searchLower) ||
      booking.mentorship_events?.name?.toLowerCase().includes(searchLower);

    const matchesDate = !filters.date || booking.mentorship_events.date.includes(filters.date);
    const matchesPaymentStatus = !filters.paymentStatus || booking.payment_status === filters.paymentStatus;
    const matchesBookingStatus = !filters.bookingStatus || booking.booking_status === filters.bookingStatus;

    return matchesSearch && matchesDate && matchesPaymentStatus && matchesBookingStatus;
  });

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Event Bookings</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-2 rounded-lg border",
              showFilters ? "bg-purple-50 border-purple-200" : "hover:bg-gray-50"
            )}
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white rounded-lg shadow-sm border">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Status</label>
            <select
              value={filters.bookingStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, bookingStatus: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : paginatedBookings.length > 0 ? (
        <>
          <div className="grid gap-4">
            {paginatedBookings.map((booking) => (
              <div
                key={booking.id}
                className={cn(
                  "bg-white p-4 rounded-lg shadow-sm border-l-4",
                  booking.booking_status === 'approved' && "border-l-green-500",
                  booking.booking_status === 'rejected' && "border-l-red-500",
                  booking.booking_status === 'pending' && "border-l-yellow-500"
                )}
              >
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Customer Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-sm">{booking.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{booking.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{booking.phone}</span>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{formatDate(booking.mentorship_events.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{formatPrice(booking.payment_amount || booking.mentorship_events.price)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        Booked: {formatDate(booking.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">Booking:</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          booking.booking_status === 'approved' && "bg-green-100 text-green-800",
                          booking.booking_status === 'pending' && "bg-yellow-100 text-yellow-800",
                          booking.booking_status === 'rejected' && "bg-red-100 text-red-800"
                        )}>
                          {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">Payment:</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          booking.payment_status === 'completed' && "bg-green-100 text-green-800",
                          booking.payment_status === 'pending' && "bg-yellow-100 text-yellow-800",
                          booking.payment_status === 'failed' && "bg-red-100 text-red-800"
                        )}>
                          {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                        </span>
                      </div>
                      {booking.payment_reference && (
                        <div className="text-xs text-gray-500">
                          Ref: {booking.payment_reference}
                        </div>
                      )}
                      {booking.payment_date && (
                        <div className="text-xs text-gray-500">
                          Paid: {formatDate(booking.payment_date)}
                        </div>
                      )}
                    </div>

                    {booking.booking_status === 'pending' && (
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'approved')}
                          disabled={isUpdating === booking.id}
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                            "bg-green-100 text-green-700 hover:bg-green-200",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                          )}
                        >
                          <Check className="w-3 h-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                          disabled={isUpdating === booking.id}
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                            "bg-red-100 text-red-700 hover:bg-red-200",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                          )}
                        >
                          <X className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)} of {filteredBookings.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No bookings found.
        </div>
      )}
    </div>
  );
}
