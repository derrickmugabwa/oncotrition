import { createClient } from '@supabase/supabase-js';
import Hero from '@/components/about/Hero';
import Mission from '@/components/about/Mission';
import Values from '@/components/about/Values';
import Team from '@/components/about/Team';
import Modules from '@/components/about/Modules';
import WhyChooseUs from '@/components/about/WhyChooseUs';
import { Database } from '@/types/supabase';
import AboutClientWrapper from './AboutClientWrapper';
import AboutAnimatedSection from './AboutAnimatedSection';

type ComponentSetting = Database['public']['Tables']['about_components']['Row'];

const componentMap = {
  Hero,
  Mission,
  Values,
  Team,
  Modules,
  WhyChooseUs,
};

type ComponentKey = keyof typeof componentMap;

export default async function About() {
  // Use public client for about components (no auth required)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Fetch components server-side
  const { data: components, error } = await supabase
    .from('about_components')
    .select('*')
    .eq('is_visible', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching components:', error);
    // Return default components if database fails
    return (
      <div className="relative font-poppins" style={{ zIndex: 0 }}>
        <AboutAnimatedSection 
          delay={0}
          className="relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(99,102,241,0.1),transparent_50%)]"></div>
          <Hero />
        </AboutAnimatedSection>
        <AboutAnimatedSection 
          delay={0.2}
          className="relative bg-white dark:bg-gray-900"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/50 dark:to-blue-950/30"></div>
          <Mission />
        </AboutAnimatedSection>
        <AboutAnimatedSection 
          delay={0.4}
          className="relative bg-gray-50 dark:bg-gray-950"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/50 dark:to-blue-950/30"></div>
          <WhyChooseUs />
        </AboutAnimatedSection>
        <AboutAnimatedSection 
          delay={0.6}
          className="relative bg-white dark:bg-gray-900"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/50 dark:to-blue-950/30"></div>
          <Values />
        </AboutAnimatedSection>
        <AboutAnimatedSection 
          delay={0.8}
          className="relative bg-white dark:bg-gray-900"
        >
          <Modules />
        </AboutAnimatedSection>
        <AboutAnimatedSection 
          delay={1.0}
          className="relative bg-white dark:bg-gray-900"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/50 dark:to-blue-950/30"></div>
          <Team />
        </AboutAnimatedSection>
      </div>
    );
  }

  const visibleComponents = components || [];

  const renderComponent = (component: ComponentSetting, index: number) => {
    const Component = componentMap[component.component_key as ComponentKey];
    if (!Component) return null;

    const baseClasses = {
      Hero: "relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900",
      Mission: "relative bg-white dark:bg-gray-900",
      WhyChooseUs: "relative bg-gray-50 dark:bg-gray-950",
      Values: "relative bg-white dark:bg-gray-900",
      Modules: "relative bg-white dark:bg-gray-900",
      Team: "relative bg-white dark:bg-gray-900"
    };

    return (
      <AboutAnimatedSection 
        key={component.id} 
        delay={0.2 * index}
        className={baseClasses[component.component_key as keyof typeof baseClasses]}
      >
        {component.component_key === 'Hero' ? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(99,102,241,0.1),transparent_50%)]"></div>
            <Component />
          </>
        ) : component.component_key === 'Modules' ? (
          <Component />
        ) : (
          <>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/50 dark:to-blue-950/30"></div>
            <Component />
          </>
        )}
      </AboutAnimatedSection>
    );
  };

  return (
    <div className="relative font-poppins" style={{ zIndex: 0 }}>
      {visibleComponents.map((component, index) => renderComponent(component, index))}
      <AboutClientWrapper initialComponents={visibleComponents} />
    </div>
  );
}
