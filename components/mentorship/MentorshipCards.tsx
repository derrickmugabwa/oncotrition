'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Package {
  id: number;
  name: string;
  price: number;
  international_price: number;
  title: string;
  description: string;
  features: string[];
  recommended: boolean;
  gradient: string;
  order_number: number;
  duration_type: string;
  url: string;
  show_price: boolean;
}

export default function MentorshipCards() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInternational, setIsInternational] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('Our Mentorship Packages');
  const [sectionDescription, setSectionDescription] = useState('Choose the perfect mentorship package tailored to your needs and goals.');
  const supabase = createClient();

  useEffect(() => {
    fetchPackages();
    
    // Log the current state values for debugging
    console.log('Initial state values:', { sectionTitle, sectionDescription });
  }, []);
  
  // Monitor state changes
  useEffect(() => {
    console.log('Section title updated:', sectionTitle);
  }, [sectionTitle]);
  
  useEffect(() => {
    console.log('Section description updated:', sectionDescription);
  }, [sectionDescription]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      
      // First fetch packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('mentorship_packages')
        .select('*')
        .order('order_number');

      if (packagesError) throw packagesError;

      if (packagesData) {
        setPackages(packagesData as any);
      }
      
      // Then fetch section settings from the first package
      if (packagesData && packagesData.length > 0) {
        const firstPackage = packagesData[0];
        
        // Log the first package to see what data we have
        console.log('First package data:', firstPackage);
        
        // Always set the title and description, even if they're empty strings
        setSectionTitle(firstPackage.title || 'Our Mentorship Packages');
        setSectionDescription(firstPackage.description || 'Choose the perfect mentorship package tailored to your needs and goals.');
      }
    } catch (error: any) {
      console.error('Error fetching mentorship data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex text-center justify-center items-center gap-4 flex-col mb-8">
          <div className="flex gap-3 flex-col">
            <h2 className="text-4xl md:text-6xl tracking-tight max-w-3xl text-center font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              {sectionTitle}
            </h2>
            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              {sectionDescription}
            </p>
          </div>
          
          {/* Toggle for Local/International */}
          <div className="flex justify-center mt-4 mb-2">
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 p-1.5 rounded-2xl inline-flex shadow-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsInternational(false)}
                className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${!isInternational
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-lg text-white scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50'}`}
              >
                🇰🇪 Local Pricing
              </button>
              <button
                onClick={() => setIsInternational(true)}
                className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isInternational
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-lg text-white scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50'}`}
              >
                🌍 International Pricing
              </button>
            </div>
          </div>
          
          <div className="grid pt-8 text-left grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-6">
          {packages.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15, type: "spring" }}
              viewport={{ once: true }}
              className={plan.recommended || index === 1 ? 'lg:-mt-4 lg:mb-4' : ''}
            >
              <Card className={`w-full rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                plan.recommended || index === 1 
                  ? 'border-teal-500 shadow-xl shadow-teal-500/20 relative overflow-hidden' 
                  : 'border-gray-200 dark:border-gray-800 hover:border-teal-300'
              }`}>
                {(plan.recommended || index === 1) && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-1.5 rounded-bl-2xl text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">
                    <span className="flex flex-row gap-2 items-center">
                      {plan.name}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Our goal is to provide the best mentorship experience for you.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-col gap-6 justify-start">
                    <div className="flex flex-col gap-1">
                      <motion.div 
                        key={isInternational ? 'international' : 'local'}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-baseline gap-2"
                      >
                        <span className="text-5xl font-extrabold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                          {isInternational 
                            ? (plan.international_price || plan.price).toLocaleString()
                            : plan.price.toLocaleString()}
                        </span>
                        <span className="text-lg font-semibold text-muted-foreground">
                          {isInternational ? 'USD' : 'KES'}
                        </span>
                      </motion.div>
                      <span className="text-sm text-muted-foreground font-medium">
                        per {plan.duration_type}
                      </span>
                    </div>
                    
                    <div className="flex flex-col justify-start gap-3 py-4 border-t border-b border-gray-200 dark:border-gray-800">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex flex-row items-start gap-3">
                          <div className="mt-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 p-1">
                            <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          </div>
                          <div className="flex flex-col flex-1">
                            <p className="font-medium text-sm">{feature.split(':')[0] || feature}</p>
                            {feature.includes(':') && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {feature.split(':')[1].trim()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="mt-2"
                    >
                      <Button
                        size="lg"
                        onClick={() => window.location.href = plan.url || '/mentorship/apply'}
                        className={`w-full gap-2 font-semibold text-base rounded-xl transition-all duration-300 ${
                          plan.recommended || index === 1
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <Link
                          href={plan.url || "https://www.nutripreneurship.com/auth/signup"}
                          target={plan.url ? "_blank" : undefined}
                          rel={plan.url ? "noopener noreferrer" : undefined}
                          onClick={(e) => {
                            if (!plan.url) {
                              e.preventDefault();
                              document.getElementById('events-section')?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                              });
                            }
                          }}
                          className="flex items-center justify-center"
                        >
                          Get Started
                          <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
