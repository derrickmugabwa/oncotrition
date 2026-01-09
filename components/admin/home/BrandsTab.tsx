'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Brand {
  id: number;
  name: string;
  logo_url: string;
  order_index: number;
}

export default function BrandsTab() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [title, setTitle] = useState('Trusted by Leading Brands');
  const [editForm, setEditForm] = useState<{
    name: string;
    logo_url: string;
    order_index: number;
  }>({
    name: '',
    logo_url: '',
    order_index: 0
  });

  const supabase = createClient();

  useEffect(() => {
    fetchBrands();
    fetchTitle();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      toast.error('Error fetching brands');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTitle = async () => {
    try {
      const { data, error } = await supabase
        .from('brands_content')
        .select('title')
        .single();

      if (error) throw error;
      if (data) setTitle(data.title);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdateTitle = async () => {
    try {
      const { error } = await supabase
        .from('brands_content')
        .upsert({ title });

      if (error) throw error;
      toast.success('Title updated successfully');
    } catch (error) {
      toast.error('Error updating title');
      console.error('Error:', error);
    }
  };

  const handleAddBrand = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .insert([
          {
            name: editForm.name,
            logo_url: editForm.logo_url,
            order_index: brands.length
          }
        ])
        .select()
        .single();

      if (error) throw error;
      setBrands([...brands, data]);
      setEditForm({ name: '', logo_url: '', order_index: 0 });
      toast.success('Brand added successfully');
    } catch (error) {
      toast.error('Error adding brand');
      console.error('Error:', error);
    }
  };

  const handleUpdateBrand = async () => {
    if (!editingBrand) return;

    try {
      const { error } = await supabase
        .from('brands')
        .update({
          name: editForm.name,
          logo_url: editForm.logo_url,
          order_index: editForm.order_index
        })
        .eq('id', editingBrand.id);

      if (error) throw error;

      setBrands(brands.map(brand => 
        brand.id === editingBrand.id 
          ? { ...brand, ...editForm }
          : brand
      ));
      setEditingBrand(null);
      setEditForm({ name: '', logo_url: '', order_index: 0 });
      toast.success('Brand updated successfully');
    } catch (error) {
      toast.error('Error updating brand');
      console.error('Error:', error);
    }
  };

  const handleDeleteBrand = async (id: number) => {
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBrands(brands.filter(brand => brand.id !== id));
      toast.success('Brand deleted successfully');
    } catch (error) {
      toast.error('Error deleting brand');
      console.error('Error:', error);
    }
  };

  const startEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setEditForm({
      name: brand.name,
      logo_url: brand.logo_url,
      order_index: brand.order_index
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Section Title</h2>
        <div className="flex gap-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter section title"
          />
          <Button onClick={handleUpdateTitle}>Update Title</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Manage Brands</h2>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Brand Name</Label>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Enter brand name"
            />
          </div>

          <div className="space-y-2">
            <Label>Logo Upload</Label>
            <ImageUpload
              value={editForm.logo_url}
              onChange={(url) => setEditForm({ ...editForm, logo_url: url })}
              onRemove={() => setEditForm({ ...editForm, logo_url: '' })}
              bucket="logos"
              folder="brands"
            />
          </div>

          <Button 
            onClick={editingBrand ? handleUpdateBrand : handleAddBrand}
            disabled={!editForm.name || !editForm.logo_url}
          >
            {editingBrand ? 'Update Brand' : 'Add Brand'}
          </Button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : brands.length === 0 ? (
          <div>No brands added yet.</div>
        ) : (
          <div className="grid gap-4 mt-8">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={brand.logo_url}
                    alt={brand.name}
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                  <span>{brand.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => startEdit(brand)}
                    variant="outline"
                    size="icon"
                  >
                    <FaEdit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteBrand(brand.id)}
                    variant="destructive"
                    size="icon"
                  >
                    <FaTrash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
