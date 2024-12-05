'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaHandshake, 
  FaChartLine,
  FaCalendarCheck,
  FaUsers
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
  FaUsers
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

export default function MentorshipFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchFeatures = async () => {
      const { data } = await supabase
        .from('mentorship_features')
        .select('*')
        .order('display_order');

      if (data) {
        setFeatures(data);
      }
    };

    fetchFeatures();
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
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Why Choose Our Mentorship?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your nutrition journey with expert guidance and personalized support
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
