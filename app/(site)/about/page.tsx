'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Hero from '@/components/about/Hero';
import Mission from '@/components/about/Mission';
import Values from '@/components/about/Values';
import Team from '@/components/about/Team';
import Modules from '@/components/about/Modules';
import WhyChooseUs from '@/components/about/WhyChooseUs';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

interface ComponentSetting {
  id: string;
  component_key: string;
  is_visible: boolean;
  display_order: number;
}

const componentMap = {
  Hero,
  Mission,
  Values,
  Team,
  Modules,
  WhyChooseUs,
};

const AnimatedSection = ({ children, className = "", delay = 0 }: AnimatedSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ 
        duration: 0.8,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function About() {
  const [components, setComponents] = useState<ComponentSetting[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchComponents = async () => {
      const { data, error } = await supabase
        .from('about_components')
        .select('*')
        .order('display_order');
      
      if (error) {
        console.error('Error fetching components:', error);
        return;
      }
      
      setComponents(data || []);
    };

    fetchComponents();
  }, []);

  const renderComponent = (component: ComponentSetting, index: number) => {
    if (!component.is_visible) return null;

    const Component = componentMap[component.component_key as keyof typeof componentMap];
    if (!Component) return null;

    const baseClasses = {
      Hero: "relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900",
      Mission: "relative bg-white dark:bg-gray-900",
      WhyChooseUs: "relative bg-gray-50 dark:bg-gray-950",
      Values: "relative bg-white dark:bg-gray-900",
      Modules: "relative bg-gray-50 dark:bg-gray-950",
      Team: "relative bg-white dark:bg-gray-900"
    };

    return (
      <AnimatedSection 
        key={component.id} 
        delay={0.2 * index}
        className={baseClasses[component.component_key as keyof typeof baseClasses]}
      >
        {component.component_key === 'Hero' ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(99,102,241,0.1),transparent_50%)]"></div>
            <Component />
          </motion.div>
        ) : (
          <>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/50 dark:to-blue-950/30"></div>
            <Component />
          </>
        )}
      </AnimatedSection>
    );
  };

  return (
    <div className="relative">
      {components.map((component, index) => renderComponent(component, index))}
    </div>
  );
}
