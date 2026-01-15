'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Event } from '@/types/events';
import { NutrivibeInterestArea } from '@/types/nutrivibe';
import { Plus, Trash2, Save, ArrowLeft, GripVertical } from 'lucide-react';

interface EventInterestAreasManagerProps {
  event: Event;
  interestAreas: NutrivibeInterestArea[];
}

interface InterestAreaFormData {
  id?: string;
  name: string;
  is_active: boolean | null;
  display_order: number | null;
}

export function EventInterestAreasManager({ event, interestAreas }: EventInterestAreasManagerProps) {
  const router = useRouter();
  const [areas, setAreas] = useState<InterestAreaFormData[]>(
    interestAreas.map(a => ({
      id: a.id,
      name: a.name,
      is_active: a.is_active ?? true,
      display_order: a.display_order ?? 0,
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addInterestArea = () => {
    const newOrder = areas.length > 0 
      ? Math.max(...areas.map(a => a.display_order ?? 0)) + 1 
      : 1;
    
    setAreas([
      ...areas,
      {
        name: '',
        is_active: true,
        display_order: newOrder,
      },
    ]);
  };

  const removeInterestArea = (index: number) => {
    setAreas(areas.filter((_, i) => i !== index));
  };

  const updateInterestArea = (index: number, field: keyof InterestAreaFormData, value: any) => {
    const updated = [...areas];
    updated[index] = { ...updated[index], [field]: value };
    setAreas(updated);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...areas];
    const temp = updated[index].display_order;
    updated[index].display_order = updated[index - 1].display_order;
    updated[index - 1].display_order = temp;
    updated.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    setAreas(updated);
  };

  const moveDown = (index: number) => {
    if (index === areas.length - 1) return;
    const updated = [...areas];
    const temp = updated[index].display_order;
    updated[index].display_order = updated[index + 1].display_order;
    updated[index + 1].display_order = temp;
    updated.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    setAreas(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate
      for (const area of areas) {
        if (!area.name.trim()) {
          throw new Error('All interest areas must have a name');
        }
      }

      const response = await fetch(`/api/admin/events/${event.id}/interest-areas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interestAreas: areas }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save interest areas');
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
          <p className="text-muted-foreground">Manage interest areas for this event</p>
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
          <AlertDescription>Interest areas saved successfully!</AlertDescription>
        </Alert>
      )}

      {/* Interest Areas */}
      <div className="space-y-4">
        {areas.map((area, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {/* Drag Handle & Order Controls */}
                <div className="flex flex-col items-center gap-2 pt-2">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === areas.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      ▼
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Name */}
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor={`name-${index}`}>
                        Interest Area Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`name-${index}`}
                        value={area.name}
                        onChange={(e) => updateInterestArea(index, 'name', e.target.value)}
                        placeholder="e.g., Clinical Nutrition, Sports Nutrition"
                      />
                    </div>

                    {/* Active Status */}
                    <div className="space-y-2">
                      <Label htmlFor={`active-${index}`}>Status</Label>
                      <div className="flex items-center space-x-2 pt-2">
                        <Switch
                          id={`active-${index}`}
                          checked={area.is_active ?? false}
                          onCheckedChange={(checked) => updateInterestArea(index, 'is_active', checked)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {(area.is_active ?? false) ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Display Order (hidden, auto-managed) */}
                  <input type="hidden" value={area.display_order ?? 0} />
                </div>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInterestArea(index)}
                  disabled={areas.length === 1}
                  className="mt-8"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Button */}
      <Button onClick={addInterestArea} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Interest Area
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
          {isSaving ? 'Saving...' : 'Save Interest Areas'}
        </Button>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {areas
              .filter(a => a.is_active && a.name.trim())
              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
              .map((area, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#009688] border-gray-300 rounded focus:ring-[#009688]"
                    disabled
                  />
                  <span className="font-medium">{area.name}</span>
                </div>
              ))}
            {areas.filter(a => a.is_active && a.name.trim()).length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No active interest areas
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
