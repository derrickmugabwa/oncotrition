'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const supabase = createClient();

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
    return (
      <div className="py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground font-outfit">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-primary mb-4 font-outfit"
            >
              {content?.heading || 'Our Modules'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-base text-muted-foreground max-w-2xl mx-auto font-outfit"
            >
              {content?.description || 'Comprehensive solutions designed to transform your nutrition journey'}
            </motion.p>
          </div>

          {/* Modules with alternating layout */}
          <div className="space-y-20">
            {modules.map((module, index) => {
              const isImageRight = index % 2 === 0;
              const IconComponent = ICON_MAP[module.icon_svg as keyof typeof ICON_MAP];

              return (
                <motion.div 
                  key={module.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="w-full max-w-5xl mx-auto"
                >
                  {/* Desktop layout */}
                  <div className="hidden md:flex relative items-center">
                    {/* Image */}
                    <div className={cn(
                      "w-[470px] h-[400px] rounded-3xl overflow-hidden bg-gray-200 dark:bg-neutral-800 flex-shrink-0",
                      isImageRight ? "order-2" : "order-1"
                    )}>
                      {module.image_url ? (
                        <Image
                          src={module.image_url}
                          alt={module.title}
                          width={470}
                          height={400}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-100 to-emerald-200 dark:from-teal-900 dark:to-emerald-800 flex items-center justify-center">
                          {IconComponent && (
                            <IconComponent className="w-24 h-24 text-teal-600 dark:text-teal-400" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card */}
                    <div className={cn(
                      "bg-white dark:bg-card rounded-3xl shadow-2xl p-8 z-10 max-w-xl flex-1",
                      isImageRight ? "mr-[-80px] order-1" : "ml-[-80px] order-2"
                    )}>
                      <div className="mb-6">
                        <div className="inline-flex items-center justify-center p-3 bg-teal-100 dark:bg-teal-900/50 rounded-full mb-4">
                          {IconComponent && (
                            <IconComponent className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-outfit">
                          {module.title}
                        </h3>
                        <p className="text-base text-muted-foreground leading-relaxed mb-6 font-outfit">
                          {module.features[0] || 'Feature description'}
                        </p>
                      </div>

                      {module.features.length > 1 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {module.features.slice(1, 4).map((feature, featureIndex) => (
                            <span 
                              key={featureIndex} 
                              className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-sm font-outfit"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}

                      {module.learn_more_url && (
                        <a 
                          href={module.learn_more_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center text-teal-600 dark:text-teal-400 font-medium hover:text-teal-800 dark:hover:text-teal-300 transition-colors font-outfit"
                        >
                          Learn more
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Mobile layout */}
                  <div className="md:hidden max-w-sm mx-auto">
                    {/* Image */}
                    <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-3xl overflow-hidden mb-6">
                      {module.image_url ? (
                        <Image
                          src={module.image_url}
                          alt={module.title}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-100 to-emerald-200 dark:from-teal-900 dark:to-emerald-800 flex items-center justify-center">
                          {IconComponent && (
                            <IconComponent className="w-16 h-16 text-teal-600 dark:text-teal-400" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="px-4">
                      <div className="inline-flex items-center justify-center p-3 bg-teal-100 dark:bg-teal-900/50 rounded-full mb-4">
                        {IconComponent && (
                          <IconComponent className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 font-outfit">
                        {module.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 font-outfit">
                        {module.features[0] || 'Feature description'}
                      </p>
                      
                      {module.features.length > 1 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {module.features.slice(1, 3).map((feature, featureIndex) => (
                            <span 
                              key={featureIndex} 
                              className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-xs font-outfit"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}

                      {module.learn_more_url && (
                        <a 
                          href={module.learn_more_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center text-teal-600 dark:text-teal-400 font-medium hover:text-teal-800 dark:hover:text-teal-300 transition-colors text-sm font-outfit"
                        >
                          Learn more
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
