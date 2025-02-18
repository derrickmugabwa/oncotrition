'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';

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

export default function TeamTab() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<TeamMember>>({});
  const [sectionContent, setSectionContent] = useState({
    heading: 'Meet Our Team',
    description: 'Dedicated experts committed to transforming your nutrition journey'
  });
  const [isEditingSection, setIsEditingSection] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
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
      console.error('Error:', error);
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionEdit = () => {
    setIsEditingSection(true);
  };

  const handleSectionSave = async () => {
    try {
      const { error } = await supabase
        .from('page_sections')
        .upsert({
          section_id: 'team',
          heading: sectionContent.heading,
          description: sectionContent.description,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'section_id'
        });

      if (error) throw error;
      setIsEditingSection(false);
      toast.success('Section content updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update section content');
    }
  };

  const startEditing = (member: TeamMember) => {
    setEditingId(member.id);
    setEditForm({
      name: member.name,
      position: member.position,
      image_src: member.image_src,
      bio: member.bio,
      linkedin_url: member.linkedin_url || '',
      twitter_url: member.twitter_url || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveTeamMember = async (member: TeamMember) => {
    const { error } = await supabase
      .from('team_members')
      .update({
        name: editForm.name,
        position: editForm.position,
        image_src: editForm.image_src,
        bio: editForm.bio,
        linkedin_url: editForm.linkedin_url || null,
        twitter_url: editForm.twitter_url || null,
      })
      .eq('id', member.id);

    if (error) {
      console.error('Error updating team member:', error);
      return;
    }

    cancelEditing();
    fetchData();
  };

  const addNewTeamMember = async () => {
    const maxOrder = Math.max(...teamMembers.map(m => m.display_order), 0);
    const { error } = await supabase
      .from('team_members')
      .insert({
        name: 'New Team Member',
        position: 'Position',
        image_src: '/placeholder.svg?height=200&width=200&text=New',
        bio: 'Team member bio goes here.',
        display_order: maxOrder + 1,
      });

    if (error) {
      console.error('Error adding team member:', error);
      return;
    }

    fetchData();
  };

  const deleteTeamMember = async (id: number) => {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting team member:', error);
      return;
    }

    fetchData();
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `team-members/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      setEditForm({ ...editForm, image_src: publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      {/* Section Content */}
      <div className="border-b dark:border-gray-700 pb-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Section Content
          </h3>
          {!isEditingSection ? (
            <button
              onClick={handleSectionEdit}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Edit Content
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingSection(false)}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSectionSave}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {isEditingSection ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heading
              </label>
              <input
                type="text"
                value={sectionContent.heading}
                onChange={(e) => setSectionContent({ ...sectionContent, heading: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="Enter section heading"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={sectionContent.description}
                onChange={(e) => setSectionContent({ ...sectionContent, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
                placeholder="Enter section description"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">Heading:</span> {sectionContent.heading}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">Description:</span> {sectionContent.description}
            </p>
          </div>
        )}
      </div>

      {/* Team Members Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{sectionContent.heading}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {sectionContent.description}
          </p>
        </div>
        <button
          onClick={addNewTeamMember}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Team Member
        </button>
      </div>

      <div className="space-y-6">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            {editingId === member.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <input
                    type="text"
                    value={editForm.position}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Image</label>
                  <div className="flex items-center gap-4">
                    {editForm.image_src && (
                      <div className="relative w-32 h-32">
                        <Image
                          src={editForm.image_src}
                          alt="Preview"
                          width={128}
                          height={128}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                      >
                        <PhotoIcon className="w-5 h-5 mr-2" />
                        Upload Image
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={editForm.linkedin_url}
                    onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Twitter URL</label>
                  <input
                    type="text"
                    value={editForm.twitter_url}
                    onChange={(e) => setEditForm({ ...editForm, twitter_url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveTeamMember(member)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-6">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <Image
                    src={member.image_src}
                    alt={member.name}
                    width={128}
                    height={128}
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{member.name}</h3>
                      <p className="text-blue-600 dark:text-blue-400">{member.position}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(member)}
                        className="p-2 text-blue-600 hover:text-blue-700"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteTeamMember(member.id)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{member.bio}</p>
                  <div className="mt-3 flex gap-4">
                    {member.linkedin_url && (
                      <a
                        href={member.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-600"
                      >
                        LinkedIn
                      </a>
                    )}
                    {member.twitter_url && (
                      <a
                        href={member.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-600"
                      >
                        Twitter
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
