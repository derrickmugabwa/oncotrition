'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
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
  image_url?: string;
  learn_more_url?: string;
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
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header with angled design */}
          <div className="relative mb-20">
            <div className="absolute inset-0 bg-emerald-600 dark:bg-emerald-800 skew-y-3 -z-10 rounded-br-3xl rounded-tl-3xl"></div>
            <div className="relative z-10 py-12 px-8">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-emerald-500 dark:text-emerald-400 mb-3 drop-shadow-sm"
              >
                {content?.heading || 'Our Modules'}
              </motion.h2>
              <div className="h-1 w-24 bg-emerald-300 mb-4"></div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-emerald-600 dark:text-emerald-500 max-w-xl font-medium"
              >
                {content?.description || 'Comprehensive solutions designed to transform your nutrition journey'}
              </motion.p>
            </div>
          </div>

          {/* Modules in a staggered layout */}
          <div className="space-y-16">
            {modules.map((module, index) => (
              <motion.div 
                key={module.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="grid md:grid-cols-5 gap-6 items-center">
                  {/* Image column - alternating layout */}
                  <div className={`md:col-span-2 order-2 ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                    <div className="rounded-2xl overflow-hidden shadow-xl transform transition-transform hover:scale-105">
                      {module.image_url ? (
                        <Image
                          src={module.image_url}
                          alt={module.title}
                          width={500}
                          height={300}
                          className="w-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-[300px] bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 flex items-center justify-center">
                          {(() => {
                            const IconComponent = ICON_MAP[module.icon_svg as keyof typeof ICON_MAP];
                            return IconComponent ? (
                              <IconComponent className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <div className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content column */}
                  <div className={`md:col-span-3 order-1 ${index % 2 === 0 ? 'md:order-2 md:pl-8' : 'md:order-1 md:pr-8'}`}>
                    <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-full mb-4">
                      {(() => {
                        const IconComponent = ICON_MAP[module.icon_svg as keyof typeof ICON_MAP];
                        return IconComponent ? (
                          <IconComponent className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <div className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        );
                      })()}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">{module.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      {module.features[0] || 'Feature description'}
                    </p>
                    <div className="flex flex-wrap gap-3 mb-6">
                      {module.features.slice(1).map((feature, featureIndex) => (
                        <span key={featureIndex} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                    {module.learn_more_url ? (
                      <a 
                        href={module.learn_more_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                      >
                        Learn more about {module.title}
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    ) : (
                      <button className="group flex items-center text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors opacity-70 cursor-default">
                        Learn more about {module.title}
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
