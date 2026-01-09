'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  UserGroupIcon, AcademicCapIcon, BeakerIcon, BoltIcon,
  FireIcon, SparklesIcon, ShieldCheckIcon, HandThumbUpIcon,
  BookOpenIcon, BellAlertIcon, CalendarIcon, ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon, RocketLaunchIcon, TrophyIcon,
  PlusIcon, TrashIcon, PencilIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

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

const iconOptions = Object.entries(userIcons).map(([value, Icon]) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1).replace(/([A-Z])/g, ' $1').trim()
}));

type IconName = keyof typeof userIcons;

export default function UsersTab() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [headerContent, setHeaderContent] = useState<HeaderContent>({
    heading: '',
    paragraph: ''
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

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
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('smartspoon_users_header')
        .upsert([headerContent]);

      if (error) throw error;
      toast.success('Header content updated successfully');
    } catch (error) {
      console.error('Error updating header:', error);
      toast.error('Failed to update header');
    } finally {
      setSaving(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);

    try {
      if (editingUser.id) {
        // Update existing user
        const { error } = await supabase
          .from('smartspoon_users')
          .update(editingUser)
          .eq('id', editingUser.id);

        if (error) throw error;
        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      } else {
        // Add new user
        const { data, error } = await supabase
          .from('smartspoon_users')
          .insert([{ ...editingUser, sort_order: users.length }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setUsers([...users, data]);
        }
      }

      setEditingUser(null);
      toast.success(editingUser.id ? 'User updated successfully' : 'User added successfully');
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('smartspoon_users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setUsers(users.filter(u => u.id !== id));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(users);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update sort_order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index,
    }));

    setUsers(updatedItems);

    // Update in database
    try {
      const { error } = await supabase
        .from('smartspoon_users')
        .upsert(updatedItems);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating sort_order:', error);
      toast.error('Failed to update order');
      fetchData(); // Revert to original order
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Header Content</h3>
        <form onSubmit={handleHeaderSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Heading</label>
            <input
              type="text"
              value={headerContent.heading}
              onChange={(e) => setHeaderContent({ ...headerContent, heading: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Paragraph</label>
            <textarea
              value={headerContent.paragraph}
              onChange={(e) => setHeaderContent({ ...headerContent, paragraph: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className={cn(
              "px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700",
              saving && "opacity-50 cursor-not-allowed"
            )}
          >
            {saving ? 'Saving...' : 'Save Header'}
          </button>
        </form>
      </div>

      {/* Users Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Users</h3>
          <button
            onClick={() => setEditingUser({ id: 0, title: '', description: '', icon_name: 'userGroup', sort_order: users.length })}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <PlusIcon className="w-4 h-4" />
            Add User
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="users">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {users.map((user, index) => {
                  const IconComponent = userIcons[user.icon_name as IconName] || UserGroupIcon;
                  return (
                    <Draggable key={user.id} draggableId={String(user.id)} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <IconComponent className="w-5 h-5 text-emerald-500" />
                            <div>
                              <h4 className="font-medium">{user.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{user.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-2 text-gray-600 hover:text-emerald-600"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-gray-600 hover:text-red-600"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              {editingUser.id ? 'Edit User' : 'Add User'}
            </h3>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editingUser.title}
                  onChange={(e) => setEditingUser({ ...editingUser, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editingUser.description}
                  onChange={(e) => setEditingUser({ ...editingUser, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Icon</label>
                <select
                  value={editingUser.icon_name}
                  onChange={(e) => setEditingUser({ ...editingUser, icon_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  {iconOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={cn(
                    "px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700",
                    saving && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {saving ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
