'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, Filter } from 'lucide-react';
import EventCard from './EventCard';
import EventFilters from './EventFilters';
import { Event, EventFilters as EventFiltersType } from '@/types/events';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EventsListProps {
  events: Event[];
  featuredEvents: Event[];
  upcomingEvents: Event[];
}

export default function EventsList({ events, featuredEvents, upcomingEvents }: EventsListProps) {
  const [filters, setFilters] = useState<EventFiltersType>({
    status: undefined,
    search: '',
    dateFrom: undefined,
    dateTo: undefined,
    isFeatured: undefined,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Status filter
      if (filters.status && event.status !== filters.status) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Date range filter
      if (filters.dateFrom && event.event_date < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && event.event_date > filters.dateTo) {
        return false;
      }

      // Featured filter
      if (filters.isFeatured !== undefined && event.is_featured !== filters.isFeatured) {
        return false;
      }

      return true;
    });
  }, [events, filters]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 font-outfit">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Upcoming Events
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Join our nutrition workshops, seminars, and support groups designed to empower you on your health journey.
        </p>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 w-full"
            />
          </div>

          {/* Filter Toggle Button */}
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="default"
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <EventFilters filters={filters} onFiltersChange={setFilters} />
          </motion.div>
        )}
      </motion.div>

      {/* Results Count */}
      <div className="mb-6 text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? 's' : ''}
      </div>

      {/* Featured Events Section */}
      {featuredEvents.length > 0 && !filters.search && !filters.status && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Featured Events</h2>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {featuredEvents.map((event) => (
              <motion.div key={event.id} variants={itemVariants}>
                <EventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* All Events Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {filters.status ? `${filters.status.charAt(0).toUpperCase() + filters.status.slice(1)} Events` : 'All Events'}
        </h2>
        
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No events found</h3>
            <p className="text-muted-foreground">
              {filters.search || filters.status
                ? 'Try adjusting your filters to see more events.'
                : 'Check back soon for upcoming events!'}
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredEvents.map((event) => (
              <motion.div key={event.id} variants={itemVariants}>
                <EventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>
    </div>
  );
}
