'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase-client';
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
  onUpdate: (feature: Feature) => void;
  onDelete: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFeature, setEditedFeature] = useState<Feature>(feature);

  // Update local state when feature prop changes
  useEffect(() => {
    setEditedFeature(feature);
  }, [feature]);

  const IconComponent = Icons[feature.icon_name as keyof typeof Icons];

  const handleSave = () => {
    // Create an updates object with only the changed fields
    const updates: Partial<Feature> = {};
    if (editedFeature.title !== feature.title) updates.title = editedFeature.title;
    if (editedFeature.description !== feature.description) updates.description = editedFeature.description;
    if (editedFeature.icon_name !== feature.icon_name) updates.icon_name = editedFeature.icon_name;
    if (editedFeature.gradient !== feature.gradient) updates.gradient = editedFeature.gradient;
    if (editedFeature.display_order !== feature.display_order) updates.display_order = editedFeature.display_order;

    console.log('Saving changes:', {
      id: feature.id,
      originalFeature: feature,
      editedFeature,
      updates
    });

    onUpdate(editedFeature);
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
                  onClick={() => {
                    setIsEditing(false);
                    setEditedFeature(feature); // Reset to original feature
                  }}
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
  const [updating, setUpdating] = useState(false);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      console.log('Fetching features...');
      const { data, error } = await supabase
        .from('mentorship_features')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('Error fetching features:', error);
        toast.error(`Error fetching features: ${error.message}`);
        return;
      }

      console.log('Features fetched successfully:', data);
      setFeatures(data || []);
    } catch (error: any) {
      console.error('Error in fetchFeatures:', error);
      toast.error(`Error fetching features: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleUpdateFeature = async (feature: Feature) => {
    try {
      setUpdating(true);
      const supabase = createClient();

      // Prepare the update data
      const updateData = {
        title: feature.title,
        description: feature.description,
        icon_name: feature.icon_name,
        gradient: feature.gradient,
        display_order: feature.display_order,
        updated_at: new Date().toISOString()
      };

      console.log('Updating feature:', feature.id, updateData);

      const { data, error } = await supabase
        .from('mentorship_features')
        .update(updateData)
        .eq('id', feature.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating feature:', error);
        toast.error(`Error updating feature: ${error.message}`);
        return;
      }

      console.log('Feature updated successfully:', data);
      
      // Refresh the features list to ensure we have the latest data
      await fetchFeatures();
      
      toast.success('Feature updated successfully');
    } catch (error: any) {
      console.error('Error in handleUpdateFeature:', error);
      toast.error(`Error updating feature: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteFeature = async (id: number) => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('mentorship_features')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting feature:', error);
        toast.error(`Error deleting feature: ${error.message}`);
        return;
      }

      setFeatures(prev => prev.filter(f => f.id !== id));
      toast.success('Feature deleted successfully');
    } catch (error: any) {
      console.error('Error in handleDeleteFeature:', error);
      toast.error(`Error deleting feature: ${error.message}`);
    }
  };

  const handleAddFeature = async () => {
    try {
      const newOrder = features.length > 0 ? Math.max(...features.map(f => f.display_order)) + 1 : 0;
      const newFeature = {
        title: 'New Feature',
        description: 'Description of the new feature',
        icon_name: 'FaUsers',
        gradient: 'from-blue-500 to-cyan-500',
        display_order: newOrder,
      };

      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('mentorship_features')
        .insert([newFeature])
        .select()
        .single();

      if (error) {
        console.error('Error adding feature:', error);
        toast.error(`Error adding feature: ${error.message}`);
        return;
      }

      console.log('Feature added successfully:', data);
      await fetchFeatures();
      toast.success('Feature added successfully');
    } catch (error: any) {
      console.error('Error in handleAddFeature:', error);
      toast.error(`Error adding feature: ${error.message}`);
    }
  };

  const handleReorder = async (reorderedFeatures: Feature[]) => {
    try {
      const updates = reorderedFeatures.map((feature, index) => ({
        id: feature.id,
        display_order: index
      }));

      for (const update of updates) {
        await fetch('/api/mentorship/features/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: update.id, updates: { display_order: update.display_order } }),
        });
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
