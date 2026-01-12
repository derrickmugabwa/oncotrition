'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BeakerIcon, ChartBarIcon, ClockIcon, CogIcon, 
  CurrencyDollarIcon, DocumentTextIcon, HeartIcon, 
  LightBulbIcon, ScaleIcon, SparklesIcon, UserGroupIcon,
  ShieldCheckIcon, StarIcon, TrophyIcon, FireIcon,
  BoltIcon, GlobeAltIcon, PresentationChartLineIcon,
  AcademicCapIcon, HandThumbUpIcon, CakeIcon,
  BookOpenIcon, BellAlertIcon, CalendarIcon,
  ChatBubbleLeftRightIcon, ClipboardDocumentCheckIcon,
  RocketLaunchIcon, UserIcon, DocumentCheckIcon,
  DocumentChartBarIcon, DocumentMagnifyingGlassIcon,
  CloudArrowUpIcon, ArrowPathIcon, LinkIcon,
  MagnifyingGlassIcon, MapPinIcon, PhoneIcon,
  ServerIcon, Square3Stack3DIcon, SunIcon,
  TableCellsIcon, TagIcon, UserPlusIcon,
  UsersIcon, VideoCameraIcon, WrenchScrewdriverIcon,
  XCircleIcon, CheckCircleIcon, ExclamationCircleIcon,
  InformationCircleIcon, QuestionMarkCircleIcon,
  ArrowPathRoundedSquareIcon, Bars3BottomLeftIcon,
  Bars3CenterLeftIcon, BarsArrowUpIcon, BuildingLibraryIcon,
  ChartPieIcon, CircleStackIcon, ClipboardIcon,
  CloudIcon, CubeIcon, CubeTransparentIcon,
  FingerPrintIcon, ArrowTrendingUpIcon, BuildingOfficeIcon,
  CalculatorIcon, ComputerDesktopIcon, DevicePhoneMobileIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon_name: string;
  order: number;
}

interface HeaderContent {
  heading: string;
  paragraph: string;
  button_text: string;
  button_url: string;
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon_name: string;
  index: number;
}

const featureIcons = {
  beaker: BeakerIcon,
  chart: ChartBarIcon,
  clock: ClockIcon,
  cog: CogIcon,
  dollar: CurrencyDollarIcon,
  document: DocumentTextIcon,
  heart: HeartIcon,
  bulb: LightBulbIcon,
  scale: ScaleIcon,
  sparkles: SparklesIcon,
  users: UserGroupIcon,
  shield: ShieldCheckIcon,
  star: StarIcon,
  trophy: TrophyIcon,
  fire: FireIcon,
  bolt: BoltIcon,
  globe: GlobeAltIcon,
  presentation: PresentationChartLineIcon,
  academic: AcademicCapIcon,
  thumbUp: HandThumbUpIcon,
  cake: CakeIcon,
  book: BookOpenIcon,
  bell: BellAlertIcon,
  calendar: CalendarIcon,
  chat: ChatBubbleLeftRightIcon,
  clipboard: ClipboardDocumentCheckIcon,
  rocket: RocketLaunchIcon,
  user: UserIcon,
  supplements: BeakerIcon,  // Reusing BeakerIcon
  cardio: HeartIcon,  // Reusing HeartIcon
  metabolism: FireIcon,  // Reusing FireIcon
  bodyComp: ScaleIcon,  // Reusing ScaleIcon
  mealTime: ClockIcon,  // Reusing ClockIcon
  immune: ShieldCheckIcon,  // Reusing ShieldCheckIcon
  performance: BoltIcon,  // Reusing BoltIcon
  wellness: SparklesIcon,  // Reusing SparklesIcon
  healthyChoice: HandThumbUpIcon,  // Reusing HandThumbUpIcon
  personalHealth: UserIcon,  // Reusing UserIcon
  healthRecords: DocumentCheckIcon,
  healthAnalytics: DocumentChartBarIcon,
  healthInsights: DocumentMagnifyingGlassIcon,
  sync: CloudArrowUpIcon,
  update: ArrowPathIcon,
  connect: LinkIcon,
  search: MagnifyingGlassIcon,
  location: MapPinIcon,
  phone: PhoneIcon,
  server: ServerIcon,
  features: Square3Stack3DIcon,
  lifestyle: SunIcon,
  mealPlan: TableCellsIcon,
  foodLabel: TagIcon,
  groupSupport: UserGroupIcon,  // Reusing UserGroupIcon
  addMember: UserPlusIcon,
  community: UsersIcon,
  video: VideoCameraIcon,
  tools: WrenchScrewdriverIcon,
  allergies: XCircleIcon,
  approved: CheckCircleIcon,
  warning: ExclamationCircleIcon,
  info: InformationCircleIcon,
  help: QuestionMarkCircleIcon,
  foodCycle: ArrowPathRoundedSquareIcon,
  menu: Bars3BottomLeftIcon,
  categories: Bars3CenterLeftIcon,
  progressUp: BarsArrowUpIcon,
  library: BuildingLibraryIcon,
  nutrition: ChartPieIcon,
  database: CircleStackIcon,
  foodLog: ClipboardIcon,
  cloud: CloudIcon,
  portions: CubeIcon,
  macros: CubeTransparentIcon,
  fingerprint: FingerPrintIcon,
  trend: ArrowTrendingUpIcon,
  building: BuildingOfficeIcon,
  calculator: CalculatorIcon,
  desktop: ComputerDesktopIcon,
  mobile: DevicePhoneMobileIcon,
  flag: FlagIcon
} as const;

type IconName = keyof typeof featureIcons;

const defaultFeatures: Feature[] = [];

const defaultHeaderContent = {
  heading: "",
  paragraph: "",
  button_text: "",
  button_url: "/features"
};

const FeatureCard = ({ title, description, icon_name, index }: FeatureCardProps) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true });
  const IconComponent = featureIcons[icon_name as keyof typeof featureIcons] || featureIcons.scale;

  return (
    <motion.div 
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        y: -8,
        transition: { type: "spring", stiffness: 400, damping: 17 }
      }}
      viewport={{ once: true }}
    >
      <Card 
        className="group relative h-full rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 dark:from-teal-950/30 dark:via-emerald-950/30 dark:to-cyan-950/30 dark:border-teal-800 p-5 transition-all duration-300 hover:shadow-xl hover:border-teal-400 dark:hover:border-teal-600 overflow-hidden"
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/3 via-transparent to-emerald-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
        
        <div className="relative z-10">
          {/* Icon Section */}
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <div className="w-16 h-16 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
              <IconComponent className="w-8 h-8" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
            className="text-2xl font-bold text-card-foreground mb-2 group-hover:text-teal-600 transition-colors"
          >
            {title}
          </motion.h3>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
            className="text-muted-foreground leading-relaxed text-sm"
          >
            {description}
          </motion.p>

        </div>
      </Card>
    </motion.div>
  );
};

export default function Features() {
  const [features, setFeatures] = useState<Feature[]>(defaultFeatures);
  const [headerContent, setHeaderContent] = useState<HeaderContent>(defaultHeaderContent);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch features
      const { data: featuresData, error: featuresError } = await supabase
        .from('features')
        .select('*')
        .order('order');

      if (featuresError) {
        console.error('Error fetching features:', featuresError);
      } else if (featuresData && featuresData.length > 0) {
        setFeatures(featuresData);
      }

      // Fetch header content
      const { data: headerData, error: headerError } = await supabase
        .from('features_header')
        .select('*')
        .single();

      if (headerError) {
        console.error('Error fetching header content:', headerError);
      } else if (headerData) {
        setHeaderContent(headerData);
      }
    };

    fetchData();

    // Subscribe to changes
    const featuresChannel = supabase
      .channel('features_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'features'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const headerChannel = supabase
      .channel('header_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'features_header'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(featuresChannel);
      supabase.removeChannel(headerChannel);
    };
  }, [supabase]);

  return (
    <section className="relative py-20 overflow-hidden bg-background">
      {/* Subtle animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full animate-drift"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/10 to-transparent rounded-full animate-drift-reverse"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header content - full width */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl font-bold text-primary mb-6"
          >
            {headerContent.heading}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base text-muted-foreground mb-8 w-full px-4 sm:px-6 lg:px-8"
          >
            {headerContent.paragraph}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* <a
              href={headerContent.button_url}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-colors duration-200 backdrop-blur-sm"
            >
              {headerContent.button_text}
              <svg
                className="ml-2 -mr-1 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a> */}
          </motion.div>
        </motion.div>

        {/* Feature cards - horizontal layout */}
        <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            // Validate icon_name is a valid icon
            const icon_name = (feature.icon_name as IconName) in featureIcons 
              ? (feature.icon_name as IconName) 
              : 'scale';
            
            return (
              <div key={feature.id} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex justify-center">
                <FeatureCard
                  title={feature.title}
                  description={feature.description}
                  icon_name={icon_name}
                  index={index}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
