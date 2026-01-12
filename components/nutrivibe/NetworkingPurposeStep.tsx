'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RegistrationFormData } from '@/types/nutrivibe';
import { Check } from 'lucide-react';

interface NetworkingPurposeStepProps {
  data: RegistrationFormData;
  updateData: (data: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const networkingOptions = [
  {
    value: 'innovator_product',
    label: 'Showcase a product or innovation',
    description: 'Limited spots available',
  },
  {
    value: 'panel_discussion',
    label: 'Be considered for a panel discussion or short talk',
    description: '',
  },
  {
    value: 'future_programs',
    label: 'Receive updates on future Oncotrition programs',
    description: '',
  },
  {
    value: 'additional_engagement',
    label: 'Additional Engagement Options',
    description: '',
  },
];

export function NetworkingPurposeStep({
  data,
  updateData,
  onNext,
  onBack,
}: NetworkingPurposeStepProps) {
  const handleSelect = (value: string) => {
    updateData({ networkingPurpose: value });
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        What would you like to get out of this networking event? (Optional)
      </p>

      {/* Networking Options */}
      <div className="grid gap-4">
        {networkingOptions.map((option) => {
          const isSelected = data.networkingPurpose === option.value;

          return (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#009688] border-2 bg-teal-50 dark:bg-teal-950'
                  : 'hover:border-gray-400'
              }`}
              onClick={() => handleSelect(option.value)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-[#009688] bg-[#009688]'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <Label className="text-base font-semibold cursor-pointer">
                      {option.label}
                    </Label>
                    {option.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Skip Option */}
      <div className="text-center">
        <Button
          onClick={onNext}
          variant="ghost"
          className="text-muted-foreground"
        >
          Skip this step
        </Button>
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
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
