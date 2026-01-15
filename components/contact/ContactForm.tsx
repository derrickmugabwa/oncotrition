'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Send } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { Database } from '@/types/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type ContactInfo = {
  title: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  social_links: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
};

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};


function ContactForm() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  async function fetchContactInfo() {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .single();

      if (error) throw error;
      setContactInfo(data as any);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('form_submissions')
        .insert([formData]);

      if (error) throw error;

      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success('Message sent successfully! We will get back to you soon.');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">
              {contactInfo?.title || 'Get in Touch'}
            </CardTitle>
            <CardDescription className="text-sm">
              {contactInfo?.description || "Have questions? We'll love to hear from you. Send us a message and we'll respond as soon as possible."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">

            {contactInfo?.email && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <Mail className="h-4 w-4 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium mb-0.5">Email</p>
                  <a href={`mailto:${contactInfo.email}`} className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors">
                    {contactInfo.email}
                  </a>
                </div>
              </div>
            )}

            {contactInfo?.phone && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <Phone className="h-4 w-4 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium mb-0.5">Phone</p>
                  <a href={`tel:${contactInfo.phone}`} className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors">
                    {contactInfo.phone}
                  </a>
                </div>
              </div>
            )}

            {contactInfo?.address && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <MapPin className="h-4 w-4 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium mb-0.5">Address</p>
                  <p className="text-sm text-muted-foreground">{contactInfo.address}</p>
                </div>
              </div>
            )}

            {contactInfo?.social_links && Object.keys(contactInfo.social_links).length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-xs font-medium mb-3">Follow Us</p>
                <div className="flex gap-4">
                  {contactInfo.social_links.facebook && (
                    <a
                      href={contactInfo.social_links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-emerald-600 transition-colors"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {contactInfo.social_links.twitter && (
                    <a
                      href={contactInfo.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-emerald-600 transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {contactInfo.social_links.instagram && (
                    <a
                      href={contactInfo.social_links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-emerald-600 transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Send us a Message</CardTitle>
            <CardDescription className="text-sm">Fill out the form below and we'll get back to you soon</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What is this about?"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Type your message here..."
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? 'Sending...' : 'Send Message'}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ContactForm;