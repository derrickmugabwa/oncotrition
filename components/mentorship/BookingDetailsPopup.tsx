'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { publicSupabase as supabase } from '@/lib/supabase/public';
import { toast } from 'react-hot-toast';

export interface TransactionDetails {
  id: string;
  booking_status: string;
  event_name: string;
  name: string;
  phone: string;
  booking_date: string;
  amount: number;
  payment_status: string;
}

interface BookingDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  transactionDetails: TransactionDetails;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

export default function BookingDetailsPopup({
  isOpen,
  onClose,
  transactionDetails: initialTransactionDetails,
  paymentStatus: initialPaymentStatus
}: BookingDetailsPopupProps) {
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [transactionDetails, setTransactionDetails] = useState(initialTransactionDetails);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);

  // Timer effect
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // When timer reaches 0, update booking status to rejected
          updateBookingStatus('rejected');
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Function to update booking status
  const updateBookingStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from('event_bookings')
        .update({ 
          booking_status: status,
          payment_status: status === 'rejected' ? 'failed' : undefined 
        })
        .eq('id', transactionDetails.id);

      if (error) throw error;

      if (status === 'rejected') {
        setPaymentStatus('failed');
        toast.error('Booking rejected due to payment timeout');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  // Real-time subscription effect
  useEffect(() => {
    if (!isOpen || !transactionDetails.id) return;

    // Subscribe to changes in the booking
    const subscription = supabase
      .channel(`booking_${transactionDetails.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_bookings',
          filter: `id=eq.${transactionDetails.id}`
        },
        async (payload) => {
          if (payload.new) {
            const updatedBooking = payload.new as any;
            
            // Update local state with new booking data
            setTransactionDetails(prev => ({
              ...prev,
              booking_status: updatedBooking.booking_status,
              payment_status: updatedBooking.payment_status
            }));

            // Update payment status
            if (updatedBooking.payment_status === 'completed') {
              setPaymentStatus('completed');
              toast.success('Payment completed successfully!');
            } else if (updatedBooking.payment_status === 'failed') {
              setPaymentStatus('failed');
              toast.error('Payment failed. Please try again.');
            }
          }
        }
      )
      .subscribe();

    // Polling fallback for status updates
    const pollInterval = setInterval(async () => {
      const { data, error } = await supabase
        .from('event_bookings')
        .select('*')
        .eq('id', transactionDetails.id)
        .single();

      if (!error && data) {
        setTransactionDetails(prev => ({
          ...prev,
          booking_status: data.booking_status,
          payment_status: data.payment_status ?? 'pending'
        }));

        if (data.payment_status === 'completed') {
          setPaymentStatus('completed');
        } else if (data.payment_status === 'failed') {
          setPaymentStatus('failed');
        }
      }
    }, 5000);

    // Cleanup subscriptions and intervals
    return () => {
      subscription.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [isOpen, transactionDetails.id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
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
        className="relative flex h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl dark:bg-gray-800 md:h-auto md:max-h-[80vh]"
      >
        {/* Main content area - scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col p-3">
            <div className="flex flex-col space-y-3 md:flex-row md:space-x-4 md:space-y-0">
              <div className="text-center md:w-1/3">
                <div className="mb-2 flex justify-center">
                  {paymentStatus === 'completed' ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : paymentStatus === 'failed' ? (
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-yellow-500" />
                  )}
                </div>
                <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  Booking Details
                </h2>
                
                {paymentStatus === 'processing' && timeLeft > 0 && (
                  <div className="mb-2">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Processing Time Remaining
                    </div>
                    <div className="text-lg font-bold text-blue-500">
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                )}

                <div className="mb-3 text-sm">
                  <p className="mb-1 text-gray-600 dark:text-gray-300">
                    Dear <span className="font-medium">{transactionDetails.name}</span>,
                  </p>
                  {paymentStatus === 'completed' ? (
                    <p className="text-green-600 dark:text-green-400">
                      Payment completed successfully! Thank you for your booking.
                    </p>
                  ) : paymentStatus === 'failed' ? (
                    <p className="text-red-600 dark:text-red-400">
                      {timeLeft === 0 
                        ? 'Booking rejected due to payment timeout. Please try again.'
                        : 'Payment failed. Please try again or contact support if the issue persists.'}
                    </p>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300">
                      We have sent a notification to <span className="font-medium">{transactionDetails.phone}</span>.
                      Please enter your M-Pesa PIN on your mobile to proceed.
                    </p>
                  )}
                </div>
              </div>

              <div className="md:w-2/3">
                <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-700">
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {/* Event Name - Full Width */}
                    <div className="col-span-full flex flex-col rounded-md bg-white px-2 py-1 shadow-sm dark:bg-gray-800">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Event
                      </p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {transactionDetails.event_name}
                      </p>
                    </div>

                    {/* Booking ID - Full Width */}
                    <div className="col-span-full flex flex-col rounded-md bg-white px-2 py-1 shadow-sm dark:bg-gray-800">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Booking ID
                      </p>
                      <p className="break-all text-xs font-medium text-gray-900 dark:text-white">
                        {transactionDetails.id}
                      </p>
                    </div>

                    {/* Status and Amount */}
                    <div className="flex flex-col rounded-md bg-white px-2 py-1 shadow-sm dark:bg-gray-800">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Status
                      </p>
                      <p className="text-xs font-medium capitalize text-gray-900 dark:text-white">
                        {transactionDetails.booking_status}
                      </p>
                    </div>

                    <div className="flex flex-col rounded-md bg-white px-2 py-1 shadow-sm dark:bg-gray-800">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Amount
                      </p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        KES {transactionDetails.amount.toLocaleString()}
                      </p>
                    </div>

                    {/* Name and Phone */}
                    <div className="flex flex-col rounded-md bg-white px-2 py-1 shadow-sm dark:bg-gray-800">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Name
                      </p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {transactionDetails.name}
                      </p>
                    </div>

                    <div className="flex flex-col rounded-md bg-white px-2 py-1 shadow-sm dark:bg-gray-800">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Phone
                      </p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {transactionDetails.phone}
                      </p>
                    </div>

                    {/* Date and Payment Status */}
                    <div className="flex flex-col rounded-md bg-white px-2 py-1 shadow-sm dark:bg-gray-800">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Date
                      </p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {transactionDetails.booking_date}
                      </p>
                    </div>

                    <div className="flex flex-col rounded-md bg-white px-2 py-1 shadow-sm dark:bg-gray-800">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Payment Status
                      </p>
                      <p className={`text-xs font-medium capitalize ${
                        transactionDetails.payment_status === 'completed' 
                          ? 'text-green-500' 
                          : transactionDetails.payment_status === 'failed'
                          ? 'text-red-500'
                          : 'text-yellow-500'
                      }`}>
                        {transactionDetails.payment_status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop close button */}
            <button
              onClick={onClose}
              className="mt-3 hidden w-full rounded-md bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 text-white transition-all hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 md:block"
            >
              Close
            </button>
          </div>
        </div>

        {/* Mobile close button - fixed at bottom */}
        <div className="sticky bottom-0 mt-auto border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:hidden">
          <button
            onClick={onClose}
            className="w-full rounded-md bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 text-white transition-all hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
