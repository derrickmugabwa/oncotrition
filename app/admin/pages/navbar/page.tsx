'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import { Tab } from '@headlessui/react';
import { cn } from '@/lib/utils';
import { HiPlus, HiTrash } from 'react-icons/hi';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface NavItem {
  id: string;
  name: string;
  href: string;
  order: number;
  open_in_new_tab?: boolean;
}

interface NavigationItem {
  id?: number;
  label: string;
  href: string;
  display_order: number;
  open_in_new_tab?: boolean;
}

// Input component for consistent styling
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={cn(
      'w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2',
      'focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
      'transition-colors duration-200',
      props.className
    )}
  />
);

// Section component for consistent layout
const Section = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4"
  >
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
    {children}
  </motion.div>
);

export default function NavbarPage() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', href: '', open_in_new_tab: false });
  const [editItem, setEditItem] = useState<NavigationItem>({
    label: '',
    href: '',
    display_order: 0,
    open_in_new_tab: false
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchNavItems();
  }, []);

  const fetchNavItems = async () => {
    const { data, error } = await supabase
      .from('navigation_items')
      .select('*')
      .order('order');
    
    if (error) {
      toast.error('Failed to load navigation items');
      return;
    }
    
    setNavItems(data || []);
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.href) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('navigation_items')
        .insert([
          {
            name: newItem.name,
            href: newItem.href,
            order: navItems.length,
            open_in_new_tab: newItem.open_in_new_tab
          },
        ]);

      if (error) throw error;

      fetchNavItems();
      setNewItem({ name: '', href: '', open_in_new_tab: false });
      toast.success('Navigation item added successfully');
    } catch (error) {
      console.error('Error adding navigation item:', error);
      toast.error('Failed to add navigation item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    const { error } = await supabase
      .from('navigation_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete navigation item');
      return;
    }

    setNavItems(navItems.filter(item => item.id !== id));
    toast.success('Navigation item deleted successfully');
  };

  const handleMoveItem = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = navItems.findIndex(item => item.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === navItems.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedItems = [...navItems];
    const [movedItem] = updatedItems.splice(currentIndex, 1);
    updatedItems.splice(newIndex, 0, movedItem);

    const itemsWithNewOrder = updatedItems.map((item, index) => ({
      ...item,
      order: index
    }));

    const { error } = await supabase
      .from('navigation_items')
      .upsert(itemsWithNewOrder);

    if (error) {
      toast.error('Failed to update order');
      return;
    }

    setNavItems(itemsWithNewOrder);
    toast.success('Order updated successfully');
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('navigation_items')
        .upsert({
          id: editingId,
          label: editItem.label,
          href: editItem.href,
          display_order: editItem.display_order,
          open_in_new_tab: editItem.open_in_new_tab
        });

      if (error) throw error;
      
      fetchNavItems();
      setEditingId(null);
      setEditItem({
        label: '',
        href: '',
        display_order: 0,
        open_in_new_tab: false
      });
      toast.success('Navigation item saved successfully');
    } catch (error) {
      console.error('Error saving navigation item:', error);
      toast.error('Failed to save navigation item');
    }
  };

  const tabs = [
    {
      name: 'Navigation Items',
      component: (
        <div className="space-y-6">
          <Section title="Add New Navigation Item">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <Input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g., About Us"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    URL
                  </label>
                  <Input
                    type="text"
                    value={newItem.href}
                    onChange={(e) => setNewItem({ ...newItem, href: e.target.value })}
                    placeholder="e.g., /about"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="open-new-tab"
                  checked={newItem.open_in_new_tab}
                  onChange={(e) => setNewItem({ ...newItem, open_in_new_tab: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="open-new-tab" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Open in new tab
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleAddItem}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                >
                  <HiPlus className="w-5 h-5 mr-2" />
                  Add Item
                </button>
              </div>
            </form>
          </Section>

          <Section title="Current Navigation Items">
            <div className="space-y-3">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-gray-100 dark:border-gray-700"
                >
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.href}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleMoveItem(item.id, 'up')}
                      disabled={index === 0}
                      className={cn(
                        'p-2 rounded-lg transition-colors duration-200',
                        index === 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                      )}
                    >
                      <ChevronUpIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleMoveItem(item.id, 'down')}
                      disabled={index === navItems.length - 1}
                      className={cn(
                        'p-2 rounded-lg transition-colors duration-200',
                        index === navItems.length - 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                      )}
                    >
                      <ChevronDownIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                    >
                      <HiTrash className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
              {navItems.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No navigation items yet. Add some above!
                </p>
              )}
            </div>
          </Section>
        </div>
      ),
    },
    {
      name: 'Edit Navigation Items',
      component: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Navigation Items</h1>
            <button
              onClick={() => {
                setEditingId(null);
                setEditItem({
                  label: '',
                  href: '',
                  display_order: navItems.length,
                  open_in_new_tab: false
                });
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              Add Item
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {navItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      {editingId === Number(item.id) ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Label
                            </label>
                            <input
                              type="text"
                              value={editItem.label}
                              onChange={(e) => setEditItem({ ...editItem, label: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              URL
                            </label>
                            <input
                              type="text"
                              value={editItem.href}
                              onChange={(e) => setEditItem({ ...editItem, href: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Display Order
                            </label>
                            <input
                              type="number"
                              value={editItem.display_order}
                              onChange={(e) => setEditItem({ ...editItem, display_order: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="open-new-tab"
                              checked={editItem.open_in_new_tab}
                              onChange={(e) => setEditItem({ ...editItem, open_in_new_tab: e.target.checked })}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="open-new-tab" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Open in new tab
                            </label>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSave}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditItem({
                                  label: '',
                                  href: '',
                                  display_order: 0,
                                  open_in_new_tab: false
                                });
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.href}</p>
                          {item.open_in_new_tab && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Opens in new tab
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingId(Number(item.id));
                          setEditItem({
                            label: item.name,
                            href: item.href,
                            display_order: item.order,
                            open_in_new_tab: item.open_in_new_tab
                          });
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <div className="max-w-3xl mb-8">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-4"
        >
          Navigation Bar Management
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-300"
        >
          Manage your website's navigation menu items and their order.
        </motion.p>
      </div>

      <Tab.Group>
        <Tab.List className="flex flex-wrap gap-2 p-2 rounded-2xl bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 shadow-lg backdrop-blur-sm">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                cn(
                  'px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                  'focus:outline-none',
                  selected
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 scale-105 hover:shadow-lg'
                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400'
                )
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-8">
          {tabs.map((tab, idx) => (
            <Tab.Panel
              key={idx}
              className={cn(
                'rounded-2xl bg-white dark:bg-gray-800/80 p-6 shadow-xl backdrop-blur-sm',
                'ring-white/60 ring-offset-2 ring-offset-emerald-400 focus:outline-none focus:ring-2'
              )}
            >
              {tab.component}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </motion.div>
  );
}
