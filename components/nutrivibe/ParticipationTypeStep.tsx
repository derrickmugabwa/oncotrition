'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { RegistrationFormData, NutrivibePricing } from '@/types/nutrivibe';
import { Check } from 'lucide-react';

interface ParticipationTypeStepProps {
  data: RegistrationFormData;
  updateData: (data: Partial<RegistrationFormData>) => void;
  pricing: NutrivibePricing[];
  onNext: () => void;
  onBack: () => void;
}

export function ParticipationTypeStep({
  data,
  updateData,
  pricing,
  onNext,
  onBack,
}: ParticipationTypeStepProps) {
  const [error, setError] = useState<string>('');

  const handleNext = () => {
    if (!data.participationType) {
      setError('Please select a participation type');
      return;
    }

    setError('');
    onNext();
  };

  const handleSelect = (type: string) => {
    updateData({ participationType: type });
    setError('');
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Select your participation type. Pricing varies based on your selection.
      </p>

      {/* Pricing Options */}
      <div className="grid gap-4">
        {pricing.map((option) => {
          const isSelected = data.participationType === option.participation_type;
          
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#009688] border-2 bg-teal-50 dark:bg-teal-950'
                  : 'hover:border-gray-400'
              }`}
              onClick={() => handleSelect(option.participation_type)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-[#009688] bg-[#009688]'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <Label className="text-base sm:text-lg font-semibold cursor-pointer leading-tight">
                        {option.description}
                      </Label>
                    </div>
                    {option.participation_type === 'nutrition_student' && (
                      <p className="text-sm text-muted-foreground ml-8">
                        Special rate for nutrition students
                      </p>
                    )}
                  </div>
                  <div className="text-left sm:text-right ml-8 sm:ml-0">
                    <div className="text-xl sm:text-2xl font-bold text-[#009688]">
                      KES {option.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Other Option */}
      {data.participationType && (
        <div className="space-y-2">
          <Label htmlFor="participationTypeOther" className="text-base">
            If "Other", please specify:
          </Label>
          <Input
            id="participationTypeOther"
            type="text"
            placeholder="Please specify your participation type"
            value={data.participationTypeOther}
            onChange={(e) => updateData({ participationTypeOther: e.target.value })}
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="outline" size="lg">
          Back
        </Button>
        <Button
          onClick={handleNext}
          className="bg-[#009688] hover:bg-[#00796b] text-white"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
