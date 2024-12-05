'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaEdit, FaTrash, FaPlus, FaGripVertical } from 'react-icons/fa';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import toast from 'react-hot-toast';
import * as Icons from 'react-icons/fa';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon_name: string;
  gradient: string;
  display_order: number;
}

const AVAILABLE_ICONS = [
  { name: 'FaUserGraduate', label: 'Graduate' },
  { name: 'FaChalkboardTeacher', label: 'Teacher' },
  { name: 'FaHandshake', label: 'Handshake' },
  { name: 'FaChartLine', label: 'Chart' },
  { name: 'FaCalendarCheck', label: 'Calendar' },
  { name: 'FaUsers', label: 'Users' }
];

const AVAILABLE_GRADIENTS = [
  { value: 'from-blue-500 to-cyan-500', label: 'Blue to Cyan' },
  { value: 'from-purple-500 to-pink-500', label: 'Purple to Pink' },
  { value: 'from-green-500 to-teal-500', label: 'Green to Teal' },
  { value: 'from-orange-500 to-yellow-500', label: 'Orange to Yellow' },
  { value: 'from-red-500 to-pink-500', label: 'Red to Pink' },
  { value: 'from-indigo-500 to-purple-500', label: 'Indigo to Purple' }
];

function FeatureCard({ feature, onUpdate, onDelete }: { 
  feature: Feature; 
  onUpdate: (id: number, updates: Partial<Feature>) => void;
  onDelete: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFeature, setEditedFeature] = useState(feature);
  const IconComponent = Icons[feature.icon_name as keyof typeof Icons];

  const handleSave = () => {
    onUpdate(feature.id, editedFeature);
    setIsEditing(false);
  };

  return (
    <Reorder.Item
      value={feature}
      id={feature.id.toString()}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`bg-gradient-to-r ${feature.gradient} w-12 h-12 rounded-lg flex items-center justify-center`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <FaGripVertical className="text-gray-400 cursor-grab active:cursor-grabbing" />
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(feature.id)}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {isEditing ? (
            <>
              <input
                type="text"
                value={editedFeature.title}
                onChange={(e) => setEditedFeature({ ...editedFeature, title: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 h-9"
                placeholder="Feature title"
              />
              <textarea
                value={editedFeature.description}
                onChange={(e) => setEditedFeature({ ...editedFeature, description: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                rows={2}
                placeholder="Feature description"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={editedFeature.icon_name}
                  onChange={(e) => setEditedFeature({ ...editedFeature, icon_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                >
                  {AVAILABLE_ICONS.map((icon) => (
                    <option key={icon.name} value={icon.name}>
                      {icon.label}
                    </option>
                  ))}
                </select>
                <select
                  value={editedFeature.gradient}
                  onChange={(e) => setEditedFeature({ ...editedFeature, gradient: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                >
                  {AVAILABLE_GRADIENTS.map((gradient) => (
                    <option key={gradient.value} value={gradient.value}>
                      {gradient.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </>
          )}
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function MentorshipFeaturesTab() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('mentorship_features')
        .select('*')
        .order('display_order');

      if (error) throw error;

      if (data) {
        setFeatures(data);
      }
    } catch (error: any) {
      console.error('Error fetching features:', error);
      toast.error(error.message || 'Failed to load features');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = async () => {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!session) {
        throw new Error('Not authenticated');
      }

      const newOrder = features.length > 0 ? Math.max(...features.map(f => f.display_order)) + 1 : 0;
      const newFeature = {
        title: 'New Feature',
        description: 'Description of the new feature',
        icon_name: 'FaUsers',
        gradient: 'from-blue-500 to-cyan-500',
        display_order: newOrder,
      };

      const { data, error } = await supabase
        .from('mentorship_features')
        .insert([newFeature])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setFeatures(prevFeatures => [...prevFeatures, data]);
        toast.success('Feature added successfully');
      }
    } catch (error: any) {
      console.error('Error adding feature:', error);
      toast.error(error.message || 'Failed to add feature');
    }
  };

  const handleDeleteFeature = async (id: number) => {
    try {
      // Get session
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!session) {
        throw new Error('Not authenticated - no session found');
      }

      // Attempt delete
      const { error: deleteError } = await supabase
        .from('mentorship_features')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw new Error(`Failed to delete feature: ${deleteError.message}`);
      }

      // Update UI after successful database operation
      setFeatures(prevFeatures => prevFeatures.filter(f => f.id !== id));
      toast.success('Feature deleted successfully');
    } catch (error: any) {
      console.error('Delete operation failed:', error);
      toast.error(error.message || 'Failed to delete feature');
      
      // Refresh the features list to ensure UI is in sync with database
      await fetchFeatures();
    }
  };

  const handleUpdateFeature = async (id: number, updates: Partial<Feature>) => {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('mentorship_features')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchFeatures();
      toast.success('Feature updated successfully');
    } catch (error: any) {
      console.error('Error updating feature:', error);
      toast.error(error.message || 'Failed to update feature');
    }
  };

  const handleReorder = async (reorderedFeatures: Feature[]) => {
    try {
      const updates = reorderedFeatures.map((feature, index) => ({
        id: feature.id,
        display_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('mentorship_features')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      await fetchFeatures();
    } catch (error: any) {
      console.error('Error reordering features:', error);
      toast.error(error.message || 'Failed to reorder features');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 p-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Mentorship Features
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and organize your mentorship features
          </p>
        </div>
        <button
          onClick={handleAddFeature}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          Add Feature
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={features}
          onReorder={handleReorder}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {features.map((feature) => (
              <Reorder.Item key={feature.id} value={feature}>
                <FeatureCard
                  feature={feature}
                  onUpdate={handleUpdateFeature}
                  onDelete={handleDeleteFeature}
                />
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}
    </motion.div>
  );
}
