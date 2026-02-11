'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SponsorshipTierCard } from './SponsorshipTierCard';
import { SponsorshipTier, SponsorshipFormData } from '@/types/sponsorship';
import { Event } from '@/types/events';
import { Loader2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface SponsorshipFormProps {
  event: Event;
  tiers: SponsorshipTier[];
}

export function SponsorshipForm({ event, tiers }: SponsorshipFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SponsorshipFormData>({
    companyName: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    companyWebsite: '',
    industry: '',
    sponsorshipGoals: '',
    specialRequests: '',
    tierId: '',
  });

  const totalSteps = 3;
  const selectedTier = tiers.find((t) => t.id === formData.tierId);

  const updateFormData = (data: Partial<SponsorshipFormData>) => {
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

  const validateStep1 = () => {
    if (!formData.tierId) {
      toast.error('Please select a sponsorship tier');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.companyName || !formData.contactPerson || !formData.email || !formData.phoneNumber) {
      toast.error('Please fill in all required fields');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    nextStep();
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Submitting sponsorship registration:', formData);
      const response = await fetch(`/api/events/${event.id}/sponsor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Sponsorship response:', { status: response.status, data });

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to register';
        throw new Error(errorMessage);
      }

      // Show success message
      toast.success('Registration successful! Redirecting to payment...');

      // Redirect to Paystack payment page
      window.location.href = data.paymentUrl;
    } catch (err) {
      console.error('Sponsorship registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';

      // Show error in both toast and alert
      toast.error(errorMessage, {
        duration: 6000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: '500',
          padding: '16px',
          borderRadius: '8px',
        },
        icon: '⚠️',
      });

      setError(errorMessage);
      setIsSubmitting(false);

      // Scroll to top to show the error alert
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
        <Alert variant="destructive" className="border-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2 font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {currentStep === 1 && 'Select Sponsorship Tier'}
            {currentStep === 2 && 'Company Information'}
            {currentStep === 3 && 'Review & Submit'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Tier Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tiers
                  .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                  .map((tier) => (
                    <SponsorshipTierCard
                      key={tier.id}
                      tier={tier}
                      isSelected={formData.tierId === tier.id}
                      onSelect={() => updateFormData({ tierId: tier.id })}
                      isRecommended={tier.is_recommended || false}
                    />
                  ))}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleNext}
                  className="bg-[#009688] hover:bg-[#00796b]"
                  size="lg"
                  disabled={!formData.tierId}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Company Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateFormData({ companyName: e.target.value })}
                    placeholder="Your Company Ltd"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">
                    Contact Person <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => updateFormData({ contactPerson: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData({ email: e.target.value })}
                    placeholder="contact@company.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
                    placeholder="+254 700 000 000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Company Website</Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    value={formData.companyWebsite}
                    onChange={(e) => updateFormData({ companyWebsite: e.target.value })}
                    placeholder="https://www.company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => updateFormData({ industry: e.target.value })}
                    placeholder="e.g., Food & Beverage, Healthcare"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sponsorshipGoals">Sponsorship Goals</Label>
                <Textarea
                  id="sponsorshipGoals"
                  value={formData.sponsorshipGoals}
                  onChange={(e) => updateFormData({ sponsorshipGoals: e.target.value })}
                  placeholder="What do you hope to achieve through this sponsorship?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => updateFormData({ specialRequests: e.target.value })}
                  placeholder="Any special requirements or requests?"
                  rows={3}
                />
              </div>

              <div className="flex justify-between">
                <Button onClick={prevStep} variant="outline" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-[#009688] hover:bg-[#00796b]"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Selected Tier Summary */}
              {selectedTier && (
                <div className="bg-gradient-to-br from-[#009688]/10 to-teal-50 p-6 rounded-lg border-2 border-[#009688]/20">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {selectedTier.tier_name}
                  </h3>
                  <p className="text-3xl font-bold text-[#009688] mb-4">
                    KES {selectedTier.price.toLocaleString()}
                  </p>
                  {selectedTier.benefits && selectedTier.benefits.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">
                        Includes:
                      </p>
                      <ul className="text-sm text-foreground space-y-1">
                        {selectedTier.benefits
                          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                          .slice(0, 3)
                          .map((benefit) => (
                            <li key={benefit.id}>• {benefit.benefit_text}</li>
                          ))}
                        {selectedTier.benefits.length > 3 && (
                          <li className="text-muted-foreground">
                            + {selectedTier.benefits.length - 3} more benefits
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Company Information Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Company Name</p>
                    <p className="font-medium text-foreground">{formData.companyName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contact Person</p>
                    <p className="font-medium text-foreground">{formData.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{formData.phoneNumber}</p>
                  </div>
                  {formData.companyWebsite && (
                    <div>
                      <p className="text-muted-foreground">Website</p>
                      <p className="font-medium text-foreground">{formData.companyWebsite}</p>
                    </div>
                  )}
                  {formData.industry && (
                    <div>
                      <p className="text-muted-foreground">Industry</p>
                      <p className="font-medium text-foreground">{formData.industry}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms Notice */}
              {event.sponsorship_terms && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="text-sm">
                      By proceeding to payment, you agree to the sponsorship terms and
                      conditions.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <Button onClick={prevStep} variant="outline" size="lg" disabled={isSubmitting}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-[#009688] hover:bg-[#00796b]"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Need help?</strong> Contact us at{' '}
            <a
              href="mailto:partnerships@oncotritionhc.com"
              className="underline hover:text-blue-700"
            >
              partnerships@oncotritionhc.com
            </a>
            {' '}or call{' '}
            <a href="tel:+254711118283" className="underline hover:text-blue-700">
              +254 711 118 283
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
