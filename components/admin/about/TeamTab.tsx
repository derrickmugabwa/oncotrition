'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  // Form states
  const [editName, setEditName] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editImageSrc, setEditImageSrc] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLinkedinUrl, setEditLinkedinUrl] = useState('');
  const [editTwitterUrl, setEditTwitterUrl] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  async function fetchTeamMembers() {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('display_order');
    
    if (error) {
      console.error('Error fetching team members:', error);
      return;
    }

    setTeamMembers(data || []);
    setIsLoading(false);
  }

  const startEditing = (member: TeamMember) => {
    setEditingId(member.id);
    setEditName(member.name);
    setEditPosition(member.position);
    setEditImageSrc(member.image_src);
    setEditBio(member.bio);
    setEditLinkedinUrl(member.linkedin_url || '');
    setEditTwitterUrl(member.twitter_url || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditPosition('');
    setEditImageSrc('');
    setEditBio('');
    setEditLinkedinUrl('');
    setEditTwitterUrl('');
  };

  const saveTeamMember = async (member: TeamMember) => {
    const { error } = await supabase
      .from('team_members')
      .update({
        name: editName,
        position: editPosition,
        image_src: editImageSrc,
        bio: editBio,
        linkedin_url: editLinkedinUrl || null,
        twitter_url: editTwitterUrl || null,
      })
      .eq('id', member.id);

    if (error) {
      console.error('Error updating team member:', error);
      return;
    }

    cancelEditing();
    fetchTeamMembers();
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

    fetchTeamMembers();
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

    fetchTeamMembers();
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

      setEditImageSrc(publicUrl);
      setUploadProgress(100);

      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadProgress(0);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Members</h2>
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
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <input
                    type="text"
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Image</label>
                  <div className="flex items-center gap-4">
                    {editImageSrc && (
                      <div className="relative w-32 h-32">
                        <Image
                          src={editImageSrc}
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
                      {uploadProgress > 0 && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={editLinkedinUrl}
                    onChange={(e) => setEditLinkedinUrl(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Twitter URL</label>
                  <input
                    type="text"
                    value={editTwitterUrl}
                    onChange={(e) => setEditTwitterUrl(e.target.value)}
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
