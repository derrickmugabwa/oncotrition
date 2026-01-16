'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order_index: number;
}

interface FAQContent {
  id: string;
  title: string;
  description: string;
}

export default function NutritionSurvey() {
  const supabase = createClient();
  const spiralRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [query, setQuery] = useState('');
  const [content, setContent] = useState<FAQContent>({
    id: '',
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about our nutrition services'
  });

  // Spiral configuration
  const cfg = useMemo(() => ({
    points: 700,
    dotRadius: 1.8,
    duration: 3.0,
    color: '#14b8a6', // teal-500
    pulseEffect: true,
    opacityMin: 0.25,
    opacityMax: 0.9,
    sizeMin: 0.5,
    sizeMax: 1.4,
  }), []);

  useEffect(() => {
    fetchContent();
    fetchFAQs();
  }, []);

  // Generate spiral SVG
  useEffect(() => {
    if (!spiralRef.current) return;

    const SIZE = 560;
    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
    const N = cfg.points;
    const DOT = cfg.dotRadius;
    const CENTER = SIZE / 2;
    const PADDING = 4;
    const MAX_R = CENTER - PADDING - DOT;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', String(SIZE));
    svg.setAttribute('height', String(SIZE));
    svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);

    for (let i = 0; i < N; i++) {
      const idx = i + 0.5;
      const frac = idx / N;
      const r = Math.sqrt(frac) * MAX_R;
      const theta = idx * GOLDEN_ANGLE;
      const x = CENTER + r * Math.cos(theta);
      const y = CENTER + r * Math.sin(theta);

      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', x.toFixed(3));
      c.setAttribute('cy', y.toFixed(3));
      c.setAttribute('r', String(DOT));
      c.setAttribute('fill', cfg.color);
      c.setAttribute('opacity', '0.6');

      if (cfg.pulseEffect) {
        const animR = document.createElementNS(svgNS, 'animate');
        animR.setAttribute('attributeName', 'r');
        animR.setAttribute('values', `${DOT * cfg.sizeMin};${DOT * cfg.sizeMax};${DOT * cfg.sizeMin}`);
        animR.setAttribute('dur', `${cfg.duration}s`);
        animR.setAttribute('begin', `${(frac * cfg.duration).toFixed(3)}s`);
        animR.setAttribute('repeatCount', 'indefinite');
        animR.setAttribute('calcMode', 'spline');
        animR.setAttribute('keySplines', '0.4 0 0.6 1;0.4 0 0.6 1');
        c.appendChild(animR);

        const animO = document.createElementNS(svgNS, 'animate');
        animO.setAttribute('attributeName', 'opacity');
        animO.setAttribute('values', `${cfg.opacityMin};${cfg.opacityMax};${cfg.opacityMin}`);
        animO.setAttribute('dur', `${cfg.duration}s`);
        animO.setAttribute('begin', `${(frac * cfg.duration).toFixed(3)}s`);
        animO.setAttribute('repeatCount', 'indefinite');
        animO.setAttribute('calcMode', 'spline');
        animO.setAttribute('keySplines', '0.4 0 0.6 1;0.4 0 0.6 1');
        c.appendChild(animO);
      }

      svg.appendChild(c);
    }

    spiralRef.current.innerHTML = '';
    spiralRef.current.appendChild(svg);
  }, [cfg]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('nutrition_survey_content')
        .select('*')
        .single();

      if (error) throw error;
      if (data) setContent(data);
    } catch (error) {
      console.error('Error fetching FAQ content:', error);
    }
  };

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('nutrition_survey')
        .select('id, question, answer, order_index')
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      if (data) {
        // Map the data to include answer field (will be empty if not in DB yet)
        const faqData = data.map(item => ({
          ...item,
          answer: item.answer || '' // Fallback to empty string if no answer
        }));
        setFaqs(faqData);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter FAQs based on search query
  const filtered = query
    ? faqs.filter(({ question, answer }) => 
        (question + answer).toLowerCase().includes(query.toLowerCase())
      )
    : faqs;

  if (loading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-gray-900">
        <div className="relative mx-auto max-w-5xl px-6 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Background Spiral */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20 dark:opacity-30"
        style={{ 
          maskImage: 'radial-gradient(circle at center, rgba(255,255,255,1), rgba(255,255,255,0.1) 60%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle at center, rgba(255,255,255,1), rgba(255,255,255,0.1) 60%, transparent 75%)'
        }}
      >
        <div ref={spiralRef} />
      </div>

      {/* Layout */}
      <div className="relative mx-auto max-w-5xl px-6 py-16">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col md:flex-row items-start md:items-end justify-between border-b border-gray-200 dark:border-gray-700 pb-6 gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight font-outfit">
              {content.title}
            </h1>
            <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400 font-outfit">
              {content.description}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              className="h-10 w-full md:w-56 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm outline-none transition focus:border-teal-500 dark:focus:border-teal-400 font-outfit"
            />
          </div>
        </motion.header>

        {/* Content */}
        <section className="relative">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filtered.map((item, i) => (
              <FAQItemComponent key={item.id} question={item.question} answer={item.answer} index={i + 1} />
            ))}
          </div>
          
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 font-outfit">No questions found matching your search.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// FAQ Item Component
function FAQItemComponent({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index - 1) * 0.1 }}
      className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm p-5 transition hover:border-teal-400 dark:hover:border-teal-500"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <div className="flex items-baseline gap-3">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-outfit">
            {String(index).padStart(2, '0')}
          </span>
          <h3 className="text-sm md:text-base font-semibold leading-tight font-outfit">
            {question}
          </h3>
        </div>
        <span className="ml-4 text-gray-600 dark:text-gray-400 transition group-hover:text-teal-600 dark:group-hover:text-teal-400 font-outfit">
          {open ? '–' : '+'}
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          open ? 'mt-3 grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          {answer ? (
            <p className="text-sm text-gray-600 dark:text-gray-300 font-outfit">{answer}</p>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic font-outfit">
              Answer coming soon...
            </p>
          )}
        </div>
      </div>
      {/* Hover halo */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute -inset-1 rounded-2xl border border-teal-200 dark:border-teal-800" />
      </div>
    </motion.div>
  );
}
