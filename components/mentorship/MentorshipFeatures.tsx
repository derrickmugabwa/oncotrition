'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import createClient from '@/utils/supabase-client';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaHandshake, 
  FaChartLine,
  FaCalendarCheck,
  FaUsers,
  FaUserCheck,
  FaExclamationCircle
} from 'react-icons/fa';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon_name: string;
  gradient: string;
  display_order: number;
}

const ICONS = {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaHandshake,
  FaChartLine,
  FaCalendarCheck,
  FaUsers,
  FaUserCheck
};

function FeatureCard({ feature }: { feature: Feature }) {
  const IconComponent = ICONS[feature.icon_name as keyof typeof ICONS];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-shadow duration-300"
    >
      <div className={`bg-gradient-to-r ${feature.gradient} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
        <IconComponent className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
        {feature.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {feature.description}
      </p>
    </motion.div>
  );
}

function LoadingFeatureCard() {
  return (
    <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-xl animate-pulse">
      <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 mb-4" />
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mt-2" />
    </div>
  );
}

function ErrorState() {
  return (
    <div className="col-span-3 flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
      <FaExclamationCircle className="w-12 h-12 mb-4 text-red-500" />
      <p className="text-lg">Unable to load mentorship features.</p>
      <p className="text-sm mt-2">Please try refreshing the page.</p>
    </div>
  );
}

interface SectionContent {
  id: string;
  title: string;
  description: string;
}

export default function MentorshipFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [content, setContent] = useState<SectionContent>({
    id: '',
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const supabase = createClient();
        
        // Fetch features
        const { data: featuresData, error: featuresError } = await supabase
          .from('mentorship_features')
          .select('*')
          .order('display_order');

        if (featuresError) {
          console.error('Supabase error fetching features:', featuresError);
          throw featuresError;
        }

        if (featuresData) {
          console.log('Features fetched successfully:', featuresData);
          setFeatures(featuresData);
        } else {
          console.log('No features found');
          setFeatures([]);
        }
        
        // Fetch section content from the API endpoint
        try {
          const response = await fetch('/api/mentorship/features-content');
          if (!response.ok) {
            throw new Error(`Error fetching content: ${response.statusText}`);
          }
          
          const contentData = await response.json();
          if (contentData) {
            console.log('Content fetched successfully:', contentData);
            setContent({
              id: contentData.id || '',
              title: contentData.title,
              description: contentData.description
            });
          }
        } catch (contentError) {
          console.error('Error fetching section content:', contentError);
          // Use default values if API fails
          console.log('Using default content values');
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load mentorship features');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-[#009688]">
            {content.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {content.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <>
              <LoadingFeatureCard />
              <LoadingFeatureCard />
              <LoadingFeatureCard />
            </>
          ) : error ? (
            <ErrorState />
          ) : features.length > 0 ? (
            features.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
              No mentorship features available at the moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
