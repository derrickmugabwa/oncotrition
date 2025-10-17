import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, User, Mail, Phone, ArrowLeft, AlertCircle } from 'lucide-react';
import { Event } from '@/types/events';
import { format } from 'date-fns';

interface EventDetailProps {
  event: Event;
}

export default function EventDetail({ event }: EventDetailProps) {
  const eventDate = new Date(event.event_date);
  const formattedDate = format(eventDate, 'EEEE, MMMM dd, yyyy');
  const formattedTime = event.event_time.slice(0, 5); // HH:MM format

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const attendeePercentage = event.max_attendees
    ? (event.current_attendees / event.max_attendees) * 100
    : 0;

  const isFull = event.max_attendees && event.current_attendees >= event.max_attendees;
  const spotsLeft = event.max_attendees ? event.max_attendees - event.current_attendees : null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-[#009688] hover:text-[#00796b] mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Events</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Featured Image */}
          <div className="relative h-96 rounded-2xl overflow-hidden mb-8 shadow-2xl">
            {event.featured_image_url ? (
              <Image
                src={event.featured_image_url}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#009688] to-blue-500 flex items-center justify-center">
                <Calendar className="w-24 h-24 text-white/30" />
              </div>
            )}
            
            {/* Status Badge */}
            <div className={`absolute top-6 right-6 ${getStatusColor(event.status)} px-4 py-2 rounded-full text-sm font-semibold capitalize border-2 backdrop-blur-sm`}>
              {event.status}
            </div>
          </div>

          {/* Title and Description */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {event.title}
            </h1>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="whitespace-pre-line">{event.description}</p>
            </div>

            {/* Additional Info */}
            {event.additional_info && (
              <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Additional Information</h3>
                    <p className="text-blue-800 text-sm whitespace-pre-line">{event.additional_info}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Organizer Information */}
          {(event.organizer_name || event.organizer_contact) && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Organizer</h2>
              <div className="space-y-3">
                {event.organizer_name && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <User className="w-5 h-5 text-[#009688]" />
                    <span className="font-medium">{event.organizer_name}</span>
                  </div>
                )}
                {event.organizer_contact && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-5 h-5 text-[#009688]" />
                    <a
                      href={`mailto:${event.organizer_contact}`}
                      className="hover:text-[#009688] transition-colors"
                    >
                      {event.organizer_contact}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Event Details Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Event Details</h2>
              
              <div className="space-y-4">
                {/* Date */}
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#009688] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold text-gray-900">{formattedDate}</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#009688] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-semibold text-gray-900">{formattedTime}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#009688] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">{event.location}</p>
                  </div>
                </div>

                {/* Attendees */}
                {event.max_attendees && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#009688]" />
                        <span className="text-sm text-gray-500">Attendees</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {event.current_attendees} / {event.max_attendees}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isFull ? 'bg-red-500' : 'bg-[#009688]'
                        }`}
                        style={{ width: `${Math.min(attendeePercentage, 100)}%` }}
                      />
                    </div>
                    {spotsLeft !== null && spotsLeft > 0 && (
                      <p className="text-sm text-gray-600">
                        {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} remaining
                      </p>
                    )}
                    {isFull && (
                      <p className="text-sm text-red-600 font-medium">Event is full</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Registration Card */}
            {event.registration_link && event.status === 'upcoming' && (
              <div className="bg-gradient-to-br from-[#009688] to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-3">Ready to Join?</h3>
                <p className="text-white/90 mb-4 text-sm">
                  {isFull 
                    ? 'This event is currently full. Register to join the waitlist.'
                    : 'Secure your spot at this event today!'}
                </p>
                <a
                  href={event.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-white text-[#009688] py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {isFull ? 'Join Waitlist' : 'Register Now'}
                </a>
              </div>
            )}

            {/* Event Cancelled Notice */}
            {event.status === 'cancelled' && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-900 mb-1">Event Cancelled</h3>
                    <p className="text-red-800 text-sm">
                      This event has been cancelled. Please check back for future events.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Event Completed Notice */}
            {event.status === 'completed' && (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Event Completed</h3>
                    <p className="text-gray-700 text-sm">
                      This event has ended. Check out our upcoming events!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
