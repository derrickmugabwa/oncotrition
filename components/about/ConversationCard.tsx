'use client';

import { motion } from 'framer-motion';
import { UserCircleIcon, UserIcon } from '@heroicons/react/24/outline';
import { BorderTrail } from '../ui/border-trail';

interface Message {
  sender: 'mentor' | 'mentee';
  text: string;
}

interface ConversationCardProps {
  position?: string;
  className?: string;
  messages: Message[];
}

export default function ConversationCard({
  position = 'absolute',
  className = '',
  messages
}: ConversationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      viewport={{ once: true }}
      className={`${position} z-20 bg-white/95 dark:bg-gray-800/95 rounded-3xl shadow-xl
                backdrop-blur-sm border border-white/50 dark:border-gray-700/50 overflow-hidden
                w-full max-w-2xl relative ${className}`}
    >
      <BorderTrail className="bg-blue-500" size={12} />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-emerald-500 flex items-center justify-center">
            <UserCircleIcon className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Nutrition Mentorship</h4>
        </div>
        
        <div className="flex flex-row gap-3 items-start">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex-1 ${message.sender === 'mentee' ? 'mt-6' : ''}`}
            >
              <div 
                className={`p-2 rounded-xl ${message.sender === 'mentor' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500' 
                  : 'bg-emerald-100 dark:bg-emerald-900/30 border-l-4 border-emerald-500'}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  {message.sender === 'mentor' ? (
                    <>
                      <UserCircleIcon className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Mentor</span>
                    </>
                  ) : (
                    <>
                      <UserIcon className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Mentee</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-200">{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
