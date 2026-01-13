'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PersonalDetailsStep } from './PersonalDetailsStep';
import { ParticipationTypeStep } from './ParticipationTypeStep';
import { InterestAreasStep } from './InterestAreasStep';
import { NetworkingPurposeStep } from './NetworkingPurposeStep';
import { PaymentSummary } from './PaymentSummary';
import { NutrivibePricing, NutrivibeInterestArea, RegistrationFormData } from '@/types/nutrivibe';
import { Event } from '@/types/events';
import { Loader2 } from 'lucide-react';

interface RegistrationFormProps {
  event: Event;
  pricing: NutrivibePricing[];
  interestAreas: NutrivibeInterestArea[];
}

export function RegistrationForm({ event, pricing, interestAreas }: RegistrationFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    organization: '',
    designation: '',
    email: '',
    phoneNumber: '',
    participationType: '',
    participationTypeOther: '',
    interestAreas: [],
    interestAreasOther: '',
    networkingPurpose: '',
  });

  const totalSteps = 5;

  const updateFormData = (data: Partial<RegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Submitting registration:', formData);
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Registration response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      // Redirect to Paystack payment page
      window.location.href = data.paymentUrl;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  const selectedPrice = pricing.find((p) => p.participation_type === formData.participationType);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-[#009688]">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#009688] to-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {currentStep === 1 && 'Personal Details'}
            {currentStep === 2 && 'Participation Type'}
            {currentStep === 3 && 'Interest Areas'}
            {currentStep === 4 && 'Networking Purpose'}
            {currentStep === 5 && 'Review & Payment'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <PersonalDetailsStep
              data={formData}
              updateData={updateFormData}
              onNext={nextStep}
            />
          )}

          {currentStep === 2 && (
            <ParticipationTypeStep
              data={formData}
              updateData={updateFormData}
              pricing={pricing}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 3 && (
            <InterestAreasStep
              data={formData}
              updateData={updateFormData}
              interestAreas={interestAreas}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 4 && (
            <NetworkingPurposeStep
              data={formData}
              updateData={updateFormData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 5 && (
            <PaymentSummary
              data={formData}
              pricing={pricing}
              event={event}
              onBack={prevStep}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Need help?</strong> Contact us at{' '}
            <a href="mailto:events@oncotrition.com" className="underline hover:text-blue-700">
              events@oncotrition.com
            </a>
            {' '}or call{' '}
            <a href="tel:+254700000000" className="underline hover:text-blue-700">
              +254 700 000 000
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
