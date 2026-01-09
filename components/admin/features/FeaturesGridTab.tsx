'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { 
  FaHeartbeat, 
  FaAppleAlt,
  FaWeight,
  FaRunning,
  FaUserMd,
  FaUserFriends,
  FaChartLine,
  FaBrain,
  FaCarrot,
  FaLeaf,
  FaPrescriptionBottle,
  FaStethoscope,
  FaDumbbell,
  FaBed,
  FaClock,
  FaCalendarAlt,
  FaChartBar,
  FaChartPie,
  FaUtensils,
  FaGlassWhiskey,
  FaBookMedical,
  FaMedkit,
  FaHospital,
  FaNotesMedical
} from 'react-icons/fa';

const AVAILABLE_ICONS = {
  FaHeartbeat: { icon: FaHeartbeat, label: 'Heart / Pulse' },
  FaAppleAlt: { icon: FaAppleAlt, label: 'Apple / Fruit' },
  FaWeight: { icon: FaWeight, label: 'Weight Scale' },
  FaRunning: { icon: FaRunning, label: 'Running / Exercise' },
  FaUserMd: { icon: FaUserMd, label: 'Doctor / Expert' },
  FaUserFriends: { icon: FaUserFriends, label: 'Community' },
  FaChartLine: { icon: FaChartLine, label: 'Progress Chart' },
  FaBrain: { icon: FaBrain, label: 'Brain / Mental Health' },
  FaCarrot: { icon: FaCarrot, label: 'Carrot / Vegetables' },
  FaLeaf: { icon: FaLeaf, label: 'Leaf / Natural' },
  FaPrescriptionBottle: { icon: FaPrescriptionBottle, label: 'Supplements' },
  FaStethoscope: { icon: FaStethoscope, label: 'Medical Care' },
  FaDumbbell: { icon: FaDumbbell, label: 'Fitness / Strength' },
  FaBed: { icon: FaBed, label: 'Sleep / Rest' },
  FaClock: { icon: FaClock, label: 'Time / Schedule' },
  FaCalendarAlt: { icon: FaCalendarAlt, label: 'Calendar / Planning' },
  FaChartBar: { icon: FaChartBar, label: 'Statistics' },
  FaChartPie: { icon: FaChartPie, label: 'Analytics' },
  FaUtensils: { icon: FaUtensils, label: 'Food / Dining' },
  FaGlassWhiskey: { icon: FaGlassWhiskey, label: 'Water / Hydration' },
  FaBookMedical: { icon: FaBookMedical, label: 'Medical Records' },
  FaMedkit: { icon: FaMedkit, label: 'First Aid / Care' },
  FaHospital: { icon: FaHospital, label: 'Hospital / Clinic' },
  FaNotesMedical: { icon: FaNotesMedical, label: 'Medical Notes' }
};

const GRADIENTS = [
  "from-rose-400 to-red-500",
  "from-blue-400 to-indigo-500",
  "from-green-400 to-emerald-500",
  "from-purple-400 to-violet-500",
  "from-amber-400 to-orange-500",
  "from-teal-400 to-cyan-500"
];

interface Feature {
  id: number;
  title: string;
  description: string;
  icon_name: string;
  gradient: string;
  display_order: number;
}

export default function FeaturesGridTab() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const supabase = createClient();

  // Form states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIconName, setEditIconName] = useState('');
  const [editGradient, setEditGradient] = useState('');

  useEffect(() => {
    fetchFeatures();
  }, []);

  async function fetchFeatures() {
    const { data, error } = await supabase
      .from('features_grid')
      .select('*')
      .order('display_order');
    
    if (error) {
      console.error('Error fetching features:', error);
      return;
    }

    setFeatures(data || []);
    setIsLoading(false);
  }

  const startEditing = (feature: Feature) => {
    setEditingId(feature.id);
    setEditTitle(feature.title);
    setEditDescription(feature.description);
    setEditIconName(feature.icon_name);
    setEditGradient(feature.gradient);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setEditIconName('');
    setEditGradient('');
  };

  const saveFeature = async (feature: Feature) => {
    const { error } = await supabase
      .from('features_grid')
      .update({
        title: editTitle,
        description: editDescription,
        icon_name: editIconName,
        gradient: editGradient,
      })
      .eq('id', feature.id);

    if (error) {
      console.error('Error updating feature:', error);
      return;
    }

    cancelEditing();
    fetchFeatures();
  };

  const addNewFeature = async () => {
    const maxOrder = Math.max(...features.map(f => f.display_order), 0);
    const { error } = await supabase
      .from('features_grid')
      .insert({
        title: 'New Feature',
        description: 'Feature description goes here.',
        icon_name: 'FaHeartbeat',
        gradient: GRADIENTS[0],
        display_order: maxOrder + 1,
      });

    if (error) {
      console.error('Error adding feature:', error);
      return;
    }

    fetchFeatures();
  };

  const deleteFeature = async (id: number) => {
    const { error } = await supabase
      .from('features_grid')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting feature:', error);
      return;
    }

    fetchFeatures();
  };

  const renderIcon = (iconName: string) => {
    const iconData = AVAILABLE_ICONS[iconName as keyof typeof AVAILABLE_ICONS];
    if (!iconData) return null;
    const IconComponent = iconData.icon;
    return <IconComponent className="h-6 w-6" />;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Features Grid</h3>
        <button
          onClick={addNewFeature}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Feature
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="bg-white shadow rounded-lg p-6 space-y-4"
          >
            {editingId === feature.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Icon</label>
                  <select
                    value={editIconName}
                    onChange={(e) => setEditIconName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {Object.entries(AVAILABLE_ICONS).map(([iconName, { label }]) => (
                      <option key={iconName} value={iconName}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Gradient</label>
                  <select
                    value={editGradient}
                    onChange={(e) => setEditGradient(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {GRADIENTS.map((gradient) => (
                      <option key={gradient} value={gradient}>
                        {gradient}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveFeature(feature)}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.gradient} bg-opacity-10`}>
                      {renderIcon(feature.icon_name)}
                    </div>
                    <h4 className="text-lg font-medium">{feature.title}</h4>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditing(feature)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteFeature(feature.id)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-500">{feature.description}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
