'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import {
  UserGroupIcon, AcademicCapIcon, BeakerIcon, BoltIcon,
  FireIcon, SparklesIcon, ShieldCheckIcon, HandThumbUpIcon,
  BookOpenIcon, BellAlertIcon, CalendarIcon, ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon, RocketLaunchIcon, TrophyIcon
} from '@heroicons/react/24/outline';

interface User {
  id: number;
  title: string;
  description: string;
  icon_name: string;
  sort_order: number;
}

interface HeaderContent {
  heading: string;
  paragraph: string;
}

interface UserCardProps {
  title: string;
  description: string;
  icon_name: string;
  index: number;
}

const userIcons = {
  userGroup: UserGroupIcon,
  academic: AcademicCapIcon,
  beaker: BeakerIcon,
  bolt: BoltIcon,
  fire: FireIcon,
  sparkles: SparklesIcon,
  shield: ShieldCheckIcon,
  thumbUp: HandThumbUpIcon,
  book: BookOpenIcon,
  bell: BellAlertIcon,
  calendar: CalendarIcon,
  chat: ChatBubbleLeftRightIcon,
  clipboard: ClipboardDocumentCheckIcon,
  rocket: RocketLaunchIcon,
  trophy: TrophyIcon
};

type IconName = keyof typeof userIcons;

const defaultUsers: any[] = [];

const defaultHeaderContent = {
  heading: "",
  paragraph: ""
};

function UserCard({ title, description, icon_name, index }: UserCardProps) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true });
  const IconComponent = userIcons[icon_name as IconName] || UserGroupIcon;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 backdrop-blur-sm border border-gray-100 dark:border-gray-700"
    >
      <div className="absolute top-6 right-6">
        <IconComponent className="w-6 h-6 text-emerald-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 pr-8">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </motion.div>
  );
}

export default function Users() {
  const supabase = createClient();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [headerContent, setHeaderContent] = useState<HeaderContent>(defaultHeaderContent);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch header content
        const { data: headerData, error: headerError } = await supabase
          .from('smartspoon_users_header')
          .select('*')
          .single();

        if (headerError) throw headerError;
        if (headerData) {
          setHeaderContent(headerData);
        }

        // Fetch users
        const { data: userData, error: userError } = await supabase
          .from('smartspoon_users')
          .select('*')
          .order('sort_order');

        if (userError) throw userError;
        if (userData) {
          setUsers(userData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const usersChannel = supabase
      .channel('smartspoon_users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'smartspoon_users'
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setUsers(current => current.filter(user => user.id !== payload.old.id));
          } else {
            fetchData();
          }
        }
      )
      .subscribe();

    const headerChannel = supabase
      .channel('smartspoon_users_header_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'smartspoon_users_header'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(headerChannel);
    };
  }, [supabase]);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-200/30 via-white/40 to-teal-200/30 dark:from-emerald-500/10 dark:via-gray-900/40 dark:to-teal-500/10 pointer-events-none"></div>
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full animate-drift"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-teal-500/20 to-transparent rounded-full animate-drift-reverse"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h2
            ref={containerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-6"
          >
            {headerContent.heading}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-300"
          >
            {headerContent.paragraph}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {users.map((user, index) => {
            const icon_name = (user.icon_name as IconName) in userIcons 
              ? (user.icon_name as IconName) 
              : 'userGroup';
            
            return (
              <UserCard
                key={user.id}
                title={user.title}
                description={user.description}
                icon_name={icon_name}
                index={index}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
