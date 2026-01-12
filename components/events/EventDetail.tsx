import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, User, Mail, Phone, ArrowLeft, AlertCircle } from 'lucide-react';
import { Event } from '@/types/events';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EventDetailProps {
  event: Event;
}

export default function EventDetail({ event }: EventDetailProps) {
  const eventDate = new Date(event.event_date);
  const formattedDate = format(eventDate, 'EEEE, MMMM dd, yyyy');
  const formattedTime = event.event_time.slice(0, 5); // HH:MM format

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
    ? (event.current_attendees / event.max_attendees) * 100
    : 0;

  const isFull = event.max_attendees && event.current_attendees >= event.max_attendees;
  const spotsLeft = event.max_attendees ? event.max_attendees - event.current_attendees : null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 font-outfit">
      {/* Back Button */}
      <Link href="/events">
        <Button variant="ghost" className="mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
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
            <div className="absolute top-6 right-6">
              <Badge 
                variant={getStatusVariant(event.status)} 
                className={`capitalize text-sm px-4 py-2 ${
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

          {/* Title and Description */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {event.title}
              </h1>
              
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="whitespace-pre-line">{event.description}</p>
              </div>

              {/* Additional Info */}
              {event.additional_info && (
                <Alert className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <h3 className="font-semibold mb-1">Additional Information</h3>
                    <p className="text-sm whitespace-pre-line">{event.additional_info}</p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Organizer Information */}
          {(event.organizer_name || event.organizer_contact) && (
            <Card>
              <CardHeader>
                <CardTitle>Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.organizer_name && (
                    <div className="flex items-center gap-3 text-foreground">
                      <User className="w-5 h-5 text-primary" />
                      <span className="font-medium">{event.organizer_name}</span>
                    </div>
                  )}
                  {event.organizer_contact && (
                    <div className="flex items-center gap-3 text-foreground">
                      <Mail className="w-5 h-5 text-primary" />
                      <a
                        href={`mailto:${event.organizer_contact}`}
                        className="hover:text-primary transition-colors"
                      >
                        {event.organizer_contact}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Event Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold text-foreground">{formattedDate}</p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-semibold text-foreground">{formattedTime}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold text-foreground">{event.location}</p>
                    </div>
                  </div>

                  {/* Attendees */}
                  {event.max_attendees && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          <span className="text-sm text-muted-foreground">Attendees</span>
                        </div>
                        <span className="font-semibold text-foreground">
                          {event.current_attendees} / {event.max_attendees}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isFull ? 'bg-destructive' : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(attendeePercentage, 100)}%` }}
                        />
                      </div>
                      {spotsLeft !== null && spotsLeft > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} remaining
                        </p>
                      )}
                      {isFull && (
                        <p className="text-sm text-destructive font-medium">Event is full</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Registration Card - Internal Registration */}
            {event.has_internal_registration && 
             event.registration_type === 'internal' && 
             event.status === 'upcoming' && (
              <Card className="bg-gradient-to-br from-[#009688] to-[#00796b] text-white border-0">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">Ready to Join?</h3>
                  <p className="text-white/90 mb-4 text-sm">
                    {isFull 
                      ? 'This event is currently full.'
                      : 'Register now to secure your spot at this event.'}
                  </p>
                  {event.registration_deadline && (
                    <p className="text-white/80 mb-4 text-xs">
                      Registration closes: {new Date(event.registration_deadline).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                  <Link href={`/events/${event.id}/register`} className="block w-full">
                    <Button 
                      className="w-full bg-white hover:bg-gray-100 text-[#009688]" 
                      variant="secondary" 
                      size="lg"
                      disabled={isFull}
                    >
                      {isFull ? 'Event Full' : 'Register for This Event'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Registration Card - External Link */}
            {event.registration_link && 
             event.registration_type !== 'internal' && 
             event.status === 'upcoming' && (
              <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">Ready to Join?</h3>
                  <p className="text-primary-foreground/90 mb-4 text-sm">
                    {isFull 
                      ? 'This event is currently full. Register to join the waitlist.'
                      : 'Secure your spot at this event today!'}
                  </p>
                  <a
                    href={event.registration_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full bg-white hover:bg-gray-100 text-primary" variant="secondary" size="lg">
                      {isFull ? 'Join Waitlist' : 'Register Now'}
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Event Cancelled Notice */}
            {event.status === 'cancelled' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <h3 className="font-bold mb-1">Event Cancelled</h3>
                  <p className="text-sm">
                    This event has been cancelled. Please check back for future events.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Event Completed Notice */}
            {event.status === 'completed' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <h3 className="font-bold mb-1">Event Completed</h3>
                  <p className="text-sm">
                    This event has ended. Check out our upcoming events!
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
