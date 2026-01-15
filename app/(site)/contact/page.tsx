'use client';

import Hero from '@/components/contact/Hero';
import ContactForm from '@/components/contact/ContactForm';

export default function Contact() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Hero />
      <ContactForm />
    </main>
  );
}
