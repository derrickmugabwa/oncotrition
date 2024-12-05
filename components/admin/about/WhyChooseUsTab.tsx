'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon_path: string;
  display_order: number;
}

export default function WhyChooseUsTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Feature>>({});
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('why_choose_us_features')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      toast.error('Failed to fetch features');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addFeature = async () => {
    try {
      setIsLoading(true);
      const newOrder = features.length;
      const { data, error } = await supabase
        .from('why_choose_us_features')
        .insert([{
          title: 'New Feature',
          description: 'Feature description',
          icon_path: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
          display_order: newOrder,
        }])
        .select();

      if (error) throw error;
      
      if (data) {
        setFeatures([...features, ...data]);
        setEditingId(data[0].id);
        setEditForm(data[0]);
        toast.success('Feature added successfully');
      }
    } catch (error) {
      toast.error('Failed to add feature');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFeature = async (id: number, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from('why_choose_us_features')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;
      
      setFeatures(features.map(feature => 
        feature.id === id ? { ...feature, [field]: value } : feature
      ));
      toast.success('Feature updated successfully');
    } catch (error) {
      toast.error('Failed to update feature');
      console.error('Error:', error);
    }
  };

  const deleteFeature = async (id: number) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('why_choose_us_features')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setFeatures(features.filter(feature => feature.id !== id));
      toast.success('Feature deleted successfully');
    } catch (error) {
      toast.error('Failed to delete feature');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (feature: Feature) => {
    setEditingId(feature.id);
    setEditForm(feature);
  };

  const handleSave = async () => {
    if (!editingId || !editForm) return;
    
    try {
      const { error } = await supabase
        .from('why_choose_us_features')
        .update(editForm)
        .eq('id', editingId);

      if (error) throw error;
      
      setFeatures(features.map(feature => 
        feature.id === editingId ? { ...feature, ...editForm } : feature
      ));
      setEditingId(null);
      setEditForm({});
      toast.success('Feature updated successfully');
    } catch (error) {
      toast.error('Failed to update feature');
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Why Choose Us</h2>
        <button
          onClick={addFeature}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Add Feature
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <div 
            key={feature.id} 
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            {editingId === feature.id ? (
              <div className="p-4 space-y-3">
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Title"
                />
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description"
                />
                <input
                  type="text"
                  value={editForm.icon_path || ''}
                  onChange={(e) => setEditForm({ ...editForm, icon_path: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Icon SVG Path"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditForm({});
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{feature.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(feature)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteFeature(feature.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
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
