'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Switch } from '@headlessui/react';
import { GripVertical } from 'lucide-react';

interface ComponentSetting {
  id: string;
  name: string;
  component_key: string;
  is_visible: boolean;
  display_order: number;
}

export default function ComponentsTab() {
  const [components, setComponents] = useState<ComponentSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchComponents();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('homepage_components_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'homepage_components'
        },
        () => {
          fetchComponents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchComponents = async () => {
    const { data, error } = await supabase
      .from('homepage_components')
      .select('*')
      .order('display_order');
    
    if (error) {
      console.error('Error fetching components:', error);
      return;
    }
    
    setComponents(data || []);
    setIsLoading(false);
  };

  const updateComponentOrder = async (newComponents: ComponentSetting[]) => {
    for (const [index, component] of newComponents.entries()) {
      const { error } = await supabase
        .from('homepage_components')
        .update({ display_order: index })
        .eq('id', component.id);

      if (error) {
        console.error('Error updating component order:', error);
      }
    }
  };

  const toggleVisibility = async (id: string, newValue: boolean) => {
    const { error } = await supabase
      .from('homepage_components')
      .update({ is_visible: newValue })
      .eq('id', id);

    if (error) {
      console.error('Error updating visibility:', error);
      return;
    }

    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, is_visible: newValue } : comp
    ));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setComponents(items);
    updateComponentOrder(items);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Homepage Component Order & Visibility
        </h3>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="components">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {components.map((component, index) => (
                  <Draggable
                    key={component.id}
                    draggableId={component.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            {...provided.dragHandleProps}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab"
                          >
                            <GripVertical size={20} />
                          </div>
                          <span className="text-gray-700 dark:text-gray-200">
                            {component.name}
                          </span>
                        </div>
                        <Switch
                          checked={component.is_visible}
                          onChange={(checked) => toggleVisibility(component.id, checked)}
                          className={`${
                            component.is_visible ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
                        >
                          <span
                            className={`${
                              component.is_visible ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </Switch>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
