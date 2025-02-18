'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  BeakerIcon, ChartPieIcon, ClipboardDocumentListIcon, 
  HeartIcon, AcademicCapIcon, UserGroupIcon, 
  SparklesIcon, ShieldCheckIcon, RocketLaunchIcon,
  BookOpenIcon, BoltIcon, CalendarIcon,
  ChartBarIcon, CloudIcon, CogIcon, CommandLineIcon,
  CpuChipIcon, DocumentTextIcon, FireIcon,
  GlobeAltIcon, LinkIcon, ListBulletIcon,
  MagnifyingGlassIcon, MapIcon, MusicalNoteIcon,
  PresentationChartBarIcon, ServerIcon,
  StarIcon, SunIcon, TableCellsIcon, TagIcon,
  TrophyIcon, VideoCameraIcon, WrenchIcon
} from '@heroicons/react/24/outline';

const ICON_MAP = {
  'Academic': AcademicCapIcon,
  'Book': BookOpenIcon,
  'Presentation': PresentationChartBarIcon,
  'Rocket': RocketLaunchIcon,
  'Star': StarIcon,
  'Heart': HeartIcon,
  'Shield': ShieldCheckIcon,
  'Sun': SunIcon,
  'Trophy': TrophyIcon,
  'Sparkles': SparklesIcon,
  'Chart-Pie': ChartPieIcon,
  'Chart-Bar': ChartBarIcon,
  'List': ListBulletIcon,
  'Table': TableCellsIcon,
  'Clipboard': ClipboardDocumentListIcon,
  'Chip': CpuChipIcon,
  'Cloud': CloudIcon,
  'Cog': CogIcon,
  'Command': CommandLineIcon,
  'Server': ServerIcon,
  'Bolt': BoltIcon,
  'Fire': FireIcon,
  'Wrench': WrenchIcon,
  'Tag': TagIcon,
  'Beaker': BeakerIcon,
  'Document': DocumentTextIcon,
  'Globe': GlobeAltIcon,
  'Link': LinkIcon,
  'Video': VideoCameraIcon,
  'Calendar': CalendarIcon,
};

interface Module {
  id: number;
  title: string;
  icon_svg: string;
  features: string[];
  display_order: number;
}

interface ModulesContent {
  id: number;
  heading: string;
  description: string;
}

export default function Modules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [content, setContent] = useState<ModulesContent | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchData() {
      const [modulesResult, contentResult] = await Promise.all([
        supabase.from('modules').select('*').order('display_order'),
        supabase.from('modules_content').select('*').single()
      ]);
      
      if (modulesResult.error) {
        console.error('Error fetching modules:', modulesResult.error);
      } else {
        setModules(modulesResult.data || []);
      }

      if (contentResult.error) {
        console.error('Error fetching content:', contentResult.error);
      } else {
        setContent(contentResult.data);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-950 dark:to-gray-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {content?.heading || 'Our Modules'}
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
            {content?.description || 'Comprehensive solutions designed to transform your nutrition journey'}
          </p>
        </motion.div>

        <div className="flex justify-center">
          <div className={`grid gap-4 md:gap-6 w-full max-w-7xl ${
            modules.length < 3 
              ? 'grid-cols-1 md:grid-cols-2 place-items-center' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group w-full max-w-md"
              >
                <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transform transition-all duration-300 group-hover:shadow-xl"></div>
                <motion.div 
                  className="relative p-8 h-full"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="mb-6">
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: index === 1 ? -5 : 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      {(() => {
                        const IconComponent = ICON_MAP[module.icon_svg as keyof typeof ICON_MAP];
                        return IconComponent ? (
                          <IconComponent className="w-8 h-8 text-white" />
                        ) : (
                          <div className="w-8 h-8 text-white" />
                        );
                      })()}
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{module.title}</h3>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    {module.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={featureIndex}
                        className="flex items-center space-x-2"
                      >
                        <span>•</span>
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
