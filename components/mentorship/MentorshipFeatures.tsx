'use client';

import { motion } from 'framer-motion';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaHandshake, 
  FaChartLine,
  FaCalendarCheck,
  FaUsers,
  FaUserCheck
} from 'react-icons/fa';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon_name: string;
  gradient: string;
  display_order: number;
}

interface SectionContent {
  id: string;
  title: string;
  description: string;
}

interface MentorshipFeaturesProps {
  features?: Feature[];
  content?: SectionContent;
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
      className="p-6 rounded-xl bg-blue-50 dark:bg-blue-950/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`bg-gradient-to-br ${feature.gradient} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
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

export default function MentorshipFeatures({ features = [], content }: MentorshipFeaturesProps) {
  const defaultContent: SectionContent = {
    id: '',
    title: '',
    description: ''
  };

  const sectionContent = content || defaultContent;

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {sectionContent.title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {sectionContent.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.length > 0 ? (
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
