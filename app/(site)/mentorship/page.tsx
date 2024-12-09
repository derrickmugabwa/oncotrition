'use client'

import React from 'react';
import { usePageLoading } from '@/hooks/usePageLoading'
import Hero from '@/components/mentorship/Hero';
import MentorshipCards from '@/components/mentorship/MentorshipCards';
import MentorshipFeatures from '@/components/mentorship/MentorshipFeatures';
import EventsList from '@/components/mentorship/EventsList';

export default function MentorshipPage() {
  usePageLoading()
  return (
    <main>
      <Hero />
      <MentorshipFeatures />
      <MentorshipCards />
      <EventsList />
    </main>
  );
}
