'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ListChecks } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface SurveyQuestion {
  id: string;
  question: string;
  order_index: number;
}

interface SurveyContent {
  id: string;
  title: string;
  description: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    x: -20
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function NutritionSurvey() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [content, setContent] = useState<SurveyContent>({
    id: '',
    title: 'Nutrition Assessment Questions',
    description: 'Key questions we\'ll explore during your nutrition consultation'
  });

  useEffect(() => {
    fetchContent();
    fetchQuestions();
  }, []);

  const fetchContent = async () => {
    try {
      const { data: surveyContent, error } = await supabase
        .from('nutrition_survey_content')
        .select('*')
        .single();

      if (error) throw error;

      if (surveyContent) {
        setContent(surveyContent);
      }
    } catch (error) {
      console.error('Error fetching survey content:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data: surveyQuestions, error } = await supabase
        .from('nutrition_survey')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;

      if (surveyQuestions) {
        setQuestions(surveyQuestions);
      }
    } catch (error) {
      console.error('Error fetching survey questions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="text-center mb-12">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 flex items-start gap-4">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              {content.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {content.description}
            </p>
          </motion.div>

          {/* Questions List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            {questions.map((q) => (
              <motion.div
                key={q.id}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-start gap-4 transform-gpu hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <ListChecks className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                </motion.div>
                <h3 className="text-xl text-gray-800 dark:text-white">
                  {q.question}
                </h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
