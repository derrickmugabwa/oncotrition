'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Vision {
  id: number;
  title: string;
  description: string;
  bullet_points: string[];
}

interface Value {
  id: number;
  title: string;
  description: string;
  display_order: number;
}

export default function ValuesTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [vision, setVision] = useState<Vision | null>(null);
  const [values, setValues] = useState<Value[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Value>>({});
  const [editingVision, setEditingVision] = useState(false);
  const [visionForm, setVisionForm] = useState<Partial<Vision>>({});
  const [newBulletPoint, setNewBulletPoint] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      // Fetch vision content
      const { data: visionData, error: visionError } = await supabase
        .from('values_vision')
        .select('*')
        .single();

      if (visionError) throw visionError;
      setVision(visionData);

      // Fetch values list
      const { data: valuesData, error: valuesError } = await supabase
        .from('values_list')
        .select('*')
        .order('display_order');

      if (valuesError) throw valuesError;
      setValues(valuesData || []);
    } catch (error) {
      toast.error('Failed to fetch content');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateVision = async () => {
    if (!vision?.id || !visionForm) return;

    try {
      const { error } = await supabase
        .from('values_vision')
        .update(visionForm)
        .eq('id', vision.id);

      if (error) throw error;

      setVision({ ...vision, ...visionForm });
      setEditingVision(false);
      setVisionForm({});
      toast.success('Vision updated successfully');
    } catch (error) {
      toast.error('Failed to update vision');
      console.error('Error:', error);
    }
  };

  const addBulletPoint = () => {
    if (!newBulletPoint.trim() || !vision) return;

    const updatedBulletPoints = [...(visionForm.bullet_points || vision.bullet_points), newBulletPoint];
    setVisionForm({ ...visionForm, bullet_points: updatedBulletPoints });
    setNewBulletPoint('');
  };

  const removeBulletPoint = (index: number) => {
    if (!vision) return;

    const updatedBulletPoints = (visionForm.bullet_points || vision.bullet_points).filter((_, i) => i !== index);
    setVisionForm({ ...visionForm, bullet_points: updatedBulletPoints });
  };

  const addValue = async () => {
    try {
      setIsLoading(true);
      const newOrder = values.length;
      const { data, error } = await supabase
        .from('values_list')
        .insert([{
          title: 'New Value',
          description: 'Value description',
          display_order: newOrder,
        }])
        .select();

      if (error) throw error;
      
      if (data) {
        setValues([...values, ...data]);
        setEditingId(data[0].id);
        setEditForm(data[0]);
        toast.success('Value added successfully');
      }
    } catch (error) {
      toast.error('Failed to add value');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateValue = async () => {
    if (!editingId || !editForm) return;
    
    try {
      const { error } = await supabase
        .from('values_list')
        .update(editForm)
        .eq('id', editingId);

      if (error) throw error;
      
      setValues(values.map(value => 
        value.id === editingId ? { ...value, ...editForm } : value
      ));
      setEditingId(null);
      setEditForm({});
      toast.success('Value updated successfully');
    } catch (error) {
      toast.error('Failed to update value');
      console.error('Error:', error);
    }
  };

  const deleteValue = async (id: number) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('values_list')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setValues(values.filter(value => value.id !== id));
      toast.success('Value deleted successfully');
    } catch (error) {
      toast.error('Failed to delete value');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!vision) return null;

  return (
    <div className="space-y-8">
      {/* Vision Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Vision</h3>
            {!editingVision ? (
              <button
                onClick={() => {
                  setEditingVision(true);
                  setVisionForm(vision);
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingVision(false);
                    setVisionForm({});
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={updateVision}
                  className="p-1 text-blue-600 hover:text-blue-700"
                >
                  <CheckIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {editingVision ? (
            <div className="space-y-4">
              <input
                type="text"
                value={visionForm.title || ''}
                onChange={(e) => setVisionForm({ ...visionForm, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Title"
              />
              <textarea
                value={visionForm.description || ''}
                onChange={(e) => setVisionForm({ ...visionForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description"
              />
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBulletPoint}
                    onChange={(e) => setNewBulletPoint(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="New bullet point"
                  />
                  <button
                    onClick={addBulletPoint}
                    className="px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <ul className="space-y-2">
                  {(visionForm.bullet_points || []).map((point, index) => (
                    <li key={index} className="flex items-center justify-between gap-2">
                      <span className="text-sm">{point}</span>
                      <button
                        onClick={() => removeBulletPoint(index)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium">{vision.title}</h4>
              <p className="text-sm text-gray-600">{vision.description}</p>
              <ul className="space-y-2">
                {vision.bullet_points.map((point, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Values Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Values</h3>
          <button
            onClick={addValue}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add Value
          </button>
        </div>

        <div className="grid gap-4">
          {values.map((value) => (
            <div
              key={value.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              {editingId === value.id ? (
                <div className="p-4 space-y-4">
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
                      onClick={updateValue}
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
                      <h4 className="font-medium">{value.title}</h4>
                      <p className="text-sm text-gray-600">{value.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingId(value.id);
                          setEditForm(value);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteValue(value.id)}
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
    </div>
  );
}
