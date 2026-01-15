'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { publicSupabase as supabase } from '@/lib/supabase/public';
import BookingDetailsPopup, { TransactionDetails } from './BookingDetailsPopup';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  eventDate: string;
  amount: number;
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  eventId, 
  eventName, 
  eventDate,
  amount 
}: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPaymentStatus('processing');

    try {
      // Validate phone number format (should be 07XXXXXXXX or 01XXXXXXXX)
      const phoneRegex = /^(07|01)\d{8}$/;
      if (!phoneRegex.test(formData.phone)) {
        throw new Error('Invalid phone number format. Please use format: 07XXXXXXXX or 01XXXXXXXX');
      }

      // Convert phone number to international format for M-Pesa
      const internationalPhone = formData.phone.startsWith('0') 
        ? '254' + formData.phone.slice(1) 
        : formData.phone;

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('event_bookings')
        .insert([
          {
            event_id: eventId,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            amount,
            payment_status: 'pending',
            booking_status: 'pending',
            payment_phone: internationalPhone // Store the international format
          }
        ])
        .select()
        .single();

      if (bookingError) {
        // Check if it's a "no available slots" error
        if (bookingError.message?.includes('No available slots')) {
          throw new Error('Sorry, this event is fully booked. Please try another event.');
        }
        console.error('Error creating booking:', {
          error: bookingError,
          code: bookingError.code,
          message: bookingError.message,
          details: bookingError.details,
          hint: bookingError.hint
        });
        throw new Error(bookingError.message || 'Failed to create booking');
      }

      console.log('Booking created successfully:', booking);

      // Set transaction details
      setTransactionDetails({
        id: booking.id,
        booking_status: booking.booking_status,
        event_name: eventName,
        name: formData.name,
        phone: formData.phone,
        booking_date: new Date().toLocaleString(),
        amount: amount,
        payment_status: booking.payment_status ?? 'pending'
      });

      // Initiate M-Pesa payment
      const paymentResponse = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: internationalPhone, // Use international format
          amount: amount,
          bookingId: booking.id,
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        console.error('Payment initiation failed:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to initiate payment');
      }

      const paymentData = await paymentResponse.json();
      console.log('Payment initiated successfully:', paymentData);

      // Show success message and transaction details
      toast.success('Booking created! Please check your phone for the M-Pesa payment prompt.');
      setPaymentStatus('completed');
      setShowTransactionDetails(true);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
      });
    } catch (error: any) {
      console.error('Booking process error:', {
        message: error.message,
        error: error
      });
      toast.error(error.message || 'Failed to process booking');
      setPaymentStatus('failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseDetails = () => {
    setShowTransactionDetails(false);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>

              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Book Session
              </h2>

              <div className="mb-6 text-gray-600 dark:text-gray-300">
                <p className="font-medium">{eventName}</p>
                <p className="text-sm">{eventDate}</p>
                <p className="mt-2 font-medium">
                  Amount: KES {typeof amount === 'number' ? amount.toLocaleString() : '0'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="07XXXXXXXX"
                    pattern="^(07|01)\d{8}$"
                    title="Please enter a valid Kenyan phone number"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Format: 07XXXXXXXX or 01XXXXXXXX
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-md bg-blue-500 px-4 py-2 text-white transition-colors ${
                    isSubmitting
                      ? 'cursor-not-allowed bg-blue-400'
                      : 'hover:bg-blue-600'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Pay with M-Pesa'
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {transactionDetails && (
        <BookingDetailsPopup
          isOpen={showTransactionDetails}
          onClose={handleCloseDetails}
          transactionDetails={transactionDetails}
          paymentStatus={paymentStatus}
        />
      )}
    </>
  );
}
