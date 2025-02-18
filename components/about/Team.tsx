'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  image_src: string;
  bio: string;
  linkedin_url?: string;
  twitter_url?: string;
  display_order: number;
}

interface TeamMemberProps extends Omit<TeamMember, 'id' | 'display_order'> {
  delay: number;
}

const TeamMember = ({ name, position, image_src, bio, linkedin_url, twitter_url, delay }: TeamMemberProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="group relative"
  >
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative z-10"
      >
        <div className="relative mb-6 mx-auto w-48 h-48 overflow-hidden rounded-xl">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Image
              src={image_src}
              alt={name}
              width={200}
              height={200}
              className="object-cover w-full h-full"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <motion.div
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">{name}</h3>
          <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">{position}</p>
          <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">{bio}</p>
        </motion.div>

        <div className="flex justify-center space-x-4">
          {linkedin_url && (
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              href={linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </motion.a>
          )}
          {twitter_url && (
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              href={twitter_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </motion.a>
          )}
        </div>
      </motion.div>

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-600/10 to-indigo-600/10 rounded-full translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  </motion.div>
);

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionContent, setSectionContent] = useState({
    heading: 'Meet Our Team',
    description: 'Dedicated experts committed to transforming your nutrition journey'
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch team members
        const { data: membersData, error: membersError } = await supabase
          .from('team_members')
          .select('*')
          .order('display_order');
        
        if (membersError) throw membersError;
        setTeamMembers(membersData || []);

        // Fetch section content
        const { data: sectionData, error: sectionError } = await supabase
          .from('page_sections')
          .select('*')
          .eq('section_id', 'team')
          .single();

        if (!sectionError && sectionData) {
          setSectionContent({
            heading: sectionData.heading,
            description: sectionData.description
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-950 dark:to-blue-950/30"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {sectionContent.heading}
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
            {sectionContent.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {teamMembers.map((member, index) => (
            <TeamMember 
              key={member.id}
              name={member.name}
              position={member.position}
              image_src={member.image_src}
              bio={member.bio}
              linkedin_url={member.linkedin_url}
              twitter_url={member.twitter_url}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
