'use client';

import { motion } from 'framer-motion';
import { ClockIcon, FireIcon, HeartIcon } from '@heroicons/react/24/outline';
import { BorderTrail } from '../ui/border-trail';

interface MealItem {
  time: string;
  name: string;
  calories?: string;
}

interface MealPlanCardProps {
  position?: string;
  className?: string;
  title: string;
  subtitle?: string;
  meals: MealItem[];
  borderTrailColor?: string;
}

export default function MealPlanCard({
  position = 'absolute',
  className = '',
  title,
  subtitle,
  meals,
  borderTrailColor = 'bg-emerald-500'
}: MealPlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      viewport={{ once: true }}
      className={`${position} z-20 bg-white/95 dark:bg-gray-800/95 rounded-3xl shadow-xl
                backdrop-blur-sm border border-white/50 dark:border-gray-700/50 overflow-hidden
                w-full max-w-xs relative ${className}`}
    >
      <BorderTrail className={borderTrailColor} size={12} />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <FireIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h4>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          {meals.map((meal, index) => (
            <div key={index} className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-1.5 last:border-0 last:pb-0">
              <div className="flex-shrink-0 w-1 h-8 rounded-full bg-emerald-200 dark:bg-emerald-900/50"></div>
              <div className="flex items-center gap-1.5">
                <ClockIcon className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{meal.time}</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{meal.name}</p>
              </div>
              {meal.calories && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{meal.calories}</span>
                  <span className="text-[10px]">cal</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
