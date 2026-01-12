'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RegistrationFormData, NutrivibeInterestArea } from '@/types/nutrivibe';

interface InterestAreasStepProps {
  data: RegistrationFormData;
  updateData: (data: Partial<RegistrationFormData>) => void;
  interestAreas: NutrivibeInterestArea[];
  onNext: () => void;
  onBack: () => void;
}

export function InterestAreasStep({
  data,
  updateData,
  interestAreas,
  onNext,
  onBack,
}: InterestAreasStepProps) {
  const handleToggle = (areaName: string) => {
    const currentAreas = data.interestAreas || [];
    const newAreas = currentAreas.includes(areaName)
      ? currentAreas.filter((a) => a !== areaName)
      : [...currentAreas, areaName];
    
    updateData({ interestAreas: newAreas });
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Select all areas that interest you (optional). This helps us tailor the event to your needs.
      </p>

      {/* Interest Areas Checkboxes */}
      <div className="space-y-4">
        {interestAreas.map((area) => {
          const isChecked = data.interestAreas?.includes(area.name) || false;

          return (
            <div key={area.id} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <Checkbox
                id={area.id}
                checked={isChecked}
                onCheckedChange={() => handleToggle(area.name)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor={area.id}
                  className="text-base font-medium cursor-pointer"
                >
                  {area.name}
                </Label>
                {area.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {area.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Other Interest Areas */}
      <div className="space-y-2">
        <Label htmlFor="interestAreasOther" className="text-base">
          Other interests (please specify):
        </Label>
        <Input
          id="interestAreasOther"
          type="text"
          placeholder="Any other areas of interest..."
          value={data.interestAreasOther}
          onChange={(e) => updateData({ interestAreasOther: e.target.value })}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="outline" size="lg">
          Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-[#009688] hover:bg-[#00796b] text-white"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
