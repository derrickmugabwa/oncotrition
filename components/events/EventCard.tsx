'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, Star } from 'lucide-react';
import { Event } from '@/types/events';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.event_date);
  const formattedDate = format(eventDate, 'MMM dd, yyyy');
  const formattedTime = event.event_time.slice(0, 5); // HH:MM format

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const attendeePercentage = event.max_attendees
    ? (event.current_attendees / event.max_attendees) * 100
    : 0;

  const isFull = event.max_attendees && event.current_attendees >= event.max_attendees;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col"
    >
      {/* Event Image */}
      <div className="relative h-48 bg-gradient-to-br from-[#009688] to-blue-500 overflow-hidden">
        {event.featured_image_url ? (
          <Image
            src={event.featured_image_url}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="w-16 h-16 text-white/30" />
          </div>
        )}
        
        {/* Featured Badge */}
        {event.is_featured && (
          <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute top-3 right-3 ${getStatusColor(event.status)} px-3 py-1 rounded-full text-xs font-semibold capitalize`}>
          {event.status}
        </div>
      </div>

      {/* Event Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Calendar className="w-4 h-4 text-[#009688]" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Clock className="w-4 h-4 text-[#009688]" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <MapPin className="w-4 h-4 text-[#009688]" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Attendees Progress */}
        {event.max_attendees && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{event.current_attendees} / {event.max_attendees} attendees</span>
              </div>
              <span>{Math.round(attendeePercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isFull ? 'bg-red-500' : 'bg-[#009688]'
                }`}
                style={{ width: `${Math.min(attendeePercentage, 100)}%` }}
              />
            </div>
            {isFull && (
              <p className="text-xs text-red-600 mt-1">Event is full</p>
            )}
          </div>
        )}

        {/* Action Button */}
        <Link
          href={`/events/${event.id}`}
          className="block w-full text-center bg-gradient-to-r from-[#009688] to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-[#00796b] hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}
