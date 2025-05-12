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

interface SurveyImage {
  id?: string;
  image_url?: string;
}

export default function NutritionSurvey() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [surveyImage, setSurveyImage] = useState<SurveyImage>({
    image_url: '/images/nutrition-survey-default.jpg'
  });
  const [content, setContent] = useState<SurveyContent>({
    id: '',
    title: 'Nutrition Assessment Questions',
    description: 'Key questions we\'ll explore during your nutrition consultation'
  });

  useEffect(() => {
    fetchContent();
    fetchQuestions();
    fetchSurveyImage();
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

  const fetchSurveyImage = async () => {
    try {
      const { data: imageData, error } = await supabase
        .from('nutrition_survey_image')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
        throw error;
      }

      if (imageData) {
        setSurveyImage(imageData);
      }
    } catch (error) {
      console.error('Error fetching survey image:', error);
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

  // Split questions into left and right columns
  const leftQuestions = questions.filter((_, idx) => idx % 2 === 0);
  const rightQuestions = questions.filter((_, idx) => idx % 2 === 1);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              {content.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {content.description}
            </p>
          </motion.div>

          {/* Questions with Center Image Layout */}
          <div className="relative min-h-[800px] flex justify-center items-center">
            {/* Center Image */}
            <div className="z-10 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <img 
                  src={surveyImage.image_url} 
                  alt="Nutrition Survey" 
                  className="w-72 h-72 md:w-96 md:h-96 object-cover rounded-full border-4 border-white dark:border-gray-700 shadow-xl"
                />
                <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-opacity-50 animate-pulse"></div>
              </motion.div>
            </div>

            {/* Left Side Questions */}
            <div className="absolute left-0 top-0 bottom-0 w-1/3 flex flex-col justify-around pointer-events-none">
              {leftQuestions.map((q, index) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    y: [0, -5, 0, 5, 0], // Subtle floating animation
                  }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.1 * index,
                    y: {
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }
                  }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-3 flex items-center gap-2 transform-gpu hover:shadow-lg transition-all duration-300 pointer-events-auto w-[250px] ml-5 whitespace-nowrap overflow-hidden"
                >
                  <motion.div
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListChecks className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  </motion.div>
                  <h3 className="text-xs md:text-sm text-gray-800 dark:text-white truncate">
                    {q.question}
                  </h3>
                </motion.div>
              ))}
            </div>

            {/* Right Side Questions */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 flex flex-col justify-around pointer-events-none">
              {rightQuestions.map((q, index) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    y: [0, 5, 0, -5, 0], // Subtle floating animation (opposite phase)
                  }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.1 * index + 0.2,
                    y: {
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }
                  }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-3 flex items-center gap-2 transform-gpu hover:shadow-lg transition-all duration-300 pointer-events-auto w-[250px] mr-5 ml-auto whitespace-nowrap overflow-hidden"
                >
                  <motion.div
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListChecks className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  </motion.div>
                  <h3 className="text-xs md:text-sm text-gray-800 dark:text-white truncate">
                    {q.question}
                  </h3>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
