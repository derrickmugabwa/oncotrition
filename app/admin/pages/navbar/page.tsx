'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { HiPlus, HiTrash, HiPencil } from 'react-icons/hi';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface NavItem {
  id: string;
  name: string;
  href: string;
  order: number;
  open_in_new_tab: boolean;
  type: 'link' | 'dropdown' | 'mega';
  parent_id?: string;
  column_index?: number;
  description?: string;
}

interface NavSection {
  id: string;
  nav_item_id: string;
  title: string;
  url: string;
  column_index: number;
  order_index: number;
}

interface EditingSectionState {
  id: string;
  title: string;
  url: string;
  column_index: number;
}

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
  const [sections, setSections] = useState<NavSection[]>([]);
  const [newItem, setNewItem] = useState<Partial<NavItem>>({
    name: '',
    href: '',
    open_in_new_tab: false,
    type: 'link',
    column_index: 0
  });
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<EditingSectionState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchNavItems();
    fetchSections();
  }, []);

  const fetchNavItems = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('order');
      
      if (error) throw error;
      setNavItems(data || []);
    } catch (error) {
      console.error('Error fetching navigation items:', error);
      toast.error('Failed to load navigation items');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_sections')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching navigation sections:', error);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.href) {
      toast.error('Please fill in all required fields');
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
            open_in_new_tab: newItem.open_in_new_tab,
            type: newItem.type,
            parent_id: newItem.parent_id,
            column_index: newItem.column_index,
            description: newItem.description
          },
        ]);

      if (error) throw error;

      fetchNavItems();
      setNewItem({
        name: '',
        href: '',
        open_in_new_tab: false,
        type: 'link',
        column_index: 0
      });
      toast.success('Navigation item added successfully');
    } catch (error) {
      console.error('Error adding navigation item:', error);
      toast.error('Failed to add navigation item');
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<NavItem>) => {
    try {
      const { error } = await supabase
        .from('navigation_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      fetchNavItems();
      setEditingItem(null);
      toast.success('Navigation item updated successfully');
    } catch (error) {
      console.error('Error updating navigation item:', error);
      toast.error('Failed to update navigation item');
    }
  };

  const handleAddSection = async (navItemId: string) => {
    try {
      const { error } = await supabase
        .from('navigation_sections')
        .insert([
          {
            nav_item_id: navItemId,
            title: 'New Section',
            url: '',
            column_index: 0,
            order_index: sections.filter(s => s.nav_item_id === navItemId).length
          }
        ]);

      if (error) throw error;
      fetchSections();
      toast.success('Section added successfully');
    } catch (error) {
      console.error('Error adding section:', error);
      toast.error('Failed to add section');
    }
  };

  const handleUpdateSection = async (id: string, updates: Partial<NavSection>) => {
    try {
      const { error } = await supabase
        .from('navigation_sections')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      fetchSections();
      setEditingSection(null);
      toast.success('Section updated successfully');
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error('Failed to update section');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('navigation_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNavItems(navItems.filter(item => item.id !== id));
      toast.success('Navigation item deleted successfully');
    } catch (error) {
      console.error('Error deleting navigation item:', error);
      toast.error('Failed to delete navigation item');
    }
  };

  const handleDeleteSection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('navigation_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSections(sections.filter(section => section.id !== id));
      toast.success('Section deleted successfully');
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Failed to delete section');
    }
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

    try {
      const { error } = await supabase
        .from('navigation_items')
        .upsert(itemsWithNewOrder);

      if (error) throw error;
      setNavItems(itemsWithNewOrder);
      toast.success('Order updated successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Section title="Add Navigation Item">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Menu Item Name"
              />
            </div>
            <div>
              <Label htmlFor="href">URL</Label>
              <Input
                id="href"
                value={newItem.href}
                onChange={(e) => setNewItem({ ...newItem, href: e.target.value })}
                placeholder="/page-url"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Menu Type</Label>
              <select
                id="type"
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as NavItem['type'] })}
                className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2"
              >
                <option value="link">Simple Link</option>
                <option value="dropdown">Dropdown Menu</option>
                <option value="mega">Mega Menu</option>
              </select>
            </div>
            {(newItem.type === 'dropdown' || newItem.type === 'mega') && (
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="openInNewTab"
                checked={newItem.open_in_new_tab}
                onChange={(e) => setNewItem({ ...newItem, open_in_new_tab: e.target.checked })}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Label htmlFor="openInNewTab">Open in new tab</Label>
            </div>
          </div>
        </div>
        <Button
          onClick={handleAddItem}
          className="mt-4 w-full md:w-auto"
        >
          Add Menu Item
        </Button>
      </Section>

      <Section title="Navigation Items">
        <div className="space-y-4">
          {navItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4"
            >
              {editingItem === item.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`edit-name-${item.id}`}>Name</Label>
                      <Input
                        id={`edit-name-${item.id}`}
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-href-${item.id}`}>URL</Label>
                      <Input
                        id={`edit-href-${item.id}`}
                        value={item.href}
                        onChange={(e) => handleUpdateItem(item.id, { href: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => setEditingItem(null)}
                    variant="outline"
                    size="sm"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.href}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleMoveItem(item.id, 'up')}
                      variant="ghost"
                      size="sm"
                      disabled={index === 0}
                    >
                      <ChevronUpIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleMoveItem(item.id, 'down')}
                      variant="ghost"
                      size="sm"
                      disabled={index === navItems.length - 1}
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setEditingItem(item.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <HiPencil className="h-4 w-4" />
                    </Button>
                    {item.type !== 'link' && (
                      <Button
                        onClick={() => handleAddSection(item.id)}
                        variant="outline"
                        size="sm"
                      >
                        Add Section
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDeleteItem(item.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
              
              {(item.type === 'dropdown' || item.type === 'mega') && (
                <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 mt-2">
                  {sections
                    .filter(section => section.nav_item_id === item.id)
                    .map(section => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between py-2"
                      >
                        {editingSection?.id === section.id ? (
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Input
                                value={editingSection.title}
                                onChange={(e) => setEditingSection({
                                  ...editingSection,
                                  title: e.target.value
                                })}
                                placeholder="Section Title"
                              />
                            </div>
                            <div>
                              <Input
                                value={editingSection.url}
                                onChange={(e) => setEditingSection({
                                  ...editingSection,
                                  url: e.target.value
                                })}
                                placeholder="Section URL"
                              />
                            </div>
                            {item.type === 'mega' && (
                              <div>
                                <Input
                                  type="number"
                                  min="0"
                                  value={editingSection.column_index}
                                  onChange={(e) => setEditingSection({
                                    ...editingSection,
                                    column_index: parseInt(e.target.value)
                                  })}
                                  placeholder="Column Index"
                                />
                              </div>
                            )}
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleUpdateSection(section.id, {
                                  title: editingSection.title,
                                  url: editingSection.url,
                                  column_index: editingSection.column_index
                                })}
                                size="sm"
                              >
                                Save
                              </Button>
                              <Button
                                onClick={() => setEditingSection(null)}
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {section.title}
                              </span>
                              {section.url && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                  ({section.url})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => setEditingSection({
                                  id: section.id,
                                  title: section.title,
                                  url: section.url || '',
                                  column_index: section.column_index
                                })}
                                variant="ghost"
                                size="sm"
                              >
                                <HiPencil className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteSection(section.id)}
                                variant="ghost"
                                size="sm"
                              >
                                <HiTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
