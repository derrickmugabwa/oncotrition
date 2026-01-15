'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, Star } from 'lucide-react';
import { Event } from '@/types/events';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.event_date);
  const formattedDate = format(eventDate, 'MMM dd, yyyy');
  const formattedTime = event.event_time ? event.event_time.slice(0, 5) : 'TBD'; // HH:MM format

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'upcoming':
        return 'default';
      case 'ongoing':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const attendeePercentage = event.max_attendees
    ? ((event.current_attendees ?? 0) / event.max_attendees) * 100
    : 0;

  const isFull = event.max_attendees && (event.current_attendees ?? 0) >= event.max_attendees;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="h-full font-outfit"
    >
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-2xl transition-shadow duration-300">
        {/* Event Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary to-primary/60 overflow-hidden">
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
            <div className="absolute top-3 left-3">
              <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-yellow-500">
                <Star className="w-3 h-3 fill-current mr-1" />
                Featured
              </Badge>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge 
              variant={getStatusVariant(event.status ?? 'upcoming')} 
              className={`capitalize ${
                event.status === 'upcoming' ? 'bg-green-500 text-white hover:bg-green-600' :
                event.status === 'ongoing' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                event.status === 'completed' ? 'bg-gray-500 text-white hover:bg-gray-600' :
                event.status === 'cancelled' ? 'bg-red-500 text-white hover:bg-red-600' : ''
              }`}
            >
              {event.status}
            </Badge>
          </div>
        </div>

        <CardContent className="flex-1 flex flex-col p-6">
          {/* Title */}
          <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
            {event.description}
          </p>

          {/* Event Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-foreground text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span>{formattedTime}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>

          {/* Attendees Progress */}
          {event.max_attendees && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{event.current_attendees} / {event.max_attendees} attendees</span>
                </div>
                <span>{Math.round(attendeePercentage)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isFull ? 'bg-destructive' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(attendeePercentage, 100)}%` }}
                />
              </div>
              {isFull && (
                <p className="text-xs text-destructive mt-1">Event is full</p>
              )}
            </div>
          )}

          {/* Action Button */}
          <Link 
            href={`/events/${event.id}`} 
            className="block w-full text-center bg-[#009688] hover:bg-[#00796b] text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <span className="text-white">
              {event.has_internal_registration && 
               event.registration_type === 'internal' && 
               event.status === 'upcoming' 
                ? 'View Details & Register' 
                : 'View Details'}
            </span>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
