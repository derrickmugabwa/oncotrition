'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SponsorshipTier, SponsorshipBenefit } from '@/types/sponsorship';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from 'lucide-react';

interface SponsorshipTiersManagerProps {
  event: { id: string; title: string };
  initialTiers: SponsorshipTier[];
}

function SponsorshipTiersManagerComponent({
  event,
  initialTiers,
}: SponsorshipTiersManagerProps) {
  const supabase = createClient();
  const formRef = useRef<HTMLDivElement>(null);
  const [tiers, setTiers] = useState<SponsorshipTier[]>(initialTiers);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [expandedTier, setExpandedTier] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    tier_name: '',
    price: '',
    description: '',
    display_order: 0,
    is_active: true,
    is_recommended: false,
  });

  const [benefitFormData, setBenefitFormData] = useState({
    benefit_text: '',
    display_order: 0,
  });

  // Debug: Log component mount and state changes
  useEffect(() => {
    console.log('SponsorshipTiersManager mounted');
    return () => console.log('SponsorshipTiersManager unmounted');
  }, []);

  useEffect(() => {
    console.log('State changed - isCreating:', isCreating, 'editingTier:', editingTier);
  }, [isCreating, editingTier]);

  // Auto-scroll to form when it opens
  useEffect(() => {
    if ((isCreating || editingTier) && formRef.current) {
      console.log('Scrolling to form...');
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isCreating, editingTier]);

  const resetForm = useCallback(() => {
    setFormData({
      tier_name: '',
      price: '',
      description: '',
      display_order: 0,
      is_active: true,
      is_recommended: false,
    });
    setEditingTier(null);
    setIsCreating(false);
  }, []);

  const handleOpenCreateForm = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('handleOpenCreateForm called');
    setIsCreating(true);
    setEditingTier(null);
    // Reset form data without closing the form
    setFormData({
      tier_name: '',
      price: '',
      description: '',
      display_order: 0,
      is_active: true,
      is_recommended: false,
    });
  }, []);

  const handleCreateTier = async () => {
    if (!formData.tier_name || !formData.price) {
      toast.error('Tier name and price are required');
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${event.id}/sponsorship-tiers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tier');
      }

      setTiers([...tiers, { ...data.tier, benefits: [] }]);
      toast.success('Tier created successfully');
      resetForm();
    } catch (error: any) {
      console.error('Error creating tier:', error);
      toast.error(error.message || 'Failed to create tier');
    }
  };

  const handleUpdateTier = async (tierId: string) => {
    try {
      const response = await fetch(`/api/admin/events/${event.id}/sponsorship-tiers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier_id: tierId,
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update tier');
      }

      setTiers(
        tiers.map((t) =>
          t.id === tierId ? { ...t, ...data.tier } : t
        )
      );
      toast.success('Tier updated successfully');
      resetForm();
    } catch (error: any) {
      console.error('Error updating tier:', error);
      toast.error(error.message || 'Failed to update tier');
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    if (!confirm('Are you sure you want to delete this tier?')) return;

    try {
      const response = await fetch(
        `/api/admin/events/${event.id}/sponsorship-tiers?tier_id=${tierId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete tier');
      }

      setTiers(tiers.filter((t) => t.id !== tierId));
      toast.success('Tier deleted successfully');
    } catch (error: any) {
      console.error('Error deleting tier:', error);
      toast.error(error.message || 'Failed to delete tier');
    }
  };

  const handleAddBenefit = async (tierId: string) => {
    if (!benefitFormData.benefit_text) {
      toast.error('Benefit text is required');
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/events/${event.id}/sponsorship-tiers/${tierId}/benefits`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(benefitFormData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add benefit');
      }

      setTiers(
        tiers.map((t) =>
          t.id === tierId
            ? { ...t, benefits: [...(t.benefits || []), data.benefit] }
            : t
        )
      );
      setBenefitFormData({ benefit_text: '', display_order: 0 });
      toast.success('Benefit added successfully');
    } catch (error: any) {
      console.error('Error adding benefit:', error);
      toast.error(error.message || 'Failed to add benefit');
    }
  };

  const handleDeleteBenefit = async (tierId: string, benefitId: string) => {
    if (!confirm('Are you sure you want to delete this benefit?')) return;

    try {
      const response = await fetch(
        `/api/admin/events/${event.id}/sponsorship-tiers/${tierId}/benefits?benefit_id=${benefitId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete benefit');
      }

      setTiers(
        tiers.map((t) =>
          t.id === tierId
            ? { ...t, benefits: (t.benefits || []).filter((b) => b.id !== benefitId) }
            : t
        )
      );
      toast.success('Benefit deleted successfully');
    } catch (error: any) {
      console.error('Error deleting benefit:', error);
      toast.error(error.message || 'Failed to delete benefit');
    }
  };

  const startEdit = (tier: SponsorshipTier) => {
    setFormData({
      tier_name: tier.tier_name,
      price: tier.price.toString(),
      description: tier.description || '',
      display_order: tier.display_order || 0,
      is_active: tier.is_active !== false,
      is_recommended: tier.is_recommended || false,
    });
    setEditingTier(tier.id);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <p className="text-muted-foreground">Manage sponsorship tiers and benefits</p>
          {/* Debug info - remove after testing */}
          <p className="text-xs text-gray-400 mt-1">
            Debug: isCreating={isCreating.toString()}, editingTier={editingTier || 'null'}
          </p>
        </div>
        <Button
          onClick={handleOpenCreateForm}
          className="bg-[#009688] hover:bg-[#00796b]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tier
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingTier) && (
        <>
          {/* Highly visible indicator that form is open */}
          <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 mb-4">
            <p className="text-yellow-900 font-bold text-center text-xl">
              🎯 FORM IS NOW OPEN - SCROLL UP IF YOU DON'T SEE IT
            </p>
          </div>
          
          <Card ref={formRef} className="border-2 border-[#009688] shadow-lg bg-white">
            <CardHeader className="bg-[#009688]/5">
              <CardTitle className="text-[#009688]">
                {isCreating ? '✨ Create New Tier' : '✏️ Edit Tier'}
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tier_name">Tier Name *</Label>
                <Input
                  id="tier_name"
                  value={formData.tier_name}
                  onChange={(e) =>
                    setFormData({ ...formData, tier_name: e.target.value })
                  }
                  placeholder="e.g., Gold Sponsor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (KES) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="100000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2 flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active
                </Label>
              </div>

              <div className="space-y-2 flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="is_recommended"
                  checked={formData.is_recommended}
                  onChange={(e) =>
                    setFormData({ ...formData, is_recommended: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="is_recommended" className="cursor-pointer">
                  Most Popular (Show badge)
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of this tier"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() =>
                  editingTier ? handleUpdateTier(editingTier) : handleCreateTier()
                }
                className="bg-[#009688] hover:bg-[#00796b]"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingTier ? 'Update' : 'Create'}
              </Button>
              <Button onClick={resetForm} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
        </>
      )}

      {/* Tiers List */}
      <div className="space-y-4">
        {tiers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No sponsorship tiers yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first sponsorship tier to get started
              </p>
              <Button
                onClick={handleOpenCreateForm}
                className="bg-[#009688] hover:bg-[#00796b]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tier
              </Button>
            </CardContent>
          </Card>
        ) : (
          tiers
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .map((tier) => (
              <Card key={tier.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{tier.tier_name}</h3>
                        {!tier.is_active && (
                          <Badge variant="outline" className="text-gray-500">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-[#009688] mb-2">
                        KES {tier.price.toLocaleString()}
                      </p>
                      {tier.description && (
                        <p className="text-sm text-muted-foreground">
                          {tier.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() =>
                          setExpandedTier(expandedTier === tier.id ? null : tier.id)
                        }
                        variant="outline"
                        size="sm"
                      >
                        {expandedTier === tier.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => startEdit(tier)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteTier(tier.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Benefits Section */}
                  {expandedTier === tier.id && (
                    <div className="mt-6 pt-6 border-t space-y-4">
                      <h4 className="font-semibold text-lg">Benefits</h4>

                      {/* Benefits List */}
                      {tier.benefits && tier.benefits.length > 0 ? (
                        <div className="space-y-2">
                          {tier.benefits
                            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                            .map((benefit) => (
                              <div
                                key={benefit.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <span className="text-sm">{benefit.benefit_text}</span>
                                <Button
                                  onClick={() => handleDeleteBenefit(tier.id, benefit.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No benefits added yet
                        </p>
                      )}

                      {/* Add Benefit Form */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter benefit text"
                          value={benefitFormData.benefit_text}
                          onChange={(e) =>
                            setBenefitFormData({
                              ...benefitFormData,
                              benefit_text: e.target.value,
                            })
                          }
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddBenefit(tier.id);
                            }
                          }}
                        />
                        <Button
                          onClick={() => handleAddBenefit(tier.id)}
                          className="bg-[#009688] hover:bg-[#00796b]"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}

// Export memoized version to prevent unnecessary re-renders
export const SponsorshipTiersManager = memo(SponsorshipTiersManagerComponent);
