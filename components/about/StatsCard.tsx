'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';
import FloatingCard from '../ui/FloatingCard';

interface StatItem {
  label: string;
  value: string;
}

interface StatsCardProps {
  title?: string;
  stats: StatItem[];
  position?: string;
  className?: string;
  showBorderTrail?: boolean;
  borderTrailColor?: string;
}

export default function StatsCard({
  title = 'Our Impact',
  stats,
  position,
  className,
  showBorderTrail = true,
  borderTrailColor = 'bg-emerald-500'
}: StatsCardProps) {
  return (
    <FloatingCard 
      title={title}
      icon={<SparklesIcon className="w-6 h-6 text-white" />}
      position={position}
      className={`w-72 ${className || ''}`}
      showBorderTrail={showBorderTrail}
      borderTrailColor={borderTrailColor}
    >
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
          <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stat.value}</div>
        </div>
      ))}
    </FloatingCard>
  );
}
