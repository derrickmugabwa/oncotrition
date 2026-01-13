'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Event } from '@/types/events';
import { NutrivibePricing } from '@/types/nutrivibe';
import { Plus, Trash2, Save, ArrowLeft, DollarSign } from 'lucide-react';

interface EventPricingManagerProps {
  event: Event;
  pricing: NutrivibePricing[];
}

interface PricingFormData {
  id?: string;
  participation_type: string;
  price: number;
  description: string;
  is_active: boolean;
  display_order: number;
}

export function EventPricingManager({ event, pricing }: EventPricingManagerProps) {
  const router = useRouter();
  const [pricingOptions, setPricingOptions] = useState<PricingFormData[]>(
    pricing.map(p => ({
      id: p.id,
      participation_type: p.participation_type,
      price: p.price,
      description: p.description || '',
      is_active: p.is_active,
      display_order: p.display_order,
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addPricingOption = () => {
    const newOrder = pricingOptions.length > 0 
      ? Math.max(...pricingOptions.map(p => p.display_order)) + 1 
      : 1;
    
    setPricingOptions([
      ...pricingOptions,
      {
        participation_type: '',
        price: 0,
        description: '',
        is_active: true,
        display_order: newOrder,
      },
    ]);
  };

  const removePricingOption = (index: number) => {
    setPricingOptions(pricingOptions.filter((_, i) => i !== index));
  };

  const updatePricingOption = (index: number, field: keyof PricingFormData, value: any) => {
    const updated = [...pricingOptions];
    updated[index] = { ...updated[index], [field]: value };
    setPricingOptions(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate
      for (const option of pricingOptions) {
        if (!option.participation_type || option.price <= 0) {
          throw new Error('All pricing options must have a type and price greater than 0');
        }
      }

      const response = await fetch(`/api/admin/events/${event.id}/pricing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricing: pricingOptions }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save pricing');
      }

      setSuccess(true);
      router.refresh();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/admin/pages/events/${event.id}/registrations`)}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registrations
          </Button>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground">Manage pricing options for this event</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <AlertDescription>Pricing options saved successfully!</AlertDescription>
        </Alert>
      )}

      {/* Pricing Options */}
      <div className="space-y-4">
        {pricingOptions.map((option, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Pricing Option {index + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePricingOption(index)}
                  disabled={pricingOptions.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Participation Type */}
                <div className="space-y-2">
                  <Label htmlFor={`type-${index}`}>
                    Participation Type <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`type-${index}`}
                    value={option.participation_type}
                    onChange={(e) => updatePricingOption(index, 'participation_type', e.target.value)}
                    placeholder="e.g., nutrition_student, professional"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use snake_case (e.g., nutrition_student, healthcare_professional)
                  </p>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor={`price-${index}`}>
                    Price (KES) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id={`price-${index}`}
                      type="number"
                      value={option.price}
                      onChange={(e) => updatePricingOption(index, 'price', parseFloat(e.target.value) || 0)}
                      className="pl-10"
                      min="0"
                      step="100"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Textarea
                  id={`description-${index}`}
                  value={option.description}
                  onChange={(e) => updatePricingOption(index, 'description', e.target.value)}
                  placeholder="Brief description of this pricing tier"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Display Order */}
                <div className="space-y-2">
                  <Label htmlFor={`order-${index}`}>Display Order</Label>
                  <Input
                    id={`order-${index}`}
                    type="number"
                    value={option.display_order}
                    onChange={(e) => updatePricingOption(index, 'display_order', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>

                {/* Active Status */}
                <div className="space-y-2">
                  <Label htmlFor={`active-${index}`}>Active</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id={`active-${index}`}
                      checked={option.is_active}
                      onCheckedChange={(checked) => updatePricingOption(index, 'is_active', checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {option.is_active ? 'Visible to users' : 'Hidden'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Button */}
      <Button onClick={addPricingOption} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Pricing Option
      </Button>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/pages/events/${event.id}/registrations`)}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Pricing Options'}
        </Button>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pricingOptions
              .filter(p => p.is_active)
              .sort((a, b) => a.display_order - b.display_order)
              .map((option, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {option.participation_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    {option.description && (
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    )}
                  </div>
                  <p className="text-lg font-bold text-[#009688]">
                    KES {option.price.toLocaleString()}
                  </p>
                </div>
              ))}
            {pricingOptions.filter(p => p.is_active).length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No active pricing options
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
