'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import FloatingImageUploader from './components/FloatingImageUploader';

interface VisionSection {
  title: string;
  description: string;
  image_url?: string;
}

interface Vision {
  id: number;
  title: string;
  sections: VisionSection[];
}

interface ValuesImage {
  id: number;
  title: string;
  description: string;
  image_url: string;
  floating_image_url?: string;
}

export default function ValuesTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [vision, setVision] = useState<Vision | null>(null);
  const [valuesImage, setValuesImage] = useState<ValuesImage | null>(null);
  const [editingVision, setEditingVision] = useState(false);
  const [editingValues, setEditingValues] = useState(false);
  const [visionForm, setVisionForm] = useState<Partial<Vision>>({});
  const [valuesForm, setValuesForm] = useState<Partial<ValuesImage>>({});
  const [newSection, setNewSection] = useState<VisionSection>({ title: '', description: '', image_url: '' });
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [floatingImageFile, setFloatingImageFile] = useState<File | null>(null);
  const [sectionImageFile, setSectionImageFile] = useState<File | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchContent();
    
    // Load any locally stored data
    // 1. Vision sections
    const storedSections = localStorage.getItem('vision_sections');
    if (storedSections && vision) {
      try {
        const parsedSections = JSON.parse(storedSections);
        setVision(prev => prev ? {...prev, sections: parsedSections} : prev);
      } catch (e) {
        console.error('Error parsing stored sections:', e);
      }
    }
    
    // 2. Values image
    const storedValuesImage = localStorage.getItem('values_image');
    if (storedValuesImage) {
      try {
        const parsedValuesImage = JSON.parse(storedValuesImage);
        setValuesImage(parsedValuesImage);
      } catch (e) {
        console.error('Error parsing stored values image:', e);
      }
    }
  }, []);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      // Fetch vision content
      try {
        const { data: visionData, error: visionError } = await supabase
          .from('values_vision')
          .select('*')
          .single();

        if (visionData) {
          setVision(visionData as any);
        } else {
          console.warn('Error fetching vision data:', visionError);
        }
      } catch (visionErr) {
        console.warn('Failed to fetch vision data:', visionErr);
      }

      // Fetch values image
      try {
        const { data: valuesImageData, error: valuesImageError } = await supabase
          .from('values_image')
          .select('*')
          .single();

        if (valuesImageData) {
          setValuesImage(valuesImageData as any);
          // If we successfully got data from the database, clear localStorage
          localStorage.removeItem('values_image');
        } else {
          console.warn('Error fetching values image data:', valuesImageError);
          // If the table doesn't exist yet, we'll rely on localStorage
        }
      } catch (valuesErr) {
        console.warn('Failed to fetch values image data:', valuesErr);
      }
    } catch (error) {
      console.error('Error in fetchContent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateVision = async () => {
    if (!vision?.id || !visionForm) return;

    try {
      // Create a simplified update object with only the title
      // This avoids issues with the sections field if it doesn't exist yet
      const basicUpdate = {
        title: visionForm.title || vision.title
      };

      // First update just the basic fields
      const { error: basicError } = await supabase
        .from('values_vision')
        .update(basicUpdate)
        .eq('id', vision.id);

      if (basicError) throw basicError;

      // Try to update with sections if they exist in the form
      if (visionForm.sections) {
        try {
          const { error: sectionsError } = await supabase
            .from('values_vision')
            .update({
              sections: visionForm.sections as any
            })
            .eq('id', vision.id);

          // If there's an error with sections, it might not exist in the schema yet
          if (sectionsError) {
            console.warn('Could not update sections in database, storing locally:', sectionsError);
            // Store sections in localStorage as a fallback
            localStorage.setItem('vision_sections', JSON.stringify(visionForm.sections));
            toast.success('Vision updated successfully (sections stored locally until database is ready)');
          } else {
            // If sections were successfully saved to the database, we can clear localStorage
            localStorage.removeItem('vision_sections');
            toast.success('Vision updated successfully');
          }
        } catch (sectionsErr) {
          console.warn('Error updating sections:', sectionsErr);
          // Store sections in localStorage as a fallback
          localStorage.setItem('vision_sections', JSON.stringify(visionForm.sections));
          toast.success('Vision updated successfully (sections stored locally until database is ready)');
        }
      } else {
        toast.success('Vision updated successfully');
      }

      // Update the local state with what we know worked
      setVision({
        ...vision,
        title: basicUpdate.title,
        // Keep existing sections if the update might have failed
        sections: visionForm.sections || vision.sections || []
      });
      
      setEditingVision(false);
      setVisionForm({});
    } catch (error) {
      toast.error('Failed to update vision');
      console.error('Error:', error);
    }
  };


  
  const addSection = async () => {
    if (!newSection.title.trim() || !vision) return;
    
    let imageUrl = newSection.image_url || '';
    
    // Upload section image if selected
    if (sectionImageFile) {
      try {
        const fileExt = sectionImageFile.name.split('.').pop();
        const filePath = `section-images/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, sectionImageFile);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      } catch (uploadErr) {
        console.warn('Error uploading section image:', uploadErr);
        toast.error('Failed to upload section image');
      }
    }
    
    const updatedSections = [...(visionForm.sections || vision.sections || []), { ...newSection, image_url: imageUrl }];
    setVisionForm({ ...visionForm, sections: updatedSections });
    setNewSection({ title: '', description: '', image_url: '' });
    setSectionImageFile(null);
    
    // Also update localStorage as a backup
    localStorage.setItem('vision_sections', JSON.stringify(updatedSections));
  };
  
  const updateSection = async (index: number) => {
    if (!vision) return;
    
    let imageUrl = newSection.image_url || '';
    
    // Upload section image if selected
    if (sectionImageFile) {
      try {
        const fileExt = sectionImageFile.name.split('.').pop();
        const filePath = `section-images/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, sectionImageFile);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      } catch (uploadErr) {
        console.warn('Error uploading section image:', uploadErr);
        toast.error('Failed to upload section image');
      }
    }
    
    const updatedSections = [...(visionForm.sections || vision.sections || [])];
    updatedSections[index] = { ...newSection, image_url: imageUrl };
    
    setVisionForm({ ...visionForm, sections: updatedSections });
    setNewSection({ title: '', description: '', image_url: '' });
    setEditingSectionIndex(null);
    setSectionImageFile(null);
    
    // Also update localStorage as a backup
    localStorage.setItem('vision_sections', JSON.stringify(updatedSections));
  };
  
  const editSection = (index: number) => {
    if (!vision) return;
    
    const sections = visionForm.sections || vision.sections || [];
    setNewSection({ ...sections[index] });
    setEditingSectionIndex(index);
  };
  
  const removeSection = (index: number) => {
    if (!vision) return;
    
    const updatedSections = (visionForm.sections || vision.sections || []).filter((_, i) => i !== index);
    setVisionForm({ ...visionForm, sections: updatedSections });
    
    if (editingSectionIndex === index) {
      setEditingSectionIndex(null);
      setNewSection({ title: '', description: '', image_url: '' });
      setSectionImageFile(null);
    }
    
    // Also update localStorage as a backup
    localStorage.setItem('vision_sections', JSON.stringify(updatedSections));
  };

  const updateValuesImage = async () => {
    try {
      setIsLoading(true);
      
      // Upload main image if selected
      let imageUrl = valuesForm.image_url || valuesImage?.image_url;
      
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop();
          const filePath = `values-images/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, imageFile);
            
          if (uploadError) throw uploadError;
          
          const { data } = supabase.storage.from('images').getPublicUrl(filePath);
          imageUrl = data.publicUrl;
        } catch (uploadErr) {
          console.warn('Error uploading image:', uploadErr);
          toast.error('Failed to upload image. Using previous image if available.');
          // Continue with the existing image URL if upload fails
        }
      }
      
      // Use the existing floating image URL if no new one is provided
      let floatingImageUrl = valuesForm.floating_image_url || valuesImage?.floating_image_url;
      
      // Upload floating image if selected
      if (floatingImageFile) {
        try {
          const fileExt = floatingImageFile.name.split('.').pop();
          const filePath = `floating-images/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, floatingImageFile);
            
          if (uploadError) throw uploadError;
          
          const { data } = supabase.storage.from('images').getPublicUrl(filePath);
          floatingImageUrl = data.publicUrl;
        } catch (uploadErr) {
          console.warn('Error uploading floating image:', uploadErr);
          toast.error('Failed to upload floating image. Using previous image if available.');
          // Continue with the existing floating image URL if upload fails
        }
      }
      
      const updatedValues: ValuesImage = {
        id: valuesImage?.id || 1, // Default ID if none exists
        title: valuesForm.title || valuesImage?.title || 'Our Values',
        description: valuesForm.description || valuesImage?.description || '',
        image_url: imageUrl || '',
        floating_image_url: floatingImageUrl
      };
      
      // Try to update in the database
      try {
        if (valuesImage?.id) {
          // Update existing record
          const { error } = await supabase
            .from('values_image')
            .update(updatedValues)
            .eq('id', valuesImage.id);
            
          if (!error) {
            // Database update successful
            localStorage.removeItem('values_image');
            toast.success('Values image updated successfully');
          } else {
            // Database update failed, use localStorage
            console.warn('Error updating values_image in database:', error);
            localStorage.setItem('values_image', JSON.stringify(updatedValues));
            toast.success('Values image saved locally (database not ready yet)');
          }
        } else {
          // Try to insert new record
          const { data, error } = await supabase
            .from('values_image')
            .insert([updatedValues])
            .select();
            
          if (!error && data) {
            // Database insert successful
            localStorage.removeItem('values_image');
            toast.success('Values image created successfully');
          } else {
            // Database insert failed, use localStorage
            console.warn('Error inserting values_image in database:', error);
            localStorage.setItem('values_image', JSON.stringify(updatedValues));
            toast.success('Values image saved locally (database not ready yet)');
          }
        }
      } catch (dbError) {
        console.warn('Database operation failed:', dbError);
        // Fallback to localStorage
        localStorage.setItem('values_image', JSON.stringify(updatedValues));
        toast.success('Values image saved locally (database not ready yet)');
      }
      
      // Update local state regardless of database success
      setValuesImage(updatedValues);
      setEditingValues(false);
      setValuesForm({});
      setImageFile(null);
    } catch (error) {
      toast.error('Failed to update values image');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
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
                placeholder="Vision Title"
                value={visionForm.title || vision?.title || ''}
                onChange={(e) => setVisionForm({ ...visionForm, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
              <p className="mt-1 text-sm text-gray-500">
                This is the main title for the Vision section. Add sections below to complete the content.
              </p>
              {/* Sections */}
              <div className="pt-4 mt-4">
                <h4 className="font-medium mb-3">Vision Sections</h4>
                <div className="space-y-4 mb-4">
                  {(visionForm.sections || []).map((section, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{section.title}</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{section.description}</p>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => editSection(index)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeSection(index)}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <h5 className="font-medium text-sm mb-2">
                    {editingSectionIndex !== null ? 'Edit Section' : 'Add New Section'}
                  </h5>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Section Title"
                      value={newSection.title}
                      onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-700"
                    />
                    <textarea
                      placeholder="Section Description"
                      value={newSection.description}
                      onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-700"
                      rows={3}
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Section Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSectionImageFile(e.target.files[0]);
                          }
                        }}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                      {sectionImageFile && (
                        <p className="text-xs text-gray-500">
                          Selected: {sectionImageFile.name}
                        </p>
                      )}
                      {!sectionImageFile && newSection.image_url && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Current image:</p>
                          <img 
                            src={newSection.image_url} 
                            alt="Section preview" 
                            className="w-full max-h-24 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      {editingSectionIndex !== null && (
                        <button
                          onClick={() => {
                            setEditingSectionIndex(null);
                            setNewSection({ title: '', description: '', image_url: '' });
                            setSectionImageFile(null);
                          }}
                          className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={editingSectionIndex !== null ? () => updateSection(editingSectionIndex) : addSection}
                        className="px-3 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        {editingSectionIndex !== null ? 'Update Section' : 'Add Section'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              

            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium">{vision.title}</h4>
              
              {/* Display Sections */}
              {vision.sections && vision.sections.length > 0 && (
                <div className="space-y-3 mt-4">
                  <div className="space-y-2">
                    {vision.sections.map((section, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <h6 className="font-medium text-sm">{section.title}</h6>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{section.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Values Image Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Values Image</h3>
            {!editingValues ? (
              <button
                onClick={() => {
                  setEditingValues(true);
                  setValuesForm(valuesImage || {});
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingValues(false);
                    setValuesForm({});
                    setImageFile(null);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={updateValuesImage}
                  className="p-1 text-blue-600 hover:text-blue-700"
                >
                  <CheckIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {editingValues ? (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={valuesForm.title || valuesImage?.title || ''}
                onChange={(e) => setValuesForm({ ...valuesForm, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
              <div>
                <textarea
                  placeholder="Description"
                  value={valuesForm.description || valuesImage?.description || ''}
                  onChange={(e) => setValuesForm({ ...valuesForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  rows={3}
                />
                <p className="mt-1 text-sm text-gray-500">
                  To add links, use the format: [link text](url)
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Main Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {imageFile && (
                  <p className="text-sm text-gray-500">
                    Selected file: {imageFile.name}
                  </p>
                )}
                {!imageFile && valuesImage?.image_url && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-2">Current image:</p>
                    <img 
                      src={valuesImage.image_url} 
                      alt="Current values image" 
                      className="w-full max-h-40 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              
              {/* Floating Image Uploader */}
              <FloatingImageUploader
                currentImageUrl={valuesImage?.floating_image_url || ''}
                onImageUploaded={(url) => {
                  setValuesForm({
                    ...valuesForm,
                    floating_image_url: url
                  });
                }}
                title="Floating Accent Image"
                description="This small image will appear overlapping with the main image on the Values page."
              />
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium">{valuesImage?.title || 'Our Values'}</h4>
              {valuesImage?.description && (
                <p className="text-sm text-gray-600">{valuesImage.description}</p>
              )}
              {valuesImage?.image_url ? (
                <div className="mt-4">
                  <img 
                    src={valuesImage.image_url} 
                    alt="Values" 
                    className="w-full max-h-40 object-cover rounded-md"
                  />
                </div>
              ) : (
                <div className="mt-4 p-8 bg-gray-50 rounded-md text-center text-gray-400">
                  No image uploaded
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
