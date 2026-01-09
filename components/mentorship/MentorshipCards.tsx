'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Check, MoveRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
        setPackages(packagesData);
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
    <div className="w-full py-0">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex text-center justify-center items-center gap-2 flex-col">
          {/* <Badge>Mentorship</Badge> */}
          
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl text-center font-regular text-[#00B67A]">
              {sectionTitle}
            </h2>
            <p className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-xl text-center">
              {sectionDescription}
            </p>
          </div>
          
          {/* Toggle for Local/International */}
          <div className="flex justify-center mt-2 mb-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-full inline-flex">
              <button
                onClick={() => setIsInternational(false)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!isInternational
                  ? 'bg-white dark:bg-gray-700 shadow-md text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Local Pricing
              </button>
              <button
                onClick={() => setIsInternational(true)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${isInternational
                  ? 'bg-white dark:bg-gray-700 shadow-md text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                International Pricing
              </button>
            </div>
          </div>
          
          <div className="grid pt-6 text-left grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-8">
          {packages.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={index === 1 ? 'z-10 relative' : ''}
            >
              <Card className={`w-full rounded-xl ${
                plan.recommended || index === 1 
                  ? 'shadow-2xl ' + (index === 1 ? 'bg-teal-600 text-white' : '') 
                  : ''
              }`}>
                <CardHeader>
                  <CardTitle>
                    <span className="flex flex-row gap-4 items-center font-normal">
                      {plan.name}
                    </span>
                  </CardTitle>
                  <CardDescription className={index === 1 ? 'text-white/80' : ''}>
                    Our goal is to provide the best mentorship experience for you.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-col gap-8 justify-start">
                    <p className="flex flex-row items-center gap-2 text-xl">
                      <motion.span 
                        key={isInternational ? 'international' : 'local'}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="text-3xl font-bold"
                      >
                        {isInternational 
                          ? `USD ${(plan.international_price || plan.price).toLocaleString()}` 
                          : `KES ${plan.price.toLocaleString()}`}
                      </motion.span>
                      <span className={`text-sm ${index === 1 ? 'text-white/70' : 'text-muted-foreground'}`}>
                        / {plan.duration_type}
                      </span>
                    </p>
                    
                    <div className="flex flex-col justify-start -space-y-1">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex flex-row items-start">
                          <Check className={`w-4 h-4 mt-1 mr-1 ${index === 1 ? 'text-white' : 'text-primary'}`} />
                          <div className="flex flex-col">
                            <p>{feature.split(':')[0] || feature}</p>
                            {feature.includes(':') && (
                              <p className={`text-sm ${index === 1 ? 'text-white/70' : 'text-muted-foreground'}`}>
                                {feature.split(':')[1].trim()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        asChild
                        variant={index === 1 ? 'default' : 'outline'}
                        className={`gap-4 w-full ${index === 1 ? 'bg-black hover:bg-black/90 text-white' : ''}`}
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
                        >
                          Get Started <MoveRight className="w-4 h-4" />
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
